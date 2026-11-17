import { useEffect, useRef, useState } from "react";

import { CELLS } from "../../data/grid.ts";
import { PEOPLE } from "../../data/people.ts";
import { PRACTICES, type Practice, type PracticeId } from "../../data/practices.ts";
import { definition, themeLabel } from "../i18n.ts";
import { PROPOSE_URL, profilePath, sharePath } from "./api.ts";
import { type Filter, Filters, NO_FILTER, type Sort, matches } from "./Filters.tsx";
import GridTally from "./GridTally.tsx";
import Journey from "./Journey.tsx";
import { useWords } from "./lang.ts";
import { track } from "./track.ts";
import { shownCount, useVoting } from "./votes.tsx";

const practices = Object.entries(PRACTICES) as [PracticeId, Practice][];

/** A text as a search compares it: lower case, without accents. */
const fold = (text: string): string =>
  text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();

/** The library on the home: one practice per row, its "I use it" on the right, counted by the worker. */
export default function Library() {
  const { lang, t, link } = useWords();
  const [filter, setFilter] = useState<Filter>(NO_FILTER);
  const [sort, setSort] = useState<Sort>("name");
  const [query, setQuery] = useState("");
  const { me, counts, firstVote, toggle, dialog } = useVoting("home");

  // A search is counted once it settles, not at every key.
  const searched = useRef("");
  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (query.trim() !== "" && query !== searched.current) {
        searched.current = query;
        track("search_used", { length: query.trim().length });
      }
    }, 1200);
    return () => window.clearTimeout(timer);
  }, [query]);

  const changeFilter = (next: Filter) => {
    setFilter(next);
    track("filter_used", { cell: next.cell ?? "", category: next.theme ?? "" });
  };

  const used = new Set(me.votes);
  const words = fold(query).split(/\s+/u).filter(Boolean);
  const shown = practices
    .filter(([, practice]) => matches(practice, filter))
    .filter(([id, practice]) => {
      const text = fold(`${practice.name} ${definition(lang, id)}`);
      return words.every((word) => text.includes(word));
    })
    .toSorted(([a, pa], [b, pb]) => {
      const byName = pa.name.localeCompare(pb.name);
      if (sort === "name") return byName;
      const byUse = (counts[b] ?? 0) - (counts[a] ?? 0);
      return (sort === "most-used" ? byUse : -byUse) || byName;
    });

  return (
    <section className="foundations-library">
      <Journey me={me} />
      {firstVote && me.user !== null ? (
        <p className="foundations-notice">
          {t.firstVote.before}
          <a href={profilePath(me.user.login, link)}>{sharePath(me.user.login, link)}</a>
          {t.firstVote.middle}
          <a href={link("/me")}>{t.firstVote.page}</a>
          {t.firstVote.end}
        </p>
      ) : null}

      <input
        type="search"
        className="foundations-search"
        placeholder={t.searchPlaceholder}
        aria-label={t.searchPlaceholder}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      <Filters
        filter={filter}
        onChange={changeFilter}
        shown={shown.length}
        sort={sort}
        onSort={(next) => {
          setSort(next);
          track("filter_used", { sort: next });
        }}
      />

      <ol className="foundations-rows">
        {shown.map(([id, practice]) => {
          const mine = used.has(id);
          return (
            <li key={id} className="foundations-row">
              <div className="foundations-row-body">
                <a className="foundations-row-name" href={link(`/practices/${id}`)}>
                  {practice.name}
                </a>
                <p className="foundations-row-definition">{definition(lang, id)}</p>
                <p className="foundations-row-meta">
                  {practice.cells.map((c) => (
                    <button
                      type="button"
                      key={c}
                      className="foundations-tag"
                      onClick={() => changeFilter({ ...filter, cell: c })}
                    >
                      {CELLS[c].label}
                    </button>
                  ))}
                  {practice.themes.map((theme) => (
                    <button
                      type="button"
                      key={theme}
                      className="foundations-tag"
                      onClick={() => changeFilter({ ...filter, theme })}
                    >
                      {themeLabel(lang, theme)}
                    </button>
                  ))}
                  {practice.credited.length > 0 ? (
                    <span>
                      {t.namedBy} {practice.credited.map((p) => PEOPLE[p].name).join(", ")}
                    </span>
                  ) : null}
                  <span>{t.sources(practice.sources.length)}</span>
                </p>
              </div>
              <button
                type="button"
                className="foundations-use"
                aria-pressed={mine}
                aria-label={t.iUse(practice.name)}
                onClick={() => void toggle(id)}
              >
                <span className="foundations-use-label">{t.iUseIt}</span>
                <span className="foundations-use-count">{shownCount(counts[id])}</span>
              </button>
            </li>
          );
        })}
      </ol>
      {shown.length === 0 ? <p>{query.trim() === "" ? t.noneThere : t.noMatch}</p> : null}
      {me.user === null ? null : <GridTally login={me.user.login} votes={me.votes} />}
      {dialog}
      <div className="foundations-propose">
        <span>{t.missing}</span>
        <a
          className="foundations-cta"
          href={PROPOSE_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track("propose_clicked", { from: "list" })}
        >
          {t.propose}
        </a>
      </div>
    </section>
  );
}
