import { useEffect, useRef, useState } from "react";

import { CELLS, type Cell } from "../../data/grid.ts";
import { PEOPLE } from "../../data/people.ts";
import { PRACTICES, type Practice, type PracticeId } from "../../data/practices.ts";
import { definition, themeLabel } from "../i18n.ts";
import { PROPOSE_URL, createGrid, gridSharePath, profilePath, sharePath, signIn } from "./api.ts";
import { type Filter, Filters, NO_FILTER, type Sort, matches } from "./Filters.tsx";
import LibraryGrid from "./LibraryGrid.tsx";
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

/**
 * The line between the opening and the grid, there from the start so nothing moves at the first "+":
 * before any, it invites; then how many practices and how much of the grid they cover. Signed out, kept in this browser: sharing it needs no account (a
 * short link to the grid as it is, copied), and GitHub is offered beside it, to keep it everywhere
 * under their name. Signed in, the way to their own grid.
 */
function HarnessHead({ me }: { me: ReturnType<typeof useVoting>["me"] }) {
  const { t, link: to } = useWords();
  const h = t.harnessHead;
  const used = me.votes.filter((id) => id in PRACTICES);
  const covered = (Object.keys(CELLS) as Cell[]).filter((cell) =>
    used.some((id) => (PRACTICES[id].cells as readonly Cell[]).includes(cell)),
  ).length;
  const [copied, setCopied] = useState(false);
  // Whether the line is stuck under the navigation: only then does it draw its rule and its ground.
  const sentinel = useRef<HTMLSpanElement>(null);
  const [stuck, setStuck] = useState(false);
  useEffect(() => {
    const element = sentinel.current;
    if (element === null) return;
    const observer = new IntersectionObserver(
      ([entry]) =>
        setStuck(entry !== undefined && !entry.isIntersecting && entry.boundingClientRect.top < 80),
      { rootMargin: "-65px 0px 0px 0px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  const [sharing, setSharing] = useState(false);
  // "Link copied" shows over the button for a moment, then goes.
  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timer);
  }, [copied]);

  // A grid shared without an account: frozen as it is now, under a short link, which is copied.
  const share = async () => {
    setSharing(true);
    const id = await createGrid(used);
    setSharing(false);
    if (id === null) return;
    const address = `${window.location.origin}${gridSharePath(id, to)}`;
    track("share_copied", { from: "grid", saved: false, practices: used.length });
    await navigator.clipboard.writeText(address).catch(() => undefined);
    setCopied(true);
  };

  // The line, the same at every count: before any practice it invites; then it counts, and each number
  // pops as it grows.
  const line = (tail: string) => (
    <p className="foundations-harness-text">
      {h.lead}{" "}
      {used.length === 0 ? (
        <>
          {h.none[0]}{" "}
          <span className="foundations-plus" role="img" aria-label="+">
            +
          </span>{" "}
          {h.none[1]}
        </>
      ) : (
        <>
          <b key={`n${used.length}`} className="foundations-bump">
            {used.length}
          </b>{" "}
          {h.practices(used.length)},{" "}
          <b key={`c${covered}`} className="foundations-bump">
            {covered}
          </b>{" "}
          {h.cells}
          {tail}
        </>
      )}
    </p>
  );

  return (
    <>
      <span ref={sentinel} className="foundations-harness-sentinel" aria-hidden="true" />
      <div className="foundations-harness-head" data-stuck={stuck ? "" : undefined}>
        {me.user === null ? (
          <>
            {line(h.kept)}
            <div
              className="foundations-harness-actions"
              data-hidden={used.length === 0 ? "" : undefined}
            >
              <button
                type="button"
                className="foundations-inline-link"
                onClick={() => {
                  track("sign_in_started", { from: "grid", practices: used.length });
                  signIn(window.location.pathname);
                }}
              >
                {h.save}
              </button>
              <span className="foundations-tip-anchor">
                <button
                  type="button"
                  className="foundations-cta"
                  disabled={sharing}
                  onClick={() => void share()}
                >
                  {h.share}
                </button>
                {copied ? (
                  <span className="foundations-tip" role="status">
                    {h.copied}
                  </span>
                ) : null}
              </span>
            </div>
          </>
        ) : (
          <>
            {line(h.saved)}
            <div
              className="foundations-harness-actions"
              data-hidden={used.length === 0 ? "" : undefined}
            >
              <a className="foundations-harness-link" href={profilePath(me.user.login, to)}>
                {h.see}
              </a>
            </div>
          </>
        )}
      </div>
    </>
  );
}

/** The library on the home: one practice per row, its "I use it" on the right, counted by the worker. */
export default function Library() {
  const { lang, t, link } = useWords();
  const [filter, setFilter] = useState<Filter>(NO_FILTER);
  const [sort, setSort] = useState<Sort>("name");
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  // The view a link asks for (`?view=list`), kept in the address as the reader switches.
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("view") === "list") setView("list");
  }, []);
  const show = (next: "grid" | "list") => {
    setView(next);
    // The grid lays the cells out itself: a filter by cell would only hide some of it,
    // and an order would only shuffle each cell: the grid keeps the cells' own, by name.
    if (next === "grid") {
      setFilter((current) => ({ ...current, cell: null }));
      setSort("name");
    }
    const url = new URL(window.location.href);
    if (next === "list") url.searchParams.set("view", "list");
    else url.searchParams.delete("view");
    window.history.replaceState(null, "", url);
    track("view_switched", { view: next, where: "home" });
  };
  const { me, counts, firstVote, toggle } = useVoting("home");

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
      {firstVote && me.user !== null ? (
        <p className="foundations-notice">
          {t.firstVote.before}
          <a href={profilePath(me.user.login, link)}>{sharePath(me.user.login, link)}</a>
          {t.firstVote.middle}
          <a href={link("/me")}>{t.firstVote.page}</a>
          {t.firstVote.end}
        </p>
      ) : null}

      <HarnessHead me={me} />
      <Filters
        filter={filter}
        onChange={changeFilter}
        shown={shown.length}
        sort={view === "list" ? sort : undefined}
        onSort={
          view === "list"
            ? (next) => {
                setSort(next);
                track("filter_used", { sort: next });
              }
            : undefined
        }
        byCell={view === "list"}
        lead={
          <input
            type="search"
            className="foundations-search"
            placeholder={t.filterPlaceholder}
            aria-label={t.filterPlaceholder}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        }
        trail={
          <div className="foundations-views" role="tablist" aria-label={t.views.label}>
            {(["grid", "list"] as const).map((v) => (
              <button
                key={v}
                type="button"
                role="tab"
                aria-selected={view === v}
                onClick={() => show(v)}
              >
                {v === "grid" ? t.harnessGrid : t.views.list}
              </button>
            ))}
          </div>
        }
      />

      {view === "grid" ? (
        <LibraryGrid
          shown={shown}
          used={used}
          signedIn={me.user !== null || me.votes.length > 0}
          onToggle={(id) => void toggle(id)}
        />
      ) : (
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
      )}
      {shown.length === 0 ? <p>{query.trim() === "" ? t.noneThere : t.noMatch}</p> : null}
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
