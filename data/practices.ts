import type { Cell } from "./grid.ts";
import type { PersonId } from "./people.ts";
import type { SourceId } from "./sources.ts";
import type { Theme } from "./themes.ts";

/** A practice of software engineering, named in the literature's words and backed by its sources. */
export type Practice = {
  readonly name: string;
  /** One sentence, in plain words. */
  readonly definition: string;
  readonly cells: readonly Cell[];
  readonly themes: readonly Theme[];
  readonly sources: readonly SourceId[];
  /** Who named it: each one is among the authors of one of its sources. */
  readonly credited: readonly PersonId[];
};

export const PRACTICES = {
  "architectural-fitness-function": {
    name: "Architectural fitness function",
    definition:
      "An automated check that gives an objective verdict on one characteristic of the architecture, run like a test.",
    cells: ["SC"],
    themes: ["architecture", "tests-and-verification"],
    sources: ["thoughtworks-2017-fitness-function"],
    credited: [],
  },
  "domain-modeling-made-functional": {
    name: "Domain modeling made functional",
    definition:
      "The domain written as types, so that a state the business forbids cannot be written in the code.",
    cells: ["GI", "SC"],
    themes: ["architecture", "types-and-contracts"],
    sources: ["wlaschin-2018-dmmf"],
    credited: ["scott-wlaschin"],
  },
  "hexagonal-architecture": {
    name: "Hexagonal architecture (ports and adapters)",
    definition:
      "The application talks to the outside only through ports, each served by an adapter, so its core depends on nothing outside it.",
    cells: ["GI"],
    themes: ["architecture"],
    sources: ["cockburn-2005-hexagonal"],
    credited: ["alistair-cockburn"],
  },
  "parse-dont-validate": {
    name: "Parse, don't validate",
    definition:
      "Input is checked once, at the boundary, into a type that keeps what was checked, so the rest of the program never meets an invalid value.",
    cells: ["SC"],
    themes: ["types-and-contracts"],
    sources: ["king-2019-parse-dont-validate"],
    credited: ["alexis-king"],
  },
  "suppression-baseline": {
    name: "Suppression baseline",
    definition:
      "The violations a codebase already has are recorded in a file, and the check fails when one is added or a recorded one is gone.",
    cells: ["SC"],
    themes: ["tooling", "refactoring-and-migration"],
    sources: ["eslint-bulk-suppressions"],
    credited: ["eslint"],
  },
} as const satisfies Record<string, Practice>;

export type PracticeId = keyof typeof PRACTICES;
