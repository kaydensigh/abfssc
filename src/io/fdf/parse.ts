// A small, self-contained FDF reader. FDF is PDF object syntax carrying just the
// filled field values, so we parse the `/Fields` array structurally rather than
// with a flat /T(…)/V(…) regex — which (design §05, verified) would miss every
// §8 grid cell: hierarchical fields appear as nested /Kids dicts
//   << /T (Resp1C) /Kids [ << /T (_1D) /V (…) >> << /T (Other) /V (…) >> ] >>
// and the child's fully-qualified name is parent + "." + partial (the dotted
// legacy form our rename map normalises). We also handle hex-string names
// (/T <48…>), /V-before-/T ordering (whole dict parsed before reading), literal-
// string escapes/continuations, and UTF-16BE values. No pdf-lib — pure strings.
//
// Input is UNTRUSTED, so the scanner is hardened: every loop is guaranteed to
// make progress (no stray delimiter can stall it), recursion is depth-capped,
// `/Fields` is located by the tokenizer (a decoy "/Fields" in a comment or value
// can't hijack it), and unparseable bytes surface as a typed ImportError.

import { ImportError } from "../errors.ts";

/** A parsed FDF value: a decoded string, a dict, an array, or an ignorable token. */
type FdfValue = string | FdfDict | FdfValue[] | { name: string } | { bare: string };
interface FdfDict {
  [key: string]: FdfValue;
}

/** Recursion cap. Real ABF field trees nest ~2-3 deep; 256 is far above any
 *  legitimate file yet aborts a stack-exhaustion payload in microseconds. */
const MAX_DEPTH = 256;

const isWs = (c: string): boolean =>
  c === " " || c === "\t" || c === "\n" || c === "\r" || c === "\f" || c === "\0";
const isDelim = (c: string): boolean =>
  c === "(" || c === ")" || c === "<" || c === ">" || c === "[" || c === "]" || c === "{" || c === "}" || c === "/" || c === "%";

/** Decode raw bytes to text: UTF-16BE when BOM-prefixed, else Latin1/PDFDoc. */
function decodeBytes(bytes: number[]): string {
  if (bytes.length >= 2 && bytes[0] === 0xfe && bytes[1] === 0xff) {
    let s = "";
    for (let k = 2; k + 1 < bytes.length; k += 2) s += String.fromCharCode((bytes[k] << 8) | bytes[k + 1]);
    return s;
  }
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return s;
}

class Reader {
  private i = 0;
  private readonly s: string;
  constructor(s: string) {
    this.s = s;
  }

  private get len(): number {
    return this.s.length;
  }

  /** Skip whitespace and `%` comments between tokens. */
  ws(): void {
    while (this.i < this.len) {
      const c = this.s[this.i];
      if (c === "%") {
        while (this.i < this.len && this.s[this.i] !== "\n" && this.s[this.i] !== "\r") this.i++;
      } else if (isWs(c)) {
        this.i++;
      } else break;
    }
  }

  /**
   * Scan forward to just after the `/Fields` NAME token; returns false if absent.
   * Token-driven (not a raw indexOf): comments and literal/hex strings are
   * consumed by the same tokenizer that reads values, so a decoy "/Fields" in a
   * `%` comment or inside another field's `/V (…)` can't hijack the parse.
   */
  seekFields(): boolean {
    while (this.i < this.len) {
      this.ws();
      if (this.i >= this.len) break;
      const c = this.s[this.i];
      if (c === "/") {
        if (this.parseName() === "Fields") return true;
      } else if (c === "(") {
        this.parseLiteralString();
      } else if (c === "<" && this.s[this.i + 1] !== "<") {
        this.parseHexString();
      } else if ((c === "<" || c === ">") && this.s[this.i + 1] === c) {
        this.i += 2; // step over a << or >> pair
      } else {
        // bare token or a stray single delimiter ([ ] > etc.) — always advance
        const start = this.i;
        this.skipBare();
        if (this.i === start) this.i++;
      }
    }
    return false;
  }

  /**
   * If the value at the cursor is an indirect reference (`N G R`) — a spec-legal
   * way to express `/Fields` — seek into its `N G obj … endobj` body so the array
   * can be parsed. No-op when the next token is a direct `[`.
   */
  resolveIndirectFields(): void {
    this.ws();
    if (this.s[this.i] === "[") return;
    const refRe = /(\d+)\s+\d+\s+R\b/y;
    refRe.lastIndex = this.i;
    const ref = refRe.exec(this.s);
    if (!ref || ref.index !== this.i) return;
    const objRe = new RegExp(`(?:^|[^0-9])${ref[1]}\\s+\\d+\\s+obj`);
    const obj = objRe.exec(this.s);
    if (!obj) return; // unresolved → caller gets an empty map (existing behaviour)
    this.i = obj.index + obj[0].length;
  }

  parseValue(depth = 0): FdfValue {
    if (depth > MAX_DEPTH) throw new ImportError("unreadable", "This FDF file is nested too deeply to read.");
    this.ws();
    const c = this.s[this.i];
    if (c === "<") return this.s[this.i + 1] === "<" ? this.parseDict(depth) : this.parseHexString();
    if (c === "(") return this.parseLiteralString();
    if (c === "/") return { name: this.parseName() };
    if (c === "[") return this.parseArray(depth);
    return this.parseBare();
  }

  private parseDict(depth: number): FdfDict {
    this.i += 2; // <<
    const dict: FdfDict = {};
    for (;;) {
      this.ws();
      if (this.i >= this.len) break;
      if (this.s[this.i] === ">" && this.s[this.i + 1] === ">") {
        this.i += 2;
        break;
      }
      if (this.s[this.i] !== "/") {
        this.skipBare(); // tolerate indirect-ref tails (e.g. the "0 R" of "1 0 R")
        continue;
      }
      const key = this.parseName();
      dict[key] = this.parseValue(depth + 1);
    }
    return dict;
  }

