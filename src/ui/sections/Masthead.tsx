import type { ReactElement } from "react";
import type { FieldDef, SectionDef } from "../../model/index.ts";
import { useCardStore } from "../../state/index.ts";
import { CheckboxField, ClassificationSwatch, TextField } from "../fields/index.ts";

/** The masthead band: partnership (ABF Nos. / & Names:), basic system, the
 *  classification + system flags — laid out like the printed card's front cover.
 *  Each partner is a row of [number][name]; the row labels name the columns. */
export function Masthead({ section }: { section: SectionDef }): ReactElement {
  const byKey = (k: string): FieldDef => section.fields.find((f) => f.key === k)!;
  const primary = useCardStore((s) => s.card.primaryPlayer);
  const swap = useCardStore((s) => s.swapPlayers);
  return (
    <div className="masthead-form">
      <div className="mast-players">
        <fieldset className="group-box">
          <legend>ABF Numbers &amp; Names</legend>
          <div className="abf-grid">
            <TextField def={byKey("PlayerNo_A")} />
            <TextField def={byKey("PlayerName_A")} />
            <TextField def={byKey("PlayerNo_B")} />
            <TextField def={byKey("PlayerName_B")} />
          </div>
          <div className="players-head">
            <span className="primary-tag">Player {primary === 0 ? "A" : "B"} prints first</span>
            <button className="btn" type="button" onClick={swap}>
              Swap print order
            </button>
          </div>
        </fieldset>
        <div className="field-grid">
          <TextField def={byKey("BasicSystem")} />
        </div>
      </div>

      <div className="mast-class">
        <span className="col-head">Classification</span>
        <ClassificationSwatch />
        <div className="mast-flags">
          <CheckboxField def={byKey("IsBrownSticker")} />
        </div>
      </div>
    </div>
  );
}
