// The tokens as CSS, under the appearance selectors Rspress 2 uses (`html.rp-dark`,
// `html:not(.rp-dark)`), mapped onto Rspress's own theme variables, as steme's documentation does.
import { type Theme, dark, fonts, light } from "./tokens.ts";

/** Rspress's variable → the token that fills it. */
const RSPRESS_MAP: Readonly<Record<string, string>> = {
  "--rp-c-bg": "var(--bg)",
  "--rp-c-bg-soft": "var(--surface)",
  "--rp-c-bg-mute": "var(--raised)",
  "--rp-c-bg-alt": "var(--bg)",
  "--rp-c-divider": "var(--line)",
  "--rp-c-divider-light": "var(--line)",
  "--rp-c-text-0": "var(--fg)",
  "--rp-c-text-1": "var(--fg)",
  "--rp-c-text-2": "var(--muted)",
  "--rp-c-text-3": "var(--muted)",
  "--rp-c-text-4": "var(--line)",
  "--rp-c-text-code": "var(--fg)",
  "--rp-c-text-code-bg": "var(--raised)",
  "--rp-c-text-code-border": "var(--line)",
  "--rp-c-link": "var(--accent)",
  "--rp-c-brand": "var(--accent)",
  "--rp-c-brand-light": "var(--accent)",
  "--rp-c-brand-lighter": "var(--accent)",
  "--rp-c-brand-dark": "var(--accent-strong)",
  "--rp-c-brand-darker": "var(--accent-strong)",
  "--rp-code-title-bg": "var(--surface)",
  "--rp-code-block-color": "var(--fg)",
  "--rp-code-block-bg": "var(--raised)",
  "--rp-font-family-base": `"${fonts.text}", system-ui, sans-serif`,
  "--rp-font-family-mono": `"${fonts.code}", ui-monospace, monospace`,
};

function block(selector: string, theme: Theme): string {
  const lines = [...Object.entries(theme), ...Object.entries(RSPRESS_MAP)].map(
    ([name, value]) => `  ${name}: ${value};`,
  );
  return `${selector} {\n${lines.join("\n")}\n}\n`;
}

export function themeCss(): string {
  return [
    "/* Generated from site/theme/tokens.ts. Do not edit. */",
    block("html.rp-dark", dark),
    block("html:not(.rp-dark)", light),
  ].join("\n");
}
