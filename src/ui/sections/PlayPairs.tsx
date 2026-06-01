import type { ReactElement } from "react";
import type { SectionDef } from "../../model/index.ts";
import { TextField } from "../fields/index.ts";
import { FieldList } from "./FieldList.tsx";

/** §5: each lead/carding agreement as a vs-suit / vs-notrump pair of columns
 *  (suit left, notrump right — matching the printed card), then the single
 *  fields and notes below. */
export function PlayPairs({ section }: { section: SectionDef }): ReactElement {
  return (
    <>
      <div className="pair-head" aria-hidden="true">
        <span className="pair-label" />
        <span className="col-head">vs suit</span>
        <span className="col-head">vs notrump</span>
      </div>
      <div className="pair-cols">
        {section.pairs?.map((p) => (
          <div className="pair-row" key={p.ntKey}>
            <div className="pair-label">{p.label}</div>
            <TextField def={{ key: p.sKey, label: `${p.label} — vs suit` }} />
            <TextField def={{ key: p.ntKey, label: `${p.label} — vs notrump` }} />
          </div>
        ))}
      </div>
      <FieldList fields={section.fields} />
    </>
  );
}
