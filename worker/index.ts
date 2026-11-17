/** The worker: the static site, and the routes of `app.ts` on D1 and GitHub's OAuth. */
import { Resvg, initWasm } from "@resvg/resvg-wasm";
import resvgWasm from "@resvg/resvg-wasm/index_bg.wasm";

import { type Config, type GitHub, handle } from "./app.ts";
import { CARD } from "./card.ts";
import regular from "./fonts/instrument-sans-400.ttf";
import semibold from "./fonts/instrument-sans-600.ttf";
import { d1Store } from "./store.ts";

type Env = {
  readonly DB: D1Database;
  readonly ASSETS: Fetcher;
  readonly GITHUB_CLIENT_ID: string;
  readonly GITHUB_CLIENT_SECRET: string;
  readonly SESSION_SECRET: string;
  readonly PUBLIC_ORIGIN: string;
};

const USER_AGENT = "foundations.steme.dev";

const github: GitHub = {
  async exchange(code, config: Config) {
    const response = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "User-Agent": USER_AGENT,
      },
      body: JSON.stringify({
        client_id: config.githubClientId,
        client_secret: config.githubClientSecret,
        code,
        redirect_uri: `${config.publicOrigin}/auth/callback`,
      }),
    });
    if (!response.ok) return null;
    const body = (await response.json()) as { access_token?: string };
    return body.access_token ?? null;
  },
  async user(token) {
    const response = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "User-Agent": USER_AGENT,
      },
    });
    if (!response.ok) return null;
    const body = (await response.json()) as { id?: number; login?: string; avatar_url?: string };
    return typeof body.id === "number" && typeof body.login === "string"
      ? { githubId: body.id, login: body.login, avatarUrl: body.avatar_url ?? null }
      : null;
  },
};

let ready: Promise<void> | null = null;

/** A card's SVG as PNG, with the site's font; resvg's module is set up once per isolate. */
async function renderPng(svg: string): Promise<Uint8Array> {
  ready ??= initWasm(resvgWasm);
  await ready;
  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: CARD.width },
    font: {
      fontBuffers: [new Uint8Array(regular), new Uint8Array(semibold)],
      defaultFontFamily: "Instrument Sans",
      loadSystemFonts: false,
    },
  });
  return resvg.render().asPng();
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    // A card is the same until its person's votes change, which its address carries: kept in the cache.
    const isCard =
      request.method === "GET" && /^\/u\/[^/]+\/card\.png$/u.test(new URL(request.url).pathname);
    if (isCard) {
      const hit = await caches.default.match(request);
      if (hit !== undefined) return hit;
    }
    const response = await handle(request, {
      renderPng,
      store: d1Store(env.DB),
      github,
      assets: env.ASSETS,
      now: () => new Date(),
      config: {
        githubClientId: env.GITHUB_CLIENT_ID,
        githubClientSecret: env.GITHUB_CLIENT_SECRET,
        sessionSecret: env.SESSION_SECRET,
        publicOrigin: env.PUBLIC_ORIGIN,
      },
    });
    if (isCard && response.ok) ctx.waitUntil(caches.default.put(request, response.clone()));
    return response;
  },
} satisfies ExportedHandler<Env>;
