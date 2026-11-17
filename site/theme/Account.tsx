import { useEffect, useState } from "react";

import type { PracticeId } from "../../data/practices.ts";
import { type Me, VOTES_EVENT, getMe, profilePath, signIn } from "./api.ts";
import { useWords } from "./lang.ts";

/**
 * The reader's place in the top navigation, which stays on screen: "Sign in with GitHub", or their
 * avatar and their list, its count kept up to date by every vote, and their page.
 */
export function Account() {
  const { t, link } = useWords();
  const [me, setMe] = useState<Me | null>(null);
  useEffect(() => {
    void getMe().then(setMe);
    const onVotes = (event: Event) =>
      setMe((current) =>
        current === null
          ? current
          : { ...current, votes: (event as CustomEvent<PracticeId[]>).detail },
      );
    window.addEventListener(VOTES_EVENT, onVotes);
    return () => window.removeEventListener(VOTES_EVENT, onVotes);
  }, []);

  if (me === null) return null;
  if (me.user === null)
    return (
      <button
        type="button"
        className="foundations-nav-signin"
        onClick={() => signIn(window.location.pathname + window.location.search)}
      >
        {t.signIn}
      </button>
    );
  return (
    <div className="foundations-nav-account">
      <a className="foundations-nav-list" href={profilePath(me.user.login, link)}>
        {me.user.avatarUrl === null ? null : (
          <img src={me.user.avatarUrl} alt="" width={22} height={22} />
        )}
        <span>{t.yourList}</span>
        <span className="foundations-nav-count">{me.votes.length}</span>
      </a>
      <a className="foundations-nav-me" href={link("/me")} title={t.yourAccount}>
        @{me.user.login}
      </a>
    </div>
  );
}
