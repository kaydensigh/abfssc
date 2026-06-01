const fs = require('fs');
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
  return s.replace(/\\([()\\nrtbf])/g, (m, c) => {
    if (c === 'n') return '\n'; if (c === 'r') return '\r'; if (c === 't') return '\t';
    if (c === 'b') return '\b'; if (c === 'f') return '\f'; return c;
  });
}
let blocks = [];
let p = 0;
while (true) {
  let i = t.indexOf('/JS(', p);
  if (i === -1) break;
  let [s, np] = parseStr(t, i + 4);
  blocks.push(unesc(s)); p = np;
}
let all = blocks.join('\n');

// Extract all function definitions
let fnDefs = new Set();
let re1 = /function\s+([A-Za-z_$][\w$]*)\s*\(([^)]*)\)/g, m;
while ((m = re1.exec(all))) fnDefs.add(m[1] + '(' + m[2].trim() + ')');
// Also var x = function
let re2 = /([A-Za-z_$][\w$]*)\s*=\s*function\s*\(([^)]*)\)/g;
while ((m = re2.exec(all))) fnDefs.add(m[1] + ' = fn(' + m[2].trim() + ')');
console.log('=== FUNCTION DEFINITIONS (' + fnDefs.size + ') ===');
console.log([...fnDefs].sort().join('\n'));

// Extract all called function names with gF prefix and their call frequency
let calls = {};
let re3 = /\b([A-Za-z_$][\w$]*)\s*\(/g;
while ((m = re3.exec(all))) { calls[m[1]] = (calls[m[1]] || 0) + 1; }
let callList = Object.entries(calls).filter(([k]) => /^gF|^g[A-Z]|^c[A-Z]/.test(k)).sort((a, b) => b[1] - a[1]);
console.log('\n=== TOP CALLED HELPER FUNCTIONS (gF*/g*/c*) ===');
console.log(callList.slice(0, 60).map(([k, v]) => k + ': ' + v).join('\n'));
