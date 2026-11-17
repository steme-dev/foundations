import { describe, expect, it } from "vitest";

import { PEOPLE } from "./people.ts";
import { PRACTICES, type Practice } from "./practices.ts";
import { SHOP_ORDER, SHOPS } from "./shops.ts";
import { SOURCES, type Source } from "./sources.ts";

const practices: [string, Practice][] = Object.entries(PRACTICES);
const sources: [string, Source][] = Object.entries(SOURCES);

describe("the practices", () => {
  it.each(practices)("%s stands on at least one source", (_, practice) => {
    expect(practice.sources.length).toBeGreaterThan(0);
  });

  it.each(practices)("%s credits only authors of its own sources", (_, practice) => {
    const authors = new Set(practice.sources.flatMap((id) => SOURCES[id].by));
    expect(practice.credited.filter((person) => !authors.has(person))).toEqual([]);
  });

  it.each(practices)("%s sits in at least one cell and one theme", (_, practice) => {
    expect(practice.cells.length).toBeGreaterThan(0);
    expect(practice.themes.length).toBeGreaterThan(0);
  });

  it.each(practices)("%s is defined in one plain sentence", (_, practice) => {
    expect(practice.definition).toMatch(/^[A-Z][^.—]*\.$/u);
  });
});

describe("the sources", () => {
  it.each(sources)("%s is reachable over https", (_, source) => {
    expect(new URL(source.url).protocol).toBe("https:");
  });

  it("each backs at least one practice", () => {
    const cited = new Set(practices.flatMap(([, practice]) => practice.sources));
    expect(
      sources.map(([id]) => id).filter((id) => !cited.has(id as keyof typeof SOURCES)),
    ).toEqual([]);
  });
});

describe("where a book is bought", () => {
  const books = sources.filter(([, source]) => source.kind === "book");

  it.each(books)("%s can be bought, and names its ISBN", (_, book) => {
    expect(book.buy?.length ?? 0).toBeGreaterThan(0);
    expect(book.isbn).toMatch(/^97[89]\d{10}$/u);
  });

  it.each(books)("%s offers its publisher, then bookshops, then a marketplace", (_, book) => {
    const ranks = (book.buy ?? []).map(({ shop }) => SHOP_ORDER[SHOPS[shop].kind]);
    expect(ranks).toEqual(ranks.toSorted((a, b) => a - b));
  });

  it.each(books)("%s offers a marketplace only when no one else sells it", (_, book) => {
    const kinds = (book.buy ?? []).map(({ shop }) => SHOPS[shop].kind);
    if (kinds.includes("marketplace")) expect(kinds).toEqual(["marketplace"]);
  });

  it.each(books)("%s links each shop on the shop's own address", (_, book) => {
    for (const { shop, url } of book.buy ?? []) {
      const link = new URL(url);
      expect([link.protocol, link.host]).toEqual(["https:", SHOPS[shop].host]);
    }
  });

  it("only a book has places to buy it", () => {
    const sold = sources.filter(([, source]) => source.kind !== "book" && source.buy !== undefined);
    expect(sold.map(([id]) => id)).toEqual([]);
  });
});

describe("the people", () => {
  it("each is the author of at least one source", () => {
    const authors = new Set(sources.flatMap(([, source]) => source.by));
    expect(Object.keys(PEOPLE).filter((id) => !authors.has(id as keyof typeof PEOPLE))).toEqual([]);
  });
});
