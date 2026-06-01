import type { ReactElement } from "react";
import type { SectionDef } from "../../model/index.ts";
import { TextField } from "../fields/index.ts";
import { ResponsesGrid } from "../grid/ResponsesGrid.tsx";

/** §8: the responses matrix, then the separate 1NT-response coded fields + notes. */
export function GridSection({ section }: { section: SectionDef }): ReactElement {
  return (
    <>
      <ResponsesGrid />
      <h3 className="sub-head">Responses to 1NT &amp; notes</h3>
      <div className="field-grid">
        {section.fields.map((def) => (
          <TextField key={def.key} def={def} />
        ))}
      </div>
    </>
  );
}
