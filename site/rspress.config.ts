import { readFileSync } from "node:fs";
import { join } from "node:path";

import { defineConfig } from "@rspress/core";

import { FAVICON, LOGO_DARK, LOGO_LIGHT } from "./theme/brand.ts";

const site = import.meta.dirname;

// Written by site/generate.ts: the top navigation and each section's sidebar.
const navigation = JSON.parse(
  readFileSync(join(site, "..", ".generated", "navigation.json"), "utf8"),
) as { nav: unknown[]; sidebar: Record<string, unknown[]> };

export default defineConfig({
  root: join(site, "..", ".generated", "docs"),
  outDir: join(site, "..", "dist"),
  title: "Foundations",
  // steme's wordmark, the mark and "teme" set against it, as its documentation sets it; Foundations
  // follows it small, a sub-brand (theme/styles.css). The favicon is the mark alone.
  logo: { dark: LOGO_DARK, light: LOGO_LIGHT },
  logoText: "teme",
  icon: FAVICON,
  description:
    "The software engineering we stand on: practices named in the literature's own words, each backed by its sources.",
  themeDir: join(site, "theme"),
  globalStyles: join(site, "theme", "styles.css"),
  route: { cleanUrls: true },
  // In development the worker runs beside Rspress (`pnpm worker:dev`, port 8787): its routes are
  // proxied, so the session cookie and the votes work on Rspress's own origin.
  builderConfig: {
    server: {
      proxy: [
        { pathFilter: ["/api", "/auth"], target: "http://localhost:8787" },
        // A shared list, /u/<login>, which the worker sends on to /u/?login=<login>.
        {
          pathFilter: (path: string) => /^\/u\/[^/?]+/u.test(path),
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
    ],
  },
  themeConfig: {
    // Dark until the reader picks light, as steme's documentation.
    darkMode: "dark",
    // No "Copy Markdown" button on the pages.
    llmsUI: false,
    nav: navigation.nav as never,
    sidebar: navigation.sidebar as never,
    socialLinks: [
      { icon: "github", mode: "link", content: "https://github.com/steme-dev/foundations" },
    ],
  },
});
