import { readFileSync } from "node:fs";
import { join } from "node:path";

import { defineConfig } from "@rspress/core";

import { i18nSourceFr } from "./rspress-fr.ts";
import { JOURNEY_HEAD } from "./theme/journey-state.ts";
import { FAVICON, LOGO_DARK, LOGO_LIGHT } from "./theme/brand.ts";

const site = import.meta.dirname;

// Written by site/generate.ts: the top navigation and each section's sidebar.
const navigation = JSON.parse(
  readFileSync(join(site, "..", ".generated", "navigation.json"), "utf8"),
) as { locales: Record<"en" | "fr", { nav: unknown[]; sidebar: Record<string, unknown[]> }> };

export default defineConfig({
  root: join(site, "..", ".generated", "docs"),
  outDir: join(site, "..", "dist"),
  title: "Foundations",
  // English at the root, French under /fr/: the pages under .generated/docs/<lang>/, each language's
  // top navigation in its _nav.json.
  lang: "en",
  i18nSource: i18nSourceFr,
  locales: [
    {
      lang: "en",
      label: "English",
      title: "Foundations",
      description:
        "The software engineering we stand on: practices named in the literature's own words, each backed by its sources.",
    },
    {
      lang: "fr",
      label: "Français",
      title: "Foundations",
      description:
        "Le génie logiciel sur lequel nous nous appuyons : des pratiques désignées par les mots de la littérature, chacune adossée à ses sources.",
    },
  ],
  // steme's wordmark, the mark and "teme" set against it, as its documentation sets it; Foundations
  // follows it small, a sub-brand (theme/styles.css). The favicon is the mark alone.
  logo: { dark: LOGO_DARK, light: LOGO_LIGHT },
  logoText: "teme",
  icon: FAVICON,
  description:
    "The software engineering we stand on: practices named in the literature's own words, each backed by its sources.",
  themeDir: join(site, "theme"),
  globalStyles: join(site, "theme", "styles.css"),
  // Clean URLs; a reader whose browser prefers French, landing on the English home, goes to /fr/ once,
  // and an address in a language always stays in it.
  route: { cleanUrls: true, localeRedirect: "only-default-lang" },
  // A reader past the home's three steps does not see them flash before the page knows it.
  head: [`<script>${JOURNEY_HEAD}</script>`],
  // In development the worker runs beside Rspress (`pnpm worker:dev`, port 8787): its routes are
  // proxied, so the session cookie and the votes work on Rspress's own origin.
  builderConfig: {
    server: {
      proxy: [
        { pathFilter: ["/api", "/auth", "/t"], target: "http://localhost:8787" },
        // A shared list, /u/<login> or /fr/u/<login>, which the worker serves with its preview.
        {
          pathFilter: (path: string) => /^(?:\/fr)?\/u\/[^/?]+/u.test(path),
          target: "http://localhost:8787",
        },
      ],
    },
  },
  search: { mode: "local" },
  markdown: {
    globalComponents: [
      join(site, "theme", "Library.tsx"),
      join(site, "theme", "Me.tsx"),
      join(site, "theme", "Profile.tsx"),
      join(site, "theme", "GridPlacement.tsx"),
      join(site, "theme", "PracticeVote.tsx"),
    ],
  },
  themeConfig: {
    // Dark until the reader picks light, as steme's documentation.
    darkMode: "dark",
    // No "Copy Markdown" button on the pages.
    llmsUI: false,
    // Each language's navigation and sidebars: Rspress reads them from themeConfig.locales once any
    // sidebar is given, and then no longer from the folders' _nav.json.
    locales: [
      { lang: "en", label: "English", ...navigation.locales.en },
      { lang: "fr", label: "Français", ...navigation.locales.fr },
    ] as never,
    socialLinks: [
      { icon: "github", mode: "link", content: "https://github.com/steme-dev/foundations" },
    ],
  },
});
