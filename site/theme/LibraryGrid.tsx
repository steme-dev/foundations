import { useState } from "react";

import { CELLS, type Cell } from "../../data/grid.ts";
import type { Practice, PracticeId } from "../../data/practices.ts";
import { useWords } from "./lang.ts";

const ROWS = [
  { label: "Guides", hint: "before", cells: ["GI", "GC"] as const },
  { label: "Sensors", hint: "after", cells: ["SI", "SC"] as const },
] as const;

/** How many practices a cell shows before "+N more". */
const FOLDED = 12;

/**
 * The library laid out in Böckeler's grid: each practice in the cells where it acts, the ones the
 * reader uses lit and first, each with its own "I use it". A signed-in reader sees their harness on
 * the same view: how many of each cell's practices they use, and the cells still empty.
 */
export default function LibraryGrid({
  shown,
  used,
  signedIn,
  onToggle,
}: {
  shown: readonly [PracticeId, Practice][];
  used: ReadonlySet<PracticeId>;
  signedIn: boolean;
  onToggle: (id: PracticeId) => void;
}) {
  const { t, link } = useWords();
  const [unfolded, setUnfolded] = useState<ReadonlySet<Cell>>(new Set());

  return (
    <div className="foundations-pgrid-grid foundations-lgrid">
      <span />
      <span className="foundations-placement-axis">Inferential</span>
      <span className="foundations-placement-axis">Computational</span>
      {ROWS.map((row) => (
        <div key={row.label} className="foundations-placement-row">
          <span className="foundations-placement-axis foundations-lgrid-row">
            {row.label}
            <small>{t[row.hint]}</small>
          </span>
          {row.cells.map((cell) => {
            const here = shown
              .filter(([, p]) => p.cells.includes(cell))
              .toSorted(([a], [b]) => Number(used.has(b)) - Number(used.has(a)));
            const mine = here.filter(([id]) => used.has(id)).length;
            const open = unfolded.has(cell);
            const visible = open ? here : here.slice(0, FOLDED);
            return (
              <div
                key={mine > 0 ? `${cell}-on` : cell}
                className="foundations-lgrid-cell"
                data-on={mine > 0 ? "" : undefined}
              >
                <a className="foundations-pgrid-label" href={link(`/grid/${CELLS[cell].slug}`)}>
                  {CELLS[cell].label}
                  <b>{signedIn ? t.ofCell(mine, here.length) : here.length}</b>
                </a>
                <span className="foundations-lgrid-chips">
                  {visible.map(([id, practice]) => (
                    <span
                      key={used.has(id) ? `${id}-used` : id}
                      className="foundations-lgrid-chip"
                      data-used={used.has(id) ? "" : undefined}
                    >
                      <a href={link(`/practices/${id}`)}>{practice.name}</a>
                      <button
                        type="button"
                        aria-pressed={used.has(id)}
                        aria-label={t.iUse(practice.name)}
                        title={t.iUseIt}
                        onClick={() => onToggle(id)}
                      >
                        <span className="foundations-plus" aria-hidden="true">
                          {used.has(id) ? "✓" : "+"}
                        </span>
                      </button>
                    </span>
                  ))}
                  {here.length > FOLDED ? (
                    <button
                      type="button"
                      className="foundations-lgrid-more"
                      onClick={() =>
                        setUnfolded((cells) => {
                          const next = new Set(cells);
                          if (open) next.delete(cell);
                          else next.add(cell);
                          return next;
                        })
                      }
                    >
                      {open ? t.fewer : t.more(here.length - FOLDED)}
                    </button>
                  ) : null}
                </span>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
