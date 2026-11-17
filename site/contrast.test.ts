// The tokens' contrast, WCAG 2: every pair tokens.ts lists, in both themes.
import { describe, expect, it } from "vitest";

import { contrastPairs, themes } from "./theme/tokens.ts";

function channel(hex: string, at: number): number {
  const c = Number.parseInt(hex.slice(at, at + 2), 16) / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function luminance(color: string): number {
  const hex = color.replace(/^#/u, "");
  return 0.2126 * channel(hex, 0) + 0.7152 * channel(hex, 2) + 0.0722 * channel(hex, 4);
}

function contrastRatio(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].toSorted((x, y) => y - x);
  return ((hi ?? 0) + 0.05) / ((lo ?? 0) + 0.05);
}

describe.each(Object.entries(themes))("the %s theme", (_, theme) => {
  it.each(contrastPairs)("$foreground on $background reads at $threshold or more", (pair) => {
    const fg = theme[pair.foreground];
    const bg = theme[pair.background];
    expect(fg && bg ? contrastRatio(fg, bg) : 0).toBeGreaterThanOrEqual(pair.threshold);
  });
});
