// decompress.js — STEP 0 of the extraction pipeline.
//
// Reads the binary form PDF, inflates every FlateDecode stream it contains
// (object streams, content streams, etc.), and concatenates the decompressed
// bytes into extracted/all_inflated.txt. Every other extract_*.js script reads
// that file, so run this first.
//
//   node decompress.js
//
// Output: extracted/all_inflated.txt  (~1.2 MB of readable PDF object text)

const fs = require('fs');
const zlib = require('zlib');
const path = require('path');

const PDF = 'ABF_Card_FORM.pdf';
const OUT_DIR = 'extracted';
const OUT = path.join(OUT_DIR, 'all_inflated.txt');

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR);

const buf = fs.readFileSync(PDF);
const marker = Buffer.from('stream');
const endMarker = Buffer.from('endstream');

let pos = 0, found = 0, ok = 0, fail = 0;
const chunks = [];

while (true) {
  const sIdx = buf.indexOf(marker, pos);
  if (sIdx === -1) break;

  // The stream data begins after 'stream' + its EOL (CRLF, LF, or CR).
  let dataStart = sIdx + marker.length;
  if (buf[dataStart] === 0x0d) dataStart++;
  if (buf[dataStart] === 0x0a) dataStart++;

  const eIdx = buf.indexOf(endMarker, dataStart);
  if (eIdx === -1) break;

  const data = buf.slice(dataStart, eIdx);
  found++;
  try {
    chunks.push(zlib.inflateSync(data).toString('latin1'));
    ok++;
  } catch (e) {
    // Some streams use raw DEFLATE, or aren't FlateDecode at all (e.g. images).
    try {
      chunks.push(zlib.inflateRawSync(data).toString('latin1'));
      ok++;
    } catch (e2) {
      fail++;
    }
  }
  pos = eIdx + endMarker.length;
}

const combined = chunks.join('\n\n=====STREAM-BREAK=====\n\n');
fs.writeFileSync(OUT, combined);

console.log(`streams found: ${found}  inflated: ${ok}  skipped (non-deflate/images): ${fail}`);
console.log(`wrote ${OUT}  (${combined.length} bytes)`);
