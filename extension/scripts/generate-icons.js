#!/usr/bin/env node
/**
 * Generates placeholder PNG icons for the Chrome extension.
 * Uses only Node.js built-ins (fs, path, zlib) — no external dependencies.
 * Color: LeadsBuddy indigo #4F46E5 (r=79, g=70, b=229)
 */

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// CRC-32 table (used by PNG chunk integrity checks)
const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c;
  }
  return table;
})();

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = CRC_TABLE[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcInput = Buffer.concat([typeBuf, data]);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(crcInput), 0);
  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

function createSolidPNG(size, r, g, b) {
  // PNG file signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR: width, height, bit-depth=8, color-type=2 (RGB), compression=0, filter=0, interlace=0
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(size, 0);
  ihdrData.writeUInt32BE(size, 4);
  ihdrData.writeUInt8(8, 8);
  ihdrData.writeUInt8(2, 9);
  ihdrData.writeUInt8(0, 10);
  ihdrData.writeUInt8(0, 11);
  ihdrData.writeUInt8(0, 12);

  // Raw image data: one filter byte (0 = None) followed by RGB pixels per row
  const rowLen = 1 + size * 3;
  const raw = Buffer.alloc(rowLen * size);
  for (let y = 0; y < size; y++) {
    raw[y * rowLen] = 0; // filter type None
    for (let x = 0; x < size; x++) {
      const offset = y * rowLen + 1 + x * 3;
      raw[offset] = r;
      raw[offset + 1] = g;
      raw[offset + 2] = b;
    }
  }

  const compressed = zlib.deflateSync(raw, { level: 9 });

  return Buffer.concat([
    signature,
    makeChunk('IHDR', ihdrData),
    makeChunk('IDAT', compressed),
    makeChunk('IEND', Buffer.alloc(0)),
  ]);
}

const iconsDir = path.join(__dirname, '..', 'public', 'icons');
fs.mkdirSync(iconsDir, { recursive: true });

// LeadsBuddy indigo brand color
const [R, G, B] = [79, 70, 229];

for (const size of [16, 32, 48, 128]) {
  const png = createSolidPNG(size, R, G, B);
  const filePath = path.join(iconsDir, `icon${size}.png`);
  fs.writeFileSync(filePath, png);
  console.log(`  created ${filePath}`);
}

console.log('Icons generated.');
