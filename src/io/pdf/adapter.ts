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
  PDFString,
  PDFHexString,
  PDFDict,
  PDFArray,
  PDFRawStream,
  PDFFont,
  StandardFonts,
} from "pdf-lib";
import type { PDFRef, PDFField, PDFWidgetAnnotation } from "pdf-lib";
import type { Span, Suit } from "../../render/types.ts";
import type { Classification } from "../../model/index.ts";
import { buildAppearance, type EncodedRun, type FontShop, type FontStyle } from "./appearance.ts";
import { SOLID_SUIT_PATHS } from "./suitGlyphs.ts";
import {
  bTwin,
  CHECKBOX_OFF,
  CHECKBOX_ON,
  CLASSIFICATION_RGB,
  D_PREFIX,
  B_PREFIX,
  Q_BOX,
  Q_BROWN,
  STAMP_FIELD,
  STAMP_INFO_KEY,
  STICKER_RGB,
  WHITE_RGB,
  Z_MY_CLASS,
  Z_STICKER,
} from "./fieldmap.ts";

type RGB = readonly [number, number, number];

const DEFAULT_SIZE = 10; // gTFz body size
const encoder = new TextEncoder();

const fmt = (n: number): string => n.toFixed(3).replace(/\.?0+$/, "");

/** A circle as four cubic Béziers (kappa≈0.5523 — the value the form's own
 *  appearances use), centred at (cx,cy) with radius r. Path ops only; the caller
 *  supplies the fill/stroke verb. */
function circlePath(cx: number, cy: number, r: number): string {
  const k = r * 0.5523;
  return (
    `${fmt(cx + r)} ${fmt(cy)} m\n` +
    `${fmt(cx + r)} ${fmt(cy + k)} ${fmt(cx + k)} ${fmt(cy + r)} ${fmt(cx)} ${fmt(cy + r)} c\n` +
    `${fmt(cx - k)} ${fmt(cy + r)} ${fmt(cx - r)} ${fmt(cy + k)} ${fmt(cx - r)} ${fmt(cy)} c\n` +
    `${fmt(cx - r)} ${fmt(cy - k)} ${fmt(cx - k)} ${fmt(cy - r)} ${fmt(cx)} ${fmt(cy - r)} c\n` +
    `${fmt(cx + k)} ${fmt(cy - r)} ${fmt(cx + r)} ${fmt(cy - k)} ${fmt(cx + r)} ${fmt(cy)} c`
  );
}

/** A filled disc (optionally black-ringed) sized to a w×h widget — the static
 *  twin of the form's runtime-coloured `Z_*` classification/sticker circle. */
function circleAppearance(width: number, height: number, fill: RGB, ring: boolean): string {
  const r = Math.min(width, height) / 2;
  const cx = width / 2;
  const cy = height / 2;
  let s = `${fmt(fill[0])} ${fmt(fill[1])} ${fmt(fill[2])} rg\n${circlePath(cx, cy, r)}\nf\n`;
  // The form keeps the stroke just inside the fill (r-0.5) so the 1pt ring isn't
  // clipped by the BBox. Stroke is black; fill-only when the ring is off.
  if (ring) s += `0 G\n1 w\n${circlePath(cx, cy, r - 0.5)}\ns\n`;
  return s;
}

/** The form's checkbox-glyph size. Every imitation checkbox — the `Q_*` colour
 *  boxes and the `B_*` print twins alike — draws its tick at 14pt (the size the
 *  original/Acrobat uses), so they all look identical. */
const CHECKBOX_SIZE = 14;

/** Draw one already-encoded glyph centred in a w×h text-field box (the shared
 *  look of every imitation checkbox). `fontName` is an /AP-resources font key. */
function boxGlyphAp(width: number, height: number, fontName: string, bytes: number[], glyphWidth: number): string {
  const gx = (width - glyphWidth) / 2;
  const gy = (height - CHECKBOX_SIZE * 0.717) / 2; // centre the cap height
  return (
    `/Tx BMC\nq\n0 0 ${fmt(width)} ${fmt(height)} re\nW\nn\nBT\n/${fontName} ${CHECKBOX_SIZE} Tf\n0 g\n` +
    `1 0 0 1 ${fmt(gx)} ${fmt(gy)} Tm\n(${escapeBytes(bytes)}) Tj\nET\nQ\nEMC\n`
  );
}

/** A blank (cleared) imitation-checkbox appearance — just the clip, no glyph. */
function emptyBoxAp(width: number, height: number): string {
  return `/Tx BMC\nq\n0 0 ${fmt(width)} ${fmt(height)} re\nW\nn\nQ\nEMC\n`;
}

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

export interface PdfTemplate {
  /** Set an editable field's /V (NoView; carries the value for round-trip). */
  setEditableValue(name: string, raw: string): void;
  /** Author a D_ twin's rich /AP from rendered spans. Returns false if absent. */
  writeRichField(dTwinName: string, spans: Span[], multiline: boolean): boolean;
  /** Set a checkbox editable /V and paint its B_ print twin (a Helvetica "X"). */
  writeCheckbox(editableName: string, on: boolean): void;
  /**
   * Write the Classification literal and paint the visible classification +
   * brown-sticker marks: the on-page `Q_*` "X" checkboxes and the top-right
   * `Z_*` colour circles (the form's JS draws these at runtime; we author them
   * statically so the card is correct in any viewer).
   */
  setClassification(literal: string, classification: Classification, sticker: boolean): void;
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

