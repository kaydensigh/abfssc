import type { ReactElement } from "react";
import type { SectionDef } from "../../model/index.ts";
import { FieldList } from "./FieldList.tsx";
import { ResponsesGrid } from "../grid/ResponsesGrid.tsx";

/** §8: the responses matrix, then the coded 1NT / strong-two response fields
 *  and notes (grouped by sub-heading via FieldList). */
export function GridSection({ section }: { section: SectionDef }): ReactElement {
  return (
    <>
      <ResponsesGrid />
      <FieldList fields={section.fields} />
    </>
  );
}
