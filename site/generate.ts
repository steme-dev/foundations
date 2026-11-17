/**
 * Writes the site from the data, into `.generated/`: the pages under `docs/`, Rspress's root (the home,
 * the grid and a page per cell, an index and a page per practice and per person), the navigation
 * Rspress reads (`navigation.json`), the brand's files and the tokens as CSS. Nothing under
 * `.generated/` is written by hand.
 */
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import { CELLS, type Cell, GRID_SOURCE } from "../data/grid.ts";
import { PEOPLE, type PersonId } from "../data/people.ts";
import { PRACTICES, type Practice, type PracticeId } from "../data/practices.ts";
import { SHOPS } from "../data/shops.ts";
import { SOURCES, type Source, type SourceId } from "../data/sources.ts";
import { THEMES } from "../data/themes.ts";
import { brandFiles } from "./theme/brand.ts";
import { themeCss } from "./theme/tokens-css.ts";

const GENERATED = join(import.meta.dirname, "..", ".generated");
const ROOT = join(GENERATED, "docs");

const practices = (Object.entries(PRACTICES) as [PracticeId, Practice][]).toSorted(([, a], [, b]) =>
  a.name.localeCompare(b.name),
);
const people = (Object.keys(PEOPLE) as PersonId[]).toSorted((a, b) =>
  PEOPLE[a].name.localeCompare(PEOPLE[b].name),
);
const cells = Object.keys(CELLS) as Cell[];

const cellLink = (cell: Cell): string => `/grid/${CELLS[cell].slug}`;
const personLink = (id: PersonId): string => `[${PEOPLE[id].name}](/people/${id})`;

/** The year a source carries, or nothing for a page kept up to date. */
const year = (source: Source): string => (source.year === null ? "" : `, ${source.year}`);

const sourceLine = (id: SourceId): string => {
  const source: Source = SOURCES[id];
  const line = `- [*${source.title}*](${source.url}), ${source.by.map(personLink).join(", ")}${year(source)}, ${source.publisher}.`;
  const buy = (source.buy ?? []).map(({ shop, url }) => `[${SHOPS[shop].name}](${url})`);
  return buy.length === 0 ? line : `${line} Buy it from ${buy.join(", then ")}.`;
};

const practiceLine = ([id, practice]: [PracticeId, Practice]): string =>
  `- [${practice.name}](/practices/${id}): ${practice.definition}`;

const frontmatter = (title: string, description?: string): string =>
  `---\ntitle: ${JSON.stringify(title)}\n${description === undefined ? "" : `description: ${JSON.stringify(description)}\n`}---\n`;

