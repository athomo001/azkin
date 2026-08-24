// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
// `tsc` no copia archivos no-TS (ej. el logo usado como inline attachment en correos
// transaccionales). Este paso post-build copia src/infrastructure/assets a dist/infrastructure/assets.
const fs = require("fs");
const path = require("path");

const src = path.join(__dirname, "..", "src", "infrastructure", "assets");
const dest = path.join(__dirname, "..", "dist", "infrastructure", "assets");

if (fs.existsSync(src)) {
  fs.cpSync(src, dest, {
    recursive: true,
    // Excluye los .ts fuente (ya los compila tsc aparte) — solo copiamos los assets binarios.
    filter: (path) => !path.endsWith(".ts"),
  });
}
