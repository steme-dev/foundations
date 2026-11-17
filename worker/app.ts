/**
 * The worker's routes, written against ports so the tests run them without Cloudflare or GitHub:
 *
 * - `GET /auth/github?return=/path` sends the reader to GitHub; `GET /auth/callback` comes back,
 *   records the user and sets the session; `POST /auth/logout` ends it.
 * - `GET /api/me`: who is signed in and the practices they use.
 * - `PUT` / `DELETE /api/votes/<practice>`: "I use it", or not any more.
 * - `GET /api/counts`: how many people use each practice.
 * - `GET /api/users/<login>`: a person's public list.
 * - `DELETE /api/me`: forget the user and every vote of theirs.
 * - `POST /t/e`: an event of the site, relayed to PostHog in its cookieless mode.
 * - `/u/<login>` serves the profile page with the tags a shared link's preview reads, its image
 *   `/u/<login>/card.png`, the person's grid drawn by the worker; everything else is the static site.
 */
import { PRACTICES } from "../data/practices.ts";
import { CARD, cardSvg, votesDigest } from "./card.ts";
import { SESSION_COOKIE, SESSION_DAYS, cookie, readCookie, sign, verify } from "./session.ts";
import type { Store, User } from "./store.ts";

export type Config = {
  readonly githubClientId: string;
  readonly githubClientSecret: string;
  readonly sessionSecret: string;
  /** The site's own origin, `https://foundations.steme.dev` or the local one: GitHub returns there. */
  readonly publicOrigin: string;
  /** PostHog's project key; empty, nothing is counted. Public: PostHog's keys are sent by any page. */
  readonly posthogKey: string;
  /** GitHub ids whose doings are never counted: the site's own people, signed in. */
  readonly uncounted: readonly number[];
};

/** An event as PostHog's capture endpoint takes it. */
export type Captured = {
  readonly api_key: string;
  readonly event: string;
  readonly distinct_id: string;
  readonly properties: Record<string, unknown>;
  readonly timestamp: string;
};

export interface GitHub {
  /** The access token GitHub gives for an authorization code. */
  exchange(code: string, config: Config): Promise<string | null>;
  /** The signed-in GitHub user an access token belongs to. */
  user(token: string): Promise<User | null>;
}

export type Deps = {
  readonly store: Store;
  readonly github: GitHub;
  readonly config: Config;
  readonly assets: { fetch(request: Request): Promise<Response> };
  readonly now: () => Date;
  /** Rasterises a card's SVG to PNG. */
  readonly renderPng: (svg: string) => Promise<Uint8Array>;
  /** Sends an event to PostHog, without making the reader wait. */
  readonly capture: (event: Captured) => void;
};

/** The events the site sends (site/theme/track.ts), and the one the worker adds on a sign-in. */
const EVENTS = new Set([
  "$pageview",
  "journey_step",
  "start_dialog_shown",
  "sign_in_started",
  "signed_in",
  "vote",
  "grid_viewed",
  "share_copied",
  "propose_clicked",
  "filter_used",
  "search_used",
  "view_switched",
]);

const STATE_COOKIE = "foundations_oauth_state";
const PRACTICE_IDS = new Set(Object.keys(PRACTICES));
const LOGIN = /^[A-Za-z0-9-]{1,39}$/u;

const json = (body: unknown, status = 200, headers: HeadersInit = {}): Response =>
  Response.json(body, { status, headers: { "Cache-Control": "no-store", ...headers } });

/** A path on this site to come back to, never another origin. */
const safeReturn = (value: string | null): string =>
  value !== null && value.startsWith("/") && !value.startsWith("//") ? value : "/";

