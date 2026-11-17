import type { PersonId } from "./people.ts";
import type { ShopId } from "./shops.ts";

/** A place a book can be bought. */
export type Purchase = { readonly shop: ShopId; readonly url: string };

/** A book, a paper, an article or a page of documentation, as anyone can find it. */
export type Source = {
  readonly title: string;
  readonly by: readonly PersonId[];
  /** The year it was published; `null` for a page kept up to date, with no date of its own. */
  readonly year: number | null;
  readonly kind: "book" | "paper" | "article" | "documentation";
  readonly publisher: string;
  readonly url: string;
  /** A book's ISBN-13, the one its links sell. */
  readonly isbn?: string;
  /** Where a book can be bought, in the order `shops.ts` says; only a book has it. */
  readonly buy?: readonly Purchase[];
};

export const SOURCES = {
  "cockburn-2005-hexagonal": {
    title: "Hexagonal (Ports & Adapters) Architecture",
    by: ["alistair-cockburn"],
    year: 2005,
    kind: "paper",
    publisher: "HaT Technical Report 2005.02",
    url: "https://alistair.cockburn.us/hexagonal-architecture/",
  },
  "eslint-bulk-suppressions": {
    title: "Bulk Suppressions",
    by: ["eslint"],
    year: null,
    kind: "documentation",
    publisher: "eslint.org",
    url: "https://eslint.org/docs/latest/use/suppressions",
  },
  "king-2019-parse-dont-validate": {
    title: "Parse, don't validate",
    by: ["alexis-king"],
    year: 2019,
    kind: "article",
    publisher: "lexi-lambda.github.io",
    url: "https://lexi-lambda.github.io/blog/2019/11/05/parse-don-t-validate/",
  },
  "thoughtworks-2017-fitness-function": {
    title: "Architectural fitness function",
    by: ["thoughtworks"],
    year: 2017,
    kind: "article",
    publisher: "Technology Radar",
    url: "https://www.thoughtworks.com/radar/techniques/architectural-fitness-function",
  },
  "wlaschin-2018-dmmf": {
    title: "Domain Modeling Made Functional",
    by: ["scott-wlaschin"],
    year: 2018,
    kind: "book",
    publisher: "Pragmatic Bookshelf",
    url: "https://pragprog.com/titles/swdddf/domain-modeling-made-functional/",
    isbn: "9781680502541",
    buy: [
      {
        shop: "pragmatic-bookshelf",
        url: "https://pragprog.com/titles/swdddf/domain-modeling-made-functional/",
      },
      {
        shop: "eyrolles",
        url: "https://www.eyrolles.com/Loisirs/Livre/domain-modeling-made-functional-9781680502541",
      },
      {
        shop: "bookshop-org",
        url: "https://bookshop.org/p/books/domain-modeling-made-functional-tackle-software-splexity-with-domain-driven-design-and-f-scott-wlaschin/62a7ab0d38cde630",
      },
    ],
  },
} as const satisfies Record<string, Source>;

export type SourceId = keyof typeof SOURCES;
