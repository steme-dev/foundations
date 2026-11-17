import { describe, expect, it } from "vitest";

import { type Captured, type Config, type Deps, handle } from "./app.ts";
import { SESSION_COOKIE, sign, verify } from "./session.ts";
import { memoryStore } from "./store.ts";

const ORIGIN = "http://localhost:4410";
const config: Config = {
  githubClientId: "client",
  githubClientSecret: "secret",
  sessionSecret: "a session secret for the tests",
  publicOrigin: ORIGIN,
  posthogKey: "",
  uncounted: [],
};
const NOW = new Date("2026-11-17T10:00:00Z");
const ADA = { githubId: 1, login: "ada", avatarUrl: "https://avatars.example/ada" };

const setup = (): Deps => ({
  store: memoryStore(),
  config,
  now: () => NOW,
  github: {
    exchange: async (code) => (code === "good" ? "token" : null),
    user: async (token) => (token === "token" ? ADA : null),
  },
  assets: {
    fetch: async (request) =>
      new Response(
        `<html><head><title>Practices someone builds on</title><meta property="og:title" content="Generic"><meta name="twitter:card" content="summary"></head><body>asset ${new URL(request.url).pathname}</body></html>`,
      ),
  },
  renderPng: async (svg) => new TextEncoder().encode(svg),
  capture: () => undefined,
});

const sessionOf = async (login = "ada", githubId = 1) =>
  `${SESSION_COOKIE}=${await sign({ githubId, login, exp: NOW.getTime() + 60_000 }, config.sessionSecret)}`;

const call = (deps: Deps, path: string, init: RequestInit = {}) =>
  handle(new Request(`${ORIGIN}${path}`, init), deps);

const write = async (method: string, extra: Record<string, string> = {}) => ({
  method,
  headers: { Cookie: await sessionOf(), Origin: ORIGIN, ...extra },
});

describe("the session", () => {
  it("verifies what it signed, and nothing forged or expired", async () => {
    const value = await sign({ githubId: 1, login: "ada", exp: 2_000 }, "s");
    expect(await verify(value, "s", 1_000)).toEqual({ githubId: 1, login: "ada", exp: 2_000 });
    expect(await verify(value, "other secret", 1_000)).toBeNull();
    expect(await verify(value, "s", 3_000)).toBeNull();
    expect(await verify(`${value}x`, "s", 1_000)).toBeNull();
    expect(await verify("not a session", "s", 1_000)).toBeNull();
  });
});

describe("signing in with GitHub", () => {
  it("sends the reader to GitHub with a state, and comes back to where they were", async () => {
    const deps = setup();
    const start = await call(deps, "/auth/github?return=/practices/fuzzing");
    const location = new URL(start.headers.get("Location") ?? "");
    expect(location.host).toBe("github.com");
    expect(location.searchParams.get("redirect_uri")).toBe(`${ORIGIN}/auth/callback`);
    const state = location.searchParams.get("state") ?? "";
    const stateCookie = (start.headers.get("Set-Cookie") ?? "").split(";")[0] ?? "";

    const back = await call(deps, `/auth/callback?code=good&state=${state}`, {
      headers: { Cookie: stateCookie },
    });
    expect(back.status).toBe(302);
    expect(back.headers.get("Location")).toBe("/practices/fuzzing");
    expect(back.headers.get("Set-Cookie")).toContain(`${SESSION_COOKIE}=`);
    expect(await deps.store.userByLogin("ada")).toEqual(ADA);
  });

  it("refuses a callback whose state is not the one it gave", async () => {
    const back = await call(setup(), "/auth/callback?code=good&state=forged", {
      headers: { Cookie: "foundations_oauth_state=real|%2F" },
    });
    expect(back.status).toBe(400);
  });

  it("never returns to another site", async () => {
    const start = await call(setup(), "/auth/github?return=//evil.example");
    expect(start.headers.get("Set-Cookie")).toContain("|%2F;");
  });
});

