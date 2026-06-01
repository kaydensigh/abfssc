const fs = require('fs'), zlib = require('zlib');
const g = fs.readFileSync('ABF_Card_Form_Usage_Guide.pdf');
let pos = 0, streams = [];
const M = Buffer.from('stream'), E = Buffer.from('endstream');
while (true) {
  let s = g.indexOf(M, pos); if (s < 0) break;
  let d = s + 6; if (g[d] === 13) d++; if (g[d] === 10) d++;
  let e = g.indexOf(E, d); if (e < 0) break;
  let data = g.slice(d, e);
  try { streams.push(zlib.inflateSync(data).toString('latin1')); } catch (_) {}
  pos = e + 9;
}

function decodeStr(s) {
  return s.replace(/\\(\d{1,3}|.)/g, (mm, c) => {
    if (/^\d{1,3}$/.test(c)) return String.fromCharCode(parseInt(c, 8) & 0xff);
    const map = { n: '\n', r: '', t: '\t', '(': '(', ')': ')', '\\': '\\' };
    return c in map ? map[c] : c;
  });
}

let pages = [];
for (const st of streams) {
  if (st.indexOf('BT') === -1 || st.indexOf('TJ') === -1 && st.indexOf('Tj') === -1) continue;
  let out = [];
  let re = /\[((?:[^\[\]\\]|\\.)*)\]\s*TJ|\(((?:[^()\\]|\\.)*)\)\s*Tj|\bT\*|\bTd\b|\bTD\b|\b'\B/g, m;
  let lastWasNL = false;
  while ((m = re.exec(st))) {
    if (m[1] !== undefined) {
      let inner = '', re2 = /\(((?:[^()\\]|\\.)*)\)|(-?\d+\.?\d*)/g, mm;
      while ((mm = re2.exec(m[1]))) {
        if (mm[1] !== undefined) inner += decodeStr(mm[1]);
        else { let num = parseFloat(mm[2]); if (num < -100) inner += ' '; }
      }
      out.push(inner); lastWasNL = false;
    } else if (m[2] !== undefined) { out.push(decodeStr(m[2])); lastWasNL = false; }
    else { if (!lastWasNL) { out.push('\n'); lastWasNL = true; } }
  }
  let txt = out.join('');
  if (txt.trim().length > 5) pages.push(txt);
}
let full = pages.join('\n\n========== PAGE BREAK ==========\n\n');
full = full.replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n');
fs.writeFileSync('extracted/usage_guide_text.txt', full);
console.log('Text streams with content:', pages.length);
console.log('Total guide text chars:', full.length);
console.log('\n===== PREVIEW (first 1500 chars) =====\n');
console.log(full.slice(0, 1500));
