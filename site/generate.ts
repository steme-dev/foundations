/**
 * Writes the site from the data, into `.generated/`: under `docs/<lang>/`, Rspress's root, in English and
 * in French, the home, the grid and a page per cell, an index and a page per practice and per person;
 * each language's top navigation and sidebars, which Rspress reads (`navigation.json`); the brand's
 * files and the tokens as CSS. Nothing under `.generated/` is written by hand.
 */
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import { CELLS, type Cell, GRID_SOURCE } from "../data/grid.ts";
import { PEOPLE, type PersonId } from "../data/people.ts";
import { PRACTICES, type Practice, type PracticeId } from "../data/practices.ts";
import { SHOPS } from "../data/shops.ts";
import { SOURCES, type Source, type SourceId } from "../data/sources.ts";
import { LANGS, type Lang, definition, example, hint, href, themeLabel } from "./i18n.ts";
import { brandFiles } from "./theme/brand.ts";
import { themeCss } from "./theme/tokens-css.ts";

const GENERATED = join(import.meta.dirname, "..", ".generated");
const ROOT = join(GENERATED, "docs");
const PROPOSE = "https://github.com/steme-dev/foundations/issues/new?template=new-practice.yml";

const practices = (Object.entries(PRACTICES) as [PracticeId, Practice][]).toSorted(([, a], [, b]) =>
  a.name.localeCompare(b.name),
);
const people = (Object.keys(PEOPLE) as PersonId[]).toSorted((a, b) =>
  PEOPLE[a].name.localeCompare(PEOPLE[b].name),
);
const cells = Object.keys(CELLS) as Cell[];

/** The words of the generated pages. */
const W = {
  en: {
    buy: (shops: string) => `Buy it from ${shops}.`,
    joiner: ", then ",
    namedBy: "Named by",
    categories: "Categories",
    withAgent: "With an agent",
    inGrid: "in [Böckeler's grid]",
    sources: "Sources",
    practicesNamed: "Practices named",
    practices: "Practices",
    people: "People",
    grid: "The grid",
    guidesAndSensors: "Guides and sensors",
    missing: `A practice missing? [Propose a practice](${PROPOSE}).`,
    examples: "Examples",
    actHere: "Practices that act here",
    noneHere: "No practice of this library acts here yet.",
    cellLede: (h: string) =>
      `Where a practice acts when an agent writes the code: ${h}. One cell of [Böckeler's grid]`,
    marked: (title: string) =>
      `The ones marked Böckeler are from ${title}; the others are added by this library.`,
    yourPractices: "Your practices",
    someone: "Practices someone builds on",
  },
  fr: {
    buy: (shops: string) => `Disponible chez ${shops}.`,
    joiner: ", ou chez ",
    namedBy: "Nommée par",
    categories: "Catégories",
    withAgent: "Avec un agent",
    inGrid: "dans [la grille de Böckeler]",
    sources: "Sources",
    practicesNamed: "Pratiques nommées",
    practices: "Pratiques",
    people: "Personnes",
    grid: "La grille",
    guidesAndSensors: "Guides et sensors",
    missing: `Il manque une pratique ? [Propose-la](${PROPOSE}).`,
    examples: "Exemples",
    actHere: "Les pratiques qui interviennent ici",
    noneHere: "Aucune pratique de la bibliothèque n'intervient encore ici.",
    cellLede: (h: string) =>
      `Là où une pratique intervient quand un agent écrit le code : ${h}. C'est l'une des quatre cases de [la grille de Böckeler]`,
    marked: (title: string) =>
      `Les exemples marqués Böckeler viennent de ${title} ; les autres ont été ajoutés par cette bibliothèque.`,
    yourPractices: "Mes pratiques",
    someone: "Les pratiques de quelqu'un",
  },
} as const;

const year = (source: Source): string => (source.year === null ? "" : `, ${source.year}`);

