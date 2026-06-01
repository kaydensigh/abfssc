import type { ReactElement } from "react";
import type { SectionDef } from "../../model/index.ts";
import { CheckboxField, TextField } from "../fields/index.ts";

/** §5: each lead/carding agreement as a vs-notrump / vs-suit pair of columns. */
export function PlayPairs({ section }: { section: SectionDef }): ReactElement {
  return (
    <>
      <div className="pair-cols">
        {section.pairs?.map((p) => (
          <div className="pair-row" key={p.ntKey}>
            <div className="pair-label">{p.label}</div>
            <TextField def={{ key: p.ntKey, label: "vs notrump" }} />
            <TextField def={{ key: p.sKey, label: "vs suit" }} />
          </div>
        ))}
      </div>
      <div className="field-grid" style={{ marginTop: 16 }}>
        {section.fields.map((def) =>
          def.kind === "checkbox" ? <CheckboxField key={def.key} def={def} /> : <TextField key={def.key} def={def} />,
        )}
      </div>
    </>
  );
}
