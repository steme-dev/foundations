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
 * - `/u/<login>` redirects to the profile page, `/u/?login=<login>`; everything else is the static site.
 */
import { PRACTICES } from "../data/practices.ts";
import { SESSION_COOKIE, SESSION_DAYS, cookie, readCookie, sign, verify } from "./session.ts";
import type { Store, User } from "./store.ts";

export type Config = {
  readonly githubClientId: string;
  readonly githubClientSecret: string;
  readonly sessionSecret: string;
  /** The site's own origin, `https://foundations.steme.dev` or the local one: GitHub returns there. */
  readonly publicOrigin: string;
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
};

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

  // A person's list is shared as /u/<login>; the site has one page for every list, /u/, which reads
  // the login from the query.
  const shared = /^\/u\/([^/]+)\/?$/u.exec(url.pathname);
  if (shared !== null && request.method === "GET")
    return new Response(null, {
      status: 302,
      headers: { Location: `/u/?login=${encodeURIComponent(decodeURIComponent(shared[1] ?? ""))}` },
    });

  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/auth/"))
    return json({ error: "not-found" }, 404);

  return deps.assets.fetch(request);
}
