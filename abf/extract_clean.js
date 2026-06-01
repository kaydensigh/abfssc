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
// Proper PDF string unescape, INCLUDING line-continuation (\ + EOL -> removed)
function unesc(s) {
  let out = '', i = 0;
  while (i < s.length) {
    let c = s[i];
    if (c === '\\') {
      let n = s[i + 1];
      if (n === '\r') { i += (s[i + 2] === '\n') ? 3 : 2; continue; } // line continuation
      if (n === '\n') { i += 2; continue; }                          // line continuation
      if (n === 'n') { out += '\n'; i += 2; continue; }
      if (n === 'r') { out += '\r'; i += 2; continue; }
      if (n === 't') { out += '\t'; i += 2; continue; }
      if (n === 'b') { out += '\b'; i += 2; continue; }
      if (n === 'f') { out += '\f'; i += 2; continue; }
      if (n >= '0' && n <= '7') { // octal up to 3 digits
        let oct = n; let j = i + 2;
        while (j < s.length && s[j] >= '0' && s[j] <= '7' && oct.length < 3) { oct += s[j]; j++; }
        out += String.fromCharCode(parseInt(oct, 8) & 0xff); i = j; continue;
      }
      // any other char: drop backslash, keep char
      out += n; i += 2; continue;
    }
    out += c; i++;
  }
  return out;
}
let blocks = [], p = 0;
while (true) {
  let i = t.indexOf('/JS(', p); if (i === -1) break;
  let [s, np] = parseStr(t, i + 4); blocks.push(unesc(s)); p = np;
}
console.log('blocks:', blocks.length);

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
    if (c === '{') { indent++; out += ' {' + pad(); i++; continue; }
    if (c === '}') { indent--; out = out.replace(/[ \t]+$/, ''); if (!out.endsWith('\n')) out += pad(); else out += '  '.repeat(Math.max(0,indent)); out += '}'; let nx = code[i+1]; if (nx && nx !== ';' && nx !== ')' && nx !== ',' && nx !== '}') out += pad(); i++; continue; }
    if (c === ';') { out += ';' + pad(); i++; continue; }
    out += c; i++;
  }
  return out.replace(/\n[ \t]*\n[ \t]*\n+/g, '\n\n');
}

let ranked = blocks.map((b, i) => [b.length, i]).sort((a, b) => b[0] - a[0]);
ranked.slice(0, 6).forEach((r, k) => {
  fs.writeFileSync('extracted/clean_' + k + '_block' + r[1] + '.js', beautify(blocks[r[1]]));
});
// Combined raw (unbeautified but clean) for searching
fs.writeFileSync('extracted/js_all_clean.js', blocks.map((b,i)=>'// ===== BLOCK '+i+' (len '+b.length+') =====\n'+b).join('\n\n'));
console.log('wrote clean_*.js and js_all_clean.js');
console.log('sizes top6:', ranked.slice(0,6).map(r=>r[0]).join(', '));
// sanity check
let core = beautify(blocks[ranked[0][1]]);
console.log('\n--- sanity: first 12 lines of cleaned core ---');
console.log(core.split('\n').slice(0,12).join('\n'));
