import { useEffect, useState } from "react";

import { type Me as MeState, forgetMe, getMe, profilePath, signIn, signOut } from "./api.ts";
import { PracticeList } from "./PracticeList.tsx";

/** The signed-in reader's page: the practices they use, the link to share, sign out, delete everything. */
export default function Me() {
  const [me, setMe] = useState<MeState | null>(null);
  const [copied, setCopied] = useState(false);
  useEffect(() => void getMe().then(setMe), []);

  if (me === null) return <p>Loading…</p>;
  if (me.user === null)
    return (
      <button type="button" className="foundations-signin" onClick={() => signIn("/me")}>
        Sign in with GitHub
      </button>
    );

  const { login } = me.user;
  const link = `${window.location.origin}${profilePath(login)}`;
  return (
    <section className="foundations-me">
      <p>
        Signed in as <strong>@{login}</strong>. You use {me.votes.length} practice
        {me.votes.length === 1 ? "" : "s"}.
      </p>
      <div className="foundations-share">
        <a href={profilePath(login)}>{link}</a>
        <button
          type="button"
          onClick={() => void navigator.clipboard.writeText(link).then(() => setCopied(true))}
        >
          {copied ? "Copied" : "Copy the link"}
        </button>
      </div>
      <p className="foundations-hint">This list is public, for you to share.</p>
      {me.votes.length === 0 ? (
        <p>
          None yet: say which ones you use on <a href="/">the library</a>.
        </p>
      ) : (
        <PracticeList ids={me.votes} />
      )}
      <div className="foundations-account-actions">
        <button
          type="button"
          onClick={() => void signOut().then(() => window.location.assign("/"))}
        >
          Sign out
        </button>
        <button
          type="button"
          className="foundations-danger"
          onClick={() => {
            if (
              window.confirm(
                "Delete your account and every practice you said you use? This cannot be undone.",
              )
            )
              void forgetMe().then(() => window.location.assign("/"));
          }}
        >
          Delete my account and votes
        </button>
      </div>
    </section>
  );
}
