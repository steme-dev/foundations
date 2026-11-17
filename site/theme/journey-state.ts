/**
 * Where a reader is in the way in, kept in their browser: whether they have opened their own grid,
 * and whether the three steps are behind them, after which the home no longer shows them. The page's
 * head reads the second before it paints (`JOURNEY_HEAD`), so a reader who is done never sees the
 * steps flash.
 */
export const GRID_VISITED = "foundations:grid-visited";
export const JOURNEY_DONE = "foundations:journey-done";

const read = (key: string): boolean => {
  try {
    return localStorage.getItem(key) === "1";
  } catch {
    return false;
  }
};

const write = (key: string): void => {
  try {
    localStorage.setItem(key, "1");
  } catch {
    // A browser that keeps nothing shows the steps again: no harm.
  }
};

export const gridVisited = (): boolean => read(GRID_VISITED);
export const markGridVisited = (): void => write(GRID_VISITED);
export const journeyDone = (): boolean => read(JOURNEY_DONE);

export const markJourneyDone = (): void => {
  write(JOURNEY_DONE);
  document.documentElement.dataset.journey = "done";
};

/** The inline script of every page's head: the home's steps hidden before paint once they are done. */
export const JOURNEY_HEAD = `try{if(localStorage.getItem(${JSON.stringify(JOURNEY_DONE)})==="1")document.documentElement.dataset.journey="done"}catch(e){}`;
