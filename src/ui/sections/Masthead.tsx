import type { ReactElement } from "react";
import type { FieldDef, SectionDef } from "../../model/index.ts";
import { useCardStore } from "../../state/index.ts";
import { CheckboxField, ClassificationSwatch, TextField } from "../fields/index.ts";

/** The masthead: partnership, basic system, classification, system-level flags. */
export function Masthead({ section }: { section: SectionDef }): ReactElement {
  const byKey = (k: string): FieldDef => section.fields.find((f) => f.key === k)!;
  const primary = useCardStore((s) => s.card.primaryPlayer);
  const swap = useCardStore((s) => s.swapPlayers);
  return (
    <div className="masthead-form">
      <div>
        <div className="players-head">
          <strong>Partnership</strong>
          <span className="primary-tag">Player {primary === 0 ? "A" : "B"} prints first</span>
          <button className="btn" type="button" onClick={swap}>
            Swap print order
          </button>
        </div>
        <div className="field-grid">
          <TextField def={byKey("PlayerName_A")} />
          <TextField def={byKey("PlayerNo_A")} />
          <TextField def={byKey("PlayerName_B")} />
          <TextField def={byKey("PlayerNo_B")} />
        </div>
      </div>

      <div className="field-grid">
        <TextField def={byKey("BasicSystem")} />
        <TextField def={byKey("Date_A")} />
      </div>

      <div>
        <span className="col-head">Classification</span>
        <ClassificationSwatch />
      </div>

      <div className="field-grid">
        <CheckboxField def={byKey("OneNTMayHave5Major")} />
        <CheckboxField def={byKey("IsCanape")} />
        <CheckboxField def={byKey("IsBrownSticker")} />
      </div>
    </div>
  );
}
