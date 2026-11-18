import { useEffect, useState } from "react";

import { PRACTICES } from "../../data/practices.ts";
import { type Profile as ProfileData, getMe, getProfile, sharePath } from "./api.ts";
import { track } from "./track.ts";
import { type Filter, Filters, NO_FILTER, matches } from "./Filters.tsx";
import { PracticeList } from "./PracticeList.tsx";
import ProfileGrid from "./ProfileGrid.tsx";
import { useWords } from "./lang.ts";

/** The login a profile page is for: `/u/?login=<login>`, where the worker sends `/u/<login>`. */
const loginOf = (location: Location): string =>
  decodeURIComponent(location.pathname.replace(/^(?:\/fr)?\/u\/?/u, "").replace(/\/$/u, "")) ||
  (new URLSearchParams(location.search).get("login") ?? "");

type View = "grid" | "list";

/** The view a page opens on: the grid, unless its address asks for the list. */
const viewOf = (location: Location): View =>
  new URLSearchParams(location.search).get("view") === "list" ? "list" : "grid";

/**
 * A person's public page: the practices they use, seen as their grid or as a list with its filters,
 * one at a time. The view chosen is kept in the address, so a link opens on it.
 */
export default function Profile() {
  const { t, link } = useWords();
  const [profile, setProfile] = useState<ProfileData | null | undefined>(undefined);
  const [filter, setFilter] = useState<Filter>(NO_FILTER);
  const [view, setView] = useState<View>("grid");
  const [own, setOwn] = useState(false);
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timer);
  }, [copied]);
  useEffect(() => setView(viewOf(window.location)), []);
  const show = (next: View) => {
    setView(next);
    const url = new URL(window.location.href);
    if (next === "list") url.searchParams.set("view", "list");
    else url.searchParams.delete("view");
    window.history.replaceState(null, "", url);
    track("view_switched", { view: next });
  };
  useEffect(() => {
    const login = loginOf(window.location);
    if (login === "") setProfile(null);
    else void getProfile(login).then(setProfile);
    void getMe().then((me) => {
      const mine = me.user !== null && me.user.login.toLowerCase() === login.toLowerCase();
      setOwn(mine);
      track("grid_viewed", { own: mine, list: login });
    });
  }, []);

  if (profile === undefined) return <p>{t.loading}</p>;
  if (profile === null)
    return (
      <p>
        {t.noOne} <a href={link("/")}>{t.backToLibrary}</a>.
      </p>
    );
  const shown = profile.votes.filter((id) => id in PRACTICES && matches(PRACTICES[id], filter));
  const share = async () => {
    const address = `${window.location.origin}${sharePath(profile.login, link)}`;
    await navigator.clipboard.writeText(address).catch(() => undefined);
    track("share_copied", { from: "profile", saved: true, practices: profile.votes.length });
    setCopied(true);
  };
  const views = (
    <div className="foundations-views" role="tablist" aria-label={t.views.label}>
      {(["grid", "list"] as const).map((v) => (
        <button key={v} type="button" role="tab" aria-selected={view === v} onClick={() => show(v)}>
          {t.views[v]}
        </button>
      ))}
    </div>
  );
  return (
    <section className="foundations-profile">
      <div className="foundations-profile-head">
        {profile.avatarUrl === null ? null : (
          <img src={profile.avatarUrl} alt="" width={56} height={56} />
        )}
        <div className="foundations-profile-who">
          <h2>
            <a
              href={`https://github.com/${profile.login}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              @{profile.login}
            </a>
          </h2>
          <p>{t.buildsOn(profile.votes.length)}</p>
        </div>
        <div className="foundations-harness-actions">
          {views}
          {own ? (
            <span className="foundations-tip-anchor">
              <button type="button" className="foundations-cta" onClick={() => void share()}>
                {t.harnessHead.share}
              </button>
              {copied ? (
                <span className="foundations-tip" role="status">
                  {t.harnessHead.copied}
                </span>
              ) : null}
            </span>
          ) : (
            <a
              className="foundations-cta"
              href={link("/")}
              onClick={() => track("build_own_clicked", { from: "profile" })}
            >
              {t.buildYours} →
            </a>
          )}
        </div>
      </div>
      {view === "grid" ? (
        <ProfileGrid
          login={profile.login}
          votes={profile.votes}
          heading={{ title: null, lede: t.profileLede }}
        />
      ) : (
        <>
          <Filters filter={filter} onChange={setFilter} shown={shown.length} />
          <PracticeList ids={shown} />
        </>
      )}
      {own ? (
        <a className="foundations-profile-more" href={link("/")}>
          {t.addMore}
        </a>
      ) : (
        <a className="foundations-cta" href={link("/")}>
          {t.sayWhich}
        </a>
      )}
    </section>
  );
}
