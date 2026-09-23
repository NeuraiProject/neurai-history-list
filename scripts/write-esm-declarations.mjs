// ESM declarations for the `import` entry (dist/index.mjs).
//
// Parcel writes self-contained declarations to dist/types.d.ts. This package
// is CommonJS (no "type": "module"), so TypeScript reads that file as
// CommonJS: right for `require` (dist/index.cjs), wrong for `import`. The
// same declarations are written as dist/types.d.mts, which TypeScript reads as
// ESM. Both builds export `getHistory` and a default `{ getHistory }`.
import { readFileSync, writeFileSync } from "node:fs";

const source = readFileSync(new URL("../dist/types.d.ts", import.meta.url), "utf8");
// The source map describes types.d.ts only.
const declarations = source.replace(/\n*\/\/# sourceMappingURL=.*\s*$/, "\n");
writeFileSync(new URL("../dist/types.d.mts", import.meta.url), declarations);
