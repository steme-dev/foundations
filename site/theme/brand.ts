// The mark's files, served from the site's root: the nav's logo for each appearance and the favicon,
// which follows the reader's colour scheme. Each is filled with the foreground token of its theme.
import { MARK_PATH, MARK_VIEWBOX } from "./mark.ts";
import { dark, light } from "./tokens.ts";

export const LOGO_DARK = "/logo-dark.svg";
export const LOGO_LIGHT = "/logo-light.svg";
export const FAVICON = "/favicon.svg";

const svg = (inner: string): string =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${MARK_VIEWBOX}">${inner}</svg>\n`;

const fill = (theme: Readonly<Record<string, string>>): string => theme["--fg"] ?? "currentColor";

/** The files under `.generated/docs/public/`, which Rspress serves at the root. */
export function brandFiles(): { path: string; content: string }[] {
  const favicon = svg(
    `<style>path{fill:${fill(light)}}@media (prefers-color-scheme:dark){path{fill:${fill(dark)}}}</style><path d="${MARK_PATH}"/>`,
  );
  return [
    { path: `public${LOGO_DARK}`, content: svg(`<path fill="${fill(dark)}" d="${MARK_PATH}"/>`) },
    { path: `public${LOGO_LIGHT}`, content: svg(`<path fill="${fill(light)}" d="${MARK_PATH}"/>`) },
    { path: `public${FAVICON}`, content: favicon },
    // Where crawlers may go, and the sitemap Rspress builds.
    {
      path: "public/robots.txt",
      content:
        "User-agent: *\nDisallow: /api/\nDisallow: /auth/\nDisallow: /t/\nDisallow: /me\nDisallow: /fr/me\n\nSitemap: https://foundations.steme.dev/sitemap.xml\n",
    },
  ];
}
