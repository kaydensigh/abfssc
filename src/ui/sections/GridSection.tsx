import type { ReactElement } from "react";
import type { SectionDef } from "../../model/index.ts";
import { FieldList } from "./FieldList.tsx";
import { ResponseBlocks } from "../grid/ResponseBlocks.tsx";

/** §8: the per-opening response blocks, then the closing notes (grouped by
 *  sub-heading via FieldList). */
export function GridSection({ section }: { section: SectionDef }): ReactElement {
  return (
    <>
      <ResponseBlocks />
      <FieldList fields={section.fields} boxedGroups={section.boxedGroups} />
    </>
  );
}
