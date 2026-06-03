// Compare roundtrip-export_ours.pdf vs roundtrip-export_adobe.pdf
// Run from repo root: node abf/compare_roundtrip.js
const fs = require('fs');
const path = require('path');
const { PDFDocument, PDFName, PDFString, PDFHexString, PDFNumber, PDFDict, PDFArray, PDFRef, PDFBool } = require('pdf-lib');

const ROOT = path.resolve(__dirname, '..');
const oursBytes = fs.readFileSync(path.join(ROOT, 'abf', 'roundtrip-export_ours.pdf'));
const adobeBytes = fs.readFileSync(path.join(ROOT, 'abf', 'roundtrip-export_adobe.pdf'));

function decodeStr(obj) {
  if (obj == null) return undefined;
  if (obj instanceof PDFString || obj instanceof PDFHexString) return obj.decodeText();
  if (obj instanceof PDFName) return '/' + obj.asString().replace(/^\//, '');
  if (obj instanceof PDFNumber) return obj.asNumber();
  if (obj instanceof PDFBool) return obj.asBoolean();
  return obj.toString();
}

async function readFields(bytes) {
  const doc = await PDFDocument.load(bytes, { updateMetadata: false });
  const form = doc.getForm();
  const acro = form.acroForm;
  const ctx = doc.context;

  const out = new Map();
  const fields = form.getFields();
  for (const f of fields) {
    const dict = f.acroField.dict;
    const name = f.getName();
    const rec = { type: f.constructor.name };

    const get = (k) => dict.get(PDFName.of(k));
    const FT = get('FT'); rec.FT = FT ? FT.toString() : undefined;
    const V = get('V'); rec.V = V !== undefined ? decodeStr(V) : undefined;
    const DV = get('DV'); rec.DV = DV !== undefined ? decodeStr(DV) : undefined;
    const AS = get('AS'); rec.AS = AS !== undefined ? decodeStr(AS) : undefined;
    const Ff = get('Ff'); rec.Ff = Ff !== undefined ? decodeStr(Ff) : undefined;
    const F = get('F'); rec.F = F !== undefined ? decodeStr(F) : undefined;
    const DA = get('DA'); rec.DA = DA !== undefined ? decodeStr(DA) : undefined;
    const RV = get('RV'); rec.RV = RV !== undefined ? decodeStr(RV) : undefined;

    // Appearance presence
    const widgets = f.acroField.getWidgets();
    rec.numWidgets = widgets.length;
    rec.widgets = widgets.map((w) => {
      const wd = w.dict;
      const wget = (k) => wd.get(PDFName.of(k));
      const ap = wget('AP');
      let apInfo = undefined;
      if (ap instanceof PDFDict) {
        const n = ap.get(PDFName.of('N'));
        const d = ap.get(PDFName.of('D'));
        const apN = n ? (n instanceof PDFRef ? 'stream' : (n instanceof PDFDict ? 'subdict[' + n.keys().map(k=>k.asString()).join(',') + ']' : n.toString())) : undefined;
        apInfo = { N: apN, D: d ? 'yes' : undefined };
      }
      const was = wget('AS');
      const wf = wget('F');
      const mk = wget('MK');
      let mkInfo = undefined;
      if (mk instanceof PDFDict) {
        mkInfo = mk.keys().map(k => k.asString()).join(',');
      }
      return {
        AS: was !== undefined ? decodeStr(was) : undefined,
        F: wf !== undefined ? decodeStr(wf) : undefined,
        AP: apInfo,
        MK: mkInfo,
      };
    });

    out.set(name, rec);
  }

  // Also gather AcroForm-level info
  const acroInfo = {};
  const naKey = acro.dict.get(PDFName.of('NeedAppearances'));
  acroInfo.NeedAppearances = naKey !== undefined ? decodeStr(naKey) : undefined;
  const da = acro.dict.get(PDFName.of('DA'));
  acroInfo.DA = da !== undefined ? decodeStr(da) : undefined;
  const sigFlags = acro.dict.get(PDFName.of('SigFlags'));
  acroInfo.SigFlags = sigFlags !== undefined ? decodeStr(sigFlags) : undefined;

  // Info dict stamp
  const infoRef = doc.context.trailerInfo.Info;
  let stamp = undefined;
  if (infoRef) {
    const info = doc.context.lookup(infoRef);
    if (info instanceof PDFDict) {
      const s = info.get(PDFName.of('ABFCardState'));
      stamp = s !== undefined ? (decodeStr(s) || '').slice(0, 60) + '...' : undefined;
      acroInfo.infoKeys = info.keys().map(k => k.asString());
    }
  }
  acroInfo.stamp = stamp;

  return { fields: out, acroInfo, numFields: fields.length };
}

function summarizeWidgets(ws) {
  return ws.map(w => `AS=${w.AS} F=${w.F} AP.N=${w.AP ? w.AP.N : 'none'}${w.AP && w.AP.D ? '+D' : ''} MK=${w.MK || '-'}`).join(' | ');
}

(async () => {
  const ours = await readFields(oursBytes);
  const adobe = await readFields(adobeBytes);

  console.log('=== FILE-LEVEL ===');
  console.log('ours  : numFields=' + ours.numFields + ' size=' + oursBytes.length);
  console.log('adobe : numFields=' + adobe.numFields + ' size=' + adobeBytes.length);
  console.log('ours  acroInfo:', JSON.stringify(ours.acroInfo));
  console.log('adobe acroInfo:', JSON.stringify(adobe.acroInfo));

  const allNames = new Set([...ours.fields.keys(), ...adobe.fields.keys()]);
  const onlyOurs = [...allNames].filter(n => ours.fields.has(n) && !adobe.fields.has(n));
  const onlyAdobe = [...allNames].filter(n => !ours.fields.has(n) && adobe.fields.has(n));

  console.log('\n=== FIELD PRESENCE ===');
  console.log('fields only in ours :', onlyOurs.length, onlyOurs.slice(0, 30));
  console.log('fields only in adobe:', onlyAdobe.length, onlyAdobe.slice(0, 30));

  // Compare common fields
  const common = [...allNames].filter(n => ours.fields.has(n) && adobe.fields.has(n)).sort();
  const diffs = { V: [], AS: [], F: [], DA: [], FT: [], RV: [], AP: [], MK: [] };
  for (const n of common) {
    const o = ours.fields.get(n), a = adobe.fields.get(n);
    if (o.V !== a.V) diffs.V.push({ n, ours: o.V, adobe: a.V });
    if (o.AS !== a.AS) diffs.AS.push({ n, ours: o.AS, adobe: a.AS });
    if (o.F !== a.F) diffs.F.push({ n, ours: o.F, adobe: a.F });
    if (o.DA !== a.DA) diffs.DA.push({ n, ours: o.DA, adobe: a.DA });
    if (o.FT !== a.FT) diffs.FT.push({ n, ours: o.FT, adobe: a.FT });
    if ((o.RV !== undefined) !== (a.RV !== undefined)) diffs.RV.push({ n, ours: o.RV !== undefined, adobe: a.RV !== undefined });
    // widget AP/AS
    const ow = summarizeWidgets(o.widgets), aw = summarizeWidgets(a.widgets);
    if (ow !== aw) diffs.AP.push({ n, ours: ow, adobe: aw });
  }

  for (const key of ['FT', 'V', 'AS', 'F', 'DA', 'RV', 'AP']) {
    console.log(`\n=== DIFF: ${key} (${diffs[key].length}) ===`);
    const rows = diffs[key];
    const show = rows.slice(0, 60);
    for (const r of show) {
      if (key === 'AP') {
        console.log(`  [${r.n}]`);
        console.log(`     ours : ${r.ours}`);
        console.log(`     adobe: ${r.adobe}`);
      } else {
        console.log(`  ${r.n}: ours=${JSON.stringify(r.ours)} adobe=${JSON.stringify(r.adobe)}`);
      }
    }
    if (rows.length > show.length) console.log(`  ... and ${rows.length - show.length} more`);
  }

  // Save full diffs to JSON for deeper inspection
  fs.writeFileSync(path.join(ROOT, 'abf', 'compare_roundtrip_out.json'), JSON.stringify({ acro: { ours: ours.acroInfo, adobe: adobe.acroInfo }, onlyOurs, onlyAdobe, diffs }, null, 2));
  console.log('\nFull diff written to abf/compare_roundtrip_out.json');
})();
