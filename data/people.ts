/** Who a source is by: a person, an organisation or a project. */
export type Person = {
  readonly name: string;
  readonly kind: "person" | "organisation" | "project";
};

export const PEOPLE = {
  "alexis-king": { name: "Alexis King", kind: "person" },
  "alistair-cockburn": { name: "Alistair Cockburn", kind: "person" },
  eslint: { name: "ESLint", kind: "project" },
  "scott-wlaschin": { name: "Scott Wlaschin", kind: "person" },
  thoughtworks: { name: "Thoughtworks", kind: "organisation" },
} as const satisfies Record<string, Person>;

export type PersonId = keyof typeof PEOPLE;
