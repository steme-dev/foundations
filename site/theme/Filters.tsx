import { CELLS, type Cell } from "../../data/grid.ts";
import type { Practice } from "../../data/practices.ts";
import { THEMES, type Theme } from "../../data/themes.ts";
import { themeLabel } from "../i18n.ts";
import { useWords } from "./lang.ts";

export type Filter = { readonly cell: Cell | null; readonly theme: Theme | null };

export const NO_FILTER: Filter = { cell: null, theme: null };

/** How the library is ordered: by name, which does not move when a reader votes, or by use. */
export type Sort = "name" | "most-used" | "least-used";

const SORTS: readonly Sort[] = ["name", "most-used", "least-used"];

const cells = Object.keys(CELLS) as Cell[];
const themes = Object.keys(THEMES) as Theme[];

export const matches = (practice: Practice, { cell, theme }: Filter): boolean =>
  (cell === null || practice.cells.includes(cell)) &&
  (theme === null || practice.themes.includes(theme));

/** The selects, where a practice acts with an agent, its category and the order, and how many show. */
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
  const { lang, t } = useWords();
  return (
    <div className="foundations-filters">
      <label>
        <span>{t.withAgent}</span>
        <select
          value={filter.cell ?? ""}
          onChange={(event) =>
            onChange({ ...filter, cell: (event.target.value || null) as Cell | null })
          }
        >
          <option value="">{t.anywhere}</option>
          {cells.map((c) => (
            <option key={c} value={c}>
              {CELLS[c].label}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span>{t.category}</span>
        <select
          value={filter.theme ?? ""}
          onChange={(event) =>
            onChange({ ...filter, theme: (event.target.value || null) as Theme | null })
          }
        >
          <option value="">{t.everyCategory}</option>
          {themes.map((theme) => (
            <option key={theme} value={theme}>
              {themeLabel(lang, theme)}
            </option>
          ))}
        </select>
      </label>
      {sort === undefined || onSort === undefined ? null : (
        <label>
          <span>{t.sort}</span>
          <select value={sort} onChange={(event) => onSort(event.target.value as Sort)}>
            {SORTS.map((s) => (
              <option key={s} value={s}>
                {t.sorts[s]}
              </option>
            ))}
          </select>
        </label>
      )}
      <span className="foundations-count">{t.practices(shown)}</span>
    </div>
  );
}
