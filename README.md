# Foundations

Software engineering practices, each named in the literature's own words and backed by its sources: the
books, papers, articles and documentation that name it, and the people who did.

It will be served at [foundations.steme.dev](https://foundations.steme.dev), where you can say which
practices you use.

## The data

`data/` holds it, typed, so that a practice naming a source, a person, a cell or a theme that does not
exist does not compile:

- `practices.ts`: a practice's name, its definition in one sentence, its cells of Birgitta Böckeler's
  grid of guides and sensors (`grid.ts`), its themes (`themes.ts`), its sources and who it credits;
- `sources.ts`: each source as anyone can find it: its title, authors, year, kind, publisher and address;
- `people.ts`: the people, organisations and projects the sources are by;
- `shops.ts`: where a book can be bought. A book lists its publisher's own shop first, then specialised
  and independent bookshops, and a marketplace only when no one else sells it.

`data/data.test.ts` holds what the types cannot: every practice stands on a source and credits only
authors of its own sources, every source backs a practice, every person wrote a source, every book can
be bought and lists its shops in that order, each link on its shop's own address.

## Checking a change

The tools are pinned in `mise.toml`, and a dependency is installed only seven days after its release
(`pnpm-workspace.yaml`).

```sh
mise install
pnpm install
pnpm check
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## Licence

The data, the practices, their definitions and the list of sources, is under
[CC BY 4.0](LICENSE-DATA). The code is under [MIT](LICENSE-MIT) or [Apache-2.0](LICENSE-APACHE), at
your option.
