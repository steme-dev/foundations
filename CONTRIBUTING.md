# Contributing

A practice, a source, or a better place to buy a book.

- **Without code**: [propose a practice](https://github.com/steme-dev/foundations/issues/new?template=new-practice.yml).
  The form asks for what the data holds; a maintainer turns it into a pull request and checks each source.
- **With code**: open a pull request that changes `data/`. Its template lists the rules below; `pnpm check` must
  pass, and CI runs it again.

## A practice

- **Its name is the literature's.** Use the name its sources give it, not a new one. When sources
  disagree, take the most cited and say the others in the definition.
- **One sentence, in plain words**, saying what the practice does, not why it is good.
- **At least one source, read at its address.** Cite only what you have read. A practice may stand on
  several sources.
- **Credit only who named it**, among the authors of its sources.
- **Its cells of the grid**: a guide acts before the agent or the developer writes, a sensor after;
  either is inferential, a model or a person judging, or computational, a program deciding.

## A source

- Its title, authors, year and publisher as the source itself gives them. A page kept up to date with no
  date of its own has `year: null`.
- Its address is where anyone can read it or, for a book, where it is presented.
- A book names its ISBN-13 and where it can be bought: its publisher's shop first, then specialised and
  independent bookshops; a marketplace only when no one else sells it.