const frontmatter = (title: string, description?: string): string =>
  `---\ntitle: ${JSON.stringify(title)}\n${description === undefined ? "" : `description: ${JSON.stringify(description)}\n`}---\n`;

const index = (path: string, title: string, lines: string[]): [string, string] => [
  path,
  `${frontmatter(title)}\n# ${title}\n\n${lines.join("\n")}\n`,
];

const bare = (path: string, title: string, body: string): [string, string] => [
  path,
  `---\npageType: doc\nsidebar: false\noutline: false\ntitle: ${JSON.stringify(title)}\n---\n\n${body}\n`,
];

function pagesIn(lang: Lang): [string, string][] {
  const w = W[lang];
  const link = (path: string) => href(lang, path);
  const cellLink = (cell: Cell) => link(`/grid/${CELLS[cell].slug}`);
  const personLink = (id: PersonId) => `[${PEOPLE[id].name}](${link(`/people/${id}`)})`;

  const sourceLine = (id: SourceId): string => {
    const source: Source = SOURCES[id];
    const line = `- [*${source.title}*](${source.url}), ${source.by.map(personLink).join(", ")}${year(source)}, ${source.publisher}.`;
    const buy = (source.buy ?? []).map(({ shop, url }) => `[${SHOPS[shop].name}](${url})`);
    return buy.length === 0 ? line : `${line} ${w.buy(buy.join(w.joiner))}`;
  };

  const practiceLine = ([id, practice]: [PracticeId, Practice]): string =>
    `- [${practice.name}](${link(`/practices/${id}`)}): ${definition(lang, id)}`;

  const practicePage = ([id, practice]: [PracticeId, Practice]): [string, string] => {
    const named =
      practice.credited.length === 0
        ? ""
        : `\n${w.namedBy} ${practice.credited.map(personLink).join(", ")}.\n`;
    const withAgent = practice.cells
      .map((cell) => `[${CELLS[cell].label}](${cellLink(cell)})`)
      .join(", ");
    const categories = practice.themes.map((theme) => themeLabel(lang, theme)).join(" · ");
    return [
      `practices/${id}.mdx`,
      `${frontmatter(practice.name, definition(lang, id))}
# ${practice.name}

${definition(lang, id)}
${named}
**${w.categories}${lang === "fr" ? " " : ""}:** ${categories}

**${w.withAgent}${lang === "fr" ? " " : ""}:** ${withAgent}, ${w.inGrid}(${link("/grid/")}).

<GridPlacement cells={${JSON.stringify(practice.cells)}} />

## ${w.sources}

${practice.sources.map(sourceLine).join("\n")}
`,
    ];
  };

  const personPage = (id: PersonId): [string, string] => {
    const named = practices.filter(([, practice]) =>
      (practice.credited as readonly string[]).includes(id),
    );
    const wrote = (Object.keys(SOURCES) as SourceId[]).filter((source) =>
      (SOURCES[source].by as readonly string[]).includes(id),
    );
    const namedList =
      named.length === 0
        ? ""
        : `\n## ${w.practicesNamed}\n\n${named.map(practiceLine).join("\n")}\n`;
    return [
      `people/${id}.md`,
      `${frontmatter(PEOPLE[id].name)}
# ${PEOPLE[id].name}
${namedList}
## ${w.sources}

${wrote.map(sourceLine).join("\n")}
`,
    ];
  };

  const source = SOURCES[GRID_SOURCE];
  const sourceRef = `[*${source.title}*](${source.url})`;

  const gridIntro: [string, string] =
    lang === "en"
      ? [
          "grid/index.md",
          `${frontmatter("The grid", "Birgitta Böckeler's grid of guides and sensors, inferential or computational.")}
# The grid

The practices of this library come from all of software engineering: architecture, types, tests,
refactoring, tooling. ${personLink("birgitta-bockeler")}'s grid, from ${sourceRef}
(${source.publisher}, April 2026), situates each of them in work with a coding agent: where the
knowledge acts, and who applies it.

**Guides** act before the agent: they "anticipate the agent's behaviour and aim to steer it before it
acts". **Sensors** act after it: they "observe after the agent acts and help it self-correct".

Each is **computational**, "deterministic and fast, run by the CPU", or **inferential**, "semantic
analysis, AI code review, 'LLM as judge'", slower, more expensive and less deterministic.

| | Inferential: a model judges | Computational: a program decides |
| --- | --- | --- |
| **Guides**, before the agent acts | [${CELLS.GI.label}](${cellLink("GI")}) | [${CELLS.GC.label}](${cellLink("GC")}) |
| **Sensors**, after the agent acts | [${CELLS.SI.label}](${cellLink("SI")}) | [${CELLS.SC.label}](${cellLink("SC")}) |

Each cell's page lists examples of what acts there, Böckeler's and the ones this library adds, then the
practices of this library that act there when an agent writes the code.
`,
        ]
      : [
          "grid/index.md",
          `${frontmatter("La grille", "La grille de Birgitta Böckeler : guides et sensors, inferential ou computational.")}
# La grille

Les pratiques de cette bibliothèque couvrent tout le génie logiciel : architecture, types, tests,
refactoring, outillage. La grille de ${personLink("birgitta-bockeler")}, présentée dans ${sourceRef}
(${source.publisher}, avril 2026), permet de situer chacune dans le travail avec un agent de code : à quel
moment ce savoir intervient, et qui l'applique.

Les **guides** interviennent avant l'agent : "anticipate the agent's behaviour and aim to steer it before
it acts" (notre traduction : « ils anticipent son comportement et cherchent à l'orienter avant qu'il
n'agisse »). Les **sensors** interviennent après : "observe after the agent acts and help it
self-correct" (« ils observent ce que l'agent a fait et l'aident à se corriger »).

Chacun est soit **computational**, "deterministic and fast, run by the CPU" (« déterministe et rapide,
exécuté par le processeur »), soit **inferential**, "semantic analysis, AI code review, 'LLM as judge'"
(« analyse sémantique, revue de code par IA, "LLM as judge" ») : plus lent, plus coûteux et moins
déterministe.

| | Inferential : un modèle juge | Computational : un programme tranche |
| --- | --- | --- |
| **Guides**, avant l'action de l'agent | [${CELLS.GI.label}](${cellLink("GI")}) | [${CELLS.GC.label}](${cellLink("GC")}) |
| **Sensors**, après l'action de l'agent | [${CELLS.SI.label}](${cellLink("SI")}) | [${CELLS.SC.label}](${cellLink("SC")}) |

La page de chaque case donne des exemples de ce qui s'y trouve, ceux de Böckeler et ceux qu'ajoute cette
bibliothèque, puis les pratiques qui y interviennent quand un agent écrit le code.
`,
        ];

  const cellPage = (cell: Cell): [string, string] => {
    const info = CELLS[cell];
    const here = practices.filter(([, practice]) =>
      (practice.cells as readonly Cell[]).includes(cell),
    );
    const list = here.length === 0 ? w.noneHere : here.map(practiceLine).join("\n");
    const examples = info.examples
      .map(
        ({ by }, i) =>
          `- ${example(lang, cell, i)}${by === "bockeler" ? ' <span className="foundations-hers">Böckeler</span>' : ""}`,
      )
      .join("\n");
    return [
      `grid/${info.slug}.mdx`,
      `${frontmatter(info.label, `${info.label}: ${hint(lang, cell)}.`)}
# ${info.label}

${w.cellLede(hint(lang, cell))}(${link("/grid/")}).

## ${w.examples}

${examples}

${w.marked(sourceRef)}

## ${w.actHere}

${list}
`,
    ];
  };

  const home: [string, string] = [
    "index.mdx",
    lang === "en"
      ? `---
pageType: doc
sidebar: false
outline: false
title: Foundations
---

# We stand on the shoulders of giants.<br />Let's build on their work.

<p className="foundations-credit">“If I have seen further, it is by standing on ye shoulders of giants.” Isaac Newton, in a <a href="https://digitallibrary.hsp.org/Detail/objects/9792">letter to Robert Hooke</a>, 5 February 1675/76.</p>

<p className="foundations-lede">The practices of software engineering, named in the literature's own words, each backed by the books, papers and articles that name it. Say which ones you use.</p>

<Library />
`
      : `---
pageType: doc
sidebar: false
outline: false
title: Foundations
---

# Nous nous tenons sur les épaules de géants.<br />Appuyons-nous sur leur travail.

<p className="foundations-credit">“If I have seen further, it is by standing on ye shoulders of giants.” (« Si j'ai vu plus loin, c'est en me tenant sur les épaules de géants », notre traduction.) Isaac Newton, dans une <a href="https://digitallibrary.hsp.org/Detail/objects/9792">lettre à Robert Hooke</a> du 5 février 1675/76.</p>

<p className="foundations-lede">Les pratiques du génie logiciel, chacune sous le nom que lui donne la littérature et adossée aux livres, articles et publications qui l'ont nommée. Et toi, lesquelles utilises-tu ?</p>

<Library />
`,
  ];

  return [
    home,
    bare("me.mdx", w.yourPractices, `# ${w.yourPractices}\n\n<Me />`),
    bare("u/index.mdx", w.someone, "<Profile />"),
    index("practices/index.md", w.practices, [...practices.map(practiceLine), "", w.missing]),
    ...practices.map(practicePage),
    index(
      "people/index.md",
      w.people,
      people.map((id) => `- ${personLink(id)}`),
    ),
    ...people.map(personPage),
    gridIntro,
    ...cells.map(cellPage),
  ];
}

