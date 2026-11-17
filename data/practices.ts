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
  "acceptance-test": {
    name: "Acceptance test",
    definition:
      "A test of a specified acceptance criterion, written before the code from what the user should see, which the code must then pass.",
    cells: ["SC"],
    themes: ["tests-and-verification", "plans-and-agents"],
    sources: ["freeman-pryce-2009-goos", "agile-alliance-atdd", "agile-alliance-acceptance"],
    credited: [],
  },
  "approval-testing": {
    name: "Approval testing",
    definition:
      "A person approves an output once, and every later run must reproduce it until a new one is approved.",
    cells: ["SC"],
    themes: ["tests-and-verification"],
    sources: ["approvaltests"],
    credited: ["approvaltests"],
  },
  "architectural-fitness-function": {
    name: "Architectural fitness function",
    definition:
      "An automated check that gives an objective verdict on one characteristic of the architecture, run like a test.",
    cells: ["SC"],
    themes: ["architecture", "tests-and-verification"],
    sources: ["thoughtworks-2017-fitness-function"],
    credited: [],
  },
  "characterization-test": {
    name: "Characterization test",
    definition:
      "A test records what the code does today, right or not, so that a change to it cannot go unseen.",
    cells: ["SC"],
    themes: ["tests-and-verification", "refactoring-and-migration"],
    sources: ["feathers-2004-legacy-code", "feathers-2016-characterization"],
    credited: ["michael-feathers"],
  },
  "code-generator": {
    name: "Code generator (scaffolding)",
    definition:
      "A command lays down the files of a new part of the code from a template, so they start in the shape the project expects.",
    cells: ["GC"],
    themes: ["tooling"],
    sources: ["rails-generators", "yeoman"],
    credited: [],
  },
  "code-mode": {
    name: "Code mode",
    definition:
      "The agent writes a program that calls its tools, run in one step, rather than calling each tool itself and reading every result.",
    cells: ["GC"],
    themes: ["plans-and-agents", "tooling"],
    sources: ["varda-pai-2025-code-mode", "jones-kelly-2025-code-execution"],
    credited: ["kenton-varda", "sunil-pai"],
  },
  codemod: {
    name: "Codemod",
    definition:
      "A program rewrites the code base mechanically, the same change at every place a pattern matches, instead of a person or an agent making each edit.",
    cells: ["GC"],
    themes: ["refactoring-and-migration", "tooling"],
    sources: ["rosenstein-codemod", "meta-jscodeshift", "openrewrite-recipes"],
    credited: ["justin-rosenstein"],
  },
  "contract-test": {
    name: "Contract test",
    definition:
      "One suite of tests runs against both a fake and the real implementation, so the fake the other tests use is known to behave like the real one.",
    cells: ["SC"],
    themes: ["tests-and-verification"],
    sources: ["rainsberger-2021-abstract-test-cases", "fowler-2011-contract-test"],
    credited: ["j-b-rainsberger"],
  },
  "decision-table-testing": {
    name: "Decision table testing",
    definition:
      "Every combination of a finite set of conditions is listed with its expected outcome, and each row becomes a test.",
    cells: ["SC"],
    themes: ["tests-and-verification"],
    sources: ["istqb-decision-table-testing"],
    credited: [],
  },
  "domain-driven-design": {
    name: "Domain-driven design",
    definition:
      "The code is shaped on a model of the business, written in the words its experts use, and kept apart from the technical concerns around it.",
    cells: ["GI"],
    themes: ["architecture"],
    sources: ["evans-2003-ddd", "evans-2015-ddd-reference"],
    credited: ["eric-evans"],
  },
  "equivalence-partitioning-and-boundary-values": {
    name: "Equivalence partitioning and boundary value analysis",
    definition:
      "Inputs are split into classes the code should treat alike, and each class is tested once inside it and at each of its limits.",
    cells: ["SC"],
    themes: ["tests-and-verification"],
    sources: [
      "istqb-equivalence-partitioning",
      "istqb-boundary-value-analysis",
      "myers-2011-art-of-software-testing",
    ],
    credited: [],
  },
  fuzzing: {
    name: "Fuzzing",
    definition:
      "A program is fed random or malformed input to find the inputs that make it crash or hang.",
    cells: ["SC"],
    themes: ["tests-and-verification"],
    sources: ["miller-1990-fuzz"],
    credited: ["barton-miller", "lars-fredriksen", "bryan-so"],
  },
  "golden-master": {
    name: "Golden master",
    definition:
      "The output of a reference run is kept, and every later run is compared with it to catch any change in behaviour.",
    cells: ["SC"],
    themes: ["tests-and-verification", "refactoring-and-migration"],
    sources: ["rainsberger-2014-golden-master"],
    credited: [],
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
  "language-server": {
    name: "Language server",
    definition:
      "One server per language answers an editor or an agent about the code, its definitions, references and errors, through a common protocol.",
    cells: ["GC"],
    themes: ["tooling"],
    sources: ["microsoft-lsp-overview", "microsoft-lsp-3-17"],
    credited: ["microsoft"],
  },
  "make-illegal-states-unrepresentable": {
    name: "Make illegal states unrepresentable",
    definition:
      "Types are shaped so that a state the program must never reach cannot be written, and the compiler refuses it.",
    cells: ["GI", "SC"],
    themes: ["types-and-contracts"],
    sources: ["minsky-2011-effective-ml"],
    credited: ["yaron-minsky"],
  },
  "metamorphic-testing": {
    name: "Metamorphic testing",
    definition:
      "When the right output is unknown, two runs whose inputs are related are checked for outputs that relate the same way.",
    cells: ["SC"],
    themes: ["tests-and-verification"],
    sources: ["chen-1998-metamorphic", "chen-2018-metamorphic-review"],
    credited: ["tsong-yueh-chen", "s-c-cheung", "s-m-yiu"],
  },
  "mutation-testing": {
    name: "Mutation testing",
    definition:
      "Small faults are planted in the code, and a test suite that still passes on one of them has a gap to fill.",
    cells: ["SC"],
    themes: ["tests-and-verification"],
    sources: ["jia-harman-2011-mutation"],
    credited: [],
  },
  mvvm: {
    name: "Model-View-ViewModel (MVVM)",
    definition:
      "A view binds to a view model that holds its state and commands, so the interface's logic can be tested without the interface.",
    cells: ["GI"],
    themes: ["architecture"],
    sources: ["gossman-2005-mvvm"],
    credited: ["john-gossman"],
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
  "property-based-testing": {
    name: "Property-based testing",
    definition:
      "Generated inputs are checked against a property that must always hold, and a failing input is shrunk to the smallest one that still fails.",
    cells: ["SC"],
    themes: ["tests-and-verification"],
    sources: ["claessen-hughes-2000-quickcheck"],
    credited: ["koen-claessen", "john-hughes"],
  },
  ratchet: {
    name: "Ratchet",
    definition:
      "The violations a code base already has are accepted and recorded, and the check fails on any new one, so the count can only go down.",
    cells: ["SC"],
    themes: ["tooling", "refactoring-and-migration"],
    sources: [
      "qntm-2021-ratchet",
      "betterer-introduction",
      "eslint-bulk-suppressions",
      "mosher-2025-ratcheting",
      "westby-temporal-ratcheting",
      "sonarsource-clean-as-you-code",
    ],
    credited: [],
  },
  "separation-of-duties": {
    name: "Separation of duties",
    definition:
      "The one who does the work is not the one who checks it, because a measure the doer controls stops measuring.",
    cells: ["SI", "SC"],
    themes: ["tests-and-verification", "plans-and-agents"],
    sources: [
      "saltzer-schroeder-1975-protection",
      "nist-separation-of-duty",
      "slsa-source-requirements",
      "strathern-1997-improving-ratings",
    ],
    credited: ["jerome-saltzer", "michael-schroeder"],
  },
  "smoke-test": {
    name: "Smoke test",
    definition:
      "A quick run of the main paths of the whole system, end to end, to see that it works at all before deeper testing.",
    cells: ["SC"],
    themes: ["tests-and-verification"],
    sources: ["istqb-smoke-testing"],
    credited: [],
  },
  "snapshot-testing": {
    name: "Snapshot testing",
    definition:
      "A test framework stores an output the first time a test runs and fails when a later run produces a different one.",
    cells: ["SC"],
    themes: ["tests-and-verification"],
    sources: ["jest-snapshot-testing"],
    credited: ["meta"],
  },
  "stateful-testing": {
    name: "Stateful (model-based) testing",
    definition:
      "Generated sequences of commands are run against the system and against a simple model of it, and the two must agree at every step.",
    cells: ["SC"],
    themes: ["tests-and-verification"],
    sources: ["hughes-2016-testing-the-hard-stuff", "hypothesis-stateful"],
    credited: ["john-hughes"],
  },
  "test-sizes": {
    name: "Test sizes",
    definition:
      "A test is small, medium or large by what it touches, one process, one machine or beyond, which decides its speed and its flakiness better than unit or integration.",
    cells: ["SC"],
    themes: ["tests-and-verification"],
    sources: ["stewart-2010-test-sizes", "winters-2020-swe-at-google"],
    credited: ["simon-stewart"],
  },
  "unit-testing": {
    name: "Unit testing",
    definition:
      "A test exercises a small part of the code, such as one function or class, fast enough to run on every change, with its collaborators real or replaced.",
    cells: ["SC"],
    themes: ["tests-and-verification"],
    sources: ["fowler-2014-unit-test"],
    credited: [],
  },
} as const satisfies Record<string, Practice>;

export type PracticeId = keyof typeof PRACTICES;
