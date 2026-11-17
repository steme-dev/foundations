// The theme: Rspress's default, its Layout wrapped so that the top navigation, which stays on screen,
// carries the reader's account (Account.tsx), and a floating button, bottom right, to propose a practice. Rspress aliases `@rspress/core/theme` to this folder, so
// the default theme is imported as `theme-original`.
import { Layout as DefaultLayout } from "@rspress/core/theme-original";

import { Account } from "./Account.tsx";
import { PROPOSE_URL } from "./api.ts";

export * from "@rspress/core/theme-original";

export function Layout(props: Parameters<typeof DefaultLayout>[0]) {
  return (
    <>
      <DefaultLayout {...props} beforeNavMenu={<Account />} />
      <a className="foundations-fab" href={PROPOSE_URL} target="_blank" rel="noopener noreferrer">
        + Propose a practice
      </a>
    </>
  );
}
