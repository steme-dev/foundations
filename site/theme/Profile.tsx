import { useEffect, useState } from "react";

import { PRACTICES } from "../../data/practices.ts";
import { type Profile as ProfileData, getProfile } from "./api.ts";
import { type Filter, Filters, NO_FILTER, matches } from "./Filters.tsx";
import { PracticeList } from "./PracticeList.tsx";

/** The login a profile page is for: `/u/<login>`, or `/u/?login=<login>` where no worker rewrites the path. */
const loginOf = (location: Location): string =>
  decodeURIComponent(location.pathname.replace(/^\/u\/?/u, "").replace(/\/$/u, "")) ||
  (new URLSearchParams(location.search).get("login") ?? "");

/** A person's public list of the practices they use. */
export default function Profile() {
  const [profile, setProfile] = useState<ProfileData | null | undefined>(undefined);
  const [filter, setFilter] = useState<Filter>(NO_FILTER);
  useEffect(() => {
    const login = loginOf(window.location);
    if (login === "") setProfile(null);
    else void getProfile(login).then(setProfile);
  }, []);

  if (profile === undefined) return <p>Loading…</p>;
  if (profile === null)
    return (
      <p>
        No one here. <a href="/">Back to the library</a>.
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
          <p>
            Builds on {profile.votes.length} practice{profile.votes.length === 1 ? "" : "s"} of
            software engineering.
          </p>
        </div>
      </div>
      <Filters filter={filter} onChange={setFilter} shown={shown.length} />
      <PracticeList ids={shown} />
      <a className="foundations-cta" href="/">
        Say which ones you use
      </a>
    </section>
  );
}
