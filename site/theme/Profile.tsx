import { useEffect, useState } from "react";

import { PRACTICES } from "../../data/practices.ts";
import { type Profile as ProfileData, getMe, getProfile } from "./api.ts";
import { markGridVisited } from "./journey-state.ts";
import { track } from "./track.ts";
import { type Filter, Filters, NO_FILTER, matches } from "./Filters.tsx";
import { PracticeList } from "./PracticeList.tsx";
import ProfileGrid from "./ProfileGrid.tsx";
import { useWords } from "./lang.ts";

/** The login a profile page is for: `/u/?login=<login>`, where the worker sends `/u/<login>`. */
const loginOf = (location: Location): string =>
  decodeURIComponent(location.pathname.replace(/^(?:\/fr)?\/u\/?/u, "").replace(/\/$/u, "")) ||
  (new URLSearchParams(location.search).get("login") ?? "");

/** A person's public list of the practices they use. */
export default function Profile() {
  const { t, link } = useWords();
  const [profile, setProfile] = useState<ProfileData | null | undefined>(undefined);
  const [filter, setFilter] = useState<Filter>(NO_FILTER);
  useEffect(() => {
    const login = loginOf(window.location);
    if (login === "") setProfile(null);
    else void getProfile(login).then(setProfile);
    // The reader's own grid, opened once, ticks the third step of the way in.
    void getMe().then((me) => {
      const own = me.user !== null && me.user.login.toLowerCase() === login.toLowerCase();
      if (own) markGridVisited();
      track("grid_viewed", { own });
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
  return (
    <section className="foundations-profile">
      <div className="foundations-profile-head">
        {profile.avatarUrl === null ? null : (
          <img src={profile.avatarUrl} alt="" width={56} height={56} />
        )}
        <div>
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
      </div>
      <ProfileGrid login={profile.login} votes={profile.votes} />
      <Filters filter={filter} onChange={setFilter} shown={shown.length} />
      <PracticeList ids={shown} />
      <a className="foundations-cta" href={link("/")}>
        {t.sayWhich}
      </a>
    </section>
  );
}
