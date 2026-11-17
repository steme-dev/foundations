import { useEffect, useState } from "react";

import { CELLS, type Cell } from "../../data/grid.ts";
import { PRACTICES, type PracticeId } from "../../data/practices.ts";

const ROWS = [
  { label: "Guides", hint: "before the agent acts", cells: ["GI", "GC"] as const },
  { label: "Sensors", hint: "after the agent acts", cells: ["SI", "SC"] as const },
];
const STEP_MS = 260;

const cellsOf = (id: PracticeId): readonly Cell[] => PRACTICES[id].cells;

/**
 * A person's practices falling into Böckeler's grid one by one, in the order they said they use them:
 * it plays once when the page opens, then waits for "Replay". Below, how much of the grid they cover.
 */
export default function ProfileGrid({
  login,
  votes,
}: {
  login: string;
  votes: readonly PracticeId[];
}) {
  const ids = votes.filter((id) => id in PRACTICES);
  const [shown, setShown] = useState(0);
  const [run, setRun] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(ids.length);
      return;
    }
    setShown(0);
    const timer = window.setInterval(() => {
      setShown((n) => {
        if (n >= ids.length) {
          window.clearInterval(timer);
          return n;
        }
        return n + 1;
      });
    }, STEP_MS);
    return () => window.clearInterval(timer);
  }, [run, ids.length]);

  const covered = (Object.keys(CELLS) as Cell[]).filter((cell) =>
    ids.some((id) => cellsOf(id).includes(cell)),
  );
  const playing = shown < ids.length;

  return (
    <figure className="foundations-pgrid" aria-label="Where these practices act in Böckeler's grid">
      <header className="foundations-pgrid-head">
        <h3>@{login}'s harness, built on the literature</h3>
        <p>
          The practices {login} uses, each placed where it acts when an agent writes the code:
          before it or after, judged by a model or decided by a program. The grid is{" "}
          <a href="/grid/">Birgitta Böckeler's</a>.
        </p>
      </header>
      <div className="foundations-pgrid-grid">
        <span />
        <span className="foundations-placement-axis">Inferential</span>
        <span className="foundations-placement-axis">Computational</span>
        {ROWS.map((row) => (
          <div key={row.label} className="foundations-placement-row">
            <span className="foundations-placement-axis">
              {row.label}
              <small>{row.hint}</small>
            </span>
            {row.cells.map((cell) => {
              const here = ids
                .map((id, order) => ({ id, order }))
                .filter(({ id, order }) => order < shown && cellsOf(id).includes(cell));
              return (
                <a
                  key={cell}
                  href={`/grid/${CELLS[cell].slug}`}
                  className="foundations-pgrid-cell"
                  data-on={here.length > 0 ? "" : undefined}
                >
                  <span className="foundations-pgrid-label">
                    {CELLS[cell].label}
                    <b>{here.length}</b>
                  </span>
                  <span className="foundations-pgrid-chips">
                    {here.map(({ id, order }) => (
                      <span
                        key={id}
                        className="foundations-pgrid-chip"
                        data-new={order === shown - 1 && playing ? "" : undefined}
                      >
                        {PRACTICES[id].name}
                      </span>
                    ))}
                  </span>
                </a>
              );
            })}
          </div>
        ))}
      </div>
      <figcaption className="foundations-pgrid-caption">
        <span>
          {covered.length} of 4 cells covered
          {covered.length === 4
            ? ": guides and sensors, inferred and computed."
            : covered.includes("SC")
              ? "."
              : ", none yet where a program checks the work."}
        </span>
        <button type="button" onClick={() => setRun((r) => r + 1)} disabled={playing}>
          {playing ? "Playing…" : "▶ Replay"}
        </button>
      </figcaption>
    </figure>
  );
}
