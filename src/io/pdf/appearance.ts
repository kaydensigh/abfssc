// Pure spans → PDF appearance content-stream builder. Given the Span[] the
// render engine produces (the same contract the on-screen renderer consumes),
// this lays out a text-field appearance: background fill, clip, then the runs —
// per-span colour, the embedded Cards font for suits, bold/italic Helvetica
// variants, super/sub via text rise, and underline as a thin filled rule.
//
// It is pdf-lib-free and deterministic: font encoding + glyph widths are
// supplied by an injected FontShop (the adapter implements it with pdf-lib),
// so this module is unit-testable with a fake shop. The output string is the
// raw content of the /AP /N form XObject the adapter wraps and assigns.

import type { Span, Suit, Align } from "../../render/types.ts";

/** A run encoded for one font at one size: the PDF-string body + its width. */
export interface EncodedRun {
  /** AP /Resources font name without the leading slash, e.g. "F1" or "Cards". */
  fontName: string;
  /** Escaped bytes to place inside `( … )` (parens/backslash already escaped). */
  literal: string;
  /** Advance width of `text` at the requested size, in PDF units. */
  width: number;
}

export interface FontStyle {
  suit?: Suit;
  bold: boolean;
  italic: boolean;
  sizePt: number;
}

export interface FontShop {
  encode(text: string, style: FontStyle): EncodedRun;
}

export interface AppearanceBox {
  width: number;
  height: number;
}

export interface AppearanceOptions {
  /** The field's base font size (10pt body default). */
  baseSizePt: number;
  /** Whether `\n` in span text starts a new line and long lines word-wrap. */
  multiline: boolean;
  /** Field background fill (matches the widget's MK/BG); null = no fill. */
  bgColor?: readonly [number, number, number] | null;
  font: FontShop;
}

const PAD_X = 2; // left/right inset, matching the form's own appearances
const SUB_SCALE = 0.66; // super/sub glyphs render smaller
const SUPER_RISE = 0.4; // × sizePt
const SUB_RISE = 0.16; // × sizePt
const LINE_FACTOR = 1.18; // leading for multiline
const UNDERLINE_DROP = 1.4; // below baseline
const UNDERLINE_THICK = 0.6;

/** A laid-out piece of one visual line (single font, size, colour). */
interface Piece {
  run: EncodedRun;
  size: number;
  rise: number;
  color: readonly [number, number, number];
  underline: boolean;
  /** True for a pure-whitespace run (excluded from the alignment width). */
  isSpace: boolean;
}
interface VisualLine {
  pieces: Piece[];
  width: number;
}

/** Line width for alignment — trailing whitespace pieces don't count. */
function alignWidth(pieces: Piece[]): number {
  let total = 0;
  for (const p of pieces) total += p.run.width;
  for (let i = pieces.length - 1; i >= 0; i--) {
    if (pieces[i].isSpace) total -= pieces[i].run.width;
    else break;
  }
  return total;
}

function hexToRgb(hex: string): readonly [number, number, number] {
  const m = /^#?([0-9a-fA-F]{6})$/.exec(hex.trim());
  if (!m) return [0, 0, 0];
  const n = parseInt(m[1], 16);
  return [((n >> 16) & 0xff) / 255, ((n >> 8) & 0xff) / 255, (n & 0xff) / 255];
}

const fmt = (n: number): string => {
  // compact fixed output; avoid scientific notation, trim trailing zeros
  const s = n.toFixed(3);
  return s.replace(/\.?0+$/, "");
};
const rg = (c: readonly [number, number, number]): string => `${fmt(c[0])} ${fmt(c[1])} ${fmt(c[2])} rg`;

/** Encode one span as a piece, resolving size/rise for super/sub. */
function pieceFor(span: Span, text: string, font: FontShop): Piece {
  const base = span.sizePt;
  const size = span.vshift !== 0 ? base * SUB_SCALE : base;
  const rise = span.vshift === 1 ? base * SUPER_RISE : span.vshift === -1 ? -base * SUB_RISE : 0;
  const run = font.encode(text, { suit: span.suit, bold: span.bold, italic: span.italic, sizePt: size });
  return { run, size, rise, color: hexToRgb(span.color), underline: span.underline, isSpace: /^\s*$/.test(text) };
}

