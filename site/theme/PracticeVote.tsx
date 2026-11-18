import { PRACTICES, type PracticeId } from "../../data/practices.ts";
import { signIn } from "./api.ts";
import { useWords } from "./lang.ts";
import { track } from "./track.ts";
import { COUNT_FROM, useVoting } from "./votes.tsx";

/**
 * "I use it" on a practice's own page, with how many readers say so once there are enough to tell.
 * Signed out, the choice is kept in this browser, and the way to save it with GitHub follows it.
 */
export default function PracticeVote({ id }: { id: PracticeId }) {
  const { t } = useWords();
  const { me, counts, toggle } = useVoting("practice");
  const mine = me.votes.includes(id);
  const n = counts[id] ?? 0;
  return (
    <div className="foundations-practice-vote">
      <button
        type="button"
        className="foundations-use foundations-use-wide"
        aria-pressed={mine}
        aria-label={t.iUse(PRACTICES[id].name)}
        onClick={() => void toggle(id)}
      >
        <span className="foundations-use-label">{mine ? t.youUseIt : t.iUseIt}</span>
      </button>
      {mine && me.user === null ? (
        <span className="foundations-practice-count">
          {t.keptHere}{" "}
          <button
            type="button"
            className="foundations-inline-link"
            onClick={() => {
              track("sign_in_started", { from: "practice" });
              signIn(window.location.pathname);
            }}
          >
            {t.saveIt}
          </button>
        </span>
      ) : (
        <span className="foundations-practice-count">
          {n >= COUNT_FROM ? t.peopleUse(n) : t.beFirst}
        </span>
      )}
    </div>
  );
}
