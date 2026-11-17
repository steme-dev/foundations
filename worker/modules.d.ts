// What wrangler bundles beside the code: resvg's WebAssembly, compiled, and the fonts, as bytes
// (`rules` in wrangler.jsonc).
declare module "*.wasm" {
  const module: WebAssembly.Module;
  export default module;
}

declare module "*.ttf" {
  const bytes: ArrayBuffer;
  export default bytes;
}
