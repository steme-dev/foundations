/**
 * Where a book can be bought. The order a book lists them in is the order a reader is offered them:
 * the publisher's own shop, then the specialised and independent bookshops, and a marketplace only
 * as a last resort, when no one else sells the book.
 */
export type Shop = {
  readonly name: string;
  readonly kind: "publisher" | "bookshop" | "marketplace";
  /** The host every link to this shop is on. */
  readonly host: string;
};

export const SHOPS = {
  amazon: { name: "Amazon", kind: "marketplace", host: "www.amazon.com" },
  "bookshop-org": {
    name: "Bookshop.org",
    kind: "bookshop",
    host: "bookshop.org",
  },
  eyrolles: {
    name: "Librairie Eyrolles",
    kind: "bookshop",
    host: "www.eyrolles.com",
  },
  informit: {
    name: "InformIT",
    kind: "publisher",
    host: "www.informit.com",
  },
  "pragmatic-bookshelf": {
    name: "Pragmatic Bookshelf",
    kind: "publisher",
    host: "pragprog.com",
  },
} as const satisfies Record<string, Shop>;

export type ShopId = keyof typeof SHOPS;

/** The rank of a shop's kind in the order a book offers them. */
export const SHOP_ORDER: Readonly<Record<Shop["kind"], number>> = {
  publisher: 0,
  bookshop: 1,
  marketplace: 2,
};
