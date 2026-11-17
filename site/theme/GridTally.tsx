import { useEffect, useRef, useState } from "react";

import { CELLS, type Cell } from "../../data/grid.ts";
import { PRACTICES, type PracticeId } from "../../data/practices.ts";
import { profilePath } from "./api.ts";

const ORDER: readonly Cell[] = ["GI", "GC", "SI", "SC"];
const SHORT: Record<Cell, string> = {
  GI: "Inferential guides",
  GC: "Computational guides",
  SI: "Inferential sensors",
  SC: "Computational sensors",
};

const tally = (votes: readonly PracticeId[]): Record<Cell, number> => {
  const counts: Record<Cell, number> = { GI: 0, GC: 0, SI: 0, SC: 0 };
  for (const id of votes)
    if (id in PRACTICES)
      for (const cell of PRACTICES[id].cells as readonly Cell[]) counts[cell] += 1;
  return counts;
};

/**
 * The reader's grid while they vote, kept in a corner of the library: each cell's count, the cell a
 * vote just reached flashing, and the way to their whole grid. Shown once they use a practice.
 */
export default function GridTally({
  login,
  votes,
}: {
  login: string;
  votes: readonly PracticeId[];
}) {
  const counts = tally(votes);
  const before = useRef(counts);
  const [bumped, setBumped] = useState<Cell[]>([]);

  useEffect(() => {
    const grew = ORDER.filter((cell) => counts[cell] > before.current[cell]);
    before.current = counts;
    if (grew.length === 0) return;
    setBumped(grew);
    const timer = window.setTimeout(() => setBumped([]), 700);
    return () => window.clearTimeout(timer);
  }, [votes]);

  if (votes.length === 0) return null;
  return (
    <aside className="foundations-tally" aria-label="Your grid so far">
      <p className="foundations-tally-title">Your harness, cell by cell</p>
      <div className="foundations-tally-grid">
        {ORDER.map((cell) => (
          <a
            key={cell}
            href={`/grid/${CELLS[cell].slug}`}
            className="foundations-tally-cell"
            data-on={counts[cell] > 0 ? "" : undefined}
            data-bump={bumped.includes(cell) ? "" : undefined}
            title={CELLS[cell].label}
          >
            <b>{counts[cell]}</b>
            <span>{SHORT[cell]}</span>
          </a>
        ))}
      </div>
      <a className="foundations-tally-cta" href={profilePath(login)}>
        See my grid →
      </a>
    </aside>
  );
}