/** Break a single logical line's spans into visual lines, word-wrapping to width. */
function wrapLine(spans: { span: Span; text: string }[], maxWidth: number, font: FontShop): VisualLine[] {
  const lines: VisualLine[] = [];
  let cur: Piece[] = [];
  let curW = 0;
  const flush = () => {
    lines.push({ pieces: cur, width: alignWidth(cur) });
    cur = [];
    curW = 0;
  };
  for (const { span, text } of spans) {
    if (text.length === 0) continue;
    // Split into word/space tokens so we can wrap at spaces but keep widths.
    const tokens = text.match(/\s+|\S+/g) ?? [];
    for (const tok of tokens) {
      const piece = pieceFor(span, tok, font);
      const isSpace = /^\s+$/.test(tok);
      if (curW + piece.run.width > maxWidth && cur.length > 0 && !isSpace) {
        flush();
      }
      if (isSpace && cur.length === 0) continue; // drop leading space after a wrap
      cur.push(piece);
      curW += piece.run.width;
    }
  }
  flush();
  return lines;
}

/** Lay all spans out as a single (non-wrapping) visual line. */
function singleLine(spans: Span[], font: FontShop): VisualLine {
  const pieces: Piece[] = [];
  for (const span of spans) {
    if (span.text.length === 0) continue;
    pieces.push(pieceFor(span, span.text, font));
  }
  return { pieces, width: alignWidth(pieces) };
}

function alignOffset(align: Align | undefined, lineWidth: number, boxWidth: number): number {
  const avail = boxWidth - 2 * PAD_X;
  if (align === "center") return PAD_X + Math.max(0, (avail - lineWidth) / 2);
  if (align === "right") return PAD_X + Math.max(0, avail - lineWidth);
  return PAD_X;
}

/**
 * Build the appearance content stream for a field whose value rendered to
 * `spans`. Returns the raw operators for the /AP /N form XObject.
 */
export function buildAppearance(spans: Span[], box: AppearanceBox, opts: AppearanceOptions): string {
  const { width, height } = box;
  const { baseSizePt, multiline, font } = opts;
  const align = spans.find((s) => s.align)?.align;

  // Split spans into logical lines on '\n' (only meaningful for multiline).
  let lines: VisualLine[];
  if (multiline) {
    const logical: { span: Span; text: string }[][] = [[]];
    for (const span of spans) {
      const parts = span.text.split("\n");
      parts.forEach((part, i) => {
        if (i > 0) logical.push([]);
        logical[logical.length - 1].push({ span, text: part });
      });
    }
    const maxWidth = width - 2 * PAD_X;
    lines = logical.flatMap((ln) => wrapLine(ln, maxWidth, font));
  } else {
    lines = [singleLine(spans, font)];
  }

  const out: string[] = [];
  if (opts.bgColor) out.push(`${rg(opts.bgColor)}`, `0 0 ${fmt(width)} ${fmt(height)} re`, "f");
  out.push("/Tx BMC", "q", `0 0 ${fmt(width)} ${fmt(height)} re`, "W", "n");

  // Vertical placement: single line centres; multiline starts near the top.
  const lineHeight = baseSizePt * LINE_FACTOR;
  const firstBaseline = multiline ? height - PAD_X - baseSizePt * 0.8 : (height - baseSizePt) / 2 + baseSizePt * 0.163;

  const underlines: string[] = [];
  out.push("BT");
  lines.forEach((line, li) => {
    const y = firstBaseline - li * lineHeight;
    let x = alignOffset(align, line.width, width);
    for (const p of line.pieces) {
      out.push(rg(p.color));
      if (p.rise !== 0) out.push(`${fmt(p.rise)} Ts`);
      out.push(`/${p.run.fontName} ${fmt(p.size)} Tf`);
      out.push(`1 0 0 1 ${fmt(x)} ${fmt(y)} Tm`);
      out.push(`(${p.run.literal}) Tj`);
      if (p.rise !== 0) out.push("0 Ts");
      if (p.underline && p.run.width > 0) {
        const uy = y - UNDERLINE_DROP;
        // `rg` sets the non-stroking (fill) colour the following `re f` uses.
        underlines.push(`${rg(p.color)} ${fmt(x)} ${fmt(uy)} ${fmt(p.run.width)} ${fmt(UNDERLINE_THICK)} re f`);
      }
      x += p.run.width;
    }
  });
  out.push("ET");
  // Underlines as thin filled rules, drawn after the text (outside BT/ET).
  for (const u of underlines) out.push(u);
  out.push("Q", "EMC");
  return out.join("\n") + "\n";
}
