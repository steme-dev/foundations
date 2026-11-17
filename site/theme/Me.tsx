import { useEffect, useState } from "react";

import {
  type Me as MeState,
  forgetMe,
  getMe,
  profilePath,
  sharePath,
  signIn,
  signOut,
} from "./api.ts";
import { useWords } from "./lang.ts";
import { track } from "./track.ts";
import { PracticeList } from "./PracticeList.tsx";

/** The signed-in reader's page: the practices they use, the link to share, sign out, delete everything. */
export default function Me() {
  const { t, link: to } = useWords();
  const [me, setMe] = useState<MeState | null>(null);
  const [copied, setCopied] = useState(false);
  useEffect(() => void getMe().then(setMe), []);

  if (me === null) return <p>{t.loading}</p>;
  if (me.user === null)
    return (
      <button type="button" className="foundations-signin" onClick={() => signIn(to("/me"))}>
        {t.signIn}
      </button>
    );

  const { login } = me.user;
  const link = `${window.location.origin}${sharePath(login, to)}`;
  return (
    <section className="foundations-me">
      <p>
        {t.signedInAs} <strong>@{login}</strong>. {t.youUse(me.votes.length)}
      </p>
      <div className="foundations-share">
        <a href={profilePath(login, to)}>{link}</a>
        <button
          type="button"
          onClick={() =>
            void navigator.clipboard.writeText(link).then(() => {
              setCopied(true);
              track("share_copied", { from: "me" });
            })
          }
        >
          {copied ? t.copied : t.copyLink}
        </button>
      </div>
      <p className="foundations-hint">{t.publicList}</p>
      {me.votes.length === 0 ? (
        <p>
          {t.noneYet} <a href={to("/")}>{t.theLibrary}</a>.
        </p>
      ) : (
        <PracticeList ids={me.votes} />
      )}
      <div className="foundations-account-actions">
        <button
          type="button"
          onClick={() => void signOut().then(() => window.location.assign(to("/")))}
        >
          {t.signOut}
        </button>
        <button
          type="button"
          className="foundations-danger"
          onClick={() => {
            if (window.confirm(t.confirmDelete))
              void forgetMe().then(() => window.location.assign(to("/")));
          }}
        >
          {t.deleteAll}
        </button>
      </div>
    </section>
  );
}
