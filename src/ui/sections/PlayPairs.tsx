import { type ReactElement, Fragment } from "react";
import type { SectionDef } from "../../model/index.ts";
import { SuitText } from "../../render/index.ts";
import { TextField } from "../fields/index.ts";
import { FieldList } from "./FieldList.tsx";

/** §5: each lead/carding agreement as a vs-suit / vs-notrump pair of columns
 *  (suit left, notrump right — matching the printed card), under the card's
 *  three column heads. Lead agreements are grouped under a "Leads" sub-heading;
 *  the single fields and notes follow below. */
export function PlayPairs({ section }: { section: SectionDef }): ReactElement {
  let lastGroup: string | undefined;
  return (
    <>
      <div className="pair-head" aria-hidden="true">
        <span className="pair-label">Show priorities</span>
        <span className="col-head">
          Versus <strong>Suit</strong> (or both)
        </span>
        <span className="col-head">
          Versus <strong>No Trump</strong> (if different)
        </span>
      </div>
      <div className="pair-cols">
        {section.pairs?.map((p) => {
          const head = p.group && p.group !== lastGroup ? p.group : null;
          lastGroup = p.group;
          return (
            <Fragment key={p.ntKey}>
              {head && <h3 className="group-head">{head}</h3>}
              <div className="pair-row">
                <div className="pair-label">
                  <SuitText>{p.label}</SuitText>
                  {p.note && <span className="pair-note"> {p.note}</span>}
                </div>
                <TextField def={{ key: p.sKey, label: `${p.label} — vs suit` }} />
                <TextField def={{ key: p.ntKey, label: `${p.label} — vs no trump` }} />
              </div>
            </Fragment>
          );
        })}
      </div>
      <FieldList fields={section.fields} />
    </>
  );
}
