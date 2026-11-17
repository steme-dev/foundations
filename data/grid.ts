import type { SourceId } from "./sources.ts";

/**
 * Birgitta Böckeler's grid of a coding agent's harness (`GRID_SOURCE`): a guide acts before the agent,
 * a sensor after; each is inferential, a model judging, or computational, a program deciding. Each
 * cell's `examples` are hers, as her article's overview figure and its table of examples name them.
 */
export const GRID_SOURCE: SourceId = "bockeler-2026-harness";

/** An example of what acts in a cell: one Böckeler gives, or one this library adds. */
export type Example = { readonly text: string; readonly by: "bockeler" | "added" };

export type CellInfo = {
  readonly label: string;
  readonly slug: string;
  readonly hint: string;
  readonly examples: readonly Example[];
};

const hers = (text: string): Example => ({ text, by: "bockeler" });
const ours = (text: string): Example => ({ text, by: "added" });

export const CELLS = {
  GI: {
    label: "Inferential guide",
    slug: "inferential-guide",
    hint: "what the agent reads before it acts",
    examples: [
      hers("Principles"),
      hers("Cross-functional requirements"),
      hers("Rules"),
      hers("Reference docs"),
      hers("How-tos"),
      hers("Coding conventions in AGENTS.md or a skill"),
      ours("A spec and a plan, approved by a person before the work starts"),
      ours(
        "Architecture named in the literature's words, such as DDD, hexagonal or MVVM, in prompts and skills",
      ),
    ],
  },
  GC: {
    label: "Computational guide",
    slug: "computational-guide",
    hint: "a program that steers or acts before the agent writes",
    examples: [
      hers("Language servers"),
      hers("CLIs and scripts"),
      hers("Codemods, such as a tool with access to OpenRewrite recipes"),
      ours("A generator, which lays down code that is right by construction"),
      ours("A command that carries out an action in the agent's place"),
      ours("Code mode: the agent writes a program rather than a string of tool calls"),
      ours("A brief computed from the code, of the guarantees the next change must keep"),
    ],
  },
  SI: {
    label: "Inferential sensor",
    slug: "inferential-sensor",
    hint: "a model or a person judging what was done",
    examples: [
      hers("Review agents"),
      hers("Instructions for how to review, in a skill"),
      ours("A review of the change against the plan it was meant to carry out"),
    ],
  },
  SC: {
    label: "Computational sensor",
    slug: "computational-sensor",
    hint: "a program deciding whether what was done holds",
    examples: [
      hers("Tests, linters, type checkers, structural analysis"),
      hers("Logs"),
      hers("Browser"),
      hers("Structural tests, such as a hook running ArchUnit tests on module boundaries"),
      ours("Fitness functions"),
      ours("Dead-code detection"),
      ours("A gate that sends a failing check back to the agent, within a budget of attempts"),
      ours("A transition table the type checker holds exhaustive"),
      ours("Acceptance tests written before the code, frozen until a later step passes them"),
      ours("The files a step changed, reconciled with the files it planned to change"),
      ours("A snapshot of what the code does, taken before a refactoring"),
      ours("A ratchet: the accepted debt can only go down"),
    ],
  },
} as const satisfies Record<string, CellInfo>;

export type Cell = keyof typeof CELLS;
