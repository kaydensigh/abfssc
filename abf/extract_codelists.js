// extract_codelists.js — pull the per-field shortcut-code lists out of the
// AcroForm tooltips (/TU) with PROPER \r unescaping, so they can become the web
// form's dropdowns / autocomplete.
//
//   node extract_codelists.js
//
// Output: extracted/field_codelists.md  (one entry per field that ships a code list)
//
// Convention discovered in the form: each /TU begins with the field name, then a
// blank line, then the help text; embedded "N : phrase" lines (e.g. "1 : Standard")
// are the selectable shortcut codes a user expands by typing N.

const fs = require('fs');
const corpus = fs.readFileSync('extracted/all_inflated.txt', 'latin1');

// Parse every /TU(...) PDF literal string with full unescaping (\r -> newline).
function unesc(s) {
  let out = '', i = 0;
  while (i < s.length) {
    const c = s[i];
    if (c === '\\') {
      const n = s[i + 1];
      const map = { n: '\n', r: '\n', t: '\t', b: '', f: '', '(': '(', ')': ')', '\\': '\\' };
      if (n in map) { out += map[n]; i += 2; continue; }
      if (n >= '0' && n <= '7') { let o = n, j = i + 2; while (j < s.length && s[j] >= '0' && s[j] <= '7' && o.length < 3) o += s[j++]; out += String.fromCharCode(parseInt(o, 8) & 0xff); i = j; continue; }
      out += n; i += 2; continue;
    }
    out += c; i++;
  }
  return out;
}
function readStrings(key) {
  const res = []; let p = 0; const kk = key + '(';
  while (true) {
    const i = corpus.indexOf(kk, p); if (i === -1) break;
    let q = i + kk.length, depth = 1, buf = '';
    while (q < corpus.length) {
      const c = corpus[q];
      if (c === '\\') { buf += c + (corpus[q + 1] || ''); q += 2; continue; }
      if (c === '(') { depth++; buf += c; q++; continue; }
      if (c === ')') { depth--; if (depth === 0) { q++; break; } buf += c; q++; continue; }
      buf += c; q++;
    }
    res.push(unesc(buf)); p = q;
  }
  return res;
}

const tips = [...new Set(readStrings('/TU'))];
const entries = [];
const codeLine = /^\s*([0-9A-Za-z?@#]{1,3})\s*:\s+(.*\S)\s*$/;

for (const tip of tips) {
  const lines = tip.split('\n');
  const field = (lines[0] || '').trim();
  if (!field || field.startsWith('D_')) continue;          // display twins carry no codes
  const codes = [];
  for (const ln of lines.slice(1)) {
    const m = ln.match(codeLine);
    if (m && /^[0-9xX?]|^[a-z]$/.test(m[1])) codes.push([m[1], m[2].trim()]);
  }
  if (codes.length >= 2) {
    // help blurb = the non-code descriptive lines after the name
    const blurb = lines.slice(1).map(s => s.trim())
      .filter(s => s && !codeLine.test(s)).join(' ').replace(/\s+/g, ' ').slice(0, 200);
    entries.push({ field, blurb, codes });
  }
}
entries.sort((a, b) => a.field.localeCompare(b.field));

let md = '# Embedded shortcut-code lists\n\n';
md += `_Auto-extracted from the form's field tooltips by \`extract_codelists.js\`. `;
md += `${entries.length} fields ship a selectable code list. In the PDF a user types the code `;
md += `(a digit, \`x\`, \`9\`, or \`?\`) and it expands to the phrase; \`x\` usually marks a "standard/default" `;
md += `answer and \`9 : See Note #\` redirects to a numbered note. These are the natural source for the `;
md += `web form's dropdowns / autocomplete. Expansions may themselves contain rich \`!\` codes (e.g. \`!H\` = ♥)._\n\n`;
for (const e of entries) {
  md += `### \`${e.field}\`\n`;
  if (e.blurb) md += `${e.blurb}\n\n`;
  for (const [c, v] of e.codes) md += `- \`${c}\` — ${v}\n`;
  md += '\n';
}
fs.writeFileSync('extracted/field_codelists.md', md);
console.log(`Wrote extracted/field_codelists.md — ${entries.length} fields with code lists, ` +
  `${entries.reduce((n, e) => n + e.codes.length, 0)} total codes.`);