export async function handle(request: Request, deps: Deps): Promise<Response> {
  const url = new URL(request.url);
  const { store, config } = deps;
  const secure = config.publicOrigin.startsWith("https:");
  const now = deps.now();

  // An event, counted without knowing who: PostHog's cookieless mode derives a daily, salted hash from
  // the reader's address and browser, which only the worker sees.
  const capture = (event: string, properties: Record<string, unknown>) => {
    if (config.posthogKey === "" || !EVENTS.has(event)) return;
    deps.capture({
      api_key: config.posthogKey,
      event,
      distinct_id: "$posthog_cookieless",
      timestamp: now.toISOString(),
      properties: {
        ...properties,
        site: "foundations",
        $cookieless_mode: true,
        $ip: request.headers.get("CF-Connecting-IP") ?? "",
        $raw_user_agent: request.headers.get("User-Agent") ?? "",
      },
    });
  };

  if (url.pathname === "/t/e" && request.method === "POST") {
    // One of the site's own people, signed in, is not counted: their session says who they are.
    const cookieValue = readCookie(request, SESSION_COOKIE);
    const signed =
      cookieValue === null ? null : await verify(cookieValue, config.sessionSecret, now.getTime());
    if (signed !== null && config.uncounted.includes(signed.githubId))
      return new Response(null, { status: 204 });
    const text = await request.text();
    if (text.length > 8192) return new Response(null, { status: 413 });
    let body: { event?: unknown; properties?: unknown } = {};
    try {
      body = JSON.parse(text) as typeof body;
    } catch {
      return new Response(null, { status: 400 });
    }
    const event = typeof body.event === "string" ? body.event : "";
    if (!EVENTS.has(event) || event === "signed_in") return new Response(null, { status: 400 });
    const properties =
      body.properties !== null && typeof body.properties === "object"
        ? (body.properties as Record<string, unknown>)
        : {};
    capture(event, properties);
    return new Response(null, { status: 204 });
  }

  // A session counts only while its person still exists: one who deleted their account on another
  // device is signed out here too, and their cookie cleared.
  let ended = false;
  const session = async () => {
    const value = readCookie(request, SESSION_COOKIE);
    const signed = value === null ? null : await verify(value, config.sessionSecret, now.getTime());
    if (signed === null) return null;
    if ((await store.userById(signed.githubId)) === null) {
      ended = true;
      return null;
    }
    return signed;
  };
  const clearIfEnded = (response: Response): Response => {
    if (ended) response.headers.append("Set-Cookie", cookie(SESSION_COOKIE, "", 0, secure));
    return response;
  };

  // A request that changes something must come from the site itself.
  const sameOrigin = () => request.headers.get("Origin") === config.publicOrigin;

  if (url.pathname === "/auth/github" && request.method === "GET") {
    const state = crypto.randomUUID();
    const authorize = new URL("https://github.com/login/oauth/authorize");
    authorize.searchParams.set("client_id", config.githubClientId);
    authorize.searchParams.set("redirect_uri", `${config.publicOrigin}/auth/callback`);
    authorize.searchParams.set("state", state);
    authorize.searchParams.set("allow_signup", "true");
    const back = safeReturn(url.searchParams.get("return"));
    return new Response(null, {
      status: 302,
      headers: {
        Location: authorize.toString(),
        "Set-Cookie": cookie(STATE_COOKIE, `${state}|${encodeURIComponent(back)}`, 600, secure),
      },
    });
  }

  if (url.pathname === "/auth/callback" && request.method === "GET") {
    const [state, back] = (readCookie(request, STATE_COOKIE) ?? "").split("|");
    const code = url.searchParams.get("code");
    if (
      code === null ||
      state === undefined ||
      state === "" ||
      url.searchParams.get("state") !== state
    )
      return new Response("Sign-in failed: the state does not match. Try again.", { status: 400 });
    const token = await deps.github.exchange(code, config);
    const user = token === null ? null : await deps.github.user(token);
    if (user === null)
      return new Response("Sign-in failed: GitHub did not answer.", { status: 502 });
    await store.upsertUser(user, now.toISOString());
    if (!config.uncounted.includes(user.githubId))
      capture("signed_in", { $current_url: url.toString() });
    const value = await sign(
      {
        githubId: user.githubId,
        login: user.login,
        exp: now.getTime() + SESSION_DAYS * 86_400_000,
      },
      config.sessionSecret,
    );
    const headers = new Headers({ Location: safeReturn(decodeURIComponent(back ?? "/")) });
    headers.append("Set-Cookie", cookie(SESSION_COOKIE, value, SESSION_DAYS * 86_400, secure));
    headers.append("Set-Cookie", cookie(STATE_COOKIE, "", 0, secure));
    return new Response(null, { status: 302, headers });
  }

  if (url.pathname === "/auth/logout" && request.method === "POST") {
    if (!sameOrigin()) return json({ error: "cross-origin" }, 403);
    return json({ ok: true }, 200, { "Set-Cookie": cookie(SESSION_COOKIE, "", 0, secure) });
  }

  if (url.pathname === "/api/me") {
    const me = await session();
    if (request.method === "GET") {
      if (me === null) return clearIfEnded(json({ user: null, votes: [] }));
      const user = await store.userById(me.githubId);
      return json({
        user: { login: user?.login ?? me.login, avatarUrl: user?.avatarUrl ?? null },
        votes: await store.votesOf(me.githubId),
      });
    }
    if (request.method === "DELETE") {
      if (!sameOrigin()) return json({ error: "cross-origin" }, 403);
      if (me === null) return json({ error: "signed-out" }, 401);
      await store.deleteUser(me.githubId);
      return json({ ok: true }, 200, { "Set-Cookie": cookie(SESSION_COOKIE, "", 0, secure) });
    }
  }

  const vote = /^\/api\/votes\/([a-z0-9-]+)$/u.exec(url.pathname);
  if (vote !== null && (request.method === "PUT" || request.method === "DELETE")) {
    const practice = vote[1] ?? "";
    if (!sameOrigin()) return json({ error: "cross-origin" }, 403);
    if (!PRACTICE_IDS.has(practice)) return json({ error: "unknown-practice" }, 404);
    const me = await session();
    if (me === null) return clearIfEnded(json({ error: "signed-out" }, 401));
    if (request.method === "PUT") await store.addVote(me.githubId, practice, now.toISOString());
    else await store.removeVote(me.githubId, practice);
    return json({ votes: await store.votesOf(me.githubId) });
  }

  if (url.pathname === "/api/counts" && request.method === "GET") {
    const counts = await store.counts();
    return json(Object.fromEntries(Object.entries(counts).filter(([id]) => PRACTICE_IDS.has(id))));
  }

  const profile = /^\/api\/users\/([^/]+)$/u.exec(url.pathname);
  if (profile !== null && request.method === "GET") {
    const login = decodeURIComponent(profile[1] ?? "");
    const user = LOGIN.test(login) ? await store.userByLogin(login) : null;
    if (user === null) return json({ error: "unknown-user" }, 404);
    return json({
      login: user.login,
      avatarUrl: user.avatarUrl,
      votes: await store.votesOf(user.githubId),
    });
  }

  // A person's card: their grid as an image, for the preview of their shared link.
  const card = /^\/u\/([^/]+)\/card\.png$/u.exec(url.pathname);
  if (card !== null && request.method === "GET") {
    const login = decodeURIComponent(card[1] ?? "");
    const user = LOGIN.test(login) ? await store.userByLogin(login) : null;
    if (user === null) return new Response("No one here.", { status: 404 });
    const votes = await store.votesOf(user.githubId);
    const png = await deps.renderPng(
      cardSvg({ login: user.login, votes, origin: config.publicOrigin }),
    );
    return new Response(png, {
      headers: { "Content-Type": "image/png", "Cache-Control": "public, max-age=3600" },
    });
  }

  // A person's list is shared as /u/<login>. The site has one page for every list, /u/, which reads
  // the login from the query: the worker serves it with the preview's tags, which no crawler would
  // find in the page's script, and puts the query back in the address before the page starts.
  const shared = /^(\/fr)?\/u\/([^/]+)\/?$/u.exec(url.pathname);
  if (shared !== null && request.method === "GET") {
    const lang = shared[1] ?? "";
    const login = decodeURIComponent(shared[2] ?? "");
    const back = `${lang}/u/?login=${encodeURIComponent(login)}`;
    const user = LOGIN.test(login) ? await store.userByLogin(login) : null;
    if (user === null) return new Response(null, { status: 302, headers: { Location: back } });
    const page = await deps.assets.fetch(new Request(new URL(`${lang}/u/`, url), request));
    if (!page.ok) return page;
    const votes = await store.votesOf(user.githubId);
    const french = lang === "/fr";
    const html = withPreview(await page.text(), {
      title: french
        ? `Le harness de @${user.login}, fondé sur la littérature`
        : `@${user.login}'s harness, built on the literature`,
      description: french
        ? `${votes.length} pratique${votes.length === 1 ? "" : "s"} du génie logiciel, chacune placée là où elle intervient quand un agent écrit le code.`
        : `${votes.length} practice${votes.length === 1 ? "" : "s"} of software engineering, each placed where it acts when an agent writes the code.`,
      image: `${config.publicOrigin}/u/${user.login}/card.png?v=${await votesDigest(votes)}`,
      url: `${config.publicOrigin}${lang}/u/${user.login}`,
      back,
    });
    return new Response(html, {
      headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
    });
  }

  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/auth/"))
    return json({ error: "not-found" }, 404);

  return deps.assets.fetch(request);
}

const attribute = (value: string): string =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");

/** A page with the tags a link's preview reads, and the address set back to the page's own. */
export function withPreview(
  html: string,
  preview: { title: string; description: string; image: string; url: string; back: string },
): string {
  const tags = [
    `<meta property="og:type" content="profile">`,
    `<meta property="og:title" content="${attribute(preview.title)}">`,
    `<meta property="og:description" content="${attribute(preview.description)}">`,
    `<meta property="og:url" content="${attribute(preview.url)}">`,
    `<meta property="og:image" content="${attribute(preview.image)}">`,
    `<meta property="og:image:width" content="${CARD.width}">`,
    `<meta property="og:image:height" content="${CARD.height}">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:image" content="${attribute(preview.image)}">`,
    `<script>history.replaceState(null, "", ${JSON.stringify(preview.back)});</script>`,
  ].join("");
  // The page's own preview tags, generic, go: a crawler reads the first it finds.
  const bare = html
    .replace(/<meta\s+(?:property="og:[^"]*"|name="twitter:[^"]*")[^>]*>/gu, "")
    .replace(/<title>[^<]*<\/title>/u, `<title>${attribute(preview.title)}</title>`);
  return bare.replace("</head>", `${tags}</head>`);
}
