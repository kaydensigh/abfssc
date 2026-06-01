// Layer-B grave-accent (`) shortcut table — the built-in defaults seeded by
// the form's gFrC() (clean_3_block35.js:37-58). Each value is itself a !-code
// string, so a grave expansion feeds back into the Layer-C interpreter
// (e.g. `1 -> "1!^st!^" -> 1ˢᵗ). Users could extend this via My_Codes in the
// original; v1 ships the defaults and leaves user extension to settings later.
//
// Note: the source stores `@` as the mojibake "Â½" (a UTF-8 ½ byte-pair read as
// Latin-1). The intended glyph is ½ (U+00BD), restored here.
export const GRAVE_DEFAULTS: Readonly<Record<string, string>> = {
  "(": "!^(",
  ")": ")!^",
  "+": "!^+!^",
  "-": "!^!U+2013; !^",
  ".": "!U+2026;   ",
  "1": "1!^st!^",
  "2": "2!^nd!^",
  "3": "3!^rd!^",
  "4": "4!^th!^",
  "5": "5!^th!^",
  "@": "½",
  "[": "!^[",
  "]": "]!^",
  _: "!U+2013; ",
  a: "!U+03B1;", // α
  b: "!U+03B2;", // β
  c: "!U+03B3;", // γ
  d: "!U+03B4;", // δ
  e: "!U+03B5;", // ε
};

export const GRAVE_CHAR = "`";

/**
 * Layer B: expand grave-accent shortcuts. Mirrors the gCdH substitution loop
 * in clean_2_block20.js:52-82 — scan for `` ` ``, replace `` `x `` with
 * table[x] (and continue scanning past the inserted text), leave an unknown
 * `` `x `` as `` `x `` and `` `` `` ``  as a literal backtick.
 */
export function expandGrave(
  raw: string,
  table: Record<string, string> = GRAVE_DEFAULTS,
): string {
  if (raw.indexOf(GRAVE_CHAR) < 0) return raw;
  let s = raw;
  let j = s.indexOf(GRAVE_CHAR);
  while (j >= 0) {
    if (j + 1 >= s.length) break; // trailing ` with nothing after — leave as-is
    const key = s.charAt(j + 1);
    if (Object.prototype.hasOwnProperty.call(table, key)) {
      const repl = table[key];
      s = s.slice(0, j) + repl + s.slice(j + 2);
      j = s.indexOf(GRAVE_CHAR, j + repl.length);
    } else if (key === GRAVE_CHAR) {
      // `` -> ` (collapse the doubled backtick to one literal)
      s = s.slice(0, j) + s.slice(j + 1);
      j = s.indexOf(GRAVE_CHAR, j + 1);
    } else {
      // unknown `x — keep the backtick and move past it
      j = s.indexOf(GRAVE_CHAR, j + 1);
    }
  }
  return s;
}
