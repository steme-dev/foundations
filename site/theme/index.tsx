// The theme: Rspress's default, its Layout wrapped so that the top navigation, which stays on screen,
// carries the reader's account (Account.tsx), and a floating button, bottom right, to propose a practice. Rspress aliases `@rspress/core/theme` to this folder, so
// the default theme is imported as `theme-original`.
import { useLocation } from "@rspress/core/runtime";
import { Layout as DefaultLayout } from "@rspress/core/theme-original";
import { useEffect } from "react";

import { Account } from "./Account.tsx";
import { PROPOSE_URL } from "./api.ts";
import { useWords } from "./lang.ts";
import { track } from "./track.ts";

export * from "@rspress/core/theme-original";

function Propose() {
  const { t } = useWords();
  return (
    <a
      className="foundations-fab"
      href={PROPOSE_URL}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => track("propose_clicked", { from: "button" })}
    >
      + {t.propose}
    </a>
  );
}

/** Counts each page a reader opens, in the site's own navigation too. */
function PageView() {
  const { pathname } = useLocation();
  useEffect(() => track("$pageview"), [pathname]);
  return null;
}

/** Every link to another site opens in a new tab, wherever it is written: a source, a shop, the menu. */
const openOutside = (root: ParentNode): void => {
  for (const anchor of root.querySelectorAll<HTMLAnchorElement>("a[href]")) {
    let url: URL;
    try {
      url = new URL(anchor.href, window.location.href);
    } catch {
      continue;
    }
    if (!url.protocol.startsWith("http") || url.host === window.location.host) continue;
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";
  }
};

/** Holds the rule for the whole page, and for what the page renders later (a list, a dialog). */
function ExternalLinks() {
  const { pathname } = useLocation();
  useEffect(() => {
    openOutside(document);
    const observer = new MutationObserver(() => openOutside(document));
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [pathname]);
  return null;
}

export function Layout(props: Parameters<typeof DefaultLayout>[0]) {
  return (
    <>
      <DefaultLayout {...props} beforeNavMenu={<Account />} />
      <Propose />
      <PageView />
      <ExternalLinks />
    </>
  );
}
