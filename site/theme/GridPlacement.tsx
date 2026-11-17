import { CELLS, type Cell } from "../../data/grid.ts";

const ROWS = [
  { label: "Guides", hint: "before the agent acts", cells: ["GI", "GC"] as const },
  { label: "Sensors", hint: "after the agent acts", cells: ["SI", "SC"] as const },
];

/**
 * Böckeler's grid in small, a practice's cells lit: where it acts when an agent writes the code. Each
 * cell links to its page; the lit ones light up in turn as the page opens.
 */
export default function GridPlacement({ cells }: { cells: readonly Cell[] }) {
  return (
    <figure
      className="foundations-placement"
      aria-label="Where this practice acts in Böckeler's grid"
    >
      <div className="foundations-placement-grid">
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
              const on = cells.includes(cell);
              return (
                <a
                  key={cell}
                  href={`/grid/${CELLS[cell].slug}`}
                  className="foundations-placement-cell"
                  data-on={on ? "" : undefined}
                  style={
                    on ? { animationDelay: `${120 + 160 * cells.indexOf(cell)}ms` } : undefined
                  }
                >
                  <span>{CELLS[cell].label}</span>
                  {on ? <small>here</small> : null}
                </a>
              );
            })}
          </div>
        ))}
      </div>
    </figure>
  );
}
