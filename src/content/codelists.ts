// The embedded shortcut-code lists — the domain content. 52 fields ship a list
// of preset answers in their tooltip; a bare code expands to its phrase. On the
// web these seed the field's autocomplete (selecting inserts the phrase, still
// free-text editable). The data is generated from abf/extracted/field_codelists.md
// by scripts/build-codelists.mjs; this module owns the types + lookup helpers.

export interface CodeOption {
  /** The shortcut a user types (e.g. "1", "x", "9"). */
  code: string;
  /** The phrase it expands to; may itself contain !-codes / backticks. */
  phrase: string;
}

export interface CodeList {
  /** The field's tooltip question (help / placeholder text). */
  prompt: string;
  codes: CodeOption[];
}

import { CODE_LISTS } from "./codelists.generated.ts";

export { CODE_LISTS };

/** The Layer-A map for a field, in the shape renderCoded() expects. */
export function codeMap(fieldKey: string): Record<string, string> | undefined {
  const list = CODE_LISTS[fieldKey];
  if (!list) return undefined;
  const map: Record<string, string> = {};
  for (const { code, phrase } of list.codes) map[code] = phrase;
  return map;
}

/** Whether a field carries a code list (i.e. is a "coded text" field). */
export function hasCodeList(fieldKey: string): boolean {
  return Object.prototype.hasOwnProperty.call(CODE_LISTS, fieldKey);
}