  // Fonts: embed the Helvetica family (standard-14, no fontkit); reuse the
  // form's already-embedded /Cards TrueType for suit glyphs. Checkbox ticks are
  // a plain Helvetica "X" — no ZapfDingbats, which Chrome's PDF engine can't
  // reliably render.
  const helv = await doc.embedFont(StandardFonts.Helvetica);
  const helvB = await doc.embedFont(StandardFonts.HelveticaBold);
  const helvO = await doc.embedFont(StandardFonts.HelveticaOblique);
  const helvBO = await doc.embedFont(StandardFonts.HelveticaBoldOblique);

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
    font === helvB ? "Fn1" : font === helvO ? "HeOb" : font === helvBO ? "HeBO" : "F1";

  const shop: FontShop = {
    encode(text: string, style: FontStyle) {
      if (style.suit) {
        const suit = style.suit as Suit;
        const code = suit.charCodeAt(0); // 'S'|'H'|'D'|'C'
        const run: EncodedRun = { fontName: "Cards", literal: escapeBytes([code]), width: cardsWidth(code, style.sizePt) };
        // ♥/♦ are hollow outlines in the Cards font; fill their solid silhouette
        // ourselves so they print solid. ♠/♣ are solid and draw the glyph as-is.
        const solid = SOLID_SUIT_PATHS[suit];
        if (solid) run.fill = solid;
        return run;
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
      Font: { F1: helv.ref, Fn1: helvB.ref, HeOb: helvO.ref, HeBO: helvBO.ref, Cards: cardsRef },
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

    writeCheckbox(editableName, on) {
      setV(editableName, pdfStr(on ? CHECKBOX_ON : CHECKBOX_OFF));
      const bn = bTwin(editableName);
      const w = widgetOf(bn);
      if (!w) return;
      const [x0, y0, x1, y1] = rectOf(w);
      const width = x1 - x0;
      const height = y1 - y0;
      let content: string;
      if (on) {
        // Drawn exactly like the Q_* classification boxes: a 14pt Helvetica "X"
        // centred in the box — renders in every viewer (Chrome included).
        const { bytes, width: gw } = encodeRun(helv, "X", CHECKBOX_SIZE);
        content = boxGlyphAp(width, height, "F1", bytes, gw);
        byName.get(bn)?.acroField.dict.set(PDFName.of("V"), pdfStr("X"));
      } else {
        content = emptyBoxAp(width, height);
        byName.get(bn)?.acroField.dict.set(PDFName.of("V"), pdfStr(" "));
      }
      writeAp(w, content, width, height);
    },

    setClassification(literal, classification, sticker) {
      setV("Classification", pdfStr(literal));
      const classified = classification !== "unset";
      // The four colour "imitation checkboxes": the chosen colour shows an X.
      for (const cls of Object.keys(Q_BOX) as (keyof typeof Q_BOX)[]) {
        paintQBox(Q_BOX[cls], cls === classification);
      }
      paintQBox(Q_BROWN, sticker);
      // The two top-right circles. Z_MyClass always carries a black ring (the
      // form draws the outline even when unset); its fill is the colour, or
      // white when unset. Z_Sticker is brown with a black ring when set, else
      // a white (invisible) disc with no ring — matching the form's /AA scripts.
      paintRadioCircle(Z_MY_CLASS, classified ? CLASSIFICATION_RGB[classification] : WHITE_RGB, true, classified);
      paintRadioCircle(Z_STICKER, sticker ? STICKER_RGB : WHITE_RGB, sticker, sticker);
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

  /** Paint a `Q_*` imitation-checkbox text field: a centred "X" when on, blank
   *  otherwise, plus its /V (so our own import round-trips the visible state). */
  function paintQBox(name: string, on: boolean): void {
    const w = widgetOf(name);
    if (!w) return;
    const [x0, y0, x1, y1] = rectOf(w);
    const width = x1 - x0;
    const height = y1 - y0;
    let content: string;
    if (on) {
      const { bytes, width: gw } = encodeRun(helv, "X", CHECKBOX_SIZE);
      content = boxGlyphAp(width, height, "F1", bytes, gw);
    } else {
      content = emptyBoxAp(width, height);
    }
    writeAp(w, content, width, height);
    byName.get(name)?.acroField.dict.set(PDFName.of("V"), pdfStr(on ? "X" : " "));
  }

  /** Recolour a `Z_*` classification/sticker radio circle. The blank form's
   *  on-state appearance is white (it leans on Acrobat JS); we author the
   *  coloured disc directly so it shows in any viewer.
   *
   *  Crucially we mirror Adobe's own regeneration exactly: keep the widget's
   *  /AS pointing at the normal "Off" state and paint THAT state the chosen
   *  colour (both states get it, and /D too). Pointing /AS at the empty-name
   *  "on" state ("/") renders in lax viewers like poppler but is silently
   *  dropped by Acrobat / PDFium / pdf.js — which is why the circle "didn't
   *  show". The logical on/off still lives in the field /V. */
  function paintRadioCircle(parentName: string, fill: RGB, ring: boolean, on: boolean): void {
    const f = byName.get(parentName) ?? fields.find((x) => x.getName().startsWith(parentName + "."));
    if (!f) return;
    const w = f.acroField.getWidgets()[0];
    if (!w) return;
    const [x0, y0, x1, y1] = rectOf(w);
    const width = x1 - x0;
    const height = y1 - y0;
    const apDict = ctx.obj({
      Type: "XObject",
      Subtype: "Form",
      FormType: 1,
      BBox: [0, 0, width, height],
      Matrix: [1, 0, 0, 1, 0, 0],
      Resources: { ProcSet: [PDFName.of("PDF")] },
    });
    const ref = ctx.register(PDFRawStream.of(apDict, encoder.encode(circleAppearance(width, height, fill, ring))));
    // Both states (and /N + /D) share the one coloured disc, so the result is
    // the same colour whichever appearance the viewer resolves.
    const states = () => {
      const d = ctx.obj({});
      d.set(PDFName.of(""), ref);
      d.set(PDFName.of("Off"), ref);
      return d;
    };
    let ap = w.dict.lookup(PDFName.of("AP"));
    if (!(ap instanceof PDFDict)) {
      ap = ctx.obj({});
      w.dict.set(PDFName.of("AP"), ap);
    }
    (ap as PDFDict).set(PDFName.of("N"), states());
    (ap as PDFDict).set(PDFName.of("D"), states());
    // Mirror the colour into /MK + /DA so a regeneration from MK stays correct.
    let mk = w.dict.lookup(PDFName.of("MK"));
    if (!(mk instanceof PDFDict)) {
      mk = ctx.obj({});
      w.dict.set(PDFName.of("MK"), mk);
    }
    (mk as PDFDict).set(PDFName.of("BG"), ctx.obj([...fill]));
    if (ring) (mk as PDFDict).set(PDFName.of("BC"), ctx.obj([0]));
    else (mk as PDFDict).delete(PDFName.of("BC"));
    w.dict.set(PDFName.of("DA"), PDFString.of(`/ZaDb 0 Tf ${fmt(fill[0])} ${fmt(fill[1])} ${fmt(fill[2])} rg`));
    // Keep /AS on the safe normal "/Off" state (see above); /V carries on/off.
    try {
      f.acroField.dict.set(PDFName.of("V"), PDFName.of(on ? "" : "Off"));
      for (const ww of f.acroField.getWidgets()) ww.dict.set(PDFName.of("AS"), PDFName.of("Off"));
    } catch {
      /* button mirror is best-effort */
    }
  }
}

/** What a read pass extracts from a filled form — pure data, no pdf-lib past here. */
export interface FormReadResult {
  /** Number of AcroForm fields (0 ⇒ flattened/signed/printed — not importable). */
  numFields: number;
  /** Raw field name → decoded /V text (string-valued fields only; D_/B_ skipped). */
  fields: Map<string, string>;
  /** Our embedded app-state JSON (Info-dict key, else the hidden field), or null. */
  stampJson: string | null;
}

/**
 * Read a filled ABF form into raw field values + our app-state stamp. The ONLY
 * read entry point through the pdf-lib quarantine; all interpretation (name
 * normalisation, sentinel handling, model shaping) lives above in pdf-lib-free
 * code. We read /V straight off each field dict — never field.getText(), which
 * throws RichTextFieldReadError on the 245 RichText D_ twins.
 */
export async function readForm(bytes: Uint8Array | ArrayBuffer): Promise<FormReadResult> {
  const doc = await PDFDocument.load(bytes, { ignoreEncryption: true, updateMetadata: false });
  const ctx = doc.context;
  const form = doc.getForm();
  const all = form.getFields();

  const fields = new Map<string, string>();
  for (const f of all) {
    const name = f.getName();
    if (name.startsWith(D_PREFIX) || name.startsWith(B_PREFIX)) continue; // display twins carry no data
    const v = f.acroField.dict.lookup(PDFName.of("V"));
    if (v instanceof PDFString || v instanceof PDFHexString) fields.set(name, v.decodeText());
  }

  // App-state stamp: prefer the Info-dict key (survives a plain save), then fall
  // back to the redundant hidden ABF_AppState field.
  let stampJson: string | null = null;
  const infoRef = ctx.trailerInfo.Info;
  const info = infoRef ? ctx.lookup(infoRef) : undefined;
  if (info instanceof PDFDict) {
    const s = info.lookup(PDFName.of(STAMP_INFO_KEY));
    if (s instanceof PDFString || s instanceof PDFHexString) stampJson = s.decodeText();
  }
  if (stampJson === null) {
    const hidden = fields.get(STAMP_FIELD);
    if (hidden) stampJson = hidden;
  }
  fields.delete(STAMP_FIELD); // machinery, not card data

  return { numFields: all.length, fields, stampJson };
}
