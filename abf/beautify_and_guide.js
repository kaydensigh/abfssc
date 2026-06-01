const fs = require('fs');
const zlib = require('zlib');

// ---------- Part 1: Beautify the top JS blocks ----------
function beautify(code) {
  let out = '', indent = 0, inStr = false, strCh = '', i = 0;
  const pad = () => '\n' + '  '.repeat(Math.max(0, indent));
  while (i < code.length) {
    let c = code[i];
    if (inStr) {
      out += c;
      if (c === '\\') { out += code[i + 1] || ''; i += 2; continue; }
      if (c === strCh) inStr = false;
      i++; continue;
    }
    if (c === '"' || c === "'") { inStr = true; strCh = c; out += c; i++; continue; }
    if (c === '{') { indent++; out += c + pad(); i++; continue; }
    if (c === '}') { indent--; out = out.replace(/\s+$/, ''); out += pad() + c; if (code[i+1] !== ';' && code[i+1] !== ')' && code[i+1] !== ',') out += pad(); i++; continue; }
    if (c === ';') { out += c + pad(); i++; continue; }
    out += c; i++;
  }
  return out.replace(/\n\s*\n\s*\n/g, '\n\n');
}

const t = fs.readFileSync('extracted/all_inflated.txt', 'latin1');
function parseStr(t, p) {
  let depth = 1, out = [];
  while (p < t.length) {
    let c = t[p];
    if (c === '\\') { out.push(t[p], t[p + 1]); p += 2; continue; }
    if (c === '(') { depth++; out.push(c); p++; continue; }
    if (c === ')') { depth--; if (depth === 0) { p++; break; } out.push(c); p++; continue; }
    out.push(c); p++;
  }
  return [out.join(''), p];
}
function unesc(s) {
  return s.replace(/\\([()\\nrtbf])/g, (m, c) => ({n:'\n',r:'\r',t:'\t',b:'\b',f:'\f'}[c] || c));
}
let blocks = [], p = 0;
while (true) {
  let i = t.indexOf('/JS(', p); if (i === -1) break;
  let [s, np] = parseStr(t, i + 4); blocks.push(unesc(s)); p = np;
}
let ranked = blocks.map((b, i) => [b.length, i]).sort((a, b) => b[0] - a[0]);
ranked.slice(0, 4).forEach((r, k) => {
  fs.writeFileSync('extracted/beautified_' + k + '_block' + r[1] + '.js', beautify(blocks[r[1]]));
  console.log('beautified block', r[1], 'len', r[0]);
});

// ---------- Part 2: Extract usage guide text ----------
const guide = fs.readFileSync('ABF_Card_Form_Usage_Guide.pdf');
let pos = 0, texts = [];
const marker = Buffer.from('stream'), endM = Buffer.from('endstream');
while (true) {
  let sIdx = guide.indexOf(marker, pos); if (sIdx === -1) break;
  let ds = sIdx + marker.length;
  if (guide[ds] === 0x0d) ds++; if (guide[ds] === 0x0a) ds++;
  let eIdx = guide.indexOf(endM, ds); if (eIdx === -1) break;
  let data = guide.slice(ds, eIdx);
  try { texts.push(zlib.inflateSync(data).toString('latin1')); }
  catch (e) { try { texts.push(zlib.inflateRawSync(data).toString('latin1')); } catch (e2) {} }
  pos = eIdx + endM.length;
}
let gAll = texts.join('\n');
// Extract text from Tj and TJ operators
let textOut = [];
// Match (..) Tj  and  [..] TJ
let reTj = /\(((?:[^()\\]|\\.)*)\)\s*Tj/g, m;
let reTJ = /\[((?:[^\]\\]|\\.)*)\]\s*TJ/g;
// Process by scanning BT...ET blocks to keep order-ish; simpler: global scan combined
let combined = gAll;
function decodeStr(s) {
  return s.replace(/\\(\d{3}|.)/g, (mm, c) => {
    if (/^\d{3}$/.test(c)) return String.fromCharCode(parseInt(c, 8));
    return ({n:'\n',r:'',t:'\t','(':'(',')':')','\\':'\\'}[c] !== undefined ? {n:'\n',r:'',t:'\t','(':'(',')':')','\\':'\\'}[c] : c);
  });
}
let lines = [];
// Walk through and emit text pieces
let re = /(\(((?:[^()\\]|\\.)*)\)\s*Tj)|(\[((?:[^\]\\]|\\.)*)\]\s*TJ)|(T\*)|(\bTd\b)|(\bTD\b)/g;
while ((m = re.exec(combined))) {
  if (m[2] !== undefined) lines.push(decodeStr(m[2]));
  else if (m[5] !== undefined) {
    // TJ array: extract strings, ignore numbers
    let arr = m[5];
    let inner = '', re2 = /\(((?:[^()\\]|\\.)*)\)/g, mm;
    while ((mm = re2.exec(arr))) inner += decodeStr(mm[1]);
    lines.push(inner);
  } else if (m[6] || m[7] || m[8]) lines.push('\n');
}
let guideText = lines.join('').replace(/\n{3,}/g, '\n\n');
fs.writeFileSync('extracted/usage_guide_text.txt', guideText);
console.log('\nUsage guide text length:', guideText.length);
console.log('Guide text preview:\n', guideText.slice(0, 600));
