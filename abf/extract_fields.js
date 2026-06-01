const fs = require('fs');
const t = fs.readFileSync('extracted/all_inflated.txt', 'latin1');
const raw = fs.readFileSync('ABF_Card_FORM.pdf', 'latin1');
const corpus = t + '\n' + raw;

// --- Extract field names /T(...) and tooltips /TU(...) ---
function pdfStrings(corpus, key) {
  let res = [];
  let p = 0;
  const kk = key + '(';
  while (true) {
    let i = corpus.indexOf(kk, p);
    if (i === -1) break;
    let q = i + kk.length, depth = 1, out = [];
    while (q < corpus.length) {
      let c = corpus[q];
      if (c === '\\') { out.push(corpus[q + 1]); q += 2; continue; }
      if (c === '(') { depth++; out.push(c); q++; continue; }
      if (c === ')') { depth--; if (depth === 0) { q++; break; } out.push(c); q++; continue; }
      out.push(c); q++;
    }
    res.push(out.join(''));
    p = q;
  }
  return res;
}
let names = pdfStrings(corpus, '/T');
let tips = pdfStrings(corpus, '/TU');
let uniqNames = [...new Set(names)].sort();
let uniqTips = [...new Set(tips)].sort();
fs.writeFileSync('extracted/field_names.txt', uniqNames.join('\n'));
fs.writeFileSync('extracted/field_tooltips.txt', uniqTips.join('\n'));
console.log('Unique /T names:', uniqNames.length);
console.log('Unique /TU tooltips:', uniqTips.length);

// Field types
console.log('\nField type counts:');
['/Tx', '/Btn', '/Ch', '/Sig'].forEach(ft => {
  let c = (corpus.match(new RegExp(ft.replace('/', '\\/') + '\\b', 'g')) || []).length;
  console.log('  ', ft, c);
});

// --- Bookmarks / Outlines: /Title(...) ---
let titles = pdfStrings(corpus, '/Title');
fs.writeFileSync('extracted/bookmark_titles.txt', titles.join('\n'));
console.log('\nBookmark /Title count:', titles.length);
console.log('First 40 bookmark titles:');
console.log(titles.slice(0, 40).map(x => '  - ' + x).join('\n'));

// --- Document level JS names: Names tree /JavaScript ---
let ji = corpus.indexOf('/JavaScript');
console.log('\n/JavaScript Names tree context:');
if (ji >= 0) console.log(corpus.slice(ji - 200, ji + 200).replace(/\s+/g, ' '));

// Sample of field names
console.log('\nSample field names (first 80):');
console.log(uniqNames.slice(0, 80).join('  |  '));
