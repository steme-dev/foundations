import { useEffect, useState } from "react";

import { PRACTICES, type PracticeId } from "../../data/practices.ts";
import { type Me, getCounts, getMe, setVote } from "./api.ts";
import { track } from "./track.ts";

/** Under this many readers, a practice's count says "nobody yet" more than it informs: it is not shown. */
export const COUNT_FROM = 3;

export const shownCount = (n: number | undefined): string =>
  n !== undefined && n >= COUNT_FROM ? String(n) : "";

/** The practices a reader says they use before signing in: kept in this browser, sent nowhere. */
const LOCAL = "foundations:local-votes";

const readLocal = (): PracticeId[] => {
  try {
    const kept: unknown = JSON.parse(localStorage.getItem(LOCAL) ?? "[]");
    return Array.isArray(kept)
      ? kept.filter((id): id is PracticeId => typeof id === "string" && id in PRACTICES)
      : [];
  } catch {
    return [];
  }
};

const writeLocal = (votes: readonly PracticeId[]): void => {
  try {
    if (votes.length === 0) localStorage.removeItem(LOCAL);
    else localStorage.setItem(LOCAL, JSON.stringify(votes));
  } catch {
    // Without storage, the choices last as long as the page.
  }
};

/**
 * Saying "I use it", wherever a practice shows: the reader, the counts, the toggle. Signed out, a
 * press is kept in this browser and lights the practice at once, and no public count moves: the
 * counts are people's. Signed in, it is saved to their account; and on their first visit signed in,
 * what this browser kept joins their account, then the browser forgets it.
 */
export function useVoting(where: "home" | "practice") {
  const [me, setMe] = useState<Me>({ user: null, votes: [] });
  const [counts, setCounts] = useState<Partial<Record<PracticeId, number>>>({});
  const [firstVote, setFirstVote] = useState(false);

  useEffect(() => {
    void getCounts().then(setCounts);
    void getMe().then(async (current) => {
      const kept = readLocal();
      if (current.user === null) {
        setMe({ user: null, votes: kept });
        return;
      }
      setMe(current);
      const joining = kept.filter((id) => !current.votes.includes(id));
      if (joining.length === 0) {
        writeLocal([]);
        return;
      }
      let votes = current.votes;
      for (const id of joining) {
        const saved = await setVote(id, true);
        if (saved === null) return;
        votes = saved;
        track("vote", { practice: id, on: true, where, after_sign_in: true });
        setCounts((all) => ({ ...all, [id]: (all[id] ?? 0) + 1 }));
      }
      writeLocal([]);
      setMe({ ...current, votes });
      if (current.votes.length === 0) setFirstVote(true);
    });
  }, [where]);

  const toggle = async (id: PracticeId) => {
    const on = !me.votes.includes(id);
    const next = on ? [...me.votes, id] : me.votes.filter((v) => v !== id);
    if (me.user === null) {
      setMe({ user: null, votes: next });
      writeLocal(next);
      track("vote", { practice: id, on, where, saved: false });
      return;
    }
    const before = me;
    setMe({ ...me, votes: next });
    setCounts((all) => ({ ...all, [id]: Math.max(0, (all[id] ?? 0) + (on ? 1 : -1)) }));
    if (on && me.votes.length === 0) setFirstVote(true);
    const votes = await setVote(id, on);
    if (votes === null) setMe(before);
    else {
      setMe({ ...me, votes });
      track("vote", { practice: id, on, where });
    }
  };

  return { me, counts, firstVote, toggle };
}
