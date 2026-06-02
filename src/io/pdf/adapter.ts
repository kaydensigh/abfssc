// The pdf-lib quarantine. EVERY pdf-lib call lives here, behind a small typed
// surface (design §08: "all pdf-lib calls live in io/pdf — a swap is one
// directory"). It loads the blank form, embeds the fonts an appearance needs
// (the suit font /Cards is reused from the form's own /DR — no new embed), and
// exposes the primitives the exporter drives: set an editable /V, author a D_
// twin's rich /AP, paint a checkbox's B_ twin, toggle the cover buttons, stamp
// app state, and save without letting pdf-lib clobber our appearances.

import {
  PDFDocument,
  PDFName,
  PDFNumber,
  PDFHexString,
  PDFDict,
  PDFArray,
  PDFRawStream,
  PDFFont,
  StandardFonts,
} from "pdf-lib";
import type { PDFRef, PDFField, PDFWidgetAnnotation } from "pdf-lib";
import type { Span, Suit } from "../../render/types.ts";
import type { CheckboxStyle } from "../../model/index.ts";
import { buildAppearance, type FontShop, type FontStyle } from "./appearance.ts";
import {
  bTwin,
  CHECKBOX_GLYPH,
  CHECKBOX_OFF,
  CHECKBOX_ON,
  STAMP_FIELD,
  STAMP_INFO_KEY,
  Z_MY_CLASS,
  Z_STICKER,
} from "./fieldmap.ts";

const DEFAULT_SIZE = 10; // gTFz body size
const encoder = new TextEncoder();

const fmt = (n: number): string => n.toFixed(3).replace(/\.?0+$/, "");

/** Escape a byte array into the inner body of a PDF literal string `( … )`. */
function escapeBytes(bytes: number[]): string {
  let out = "";
  for (const b of bytes) {
    if (b === 0x28) out += "\\(";
    else if (b === 0x29) out += "\\)";
    else if (b === 0x5c) out += "\\\\";
    else if (b >= 32 && b < 127) out += String.fromCharCode(b);
    else out += "\\" + b.toString(8).padStart(3, "0");
  }
  return out;
}

/**
 * A /V or string value, always as a UTF-16BE hex string. pdf-lib's
 * PDFString.of does NOT escape the literal-string metacharacters '(' ')' '\'
 * on serialisation, so any value with a stray paren (common in bridge notation:
 * "2S)", ":)", "transfer (4+)") would corrupt the file. Hex is unconditionally
 * safe and lossless across parens, backslashes, and non-Latin glyphs alike.
 */
function pdfStr(text: string): PDFHexString {
  return PDFHexString.fromText(text);
}

/** Encode `text` in `font`, replacing glyphs the font can't show with "?". */
function encodeRun(font: PDFFont, text: string, size: number): { bytes: number[]; width: number } {
  const bytes: number[] = [];
  let width = 0;
  for (const ch of text) {
    try {
      const inner = font.encodeText(ch).toString().slice(1, -1); // strip < >
      const w = font.widthOfTextAtSize(ch, size);
      for (let i = 0; i < inner.length; i += 2) bytes.push(parseInt(inner.slice(i, i + 2), 16));
      width += w;
    } catch {
      bytes.push(0x3f); // '?'
      width += font.widthOfTextAtSize("?", size);
    }
  }
  return { bytes, width };
}

/** Strict encode (throws if any glyph is unsupported) — used for tick fallback. */
function encodeStrict(font: PDFFont, text: string, size: number): { bytes: number[]; width: number } {
  const bytes: number[] = [];
  let width = 0;
  for (const ch of text) {
    const inner = font.encodeText(ch).toString().slice(1, -1);
    for (let i = 0; i < inner.length; i += 2) bytes.push(parseInt(inner.slice(i, i + 2), 16));
    width += font.widthOfTextAtSize(ch, size);
  }
  return { bytes, width };
}

export interface PdfTemplate {
  /** Set an editable field's /V (NoView; carries the value for round-trip). */
  setEditableValue(name: string, raw: string): void;
  /** Author a D_ twin's rich /AP from rendered spans. Returns false if absent. */
  writeRichField(dTwinName: string, spans: Span[], multiline: boolean): boolean;
  /** Set a checkbox editable /V and paint its B_ print twin. */
  writeCheckbox(editableName: string, on: boolean, style: CheckboxStyle): void;
  /** Write the Classification literal and toggle the cover class/sticker boxes. */
  setClassification(literal: string, classified: boolean, sticker: boolean): void;
  /** Embed our app-state stamp (Info-dict key + a hidden field). */
  addStamp(json: string): void;
  save(): Promise<Uint8Array>;
}

