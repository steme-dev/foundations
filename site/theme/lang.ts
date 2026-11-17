import { useLang } from "@rspress/core/runtime";

import { type Lang, UI, href, isLang } from "../i18n.ts";

/** The page's language, its interface's words, and its paths. */
export function useWords() {
  const raw = useLang();
  const lang: Lang = isLang(raw) ? raw : "en";
  return { lang, t: UI[lang], link: (path: string) => href(lang, path) };
}
