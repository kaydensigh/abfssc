import type { Align, RenderOptions, Span, Suit } from "./types.ts";
import { DEFAULT_COLOR, SUIT_GLYPH, paletteColor, suitDefaultColor } from "./palette.ts";
import { GRAVE_DEFAULTS, expandGrave } from "./grave.ts";

// ---------------------------------------------------------------------------
// renderCoded — the single pure function that turns the form's terse code
// language into styled Span[]. It is a faithful port of the form's own rich
// formatter (clean_2_block20.js, the `cBXmd==8` branch). The original shipped
// a second "basic" sub-parser for low-capability Acrobat readers; per design
// §04 we collapse to the one rich parser. The engine is TOTAL: an unknown
// `!x` emits the literal `!x`, so malformed legacy values never throw.
//
// Three layers run as sequential passes (design §04):
//   A · tooltip code-list — a bare code (digit/`x`/`9`) expands to its phrase
//   B · grave shortcut    — `` `x `` expands via gCdH (itself !-code)
//   C · rich codes        — the `!` language proper (this file)
// ---------------------------------------------------------------------------

const DEFAULT_SIZE = 10; // gTFz
const MIN_SIZE = 6; // floor applied by !-
const SUIT_MAX_SIZE = 11; // suits capped at 11pt
const TAB_SMALL = "   "; // !t  (gRMo<8 path)
const TAB_WIDE = "    "; // !T  (gXTq)

// The rich-formatter code table, verbatim from clean_2_block20.js:244. The
// index of a code char selects its behaviour by range (see the switch below).
const CODE_TABLE = "<|>0123456789;[]:bBuitTrSHDCshdc+=-^vnN/?#$*@&~! Ff%";

// Cards-font suit chars per index 24..31 (S,H,D,C,s,h,d,c) → our Suit enum.
const SUIT_BY_INDEX: readonly Suit[] = ["S", "H", "D", "C", "S", "H", "D", "C"];

const HEX_RANGE = /^.([0-9A-Fa-f]{2,6});/; // gHXa  — !U+XXXX;
const HEX_QUAD = /^[0-9A-Fa-f]{4}$/; // gHXf  — one 4-hex group

interface State {
  colorIndex: number; // cBXpale — last palette index chosen
  color: string; // cBXrclr — current text colour
  savedColor: string; // cBXqclr
  bold: boolean; // cBXwx
  italic: boolean; // cBXix (gEit=1, so !i means italic)
  underline: boolean; // cBXuln
  vshift: 0 | 1 | -1; // cBXsbsp
  sizePt: number; // cBXrsz
  // snapshot for !/ save and !? restore
  sBold: boolean;
  sItalic: boolean;
  sUnderline: boolean;
  sVshift: 0 | 1 | -1;
}

/** Strip the `!#` / `!##` mode markers we collapse away (single rich parser). */
function stripModeMarkers(input: string): string {
  let s = input;
  // leading !## (strip 3) or !# (strip 2) — clean_2_block20.js:86-98. The 3-char
  // form is only honoured when the value is long enough (source guard length>4);
  // a short "!##" / "!##X" strips just "!#", leaving the third '#' as literal.
  if (s.startsWith("!##") && s.length > 4) s = s.slice(3);
  else if (s.startsWith("!#")) s = s.slice(2);
  // trailing fill-colour directive !#<c> / !#<c>- — clean_2_block20.js:105-122
  if (s.length > 4) {
    if (s.slice(-3, -1) === "!#" && "0123456789BPWTXxbygupo".includes(s.slice(-1))) {
      s = s.slice(0, -3);
    } else if (s.slice(-4, -2) === "!#" && s.slice(-1) === "-") {
      s = s.slice(0, -4);
    }
  }
  return s;
}

/**
 * Layer C: interpret the `!` language into Span[].
 * `multiline` controls whether `!r` emits a line break.
 */