describe("saying which practices you use", () => {
  it("records a vote, counts it and shows it on the public list", async () => {
    const deps = setup();
    await deps.store.upsertUser(ADA, NOW.toISOString());
    const put = await call(deps, "/api/votes/fuzzing", await write("PUT"));
    expect(await put.json()).toEqual({ votes: ["fuzzing"] });
    expect(await (await call(deps, "/api/counts")).json()).toEqual({ fuzzing: 1 });
    expect(await (await call(deps, "/api/users/ada")).json()).toEqual({
      login: "ada",
      avatarUrl: ADA.avatarUrl,
      votes: ["fuzzing"],
    });
    await call(deps, "/api/votes/fuzzing", await write("DELETE"));
    expect(await (await call(deps, "/api/counts")).json()).toEqual({});
  });

  it("counts one vote per person, however often they press", async () => {
    const deps = setup();
    await deps.store.upsertUser(ADA, NOW.toISOString());
    await call(deps, "/api/votes/fuzzing", await write("PUT"));
    await call(deps, "/api/votes/fuzzing", await write("PUT"));
    expect(await (await call(deps, "/api/counts")).json()).toEqual({ fuzzing: 1 });
  });

  it("refuses a vote from someone signed out, from another site, or for no practice", async () => {
    const deps = setup();
    const signedOut = await call(deps, "/api/votes/fuzzing", {
      method: "PUT",
      headers: { Origin: ORIGIN },
    });
    expect(signedOut.status).toBe(401);
    const crossSite = await call(
      deps,
      "/api/votes/fuzzing",
      await write("PUT", { Origin: "https://evil.example" }),
    );
    expect(crossSite.status).toBe(403);
    await deps.store.upsertUser(ADA, NOW.toISOString());
    const unknown = await call(deps, "/api/votes/not-a-practice", await write("PUT"));
    expect(unknown.status).toBe(404);
  });
});

describe("who is signed in", () => {
  it("says who, with their avatar and their votes, or no one", async () => {
    const deps = setup();
    await deps.store.upsertUser(ADA, NOW.toISOString());
    await call(deps, "/api/votes/fuzzing", await write("PUT"));
    expect(
      await (await call(deps, "/api/me", { headers: { Cookie: await sessionOf() } })).json(),
    ).toEqual({
      user: { login: "ada", avatarUrl: ADA.avatarUrl },
      votes: ["fuzzing"],
    });
    expect(await (await call(deps, "/api/me")).json()).toEqual({ user: null, votes: [] });
  });
});

describe("a session whose person is gone", () => {
  it("counts as signed out, clears its cookie, and records no vote", async () => {
    const deps = setup();
    const me = await call(deps, "/api/me", { headers: { Cookie: await sessionOf() } });
    expect(await me.json()).toEqual({ user: null, votes: [] });
    expect(me.headers.get("Set-Cookie")).toContain("Max-Age=0");
    const vote = await call(deps, "/api/votes/fuzzing", await write("PUT"));
    expect(vote.status).toBe(401);
    expect(await (await call(deps, "/api/counts")).json()).toEqual({});
  });
});

describe("forgetting a user", () => {
  it("deletes the user and every vote of theirs, and ends the session", async () => {
    const deps = setup();
    await deps.store.upsertUser(ADA, NOW.toISOString());
    await call(deps, "/api/votes/fuzzing", await write("PUT"));
    const gone = await call(deps, "/api/me", await write("DELETE"));
    expect(gone.headers.get("Set-Cookie")).toContain("Max-Age=0");
    expect(await deps.store.userByLogin("ada")).toBeNull();
    expect(await (await call(deps, "/api/counts")).json()).toEqual({});
  });
});

describe("the pages", () => {
  it("serves a shared /u/<login> with its preview, and the site otherwise", async () => {
    const deps = setup();
    await deps.store.upsertUser(ADA, NOW.toISOString());
    await call(deps, "/api/votes/fuzzing", await write("PUT"));
    const shared = await call(deps, "/u/ada");
    const html = await shared.text();
    expect(html).toContain("<title>@ada's harness, built on the literature</title>");
    expect(html).toMatch(
      /og:image" content="http:\/\/localhost:4410\/u\/ada\/card\.png\?v=[0-9a-f]{12}"/u,
    );
    expect(html).toContain('history.replaceState(null, "", "/u/?login=ada")');
    expect(html.match(/og:title/gu)).toHaveLength(1);
    expect(html).not.toContain("Generic");
    expect(html.match(/twitter:card/gu)).toHaveLength(1);
    expect(html).toContain("asset /u/");
    expect(await (await call(deps, "/practices/fuzzing")).text()).toContain(
      "asset /practices/fuzzing",
    );
  });

  it("serves a French shared list from the French page, with French words", async () => {
    const deps = setup();
    await deps.store.upsertUser(ADA, NOW.toISOString());
    const html = await (await call(deps, "/fr/u/ada")).text();
    expect(html).toContain("<title>Le harness de @ada, fondé sur la littérature</title>");
    expect(html).toContain('history.replaceState(null, "", "/fr/u/?login=ada")');
    expect(html).toContain("asset /fr/u/");
  });

  it("sends a /u/<login> no one holds to the page that says so", async () => {
    const shared = await call(setup(), "/u/nobody");
    expect([shared.status, shared.headers.get("Location")]).toEqual([302, "/u/?login=nobody"]);
  });

  it("draws a person's card from their votes, and no one else's", async () => {
    const deps = setup();
    await deps.store.upsertUser(ADA, NOW.toISOString());
    await call(deps, "/api/votes/fuzzing", await write("PUT"));
    const card = await call(deps, "/u/ada/card.png");
    expect(card.headers.get("Content-Type")).toBe("image/png");
    const svg = await card.text();
    expect(svg).toContain("@ada");
    expect(svg).toContain("Fuzzing");
    expect(svg).toContain("1 of 4 cells");
    expect((await call(deps, "/u/nobody/card.png")).status).toBe(404);
  });
});

