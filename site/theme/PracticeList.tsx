import { PRACTICES, type PracticeId } from "../../data/practices.ts";

/** A list of practices, each with its definition, linked to its page. */
export function PracticeList({ ids }: { ids: readonly PracticeId[] }) {
  return (
    <ul className="foundations-list">
      {ids
        .filter((id) => id in PRACTICES)
        .map((id) => (
          <li key={id}>
            <a href={`/practices/${id}`}>{PRACTICES[id].name}</a>
            <span>{PRACTICES[id].definition}</span>
          </li>
        ))}
    </ul>
  );
}
