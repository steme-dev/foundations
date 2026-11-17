// The site's colours and fonts, copied from steme's documentation (docs.steme.dev), itself copied
// from the decks. site/generate.ts draws them as CSS under Rspress's appearance selectors, and
// site/contrast.test.ts checks every pair stays readable.

export const fonts = {
  text: "Instrument Sans",
  code: "JetBrains Mono",
} as const;

export type Theme = Readonly<Record<string, string>>;

export const dark: Theme = {
  "--bg": "#030713",
  "--surface": "#0B1020",
  "--raised": "#141A2E",
  "--line": "#232B45",
  "--fg": "#FAF9FA",
  "--muted": "#A9B3CC",
  "--accent": "#8F84FF",
  "--accent-strong": "#6A5CFF",
  "--g": "#58a6ff",
  "--v": "#c49bff",
  "--a": "#a371f7",
  "--kw": "#ff7b72",
  "--str": "#a5d6ff",
  "--num": "#79c0ff",
  "--key": "#d2a8ff",
  "--com": "#8b949e",
};

export const light: Theme = {
  "--bg": "#FAF9FA",
  "--surface": "#F4F7FF",
  "--raised": "#FFFFFF",
  "--line": "#E4E9F5",
  "--fg": "#0B1020",
  "--muted": "#4B5578",
  "--accent": "#6050DC",
  "--accent-strong": "#4B3FC4",
  "--g": "#0969da",
  "--v": "#8250df",
  "--a": "#a475f9",
  "--kw": "#cf222e",
  "--str": "#0a3069",
  "--num": "#0550ae",
  "--key": "#8250df",
  "--com": "#6e7781",
};

export const themes = { dark, light } as const;

export type Pair = {
  /** The drawn token and the background it is drawn on. */
  foreground: string;
  background: string;
  /** The least contrast ratio the pair must reach. */
  threshold: number;
};

const TEXT = ["--fg", "--muted", "--accent"];
const SURFACES = ["--bg", "--surface", "--raised"];
const CODE = ["--kw", "--str", "--num", "--key", "--com"];
const CONDITIONS = ["--g", "--v", "--a"];

function pairs(foregrounds: string[], backgrounds: string[], threshold: number): Pair[] {
  return foregrounds.flatMap((foreground) =>
    backgrounds.map((background) => ({ foreground, background, threshold })),
  );
}

/** Text on every surface ≥ 4.5, code on --raised ≥ 4.5, conditions on every surface ≥ 3. */
export const contrastPairs: readonly Pair[] = [
  ...pairs(TEXT, SURFACES, 4.5),
  ...pairs(CODE, ["--raised"], 4.5),
  ...pairs(CONDITIONS, SURFACES, 3),
];
