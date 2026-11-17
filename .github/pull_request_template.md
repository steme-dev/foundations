<!-- A practice, a source, a correction: what this pull request adds or changes, in a sentence or two. -->

## For a new practice

- [ ] **Its name is the literature's** (`data/practices.ts`), the one its sources give it.
- [ ] **Its definition is one plain sentence**, saying what it does, not why it is good.
- [ ] **Its cells of the grid and its themes** are set.
- [ ] **Each source was read at its address** (`data/sources.ts`): title, authors, year, kind and publisher as
      the source itself gives them.
- [ ] **A book names its ISBN-13 and where to buy it**: the publisher's shop first, then specialised or independent
      bookshops (`data/shops.ts`); a marketplace only when no one else sells it.
- [ ] **Only people who named it are credited**, among the authors of its sources (`data/people.ts`).
- [ ] `pnpm check` passes. The types and `data/data.test.ts` check the references, the credits and the shops; CI
      runs it again.

See [CONTRIBUTING.md](../CONTRIBUTING.md).
