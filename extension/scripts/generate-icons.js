#!/usr/bin/env node
/**
 * Generates PNG icons for the Chrome extension by rasterizing logo-icon.svg.
 * Uses @resvg/resvg-js — a pure Rust/WASM SVG renderer, no system deps needed.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Resvg } from '@resvg/resvg-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const svgPath = path.join(__dirname, '..', 'src', 'assets', 'logo-icon.svg');
const svgContent = fs.readFileSync(svgPath, 'utf-8');

const iconsDir = path.join(__dirname, '..', 'public', 'icons');
fs.mkdirSync(iconsDir, { recursive: true });

for (const size of [16, 32, 48, 128]) {
  const resvg = new Resvg(svgContent, {
    fitTo: { mode: 'width', value: size },
  });
  const png = resvg.render().asPng();
  const filePath = path.join(iconsDir, `icon${size}.png`);
  fs.writeFileSync(filePath, png);
  console.log(`  created ${filePath} (${size}x${size})`);
}

console.log('Icons generated from logo-icon.svg');