const counting = () => {
  const sent: Captured[] = [];
  const deps: Deps = {
    ...setup(),
    config: { ...config, posthogKey: "phc_test" },
    capture: (e) => sent.push(e),
  };
  return { deps, sent };
};
const post = (deps: Deps, body: unknown) =>
  call(deps, "/t/e", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "CF-Connecting-IP": "203.0.113.7", "User-Agent": "test" },
  });

describe("counting what readers do", () => {
  it("relays a known event to PostHog in its cookieless mode, with the reader's address", async () => {
    const { deps, sent } = counting();
    expect((await post(deps, { event: "vote", properties: { practice: "fuzzing" } })).status).toBe(
      204,
    );
    expect(sent).toHaveLength(1);
    expect(sent[0]).toMatchObject({
      api_key: "phc_test",
      event: "vote",
      distinct_id: "$posthog_cookieless",
      properties: {
        practice: "fuzzing",
        site: "foundations",
        $cookieless_mode: true,
        $ip: "203.0.113.7",
      },
    });
  });

  it("refuses an event it does not know, and one only the worker sends", async () => {
    const { deps, sent } = counting();
    expect((await post(deps, { event: "anything" })).status).toBe(400);
    expect((await post(deps, { event: "signed_in" })).status).toBe(400);
    expect(sent).toHaveLength(0);
  });

  it("counts nothing without a key", async () => {
    const sent: Captured[] = [];
    const deps: Deps = { ...setup(), capture: (e) => sent.push(e) };
    expect((await post(deps, { event: "vote" })).status).toBe(204);
    expect(sent).toHaveLength(0);
  });

  it("counts a sign-in from the worker itself", async () => {
    const { deps, sent } = counting();
    const start = await call(deps, "/auth/github?return=/");
    const state = new URL(start.headers.get("Location") ?? "").searchParams.get("state") ?? "";
    const stateCookie = (start.headers.get("Set-Cookie") ?? "").split(";")[0] ?? "";
    await call(deps, `/auth/callback?code=good&state=${state}`, {
      headers: { Cookie: stateCookie },
    });
    expect(sent.map((e) => e.event)).toEqual(["signed_in"]);
  });
});

describe("the site's own people", () => {
  it("are not counted while signed in, from the page or at their sign-in", async () => {
    const sent: Captured[] = [];
    const deps: Deps = {
      ...setup(),
      config: { ...config, posthogKey: "phc_test", uncounted: [ADA.githubId] },
      capture: (e) => sent.push(e),
    };
    await deps.store.upsertUser(ADA, NOW.toISOString());
    const signedIn = await call(deps, "/t/e", {
      method: "POST",
      body: JSON.stringify({ event: "vote" }),
      headers: { Cookie: await sessionOf() },
    });
    expect(signedIn.status).toBe(204);
    const start = await call(deps, "/auth/github?return=/");
    const state = new URL(start.headers.get("Location") ?? "").searchParams.get("state") ?? "";
    const stateCookie = (start.headers.get("Set-Cookie") ?? "").split(";")[0] ?? "";
    await call(deps, `/auth/callback?code=good&state=${state}`, {
      headers: { Cookie: stateCookie },
    });
    expect(sent).toHaveLength(0);
    await call(deps, "/t/e", { method: "POST", body: JSON.stringify({ event: "vote" }) });
    expect(sent.map((e) => e.event)).toEqual(["vote"]);
  });
});
