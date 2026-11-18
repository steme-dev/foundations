/**
 * A person's card, the image their public page shows when it is shared: their name, how many practices
 * they build on, and Böckeler's grid with each cell's count and its first practices. Drawn as SVG
 * here, from the data alone, and rasterised to PNG by resvg (`index.ts`).
 */
import { CELLS, type Cell } from "../data/grid.ts";
import { PRACTICES, type PracticeId } from "../data/practices.ts";

export const CARD = { width: 1200, height: 630 } as const;

const COLORS = {
  bg: "#030713",
  surface: "#0B1020",
  line: "#232B45",
  fg: "#FAF9FA",
  muted: "#A9B3CC",
  accent: "#8F84FF",
  accentStrong: "#6A5CFF",
} as const;

const MARK =
  "M14 0 H98 A14 14 0 0 1 112 14 V20 H20 V55 H112 V116 A14 14 0 0 1 98 130 H14 A14 14 0 0 1 0 116 V110 H92 V75 H0 V14 A14 14 0 0 1 14 0 Z";

const ORDER: readonly Cell[] = ["GI", "GC", "SI", "SC"];
const SHOWN = 3;
const NAME_MAX = 24;

const escape = (text: string): string =>
  text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const clip = (text: string, max: number): string =>
  text.length <= max ? text : `${text.slice(0, max - 1)}…`;

// The two fonts declare themselves as two families: the semibold one is named for its weight.
const family = (weight: number): string =>
  weight >= 600 ? "Instrument Sans SemiBold" : "Instrument Sans";

const text = (
  x: number,
  y: number,
  size: number,
  fill: string,
  value: string,
  weight = 400,
  anchor = "start",
) =>
  `<text x="${x}" y="${y}" font-family="${family(weight)}" font-size="${size}" fill="${fill}" text-anchor="${anchor}">${escape(value)}</text>`;

/** The practices of a person in each cell, in the order they said they use them. */
export function byCell(votes: readonly string[]): Record<Cell, PracticeId[]> {
  const cells: Record<Cell, PracticeId[]> = { GI: [], GC: [], SI: [], SC: [] };
  for (const id of votes)
    if (id in PRACTICES)
      for (const cell of PRACTICES[id as PracticeId].cells as readonly Cell[])
        cells[cell].push(id as PracticeId);
  return cells;
}

export function cardSvg({
  login,
  votes,
  origin,
  path,
}: {
  /** The person's login, or null for a grid shared without an account. */
  login: string | null;
  votes: readonly string[];
  origin: string;
  /** The address shown at the foot: the person's list, or the shared grid's. */
  path?: string;
}): string {
  const cells = byCell(votes);
  const practices = votes.filter((id) => id in PRACTICES).length;
  const covered = ORDER.filter((cell) => cells[cell].length > 0).length;
  const host = origin.replace(/^https?:\/\//u, "");

  const grid = ORDER.map((cell, i) => {
    const x = 600 + (i % 2) * 276;
    const y = 120 + Math.floor(i / 2) * 216;
    const here = cells[cell];
    const on = here.length > 0;
    const names = here
      .slice(0, SHOWN)
      .map((id, k) =>
        text(x + 22, y + 104 + k * 28, 19, COLORS.fg, clip(PRACTICES[id].name, NAME_MAX)),
      );
    const more =
      here.length > SHOWN
        ? [text(x + 22, y + 104 + SHOWN * 28, 17, COLORS.muted, `+${here.length - SHOWN} more`)]
        : [];
    return [
      `<rect x="${x}" y="${y}" width="260" height="200" rx="16" fill="${on ? "#8F84FF22" : COLORS.surface}" stroke="${on ? COLORS.accent : COLORS.line}" stroke-width="2"/>`,
      text(x + 22, y + 38, 17, on ? COLORS.fg : COLORS.muted, CELLS[cell].label, 600),
      text(x + 238, y + 42, 30, on ? COLORS.accent : COLORS.muted, String(here.length), 600, "end"),
      ...names,
      ...more,
    ].join("");
  }).join("");

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${CARD.width}" height="${CARD.height}" viewBox="0 0 ${CARD.width} ${CARD.height}">`,
    `<rect width="100%" height="100%" fill="${COLORS.bg}"/>`,
    `<g transform="translate(64 58) scale(0.25)"><path fill="${COLORS.fg}" d="${MARK}"/></g>`,
    text(94, 88, 26, COLORS.fg, "teme", 600),
    text(162, 88, 20, COLORS.muted, "foundations"),
    login === null
      ? text(64, 230, 60, COLORS.fg, "A harness,", 600)
      : text(64, 230, 60, COLORS.fg, clip(`@${login}`, 18), 600),
    text(
      64,
      284,
      30,
      COLORS.muted,
      login === null ? "built on the literature" : "harness, built on the literature",
    ),
    text(
      64,
      352,
      26,
      COLORS.accent,
      `${practices} practice${practices === 1 ? "" : "s"} · ${covered} of 4 cells`,
      600,
    ),
    text(64, 400, 20, COLORS.muted, "Each practice placed where it acts"),
    text(64, 428, 20, COLORS.muted, "when an agent writes the code."),
    text(64, 572, 22, COLORS.muted, `${host}${path ?? `/u/${login ?? ""}`}`),
    text(600, 96, 18, COLORS.muted, "Inferential"),
    text(876, 96, 18, COLORS.muted, "Computational"),
    grid,
    "</svg>",
  ].join("");
}

/** A short digest of a person's votes, so a card's address changes when they do. */
export async function votesDigest(votes: readonly string[]): Promise<string> {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(votes.join(",")));
  return [...new Uint8Array(bytes).slice(0, 6)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
