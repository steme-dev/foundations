import { useEffect, useState } from "react";

import { CELLS, type Cell } from "../../data/grid.ts";
import { PRACTICES, type PracticeId } from "../../data/practices.ts";
import { useWords } from "./lang.ts";

const ROWS = [
  { label: "Guides", hint: "before", cells: ["GI", "GC"] as const },
  { label: "Sensors", hint: "after", cells: ["SI", "SC"] as const },
] as const;
const STEP_MS = 260;

const cellsOf = (id: PracticeId): readonly Cell[] => PRACTICES[id].cells;

/** A few practices that act in a cell, none of them already used: what an empty cell could hold. */
const suggestions = (cell: Cell, used: readonly PracticeId[]): PracticeId[] =>
  (Object.keys(PRACTICES) as PracticeId[])
    .filter((id) => cellsOf(id).includes(cell) && !used.includes(id))
    .slice(0, 3);

/**
 * A person's practices falling into Böckeler's grid one by one, in the order they said they use them:
 * it plays once when the page opens, then waits for "Replay". Below, how much of the grid they cover.
 * A cell's title leads to the cell's page, each practice in it to its own.
 */
export default function ProfileGrid({
  login,
  votes,
  heading,
}: {
  login: string;
  votes: readonly PracticeId[];
  /** The title and lede of a grid that is no one's: one shared without an account. */
  heading?: { title: string; lede: string };
}) {
  const { t, link } = useWords();
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
        <h3>{heading?.title ?? t.harnessTitle(login)}</h3>
        <p>
          {heading?.lede ?? t.harnessLede(login)}
          <a href={link("/grid/")}>{t.harnessLedeLink}</a>.
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
              <small>{t[row.hint]}</small>
            </span>
            {row.cells.map((cell) => {
              const here = ids
                .map((id, order) => ({ id, order }))
                .filter(({ id, order }) => order < shown && cellsOf(id).includes(cell));
              return (
                <div
                  key={cell}
                  className="foundations-pgrid-cell"
                  data-on={here.length > 0 ? "" : undefined}
                >
                  <a className="foundations-pgrid-label" href={link(`/grid/${CELLS[cell].slug}`)}>
                    {CELLS[cell].label}
                    <b>{here.length}</b>
                  </a>
                  {here.length === 0 && !playing ? (
                    <span className="foundations-pgrid-empty">
                      {t.emptyCell}{" "}
                      {suggestions(cell, ids).map((id, k) => (
                        <span key={id}>
                          {k > 0 ? ", " : ""}
                          <a href={link(`/practices/${id}`)}>{PRACTICES[id].name}</a>
                        </span>
                      ))}
                    </span>
                  ) : null}
                  <span className="foundations-pgrid-chips">
                    {here.map(({ id, order }) => (
                      <a
                        key={id}
                        href={link(`/practices/${id}`)}
                        className="foundations-pgrid-chip"
                        data-new={order === shown - 1 && playing ? "" : undefined}
                      >
                        {PRACTICES[id].name}
                      </a>
                    ))}
                  </span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <figcaption className="foundations-pgrid-caption">
        <span>
          {t.covered(covered.length)}
          {covered.length === 4 ? t.coveredAll : covered.includes("SC") ? "." : t.coveredNoSensor}
        </span>
        <button type="button" onClick={() => setRun((r) => r + 1)} disabled={playing}>
          {playing ? t.playing : t.replay}
        </button>
      </figcaption>
    </figure>
  );
}
