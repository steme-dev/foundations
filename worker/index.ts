/** The worker: the static site, and the routes of `app.ts` on D1 and GitHub's OAuth. */
import { type Config, type GitHub, handle } from "./app.ts";
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

export default {
  fetch(request: Request, env: Env): Promise<Response> {
    return handle(request, {
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
  },
} satisfies ExportedHandler<Env>;
