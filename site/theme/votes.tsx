import { useEffect, useRef, useState } from "react";

import { PRACTICES, type PracticeId } from "../../data/practices.ts";
import { type Me, getCounts, getMe, setVote, signIn } from "./api.ts";
import { useWords } from "./lang.ts";
import { track } from "./track.ts";

/** Under this many readers, a practice's count says "nobody yet" more than it informs: it is not shown. */
export const COUNT_FROM = 3;

export const shownCount = (n: number | undefined): string =>
  n !== undefined && n >= COUNT_FROM ? String(n) : "";

/** The practice a reader pressed before signing in, kept for their way back from GitHub. */
const PENDING = "foundations:pending-vote";

const keepPending = (id: PracticeId): void => {
  try {
    sessionStorage.setItem(PENDING, id);
  } catch {
    // Without storage, the reader presses it again once signed in.
  }
};

const takePending = (): PracticeId | null => {
  try {
    const id = sessionStorage.getItem(PENDING);
    sessionStorage.removeItem(PENDING);
    return id !== null && id in PRACTICES ? (id as PracticeId) : null;
  } catch {
    return null;
  }
};

/**
 * Saying "I use it", wherever a practice shows: the reader, the counts, the toggle. A signed-out press
 * opens the dialog that asks them to sign in; the practice pressed is voted on their way back.
 */
export function useVoting(where: "home" | "practice") {
  const [me, setMe] = useState<Me>({ user: null, votes: [] });
  const [counts, setCounts] = useState<Partial<Record<PracticeId, number>>>({});
  const [firstVote, setFirstVote] = useState(false);
  const [asking, setAsking] = useState<PracticeId | null>(null);

  useEffect(() => {
    void getCounts().then(setCounts);
    void getMe().then(async (current) => {
      setMe(current);
      const pending = takePending();
      if (current.user === null || pending === null || current.votes.includes(pending)) return;
      const votes = await setVote(pending, true);
      if (votes === null) return;
      track("vote", { practice: pending, on: true, where, after_sign_in: true });
      setMe({ ...current, votes });
      setCounts((all) => ({ ...all, [pending]: (all[pending] ?? 0) + 1 }));
      if (current.votes.length === 0) setFirstVote(true);
    });
  }, [where]);

  const toggle = async (id: PracticeId) => {
    if (me.user === null) {
      setAsking(id);
      track("start_dialog_shown", { practice: id, where });
      return;
    }
    const on = !me.votes.includes(id);
    const before = me;
    setMe({ ...me, votes: on ? [...me.votes, id] : me.votes.filter((v) => v !== id) });
    setCounts((all) => ({ ...all, [id]: Math.max(0, (all[id] ?? 0) + (on ? 1 : -1)) }));
    if (on && me.votes.length === 0) setFirstVote(true);
    const votes = await setVote(id, on);
    if (votes === null) setMe(before);
    else {
      setMe({ ...me, votes });
      track("vote", { practice: id, on, where });
    }
  };

  const dialog =
    asking === null ? null : (
      <StartDialog
        practice={asking}
        onClose={() => setAsking(null)}
        onSignIn={() => {
          keepPending(asking);
          track("sign_in_started", { from: "dialog", where });
          signIn(window.location.pathname + window.location.search);
        }}
      />
    );

  return { me, counts, firstVote, toggle, dialog };
}

/**
 * The dialog of a signed-out "I use it": why to sign in, and the way to. It keeps the keyboard's focus
 * inside while open, closes on Escape or a click beside it, and gives the focus back to what opened it.
 */
function StartDialog({
  practice,
  onClose,
  onSignIn,
}: {
  practice: PracticeId;
  onClose: () => void;
  onSignIn: () => void;
}) {
  const { t } = useWords();
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    box.current?.querySelector<HTMLElement>("button")?.focus();
    const keys = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key !== "Tab" || box.current === null) return;
      const focusable = [...box.current.querySelectorAll<HTMLElement>("button")];
      const first = focusable[0];
      const last = focusable.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    window.addEventListener("keydown", keys);
    return () => {
      window.removeEventListener("keydown", keys);
      opener?.focus();
    };
  }, [onClose]);

  return (
    <div className="foundations-modal" onClick={onClose}>
      <div
        ref={box}
        className="foundations-modal-box"
        role="dialog"
        aria-modal="true"
        aria-labelledby="foundations-start-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h3 id="foundations-start-title">{t.start.title}</h3>
        <p>{t.start.text(PRACTICES[practice].name)}</p>
        <div className="foundations-modal-actions">
          <button type="button" className="foundations-modal-primary" onClick={onSignIn}>
            {t.signIn}
          </button>
          <button type="button" onClick={onClose}>
            {t.start.later}
          </button>
        </div>
      </div>
    </div>
  );
}
