import { useEffect, useState } from "react";

import { CELLS } from "../../data/grid.ts";
import { PEOPLE } from "../../data/people.ts";
import { PRACTICES, type Practice, type PracticeId } from "../../data/practices.ts";
import { definition, themeLabel } from "../i18n.ts";
import { type Me, PROPOSE_URL, getCounts, getMe, profilePath, setVote, signIn } from "./api.ts";
import { type Filter, Filters, NO_FILTER, type Sort, matches } from "./Filters.tsx";
import GridTally from "./GridTally.tsx";
import Journey from "./Journey.tsx";
import { useWords } from "./lang.ts";

const practices = Object.entries(PRACTICES) as [PracticeId, Practice][];

/** The practice a reader pressed before signing in, kept for their way back from GitHub. */
const PENDING = "foundations:pending-vote";

const keepPending = (id: PracticeId): void => {
  try {
    sessionStorage.setItem(PENDING, id);
  } catch {
    // Without storage, the reader presses it again once signed in.
  }
};

const takePending = (): PracticeId | null => {
  try {
    const id = sessionStorage.getItem(PENDING);
    sessionStorage.removeItem(PENDING);
    return id !== null && id in PRACTICES ? (id as PracticeId) : null;
  } catch {
    return null;
  }
};

/** The library on the home: one practice per row, its "I use it" on the right, counted by the worker. */
export default function Library() {
  const { lang, t, link } = useWords();
  const [filter, setFilter] = useState<Filter>(NO_FILTER);
  const [sort, setSort] = useState<Sort>("name");
  const [me, setMe] = useState<Me>({ user: null, votes: [] });
  const [counts, setCounts] = useState<Partial<Record<PracticeId, number>>>({});
  const [firstVote, setFirstVote] = useState(false);
  const [asking, setAsking] = useState<PracticeId | null>(null);

  useEffect(() => {
    void getCounts().then(setCounts);
    void getMe().then(async (current) => {
      setMe(current);
      // A practice pressed before signing in is voted once the reader is back from GitHub.
      const pending = takePending();
      if (current.user === null || pending === null || current.votes.includes(pending)) return;
      const votes = await setVote(pending, true);
      if (votes === null) return;
      setMe({ ...current, votes });
      setCounts((all) => ({ ...all, [pending]: (all[pending] ?? 0) + 1 }));
      if (current.votes.length === 0) setFirstVote(true);
    });
  }, []);

  useEffect(() => {
    if (asking === null) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setAsking(null);
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [asking]);

  const used = new Set(me.votes);

  const toggle = async (id: PracticeId) => {
    if (me.user === null) {
      setAsking(id);
      return;
    }
    const on = !used.has(id);
    const before = me;
    setMe({ ...me, votes: on ? [...me.votes, id] : me.votes.filter((v) => v !== id) });
    setCounts({ ...counts, [id]: Math.max(0, (counts[id] ?? 0) + (on ? 1 : -1)) });
    if (on && me.votes.length === 0) setFirstVote(true);
    const votes = await setVote(id, on);
    if (votes === null) setMe(before);
    else setMe({ ...me, votes });
  };

  const shown = practices
    .filter(([, practice]) => matches(practice, filter))
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
          <a href={profilePath(me.user.login, link)}>{profilePath(me.user.login, link)}</a>
          {t.firstVote.middle}
          <a href={link("/me")}>{t.firstVote.page}</a>
          {t.firstVote.end}
        </p>
      ) : null}

      <Filters
        filter={filter}
        onChange={setFilter}
        shown={shown.length}
        sort={sort}
        onSort={setSort}
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
                      onClick={() => setFilter({ ...filter, cell: c })}
                    >
                      {CELLS[c].label}
                    </button>
                  ))}
                  {practice.themes.map((theme) => (
                    <button
                      type="button"
                      key={theme}
                      className="foundations-tag"
                      onClick={() => setFilter({ ...filter, theme })}
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
                <span className="foundations-use-count">{counts[id] ?? 0}</span>
              </button>
            </li>
          );
        })}
      </ol>
      {shown.length === 0 ? <p>{t.noneThere}</p> : null}
      {me.user === null ? null : <GridTally login={me.user.login} votes={me.votes} />}
      {asking === null ? null : (
        <div className="foundations-modal" onClick={() => setAsking(null)}>
          <div
            className="foundations-modal-box"
            role="dialog"
            aria-modal="true"
            aria-labelledby="foundations-start-title"
            onClick={(event) => event.stopPropagation()}
          >
            <h3 id="foundations-start-title">{t.start.title}</h3>
            <p>{t.start.text(PRACTICES[asking].name)}</p>
            <div className="foundations-modal-actions">
              <button
                type="button"
                className="foundations-modal-primary"
                autoFocus
                onClick={() => {
                  keepPending(asking);
                  signIn(window.location.pathname);
                }}
              >
                {t.signIn}
              </button>
              <button type="button" onClick={() => setAsking(null)}>
                {t.start.later}
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="foundations-propose">
        <span>{t.missing}</span>
        <a className="foundations-cta" href={PROPOSE_URL} target="_blank" rel="noopener noreferrer">
          {t.propose}
        </a>
      </div>
    </section>
  );
}
