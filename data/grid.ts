/**
 * Birgitta Böckeler's grid of a coding agent's harness: a guide acts before the agent, a sensor
 * after; each is inferential, a model judging, or computational, a program deciding.
 */
export const CELLS = {
  GI: {
    label: "Inferential guide",
    hint: "what the agent reads before it acts",
  },
  GC: {
    label: "Computational guide",
    hint: "a program that steers or acts before the agent writes",
  },
  SI: {
    label: "Inferential sensor",
    hint: "a model or a person judging what was done",
  },
  SC: {
    label: "Computational sensor",
    hint: "a program deciding whether what was done holds",
  },
} as const;

export type Cell = keyof typeof CELLS;
