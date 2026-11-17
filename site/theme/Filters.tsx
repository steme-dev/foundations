import { CELLS, type Cell } from "../../data/grid.ts";
import type { Practice } from "../../data/practices.ts";
import { THEMES, type Theme } from "../../data/themes.ts";

export type Filter = { readonly cell: Cell | null; readonly theme: Theme | null };

export const NO_FILTER: Filter = { cell: null, theme: null };

/** How the library is ordered: by name, which does not move when a reader votes, or by use. */
export type Sort = "name" | "most-used" | "least-used";

export const SORTS: Record<Sort, string> = {
  name: "A to Z",
  "most-used": "Most used",
  "least-used": "Least used",
};

const cells = Object.keys(CELLS) as Cell[];
const themes = Object.keys(THEMES) as Theme[];

export const matches = (practice: Practice, { cell, theme }: Filter): boolean =>
  (cell === null || practice.cells.includes(cell)) &&
  (theme === null || practice.themes.includes(theme));

/** The two selects, where a practice acts with an agent and its theme, and how many practices show. */
export function Filters({
  filter,
  onChange,
  shown,
  sort,
  onSort,
}: {
  filter: Filter;
  onChange: (filter: Filter) => void;
  shown: number;
  sort?: Sort;
  onSort?: (sort: Sort) => void;
}) {
  return (
    <div className="foundations-filters">
      <label>
        <span>With an agent</span>
        <select
          value={filter.cell ?? ""}
          onChange={(event) =>
            onChange({ ...filter, cell: (event.target.value || null) as Cell | null })
          }
        >
          <option value="">Anywhere in the grid</option>
          {cells.map((c) => (
            <option key={c} value={c}>
              {CELLS[c].label}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span>Theme</span>
        <select
          value={filter.theme ?? ""}
          onChange={(event) =>
            onChange({ ...filter, theme: (event.target.value || null) as Theme | null })
          }
        >
          <option value="">Every theme</option>
          {themes.map((t) => (
            <option key={t} value={t}>
              {THEMES[t]}
            </option>
          ))}
        </select>
      </label>
      {sort === undefined || onSort === undefined ? null : (
        <label>
          <span>Sort</span>
          <select value={sort} onChange={(event) => onSort(event.target.value as Sort)}>
            {(Object.keys(SORTS) as Sort[]).map((s) => (
              <option key={s} value={s}>
                {SORTS[s]}
              </option>
            ))}
          </select>
        </label>
      )}
      <span className="foundations-count">
        {shown} practice{shown === 1 ? "" : "s"}
      </span>
    </div>
  );
}
