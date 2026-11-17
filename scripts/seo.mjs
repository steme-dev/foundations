/**
 * After the build: the pages that are no part of the library, a reader's account (/me) and a person's
 * list (/u/), are taken out of sitemap.xml and of each language's llms.txt. They carry a noindex of
 * their own (site/generate.ts); this keeps the indexes to the practices, the people and the grid.
 *
 *   node scripts/seo.mjs     run by `pnpm build`
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const DIST = join(fileURLToPath(new URL(".", import.meta.url)), "..", "dist");
const PRIVATE = /^https:\/\/foundations\.steme\.dev(?:\/fr)?\/(?:me|u\/)/u;

const sitemapPath = join(DIST, "sitemap.xml");
const sitemap = readFileSync(sitemapPath, "utf8");
const urls = sitemap.match(/<url>.*?<\/url>/gsu) ?? [];
const kept = urls.filter((url) => !PRIVATE.test(/<loc>(.*?)<\/loc>/u.exec(url)?.[1] ?? ""));
if (urls.length === 0 || kept.length === urls.length)
  throw new Error("sitemap.xml: nothing to take out, has its shape changed?");
writeFileSync(sitemapPath, sitemap.replace(/<url>.*<\/url>/su, kept.join("")));

for (const lang of ["", "fr"]) {
  const path = join(DIST, lang, "llms.txt");
  const lines = readFileSync(path, "utf8").split("\n");
  const left = lines.filter((line) => !PRIVATE.test(/\]\((.*?)\)/u.exec(line)?.[1] ?? ""));
  if (left.length === lines.length)
    throw new Error(`${path}: nothing to take out, has its shape changed?`);
  writeFileSync(path, left.join("\n"));
}
console.log(`seo: ${urls.length - kept.length} private pages out of sitemap.xml and llms.txt`);