export async function loadTemplate(bytes: Uint8Array | ArrayBuffer): Promise<PdfTemplate> {
  const doc = await PDFDocument.load(bytes, { ignoreEncryption: true, updateMetadata: false });
  const ctx = doc.context;
  const form = doc.getForm();
  const acro = doc.catalog.lookup(PDFName.of("AcroForm"), PDFDict);

  const fields = form.getFields();
  const byName = new Map<string, PDFField>();
  for (const f of fields) byName.set(f.getName(), f);

  // Fonts: embed the Helvetica family + ZapfDingbats (standard-14, no fontkit);
  // reuse the form's already-embedded /Cards TrueType for suit glyphs.
  const helv = await doc.embedFont(StandardFonts.Helvetica);
  const helvB = await doc.embedFont(StandardFonts.HelveticaBold);
  const helvO = await doc.embedFont(StandardFonts.HelveticaOblique);
  const helvBO = await doc.embedFont(StandardFonts.HelveticaBoldOblique);
  const zapf = await doc.embedFont(StandardFonts.ZapfDingbats);

  const dr = acro.lookup(PDFName.of("DR"), PDFDict);
  const drFonts = dr.lookup(PDFName.of("Font"), PDFDict);
  const cardsRef = drFonts.get(PDFName.of("Cards")) as PDFRef;
  const cardsDict = drFonts.lookup(PDFName.of("Cards"), PDFDict);
  const cardsFirst = (cardsDict.lookup(PDFName.of("FirstChar")) as PDFNumber).asNumber();
  const cardsWidthsArr = cardsDict.lookup(PDFName.of("Widths")) as PDFArray;
  const cardsWidth = (code: number, size: number): number => {
    const w = cardsWidthsArr.lookup(code - cardsFirst);
    const adv = w instanceof PDFNumber ? w.asNumber() : 600;
    return (adv / 1000) * size;
  };

  const apName = (font: PDFFont): string =>
    font === helvB ? "Fn1" : font === helvO ? "HeOb" : font === helvBO ? "HeBO" : font === zapf ? "ZaDb" : "F1";

  const shop: FontShop = {
    encode(text: string, style: FontStyle) {
      if (style.suit) {
        const code = (style.suit as Suit).charCodeAt(0); // 'S'|'H'|'D'|'C'
        return { fontName: "Cards", literal: escapeBytes([code]), width: cardsWidth(code, style.sizePt) };
      }
      const font =
        style.bold && style.italic ? helvBO : style.bold ? helvB : style.italic ? helvO : helv;
      const { bytes, width } = encodeRun(font, text, style.sizePt);
      return { fontName: apName(font), literal: escapeBytes(bytes), width };
    },
  };

  // Shared AP /Resources font dict (all candidates; same shared refs everywhere).
  const apResources = () =>
    ctx.obj({
      Font: { F1: helv.ref, Fn1: helvB.ref, HeOb: helvO.ref, HeBO: helvBO.ref, Cards: cardsRef, ZaDb: zapf.ref },
    });

  const widgetOf = (name: string): PDFWidgetAnnotation | undefined => {
    const f = byName.get(name);
    return f?.acroField.getWidgets()[0];
  };
  const rectOf = (w: PDFWidgetAnnotation): [number, number, number, number] => {
    const r = w.dict.lookup(PDFName.of("Rect")) as PDFArray;
    return r.asArray().map((n) => (n as PDFNumber).asNumber()) as [number, number, number, number];
  };
  const bgOf = (w: PDFWidgetAnnotation): readonly [number, number, number] | null => {
    const mk = w.dict.lookup(PDFName.of("MK"));
    if (!(mk instanceof PDFDict)) return null;
    const bg = mk.lookup(PDFName.of("BG"));
    if (!(bg instanceof PDFArray)) return null;
    const vals = bg.asArray().map((n) => (n instanceof PDFNumber ? n.asNumber() : 1));
    if (vals.length === 1) return [vals[0], vals[0], vals[0]];
    if (vals.length === 3) return [vals[0], vals[1], vals[2]];
    return null;
  };

  /** Create + assign a form-XObject /AP /N for a widget. */
  const writeAp = (w: PDFWidgetAnnotation, content: string, width: number, height: number): void => {
    const apDict = ctx.obj({
      Type: "XObject",
      Subtype: "Form",
      FormType: 1,
      BBox: [0, 0, width, height],
      Matrix: [1, 0, 0, 1, 0, 0],
      Resources: apResources(),
    });
    const ref = ctx.register(PDFRawStream.of(apDict, encoder.encode(content)));
    let ap = w.dict.lookup(PDFName.of("AP"));
    if (!(ap instanceof PDFDict)) {
      ap = ctx.obj({});
      w.dict.set(PDFName.of("AP"), ap);
    }
    (ap as PDFDict).set(PDFName.of("N"), ref);
  };

  const setV = (name: string, value: PDFHexString | PDFName): void => {
    byName.get(name)?.acroField.dict.set(PDFName.of("V"), value);
  };

  return {
    setEditableValue: (name, raw) => setV(name, pdfStr(raw)),

    writeRichField(dTwinName, spans, multiline) {
      const w = widgetOf(dTwinName);
      if (!w) return false;
      const [x0, y0, x1, y1] = rectOf(w);
      const width = x1 - x0;
      const height = y1 - y0;
      const content = buildAppearance(spans, { width, height }, {
        baseSizePt: DEFAULT_SIZE,
        multiline,
        bgColor: bgOf(w),
        font: shop,
      });
      writeAp(w, content, width, height);
      setV(dTwinName, pdfStr(spans.map((s) => s.text).join("")));
      // Drop the blank /RV the template ships on these RichText twins: they are
      // not ReadOnly, so Acrobat would otherwise regenerate the appearance from
      // that stale rich value and blank our painted /AP on edit. The explicit
      // /AP (with NeedAppearances=false) is authoritative once /RV is gone.
      byName.get(dTwinName)?.acroField.dict.delete(PDFName.of("RV"));
      return true;
    },

    writeCheckbox(editableName, on, style) {
      setV(editableName, pdfStr(on ? CHECKBOX_ON : CHECKBOX_OFF));
      const bn = bTwin(editableName);
      const w = widgetOf(bn);
      if (!w) return;
      const [x0, y0, x1, y1] = rectOf(w);
      const width = x1 - x0;
      const height = y1 - y0;
      let content: string;
      if (on) {
        const g = CHECKBOX_GLYPH[style];
        const size = Math.min(width, height) * 0.86;
        let fontName = "Fn1";
        let enc: { bytes: number[]; width: number };
        if (g.dingbat) {
          try {
            enc = encodeStrict(zapf, g.char, size);
            fontName = "ZaDb";
          } catch {
            enc = encodeRun(helvB, "X", size); // fallback: bold X
          }
        } else {
          enc = encodeRun(helvB, g.char, size);
        }
        const gx = (width - enc.width) / 2;
        const gy = (height - size) / 2 + size * 0.18;
        content =
          `/Tx BMC\nq\n0 0 ${fmt(width)} ${fmt(height)} re\nW\nn\nBT\n0 g\n/${fontName} ${fmt(size)} Tf\n` +
          `1 0 0 1 ${fmt(gx)} ${fmt(gy)} Tm\n(${escapeBytes(enc.bytes)}) Tj\nET\nQ\nEMC\n`;
        byName.get(bn)?.acroField.dict.set(PDFName.of("V"), pdfStr(g.char));
      } else {
        content = `/Tx BMC\nq\n0 0 ${fmt(width)} ${fmt(height)} re\nW\nn\nQ\nEMC\n`;
        byName.get(bn)?.acroField.dict.set(PDFName.of("V"), pdfStr(" "));
      }
      writeAp(w, content, width, height);
    },

    setClassification(literal, classified, sticker) {
      setV("Classification", pdfStr(literal));
      toggleButton(Z_MY_CLASS, classified);
      toggleButton(Z_STICKER, sticker);
    },

    addStamp(json) {
      // (1) custom Info-dict key — survives a plain save.
      const infoRef = ctx.trailerInfo.Info;
      let info = infoRef ? ctx.lookup(infoRef) : undefined;
      if (!(info instanceof PDFDict)) {
        info = ctx.obj({});
        ctx.trailerInfo.Info = ctx.register(info);
      }
      (info as PDFDict).set(PDFName.of(STAMP_INFO_KEY), PDFHexString.fromText(json));
      // (2) hidden field — a redundant channel; best-effort.
      try {
        const tf = form.createTextField(STAMP_FIELD);
        const page = doc.getPages()[0];
        tf.addToPage(page, { x: -4, y: -4, width: 1, height: 1 });
        tf.setText(json);
        tf.enableReadOnly();
        for (const w of tf.acroField.getWidgets()) {
          w.dict.set(PDFName.of("F"), PDFNumber.of(2 + 32)); // Hidden + NoView
        }
      } catch {
        /* hidden-field channel is optional */
      }
    },

    async save() {
      acro.delete(PDFName.of("NeedAppearances")); // keep viewers honouring our APs
      return doc.save({ updateFieldAppearances: false });
    },
  };

  function toggleButton(parentName: string, on: boolean): void {
    const f = byName.get(parentName) ?? fields.find((x) => x.getName().startsWith(parentName + "."));
    if (!f) return;
    // The "on" appearance state is the empty name ("/"); off is "/Off".
    const state = PDFName.of(on ? "" : "Off");
    try {
      f.acroField.dict.set(PDFName.of("V"), state);
      for (const w of f.acroField.getWidgets()) w.dict.set(PDFName.of("AS"), state);
    } catch {
      /* button mirror is best-effort */
    }
  }
}
