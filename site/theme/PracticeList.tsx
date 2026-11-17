import { PRACTICES, type PracticeId } from "../../data/practices.ts";
import { definition } from "../i18n.ts";
import { useWords } from "./lang.ts";

/** A list of practices, each with its definition, linked to its page. */
export function PracticeList({ ids }: { ids: readonly PracticeId[] }) {
  const { lang, link } = useWords();
  return (
    <ul className="foundations-list">
      {ids
        .filter((id) => id in PRACTICES)
        .map((id) => (
          <li key={id}>
            <a href={link(`/practices/${id}`)}>{PRACTICES[id].name}</a>
            <span>{definition(lang, id)}</span>
          </li>
        ))}
    </ul>
  );
}