/** Each language's top navigation. */
const nav = (lang: Lang) => [
  { text: W[lang].practices, link: href(lang, "/practices/") },
  { text: W[lang].people, link: href(lang, "/people/") },
  { text: W[lang].grid, link: href(lang, "/grid/") },
];

/** The sidebar of each section, in each language, keyed by the section's path. */
const sidebar = Object.fromEntries(
  LANGS.flatMap((lang) => {
    const link = (path: string) => href(lang, path);
    return [
      [
        link("/practices/"),
        [
          {
            text: W[lang].practices,
            items: practices.map(([id, p]) => ({ text: p.name, link: link(`/practices/${id}`) })),
          },
        ],
      ],
      [
        link("/people/"),
        [
          {
            text: W[lang].people,
            items: people.map((id) => ({ text: PEOPLE[id].name, link: link(`/people/${id}`) })),
          },
        ],
      ],
      [
        link("/grid/"),
        [
          {
            text: W[lang].grid,
            items: [
              { text: W[lang].guidesAndSensors, link: link("/grid/") },
              ...cells.map((cell) => ({
                text: CELLS[cell].label,
                link: link(`/grid/${CELLS[cell].slug}`),
              })),
            ],
          },
        ],
      ],
    ];
  }),
);

rmSync(ROOT, { recursive: true, force: true });
const write = (path: string, content: string): void => {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content);
};
let count = 0;
for (const lang of LANGS) {
  for (const [path, content] of pagesIn(lang)) {
    write(join(ROOT, lang, path), content);
    count += 1;
  }
}
for (const { path, content } of brandFiles()) write(join(ROOT, path), content);
write(join(GENERATED, "theme", "tokens.css"), themeCss());
write(
  join(GENERATED, "navigation.json"),
  `${JSON.stringify({ locales: Object.fromEntries(LANGS.map((lang) => [lang, { nav: nav(lang), sidebar }])) }, null, 2)}\n`,
);
console.log(`site: ${count} pages in ${LANGS.length} languages`);