function parseRich(input: string, sizeDefault: number, multiline: boolean): Span[] {
  const spans: Span[] = [];
  const st: State = {
    colorIndex: 0,
    color: DEFAULT_COLOR,
    savedColor: DEFAULT_COLOR,
    bold: false,
    italic: false,
    underline: false,
    vshift: 0,
    sizePt: sizeDefault,
    sBold: false,
    sItalic: false,
    sUnderline: false,
    sVshift: 0,
  };
  let align: Align | undefined;
  let buf = "";

  const flush = () => {
    if (buf.length === 0) return;
    spans.push({
      text: buf,
      color: st.color,
      bold: st.bold,
      italic: st.italic,
      underline: st.underline,
      vshift: st.vshift,
      sizePt: st.sizePt,
    });
    buf = "";
  };

  const pushSuit = (suit: Suit) => {
    flush();
    // Suit colour: the current palette index applies only if it is a grey/white
    // bank entry (>=11); otherwise the suit takes its natural colour (gScxA).
    const color = st.colorIndex >= 11 ? paletteColor(st.colorIndex) : suitDefaultColor(suit);
    spans.push({
      text: SUIT_GLYPH[suit],
      suit,
      color,
      bold: false,
      italic: false,
      underline: st.underline,
      vshift: 0,
      sizePt: Math.min(st.sizePt, SUIT_MAX_SIZE),
    });
  };

  let v = input.replace(/\r/g, "");
  while (v.length > 0) {
    const p = v.indexOf("!");
    if (p < 0) {
      buf += v;
      break;
    }
    if (p === v.length - 1) {
      // a lone trailing '!' — keep it literally
      buf += v;
      break;
    }
    if (p > 0) {
      buf += v.slice(0, p);
      v = v.slice(p);
    }
    const code = v.charAt(1);
    v = v.slice(2);
    const pj = CODE_TABLE.indexOf(code);

    if (pj < 0) {
      // Unknown code. Only !U+XXXX; (and bare 4-hex groups) are interpreted;
      // everything else degrades to the literal `!x` (totality).
      if (code === "U" && v.length > 3 && v.charAt(0) === "+") {
        const m = HEX_RANGE.exec(v);
        if (m) {
          buf += String.fromCodePoint(parseInt(m[1], 16));
          v = v.slice(m[1].length + 2);
          continue;
        }
        // fallback: consecutive 4-hex groups after the '+'
        let consumed = 0;
        let i = 1;
        for (; i + 4 <= v.length; i += 4) {
          const grp = v.slice(i, i + 4);
          if (HEX_QUAD.test(grp)) {
            buf += String.fromCodePoint(parseInt(grp, 16));
            consumed += 4;
          } else break;
        }
        if (consumed > 0) {
          v = v.slice(consumed + 1);
          if (v.charAt(0) === ";") v = v.slice(1);
          continue;
        }
      }
      buf += "!" + code;
      continue;
    }

    if (pj < 3) {
      // !< !| !>  — alignment (applies to the whole value)
      align = pj === 1 ? "center" : pj === 2 ? "right" : "left";
      continue;
    }

    if (pj < 17) {
      // !0..!9 and !; ![ !] !:  — palette colour (bank 0, indices 0..13)
      flush();
      st.colorIndex = pj - 3;
      st.color = paletteColor(st.colorIndex);
    } else if (pj < 21) {
      // !b !B (bold), !u (underline), !i (italic)
      flush();
      const k = pj - 17;
      if (k < 2) st.bold = !st.bold;
      else if (k < 3) st.underline = !st.underline;
      else st.italic = !st.italic; // gEit=1 on the web
    } else if (pj < 23) {
      // !t / !T  — tabs (whitespace in the text run)
      buf += pj - 21 === 0 ? TAB_SMALL : TAB_WIDE;
    } else if (pj < 24) {
      // !r  — line break in multiline fields; else a soft space
      if (multiline) buf += "\n";
      if (!align) buf += " ";
    } else if (pj < 32) {
      // !S !H !D !C (and lowercase) — suit glyphs
      pushSuit(SUIT_BY_INDEX[pj - 24]);
    } else if (pj < 37) {
      // !+ != !-  size; !^ super; !v sub
      flush();
      const k = pj - 32;
      if (k === 0) {
        st.sizePt++;
        st.vshift = 0;
      } else if (k === 1) {
        st.sizePt = sizeDefault;
        st.vshift = 0;
      } else if (k === 2) {
        if (st.sizePt > MIN_SIZE) st.sizePt--;
        st.vshift = 0;
      } else if (k === 3) {
        st.vshift = st.vshift === 1 ? 0 : 1;
      } else {
        st.vshift = st.vshift === -1 ? 0 : -1;
      }
    } else if (pj < 42) {
      // !n reset format; !N reset + restore colour; !/ save; !? restore; !# no-op
      const k = pj - 37;
      if (k < 2) {
        flush();
        st.bold = false;
        st.italic = false;
        st.underline = false;
        st.vshift = 0;
        if (k === 1) st.color = st.savedColor; // !N
      } else if (k === 2) {
        // !/ save
        st.savedColor = st.color;
        st.sBold = st.bold;
        st.sItalic = st.italic;
        st.sUnderline = st.underline;
        st.sVshift = st.vshift;
      } else if (k === 3) {
        // !? restore
        flush();
        st.color = st.savedColor;
        st.bold = st.sBold;
        st.italic = st.sItalic;
        st.underline = st.sUnderline;
        st.vshift = st.sVshift;
      }
      // k === 4 (!#) — swallowed
    } else if (pj < 47) {
      // !$ !* !@ !& !~  — diagnostic injectors (field name/date/build dumps).
      // Dropped entirely (design §04): they leak nothing and emit nothing.
    } else if (pj < 49) {
      // !!  — literal '!'; '! ' (bang-space) — literal "! "
      buf += "!";
      if (code !== "!") buf += code;
    } else {
      // !F !f !%  — font-switching internals; no on-screen meaning. Dropped.
    }
  }

  flush();
  if (align) for (const s of spans) s.align = align;
  return spans;
}

/**
 * Render the form's coded text into styled spans. Pure; no DOM, no globals.
 *
 * @param raw  the raw code source the user typed (rendered form is derived).
 * @param opts field defaults, the field's Layer-A code list, and the Layer-B
 *             grave table (defaults to the built-in gCdH).
 */
export function renderCoded(raw: string, opts: RenderOptions = {}): Span[] {
  const sizeDefault = opts.fieldDefaults?.sizePt ?? DEFAULT_SIZE;
  let s = raw ?? "";

  // Layer A — a bare code (the whole value, <3 chars) expands to its phrase.
  if (opts.codeList) {
    const key = s.trim();
    if (key.length > 0 && key.length < 3 && Object.prototype.hasOwnProperty.call(opts.codeList, key)) {
      s = opts.codeList[key];
    }
  }
  // Layer B — grave shortcuts (feed back into Layer C).
  s = expandGrave(s, opts.graveTable ?? GRAVE_DEFAULTS);
  // collapse the !# mode markers, then interpret.
  s = stripModeMarkers(s);
  return parseRich(s, sizeDefault, opts.multiline ?? false);
}

/** Convenience: the plain text of a rendered value (suits as glyphs). */
export function renderPlain(raw: string, opts: RenderOptions = {}): string {
  return renderCoded(raw, opts)
    .map((s) => s.text)
    .join("");
}