const practicePage = ([id, practice]: [PracticeId, Practice]): [string, string] => {
  const named =
    practice.credited.length === 0
      ? ""
      : `\nNamed by ${practice.credited.map(personLink).join(", ")}.\n`;
  const withAgent = practice.cells
    .map((cell) => `[${CELLS[cell].label}](${cellLink(cell)})`)
    .join(", ");
  const themes = practice.themes.map((theme) => THEMES[theme]).join(" · ");
  return [
    `practices/${id}.mdx`,
    `${frontmatter(practice.name, practice.definition)}
# ${practice.name}

${practice.definition}
${named}
**Themes:** ${themes}

**With an agent:** ${withAgent}, in [Böckeler's grid](/grid/).

<GridPlacement cells={${JSON.stringify(practice.cells)}} />

## Sources

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
    named.length === 0 ? "" : `\n## Practices named\n\n${named.map(practiceLine).join("\n")}\n`;
  return [
    `people/${id}.md`,
    `${frontmatter(PEOPLE[id].name)}
# ${PEOPLE[id].name}
${namedList}
## Sources

${wrote.map(sourceLine).join("\n")}
`,
  ];
};

const gridIntro = (): [string, string] => {
  const table = [
    "| | Inferential: a model judges | Computational: a program decides |",
    "| --- | --- | --- |",
    `| **Guides**, before the agent acts | [${CELLS.GI.label}](${cellLink("GI")}) | [${CELLS.GC.label}](${cellLink("GC")}) |`,
    `| **Sensors**, after the agent acts | [${CELLS.SI.label}](${cellLink("SI")}) | [${CELLS.SC.label}](${cellLink("SC")}) |`,
  ].join("\n");
  const source = SOURCES[GRID_SOURCE];
  return [
    "grid/index.md",
    `${frontmatter("The grid", "Birgitta Böckeler's grid of guides and sensors, inferential or computational.")}
# The grid

The practices of this library come from all of software engineering: architecture, types, tests,
refactoring, tooling. ${personLink("birgitta-bockeler")}'s grid, from [*${source.title}*](${source.url})
(${source.publisher}, April 2026), situates each of them in work with a coding agent: where the
knowledge acts, and who applies it.

**Guides** act before the agent: they "anticipate the agent's behaviour and aim to steer it before it
acts". **Sensors** act after it: they "observe after the agent acts and help it self-correct".

Each is **computational**, "deterministic and fast, run by the CPU", or **inferential**, "semantic
analysis, AI code review, 'LLM as judge'", slower, more expensive and less deterministic.

${table}

Each cell's page lists examples of what acts there, Böckeler's and the ones this library adds, then the
practices of this library that act there when an agent writes the code.
`,
  ];
};

const cellPage = (cell: Cell): [string, string] => {
  const info = CELLS[cell];
  const here = practices.filter(([, practice]) => practice.cells.includes(cell));
  const list =
    here.length === 0
      ? "No practice of this library acts here yet."
      : here.map(practiceLine).join("\n");
  return [
    `grid/${info.slug}.mdx`,
    `${frontmatter(info.label, `The ${info.label.toLowerCase()}: ${info.hint}.`)}
# ${info.label}

Where a practice acts when an agent writes the code: ${info.hint}. One cell of [Böckeler's grid](/grid/).

## Examples

${info.examples.map(({ text, by }) => `- ${text}${by === "bockeler" ? ' <span className="foundations-hers">Böckeler</span>' : ""}`).join("\n")}

The ones marked Böckeler are from [*${SOURCES[GRID_SOURCE].title}*](${SOURCES[GRID_SOURCE].url}); the others are added by this library.

## Practices that act here

${list}
`,
  ];
};

const index = (path: string, title: string, lines: string[]): [string, string] => [
  path,
  `${frontmatter(title)}\n# ${title}\n\n${lines.join("\n")}\n`,
];

const home: [string, string] = [
  "index.mdx",
  `---
pageType: doc
sidebar: false
outline: false
title: Foundations
---

# We stand on the shoulders of giants. Let's build on their work.

<p className="foundations-credit">“If I have seen further, it is by standing on ye shoulders of giants.” Isaac Newton, in a <a href="https://digitallibrary.hsp.org/Detail/objects/9792">letter to Robert Hooke</a>, 5 February 1675/76.</p>

<p className="foundations-lede">The practices of software engineering, named in the literature's own words, each backed by the books, papers and articles that name it. Say which ones you use.</p>

<Library />
`,
];

const me: [string, string] = [
  "me.mdx",
  `---
pageType: doc
sidebar: false
outline: false
title: Your practices
---

# Your practices

<Me />
`,
];

const profile: [string, string] = [
  "u/index.mdx",
  `---
pageType: doc
sidebar: false
outline: false
title: Practices someone builds on
---

<Profile />
`,
];

const pages: [string, string][] = [
  home,
  me,
  profile,
  index("practices/index.md", "Practices", [
    ...practices.map(practiceLine),
    "",
    "A practice missing? [Propose a practice](https://github.com/steme-dev/foundations/issues/new?template=new-practice.yml).",
  ]),
  ...practices.map(practicePage),
  index(
    "people/index.md",
    "People",
    people.map((id) => `- ${personLink(id)}`),
  ),
  ...people.map(personPage),
  gridIntro(),
  ...cells.map(cellPage),
];

/** The top navigation and the sidebar of each section, titled as a reader reads them. */
const navigation = {
  nav: [
    { text: "Practices", link: "/practices/" },
    { text: "People", link: "/people/" },
    { text: "The grid", link: "/grid/" },
  ],
  sidebar: {
    "/practices/": [
      {
        text: "Practices",
        items: practices.map(([id, practice]) => ({
          text: practice.name,
          link: `/practices/${id}`,
        })),
      },
    ],
    "/people/": [
      {
        text: "People",
        items: people.map((id) => ({ text: PEOPLE[id].name, link: `/people/${id}` })),
      },
    ],
    "/grid/": [
      {
        text: "The grid",
        items: [
          { text: "Guides and sensors", link: "/grid/" },
          ...cells.map((cell) => ({ text: CELLS[cell].label, link: cellLink(cell) })),
        ],
      },
    ],
  },
};

rmSync(ROOT, { recursive: true, force: true });
const write = (path: string, content: string): void => {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content);
};
for (const [path, content] of pages) write(join(ROOT, path), content);
for (const { path, content } of brandFiles()) write(join(ROOT, path), content);
write(join(GENERATED, "theme", "tokens.css"), themeCss());
write(join(GENERATED, "navigation.json"), `${JSON.stringify(navigation, null, 2)}\n`);
console.log(`site: ${pages.length} pages`);
