/**
 * The site's two languages: English at the root, French under /fr/. What the literature names stays in
 * English in both (a practice, a cell, guides and sensors, inferential and computational); the rest is
 * here, and in `data/fr.ts` for the data.
 */
import { CELLS, type Cell } from "../data/grid.ts";
import { DEFINITIONS_FR, EXAMPLES_FR, HINTS_FR, THEMES_FR } from "../data/fr.ts";
import { PRACTICES, type PracticeId } from "../data/practices.ts";
import { THEMES, type Theme } from "../data/themes.ts";

export type Lang = "en" | "fr";
export const LANGS: readonly Lang[] = ["en", "fr"];

export const isLang = (value: string): value is Lang =>
  (LANGS as readonly string[]).includes(value);

/** A path of the site in a language: as is in English, under /fr/ in French. */
export const href = (lang: Lang, path: string): string => (lang === "en" ? path : `/fr${path}`);

export const definition = (lang: Lang, id: PracticeId): string =>
  lang === "en" ? PRACTICES[id].definition : DEFINITIONS_FR[id];

export const themeLabel = (lang: Lang, theme: Theme): string =>
  lang === "en" ? THEMES[theme] : THEMES_FR[theme];

export const hint = (lang: Lang, cell: Cell): string =>
  lang === "en" ? CELLS[cell].hint : HINTS_FR[cell];

export const example = (lang: Lang, cell: Cell, i: number): string =>
  lang === "en" ? (CELLS[cell].examples[i]?.text ?? "") : (EXAMPLES_FR[cell][i] ?? "");

const plural = (n: number, one: string, many: string): string => `${n} ${n === 1 ? one : many}`;

