import { describe, expect, it } from "vitest";

import { type Config, type Deps, handle } from "./app.ts";
import { SESSION_COOKIE, sign, verify } from "./session.ts";
import { memoryStore } from "./store.ts";

const ORIGIN = "http://localhost:4410";
const config: Config = {
  githubClientId: "client",
  githubClientSecret: "secret",
  sessionSecret: "a session secret for the tests",
  publicOrigin: ORIGIN,
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
  assets: { fetch: async (request) => new Response(`asset ${new URL(request.url).pathname}`) },
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
  it("sends /u/<login> to the profile page, and serves the site otherwise", async () => {
    const deps = setup();
    const shared = await call(deps, "/u/ada");
    expect([shared.status, shared.headers.get("Location")]).toEqual([302, "/u/?login=ada"]);
    expect(await (await call(deps, "/u/")).text()).toBe("asset /u/");
    expect(await (await call(deps, "/practices/fuzzing")).text()).toBe("asset /practices/fuzzing");
  });
});
