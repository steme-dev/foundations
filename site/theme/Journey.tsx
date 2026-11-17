import { type Me, profilePath, signIn } from "./api.ts";
import { useWords } from "./lang.ts";

/**
 * The library's way in, in three steps: meet the giants, say what you use, build your harness. It
 * follows the reader: the second is ticked once they use a practice, the third leads to their grid.
 */
export default function Journey({ me }: { me: Me }) {
  const { t, link } = useWords();
  const j = t.journey;
  const voted = me.user !== null && me.votes.length > 0;
  return (
    <ol className="foundations-journey">
      <li data-step="1">
        <b>{j.meet.title}</b>
        <span>{j.meet.text}</span>
        <a href={link("/practices/")}>{j.meet.action} →</a>
      </li>
      <li data-step="2" data-done={voted ? "" : undefined}>
        <b>{j.say.title}</b>
        {voted ? (
          <span>{j.say.done(me.votes.length)}</span>
        ) : me.user === null ? (
          <>
            <span>{j.say.text}</span>
            <button type="button" onClick={() => signIn(window.location.pathname)}>
              {t.signIn}
            </button>
          </>
        ) : (
          <span>{j.say.signedIn}</span>
        )}
      </li>
      <li data-step="3">
        <b>{j.build.title}</b>
        <span>{j.build.text}</span>
        {voted && me.user !== null ? (
          <a href={profilePath(me.user.login, link)}>{j.build.action} →</a>
        ) : null}
      </li>
    </ol>
  );
}
