/**
 * Writes the fonts the worker draws a person's card with: Instrument Sans, the site's own, from its
 * @fontsource package, turned from WOFF back into the TrueType resvg reads. The output is committed
 * (worker/fonts/), with the font's licence (SIL Open Font License 1.1).
 *
 *   node scripts/fonts.mjs
 */
import { copyFileSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { inflateSync } from "node:zlib";

const ROOT = join(fileURLToPath(new URL(".", import.meta.url)), "..");
const PACKAGE = join(ROOT, "node_modules", "@fontsource", "instrument-sans");
const OUT = join(ROOT, "worker", "fonts");

/** A WOFF 1.0 file as the sfnt (TrueType) it wraps: each table inflated, the directory rebuilt. */
export function woffToSfnt(woff) {
  const view = new DataView(woff.buffer, woff.byteOffset, woff.byteLength);
  if (view.getUint32(0) !== 0x774f4646) throw new Error("not a WOFF 1.0 file");
  const flavor = view.getUint32(4);
  const numTables = view.getUint16(12);
  const tables = [];
  for (let i = 0; i < numTables; i++) {
    const at = 44 + i * 20;
    const tag = view.getUint32(at);
    const offset = view.getUint32(at + 4);
    const compLength = view.getUint32(at + 8);
    const origLength = view.getUint32(at + 12);
    const checksum = view.getUint32(at + 16);
    const raw = woff.subarray(offset, offset + compLength);
    const data = compLength < origLength ? new Uint8Array(inflateSync(raw)) : raw;
    if (data.length !== origLength) throw new Error("a table does not inflate to its length");
    tables.push({ tag, checksum, data });
  }
  let entrySelector = 0;
  while (2 ** (entrySelector + 1) <= numTables) entrySelector++;
  const searchRange = 2 ** entrySelector * 16;
  const header = 12 + numTables * 16;
  const size = tables.reduce((n, t) => n + ((t.data.length + 3) & ~3), header);
  const out = new Uint8Array(size);
  const dv = new DataView(out.buffer);
  dv.setUint32(0, flavor);
  dv.setUint16(4, numTables);
  dv.setUint16(6, searchRange);
  dv.setUint16(8, entrySelector);
  dv.setUint16(10, numTables * 16 - searchRange);
  let offset = header;
  tables.forEach((t, i) => {
    const at = 12 + i * 16;
    dv.setUint32(at, t.tag);
    dv.setUint32(at + 4, t.checksum);
    dv.setUint32(at + 8, offset);
    dv.setUint32(at + 12, t.data.length);
    out.set(t.data, offset);
    offset += (t.data.length + 3) & ~3;
  });
  return out;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  for (const weight of [400, 600]) {
    const woff = readFileSync(
      join(PACKAGE, "files", `instrument-sans-latin-${weight}-normal.woff`),
    );
    const ttf = woffToSfnt(new Uint8Array(woff));
    writeFileSync(join(OUT, `instrument-sans-${weight}.ttf`), ttf);
    console.log(`worker/fonts/instrument-sans-${weight}.ttf: ${ttf.length} bytes`);
  }
  copyFileSync(join(PACKAGE, "LICENSE"), join(OUT, "LICENSE-OFL"));
}
