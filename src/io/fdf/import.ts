// FDF import — parse the Kids-tree into raw field values, then converge on the
// same assembler the PDF path uses. FDF carries no app-state stamp, so every FDF
// import is a fresh card (a new id is minted downstream).

import { parseFdf } from "./parse.ts";
import { assembleCard, type ImportedCard } from "../assemble.ts";
import { ImportError } from "../errors.ts";
import { currentModelNames, normalizeFieldName } from "../rename.ts";

// "Is this an ABF card?" for FDF. A PDF carries every field, so a few empty
// machinery fields (My_Options, …) suffice as a signature — but an FDF OMITS
// default-valued fields (Adobe's exportAsFDF drops them), so those machinery
// fields, and even Classification/BasicSystem, can all be absent from a perfectly
// valid card. So we test the whole namespace instead: does ANY field, once run
// through the legacy rename, land on a model field? A real card always carries at
// least one; an unrelated form (or junk that merely parses) carries none.
const MODEL_NAMES = new Set(currentModelNames());

/** Read a filled FDF (legacy or exported) into a Card. */
export function importCardFromFdf(input: string | Uint8Array | ArrayBuffer): ImportedCard {
  let fields: Map<string, string>;
  try {
    fields = parseFdf(input);
  } catch (e) {
    if (e instanceof ImportError) throw e; // already typed (e.g. over-deep nesting)
    throw new ImportError("unreadable", "This FDF file couldn't be read. It may be damaged or malformed.");
  }
  if (fields.size === 0) {
    throw new ImportError("empty-fdf", "This FDF file contained no recognisable field data.");
  }
  if (![...fields.keys()].some((name) => MODEL_NAMES.has(normalizeFieldName(name)))) {
    throw new ImportError("not-abf", "This FDF doesn't look like an ABF System Card.");
  }
  return assembleCard({ fields, stampJson: null });
}

export { parseFdf };
