import { useEffect, useState } from "react";

import { PRACTICES, type PracticeId } from "../../data/practices.ts";
import { getGrid } from "./api.ts";
import { useWords } from "./lang.ts";
import { PracticeList } from "./PracticeList.tsx";
import ProfileGrid from "./ProfileGrid.tsx";
import { track } from "./track.ts";

/** The id a shared grid's page is for: `/g/?id=<id>`, where the worker sends `/g/<id>`. */
const idOf = (location: Location): string =>
  decodeURIComponent(location.pathname.replace(/^(?:\/fr)?\/g\/?/u, "").replace(/\/$/u, "")) ||
  (new URLSearchParams(location.search).get("id") ?? "");

/**
 * A grid shared without an account: the practices someone chose, frozen when they shared it, in the
 * grid and as a list, and the way to build one's own.
 */
export default function SharedGrid() {
  const { t, link } = useWords();
  const [practices, setPractices] = useState<PracticeId[] | null | undefined>(undefined);
  useEffect(() => {
    const id = idOf(window.location);
    if (id === "") setPractices(null);
    else
      void getGrid(id).then((found) => {
        setPractices(found);
        if (found !== null) track("grid_viewed", { own: false, shared: true });
      });
  }, []);

  if (practices === undefined) return <p>{t.loading}</p>;
  if (practices === null)
    return (
      <p>
        {t.noGrid} <a href={link("/")}>{t.backToLibrary}</a>.
      </p>
    );
  const ids = practices.filter((id) => id in PRACTICES);
  return (
    <section className="foundations-profile">
      <ProfileGrid
        login=""
        votes={ids}
        heading={{ title: t.sharedTitle, lede: t.sharedLede(ids.length) }}
      />
      <PracticeList ids={ids} />
      <a className="foundations-cta" href={link("/")}>
        {t.buildYours}
      </a>
    </section>
  );
}