  private parseArray(depth: number): FdfValue[] {
    this.i += 1; // [
    const arr: FdfValue[] = [];
    for (;;) {
      this.ws();
      if (this.i >= this.len) break;
      if (this.s[this.i] === "]") {
        this.i += 1;
        break;
      }
      const before = this.i;
      const v = this.parseValue(depth + 1);
      if (this.i === before) {
        this.i++; // guarantee progress past a stray delimiter (e.g. ')','>','}')
        continue; // …and drop the empty stall token rather than collect it
      }
      arr.push(v);
    }
    return arr;
  }

  private parseName(): string {
    this.i += 1; // /
    let name = "";
    while (this.i < this.len) {
      const c = this.s[this.i];
      if (isWs(c) || isDelim(c)) break;
      if (c === "#" && this.i + 2 < this.len) {
        name += String.fromCharCode(parseInt(this.s.substr(this.i + 1, 2), 16));
        this.i += 3;
      } else {
        name += c;
        this.i++;
      }
    }
    return name;
  }

  private parseLiteralString(): string {
    this.i += 1; // (
    let depth = 1;
    const bytes: number[] = [];
    while (this.i < this.len) {
      const c = this.s[this.i++];
      if (c === "\\") {
        const n = this.s[this.i++];
        if (n === undefined) break; // truncated: a lone backslash was the last byte
        else if (n === "n") bytes.push(10);
        else if (n === "r") bytes.push(13);
        else if (n === "t") bytes.push(9);
        else if (n === "b") bytes.push(8);
        else if (n === "f") bytes.push(12);
        else if (n === "(") bytes.push(40);
        else if (n === ")") bytes.push(41);
        else if (n === "\\") bytes.push(92);
        else if (n >= "0" && n <= "7") {
          let oct = n;
          for (let k = 0; k < 2 && this.s[this.i] >= "0" && this.s[this.i] <= "7"; k++) oct += this.s[this.i++];
          bytes.push(parseInt(oct, 8) & 0xff);
        } else if (n === "\n") {
          /* line continuation */
        } else if (n === "\r") {
          if (this.s[this.i] === "\n") this.i++; // CRLF continuation
        } else {
          bytes.push(n.charCodeAt(0)); // unknown escape → the literal char
        }
      } else if (c === "(") {
        depth++;
        bytes.push(40);
      } else if (c === ")") {
        depth--;
        if (depth === 0) break;
        bytes.push(41);
      } else {
        bytes.push(c.charCodeAt(0) & 0xff);
      }
    }
    return decodeBytes(bytes);
  }

  private parseHexString(): string {
    this.i += 1; // <
    const bytes: number[] = [];
    let hi = -1;
    while (this.i < this.len && this.s[this.i] !== ">") {
      const c = this.s[this.i++];
      if (!/[0-9a-fA-F]/.test(c)) continue;
      const nyb = parseInt(c, 16);
      if (hi < 0) hi = nyb;
      else {
        bytes.push((hi << 4) | nyb);
        hi = -1;
      }
    }
    if (hi >= 0) bytes.push(hi << 4); // odd trailing nibble → low 0
    this.i += 1; // >
    return decodeBytes(bytes);
  }

  private parseBare(): { bare: string } {
    let t = "";
    while (this.i < this.len && !isWs(this.s[this.i]) && !isDelim(this.s[this.i])) t += this.s[this.i++];
    return { bare: t };
  }

  private skipBare(): void {
    const start = this.i;
    while (this.i < this.len && !isWs(this.s[this.i]) && !isDelim(this.s[this.i])) this.i++;
    if (this.i === start) this.i++; // guarantee progress past a stray delimiter
  }
}

function isDict(v: FdfValue): v is FdfDict {
  return typeof v === "object" && v !== null && !Array.isArray(v) && !("name" in v) && !("bare" in v);
}

/** Walk a field dict, building fully-qualified name (parent "." partial) → value. */
function walk(node: FdfDict, parentName: string, out: Map<string, string>, depth = 0): void {
  if (depth > MAX_DEPTH) throw new ImportError("unreadable", "This FDF file is nested too deeply to read.");
  const t = node["T"];
  const partial = typeof t === "string" ? t : "";
  const fqn = partial ? (parentName ? `${parentName}.${partial}` : partial) : parentName;

  const v = node["V"];
  if (typeof v === "string" && fqn) out.set(fqn, v);

  const kids = node["Kids"];
  if (Array.isArray(kids)) {
    for (const k of kids) if (isDict(k)) walk(k, fqn, out, depth + 1);
  }
}

/**
 * Parse an FDF file (text or bytes) into a `fully-qualified name → value` map.
 * Names stay in their on-file form (incl. dotted legacy hierarchy); callers run
 * them through the rename normalizer. Throws ImportError("unreadable") on
 * pathological input (over-deep nesting); malformed-but-shallow input degrades
 * to a best-effort partial map.
 */
export function parseFdf(input: string | Uint8Array | ArrayBuffer): Map<string, string> {
  let text: string;
  if (typeof input === "string") {
    text = input;
  } else {
    const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);
    text = new TextDecoder("latin1").decode(bytes); // byte-faithful (offsets align)
  }

  const reader = new Reader(text);
  const out = new Map<string, string>();
  if (!reader.seekFields()) return out;
  reader.resolveIndirectFields(); // follow `/Fields N 0 R` into its object body
  const fields = reader.parseValue();
  if (!Array.isArray(fields)) return out;
  for (const f of fields) if (isDict(f)) walk(f, "", out);
  return out;
}
