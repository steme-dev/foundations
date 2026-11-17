import { PRACTICES, type PracticeId } from "../../data/practices.ts";
import { useWords } from "./lang.ts";
import { COUNT_FROM, useVoting } from "./votes.tsx";

/** "I use it" on a practice's own page, with how many readers say so once there are enough to tell. */
export default function PracticeVote({ id }: { id: PracticeId }) {
  const { t } = useWords();
  const { me, counts, toggle, dialog } = useVoting("practice");
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
      <span className="foundations-practice-count">
        {n >= COUNT_FROM ? t.peopleUse(n) : t.beFirst}
      </span>
      {dialog}
    </div>
  );
}
