// FDF import — parse the Kids-tree into raw field values, then converge on the
// same assembler the PDF path uses. FDF carries no app-state stamp, so every FDF
// import is a fresh card (a new id is minted downstream).

import { parseFdf } from "./parse.ts";
import { assembleCard, type ImportedCard } from "../assemble.ts";
import { ImportError } from "../errors.ts";

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
  return assembleCard({ fields, stampJson: null });
}

export { parseFdf };
