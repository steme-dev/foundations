export const THEMES = {
  architecture: "Architecture",
  "types-and-contracts": "Types and contracts",
  "tests-and-verification": "Tests and verification",
  "refactoring-and-migration": "Refactoring and migration",
  "plans-and-agents": "Plans and agents",
  tooling: "Tooling",
} as const;

export type Theme = keyof typeof THEMES;
