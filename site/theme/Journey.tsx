import { useEffect, useRef, useState } from "react";

import { type Me, profilePath, signIn } from "./api.ts";
import { gridVisited, journeyDone, markJourneyDone } from "./journey-state.ts";
import { useWords } from "./lang.ts";
import { track } from "./track.ts";

const toList = () =>
  document
    .querySelector(".foundations-search")
    ?.scrollIntoView({ behavior: "smooth", block: "start" });

/** The first step: down to the practices. */
const meet = () => {
  track("journey_step", { step: 1 });
  toList();
};

/**
 * The library's way in, in three steps: meet the giants, say what you use, build your harness. Its
 * cards sit under the lede; once they scroll out of sight, a bar under the navigation keeps the three
 * titles, each still a way forward. The second is ticked once the reader uses a practice, the third
 * once they have opened their grid; with both done, the steps go for good.
 */
export default function Journey({ me }: { me: Me }) {
  const { t, link } = useWords();
  const j = t.journey;
  const cards = useRef<HTMLOListElement>(null);
  const [past, setPast] = useState(false);
  const [visited, setVisited] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    setVisited(gridVisited());
    setDone(journeyDone());
  }, []);

  useEffect(() => {
    const element = cards.current;
    if (element === null) return;
    const observer = new IntersectionObserver(([entry]) =>
      setPast(entry !== undefined && !entry.isIntersecting && entry.boundingClientRect.top < 0),
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [done]);

  const voted = me.user !== null && me.votes.length > 0;
  useEffect(() => {
    if (voted && visited && !done) {
      markJourneyDone();
      setDone(true);
    }
  }, [voted, visited, done]);

  if (done) return null;
  const grid = me.user === null ? null : profilePath(me.user.login, link);
  const say = () => {
    track("journey_step", { step: 2, signed_in: me.user !== null });
    if (me.user === null) {
      track("sign_in_started", { from: "journey" });
      signIn(window.location.pathname);
    } else toList();
  };

  return (
    <>
      <ol ref={cards} className="foundations-journey">
        <li data-step="1" data-done={past ? "" : undefined}>
          <b>{j.meet.title}</b>
          <span>{j.meet.text}</span>
          <button type="button" className="foundations-journey-link" onClick={meet}>
            {j.meet.action}
          </button>
        </li>
        <li data-step="2" data-done={voted ? "" : undefined}>
          <b>{j.say.title}</b>
          {voted ? (
            <span>{j.say.done(me.votes.length)}</span>
          ) : me.user === null ? (
            <>
              <span>{j.say.text}</span>
              <button type="button" onClick={say} aria-label={t.signIn}>
                <span className="foundations-wide-only">{t.signIn}</span>
                <span className="foundations-phone-only">{t.signInShort}</span>
              </button>
            </>
          ) : (
            <span>{j.say.signedIn}</span>
          )}
        </li>
        <li data-step="3" data-done={visited ? "" : undefined}>
          <b>{j.build.title}</b>
          <span>{j.build.text}</span>
          {voted && grid !== null ? (
            <a href={grid} onClick={() => track("journey_step", { step: 3 })}>
              {j.build.action} →
            </a>
          ) : null}
        </li>
      </ol>
      <nav
        className="foundations-journey-bar"
        data-shown={past ? "" : undefined}
        aria-hidden={!past}
      >
        <button type="button" data-step="1" data-done="" onClick={meet} tabIndex={past ? 0 : -1}>
          {j.meet.title}
        </button>
        <button
          type="button"
          data-step="2"
          data-done={voted ? "" : undefined}
          onClick={say}
          tabIndex={past ? 0 : -1}
        >
          {j.say.title}
        </button>
        {voted && grid !== null ? (
          <a
            href={grid}
            data-step="3"
            data-done={visited ? "" : undefined}
            tabIndex={past ? 0 : -1}
          >
            {j.build.title}
          </a>
        ) : (
          <span data-step="3">{j.build.title}</span>
        )}
      </nav>
    </>
  );
}
