/** The browser's side of the worker's routes (worker/app.ts). */
import type { PracticeId } from "../../data/practices.ts";

export type Me = { user: { login: string; avatarUrl: string | null } | null; votes: PracticeId[] };
export type Profile = { login: string; avatarUrl: string | null; votes: PracticeId[] };

const send = (path: string, method: string) =>
  fetch(path, { method, credentials: "same-origin", headers: { Accept: "application/json" } });

export async function getMe(): Promise<Me> {
  const response = await fetch("/api/me", { credentials: "same-origin" });
  return response.ok ? ((await response.json()) as Me) : { user: null, votes: [] };
}

export async function getCounts(): Promise<Partial<Record<PracticeId, number>>> {
  const response = await fetch("/api/counts");
  return response.ok ? ((await response.json()) as Partial<Record<PracticeId, number>>) : {};
}

export async function getProfile(login: string): Promise<Profile | null> {
  const response = await fetch(`/api/users/${encodeURIComponent(login)}`);
  return response.ok ? ((await response.json()) as Profile) : null;
}

/** Shares a grid without an account: its practices kept under a new id, or null when it failed. */
export async function createGrid(practices: readonly PracticeId[]): Promise<string | null> {
  const response = await fetch("/api/grids", {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ practices }),
  });
  return response.ok ? ((await response.json()) as { id: string }).id : null;
}

/** A shared grid's practices, or null when no grid has this id. */
export async function getGrid(id: string): Promise<PracticeId[] | null> {
  const response = await fetch(`/api/grids/${encodeURIComponent(id)}`);
  return response.ok ? ((await response.json()) as { practices: PracticeId[] }).practices : null;
}

/**
 * A shared grid's address to share: the page with the grid's id in its query, which the worker serves
 * with the grid's preview, and the site itself reads wherever it runs.
 */
export const gridSharePath = (id: string, link = (path: string) => path): string =>
  link(`/g/?id=${encodeURIComponent(id)}`);

/** Says the signed-in reader uses a practice, or not any more; the votes after it. */
export async function setVote(practice: PracticeId, used: boolean): Promise<PracticeId[] | null> {
  const response = await send(`/api/votes/${practice}`, used ? "PUT" : "DELETE");
  if (!response.ok) return null;
  const { votes } = (await response.json()) as { votes: PracticeId[] };
  window.dispatchEvent(new CustomEvent(VOTES_EVENT, { detail: votes }));
  return votes;
}

/** Sent on the window after every vote, with the reader's votes, for the nav's count. */
export const VOTES_EVENT = "foundations:votes";

export const signIn = (back: string): void => {
  window.location.href = `/auth/github?return=${encodeURIComponent(back)}`;
};

export const signOut = async (): Promise<void> => {
  await send("/auth/logout", "POST");
};

export const forgetMe = async (): Promise<boolean> => (await send("/api/me", "DELETE")).ok;

/**
 * A person's public list, to go to from the site: the page `/u/` itself, the login in its query, which
 * needs no worker in between (the development server has none).
 */
export const profilePath = (login: string, link: (path: string) => string = (p) => p): string =>
  link(`/u/?login=${encodeURIComponent(login)}`);

/**
 * A person's public list, to share: `/u/<login>`, `/fr/u/<login>` in French, which the worker serves
 * with the tags of a link's preview and their grid as its image.
 */
export const sharePath = (login: string, link: (path: string) => string = (p) => p): string =>
  link(`/u/${login}`);

/** Where a reader proposes a practice: the issue form of the repository. */
export const PROPOSE_URL =
  "https://github.com/steme-dev/foundations/issues/new?template=new-practice.yml";