/** The interface's words. */
export const UI = {
  en: {
    seeList: "See your list →",
    views: { label: "View", grid: "Grid", list: "List" },
    shareIt: "Share it:",
    dangerZone: "Danger zone",
    cancel: "Cancel",
    confirmSignOut: {
      title: "Sign out?",
      text: "You can sign in again any time with GitHub; your list stays as it is.",
    },
    confirmDeleteTitle: "Delete your account?",
    deleteForGood: "Delete everything",
    searchPlaceholder: "Search a practice",
    noMatch: "No practice matches this search.",
    youUseIt: "You use it",
    peopleUse: (n: number) => `${plural(n, "reader uses", "readers use")} it`,
    beFirst: "Be among the first to say you use it.",
    start: {
      title: "Start your grid",
      text: (name: string) =>
        `Sign in with GitHub to say you use ${name}. It starts your list, and your harness grid fills as you go.`,
      later: "Not now",
    },
    journey: {
      meet: {
        title: "Meet the giants",
        text: "The practices, and the people who named them.",
        action: "Scroll to see the practices ↓",
      },
      say: {
        title: "Say what you use",
        text: "Sign in with GitHub, then press “I use it”.",
        signedIn: "Press “I use it” on the practices you use.",
        done: (n: number) => `Done: ${plural(n, "practice", "practices")}.`,
      },
      build: {
        title: "Build your harness",
        text: "Your harness is what guides and checks the code an agent writes. See your grid fill, and what each empty cell could hold.",
        action: "See your grid",
      },
    },
    emptyCell: "Nothing here yet. Practices that act here:",
    signIn: "Sign in with GitHub",
    signInShort: "Sign in",
    yourList: "Your list",
    yourAccount: "Your account",
    propose: "Propose a practice",
    missing: "A practice missing?",
    iUseIt: "I use it",
    iUse: (name: string) => `I use ${name}`,
    namedBy: "named by",
    sources: (n: number) => plural(n, "source", "sources"),
    practices: (n: number) => plural(n, "practice", "practices"),
    withAgent: "With an agent",
    anywhere: "Anywhere in the grid",
    category: "Category",
    everyCategory: "Every category",
    sort: "Sort",
    sorts: { name: "A to Z", "most-used": "Most used", "least-used": "Least used" },
    noneThere: "No practice acts there in this category yet.",
    firstVote: {
      before: "Your list is public at ",
      middle: ", for you to share. You can delete it, with your account, from ",
      page: "your page",
      end: ".",
    },
    tallyTitle: "Your harness, cell by cell",
    seeMyGrid: "See your grid →",
    here: "here",
    before: "before the agent acts",
    after: "after the agent acts",
    loading: "Loading…",
    noOne: "No one here.",
    backToLibrary: "Back to the library",
    buildsOn: (n: number) =>
      `Builds on ${plural(n, "practice", "practices")} of software engineering.`,
    sayWhich: "Say which ones you use",
    harnessTitle: (login: string) => `@${login}'s harness, built on the literature`,
    harnessLede: (login: string) =>
      `The practices ${login} uses, each placed where it acts when an agent writes the code: before it or after, judged by a model or decided by a program. The grid is `,
    harnessLedeLink: "Birgitta Böckeler's",
    covered: (n: number) => `${n} of 4 cells covered`,
    coveredAll: ": guides and sensors, inferential and computational.",
    coveredNoSensor: ", none yet where a program checks the work.",
    replay: "▶ Replay",
    playing: "Playing…",
    signedInAs: "Signed in as",
    youUse: (n: number) => `You use ${plural(n, "practice", "practices")}.`,
    copyLink: "Copy the link",
    copied: "Copied",
    publicList: "This list is public, for you to share.",
    noneYet: "None yet: say which ones you use on",
    theLibrary: "the library",
    signOut: "Sign out",
    deleteAll: "Delete my account and votes",
    confirmDelete:
      "Delete your account and every practice you said you use? This cannot be undone.",
  },
  fr: {
    seeList: "Voir ta liste →",
    views: { label: "Vue", grid: "Grille", list: "Liste" },
    shareIt: "À partager :",
    dangerZone: "Zone sensible",
    cancel: "Annuler",
    confirmSignOut: {
      title: "Se déconnecter ?",
      text: "Tu pourras te reconnecter à tout moment avec GitHub ; ta liste reste telle quelle.",
    },
    confirmDeleteTitle: "Supprimer ton compte ?",
    deleteForGood: "Tout supprimer",
    searchPlaceholder: "Chercher une pratique",
    noMatch: "Aucune pratique ne correspond à cette recherche.",
    youUseIt: "Tu l'utilises",
    peopleUse: (n: number) => `${n} ${n === 1 ? "personne l'utilise" : "personnes l'utilisent"}`,
    beFirst: "Sois parmi les premiers à dire que tu l'utilises.",
    start: {
      title: "Commence ta grille",
      text: (name: string) =>
        `Connecte-toi avec GitHub pour dire que tu utilises ${name}. Ça démarre ta liste, et ta grille de harness se remplit au fil de tes votes.`,
      later: "Plus tard",
    },
    journey: {
      meet: {
        title: "Découvre les géants",
        text: "Les pratiques, et celles et ceux qui les ont nommées.",
        action: "Fais défiler pour voir les pratiques ↓",
      },
      say: {
        title: "Dis ce que tu utilises",
        text: "Connecte-toi avec GitHub, puis clique sur « J'utilise ».",
        signedIn: "Clique sur « J'utilise » pour chaque pratique que tu utilises.",
        done: (n: number) => `C'est fait : ${plural(n, "pratique", "pratiques")}.`,
      },
      build: {
        title: "Construis ton harness",
        text: "Ton harness, c'est ce qui guide et vérifie le code qu'écrit un agent. Regarde ta grille se remplir, et ce que chaque case vide pourrait accueillir.",
        action: "Voir ta grille",
      },
    },
    emptyCell: "Rien ici pour l'instant. Pratiques qui interviennent ici :",
    signIn: "Se connecter avec GitHub",
    signInShort: "Se connecter",
    yourList: "Ta liste",
    yourAccount: "Ton compte",
    propose: "Proposer une pratique",
    missing: "Il manque une pratique ?",
    iUseIt: "J'utilise",
    iUse: (name: string) => `J'utilise ${name}`,
    namedBy: "nommée par",
    sources: (n: number) => plural(n, "source", "sources"),
    practices: (n: number) => plural(n, "pratique", "pratiques"),
    withAgent: "Avec un agent",
    anywhere: "Toute la grille",
    category: "Catégorie",
    everyCategory: "Toutes",
    sort: "Trier",
    sorts: {
      name: "Ordre alphabétique",
      "most-used": "Les plus utilisées",
      "least-used": "Les moins utilisées",
    },
    noneThere: "Aucune pratique de cette catégorie n'intervient à cet endroit pour l'instant.",
    firstVote: {
      before: "Ta liste est publique à l'adresse ",
      middle: " : tu peux la partager. Tu peux aussi la supprimer, avec ton compte, depuis ",
      page: "ta page",
      end: ".",
    },
    tallyTitle: "Ton harness, case par case",
    seeMyGrid: "Voir ta grille →",
    here: "ici",
    before: "avant l'action de l'agent",
    after: "après l'action de l'agent",
    loading: "Chargement…",
    noOne: "Personne ici.",
    backToLibrary: "Retour à la bibliothèque",
    buildsOn: (n: number) =>
      `S'appuie sur ${plural(n, "pratique", "pratiques")} du génie logiciel.`,
    sayWhich: "Et toi, lesquelles utilises-tu ?",
    harnessTitle: (login: string) => `Le harness de @${login}, fondé sur la littérature`,
    harnessLede: (login: string) =>
      `Les pratiques qu'utilise ${login}, chacune placée là où elle intervient quand un agent écrit le code : avant ou après, jugée par un modèle ou tranchée par un programme. La grille est celle de `,
    harnessLedeLink: "Birgitta Böckeler",
    covered: (n: number) => `${n} cases sur 4 couvertes`,
    coveredAll: " : guides et sensors, inferential et computational.",
    coveredNoSensor: ", mais aucune où un programme vérifie le travail.",
    replay: "▶ Rejouer",
    playing: "En cours…",
    signedInAs: "Connecté en tant que",
    youUse: (n: number) => `Tu utilises ${plural(n, "pratique", "pratiques")}.`,
    copyLink: "Copier le lien",
    copied: "Copié",
    publicList: "Cette liste est publique : tu peux la partager.",
    noneYet: "Aucune pour l'instant. Indique celles que tu utilises dans",
    theLibrary: "la bibliothèque",
    signOut: "Se déconnecter",
    deleteAll: "Supprimer mon compte et mes votes",
    confirmDelete: "Supprimer ton compte et toutes tes pratiques ? Cette action est définitive.",
  },
} as const;
