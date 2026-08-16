#!/usr/bin/env node
// Comprime in-place los .gif de una carpeta de modo temático (assets/huevo/<id>/) con gifsicle -O3.
// Uso: npm run compress-theme-gifs -- assets/huevo/sonic
'use strict';

const path = require('node:path');
const fs = require('node:fs');
const { execFileSync } = require('node:child_process');

const targetDir = process.argv[2];

if (!targetDir) {
  console.error('Uso: npm run compress-theme-gifs -- <carpeta>  (ej. assets/huevo/sonic)');
  process.exit(1);
}

const resolvedDir = path.resolve(targetDir);
if (!fs.statSync(resolvedDir, { throwIfNoEntry: false })?.isDirectory()) {
  console.error(`No es una carpeta válida: ${resolvedDir}`);
  process.exit(1);
}

const gifsicleModule = require('gifsicle');
// El paquete `gifsicle` es ESM puro (v7+); bajo interop de `require()` en CJS llega como
// namespace object con `.default` en vez de un string plano.
const gifsiclePath = gifsicleModule.default ?? gifsicleModule;

const gifFiles = fs
  .readdirSync(resolvedDir)
  .filter((name) => name.toLowerCase().endsWith('.gif'))
  .map((name) => path.join(resolvedDir, name));

if (gifFiles.length === 0) {
  console.log(`Sin archivos .gif en ${resolvedDir}, nada que comprimir.`);
  process.exit(0);
}

let totalBefore = 0;
let totalAfter = 0;

for (const file of gifFiles) {
  const before = fs.statSync(file).size;
  // -b: batch/in-place. -O3: máximo nivel de optimización sin pérdida de frames/transparencia.
  execFileSync(gifsiclePath, ['-b', '-O3', file], { stdio: 'inherit' });
  const after = fs.statSync(file).size;
  totalBefore += before;
  totalAfter += after;
  const pct = before > 0 ? (100 * (1 - after / before)).toFixed(1) : '0.0';
  console.log(`${path.basename(file)}: ${(before / 1024).toFixed(1)}KB -> ${(after / 1024).toFixed(1)}KB (-${pct}%)`);
}

const totalPct = totalBefore > 0 ? (100 * (1 - totalAfter / totalBefore)).toFixed(1) : '0.0';
console.log(`\nTotal: ${(totalBefore / 1024).toFixed(1)}KB -> ${(totalAfter / 1024).toFixed(1)}KB (-${totalPct}%)`);
