const fs = require('fs');
const t = fs.readFileSync('extracted/all_inflated.txt', 'latin1');

// Parse a PDF literal string starting right after '(' at position p
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
  return s.replace(/\\([()\\nrtbf])/g, (m, c) => {
    if (c === 'n') return '\n';
    if (c === 'r') return '\r';
    if (c === 't') return '\t';
    if (c === 'b') return '\b';
    if (c === 'f') return '\f';
    return c;
  });
}
let blocks = [];
let p = 0;
while (true) {
  let i = t.indexOf('/JS(', p);
  if (i === -1) break;
  let [s, np] = parseStr(t, i + 4);
  blocks.push(unesc(s));
  p = np;
}
console.log('Total /JS blocks:', blocks.length);
let sizes = blocks.map(b => b.length).sort((a, b) => b - a);
console.log('Largest 20 block sizes:', sizes.slice(0, 20).join(', '));
console.log('Total JS chars:', blocks.reduce((a, b) => a + b.length, 0));
let big = blocks.map((b, i) => '/////// JS BLOCK ' + i + ' (len ' + b.length + ') ///////\n' + b).join('\n\n');
fs.writeFileSync('extracted/js_blocks.txt', big);
console.log('wrote extracted/js_blocks.txt');
let ranked = blocks.map((b, i) => [b.length, i]).sort((a, b) => b[0] - a[0]);
let idxLargest = ranked[0][1];
console.log('Largest block index:', idxLargest, 'len', blocks[idxLargest].length);
fs.writeFileSync('extracted/largest_js_block.txt', blocks[idxLargest]);
// Also write top 5 largest separately
ranked.slice(0, 6).forEach((r, k) => {
  fs.writeFileSync('extracted/top_' + k + '_block_' + r[1] + '.js', blocks[r[1]]);
});
