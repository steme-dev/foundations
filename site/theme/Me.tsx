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
import { Dialog } from "./Dialog.tsx";
import { useWords } from "./lang.ts";
import { track } from "./track.ts";

/**
 * The signed-in reader's account: who they are, how many practices they use, the way to their list and
 * the link to share it, and signing out; then, apart, deleting everything. Both are confirmed first. The
 * list itself is on their public page, not repeated here.
 */
export default function Me() {
  const { t, link: to } = useWords();
  const [me, setMe] = useState<MeState | null>(null);
  const [copied, setCopied] = useState(false);
  const [confirming, setConfirming] = useState<"sign-out" | "delete" | null>(null);
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
  const close = () => setConfirming(null);
  return (
    <section className="foundations-me">
      <p className="foundations-signed-in">
        <span>
          {t.signedInAs} <strong>@{login}</strong>. {t.youUse(me.votes.length)}
        </span>
        <button
          type="button"
          className="foundations-sign-out"
          onClick={() => setConfirming("sign-out")}
        >
          {t.signOut}
        </button>
      </p>
      <p>
        <a className="foundations-cta" href={profilePath(login, to)}>
          {t.seeList}
        </a>
      </p>
      <div className="foundations-share">
        <span>{t.shareIt}</span>
        <code>{link}</code>
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

      <section className="foundations-danger-zone">
        <p className="foundations-danger-title">{t.dangerZone}</p>
        <div className="foundations-account-actions">
          <button
            type="button"
            className="foundations-danger"
            onClick={() => setConfirming("delete")}
          >
            {t.deleteAll}
          </button>
        </div>
      </section>

      {confirming === "sign-out" ? (
        <Dialog
          title={t.confirmSignOut.title}
          onClose={close}
          actions={
            <>
              <button
                type="button"
                className="foundations-modal-primary"
                onClick={() => void signOut().then(() => window.location.assign(to("/")))}
              >
                {t.signOut}
              </button>
              <button type="button" onClick={close}>
                {t.cancel}
              </button>
            </>
          }
        >
          <p>{t.confirmSignOut.text}</p>
        </Dialog>
      ) : null}
      {confirming === "delete" ? (
        <Dialog
          title={t.confirmDeleteTitle}
          onClose={close}
          actions={
            <>
              <button type="button" onClick={close}>
                {t.cancel}
              </button>
              <button
                type="button"
                className="foundations-modal-danger"
                onClick={() => void forgetMe().then(() => window.location.assign(to("/")))}
              >
                {t.deleteForGood}
              </button>
            </>
          }
        >
          <p>{t.confirmDelete}</p>
        </Dialog>
      ) : null}
    </section>
  );
}
