import type { CSSProperties, ReactElement } from "react";
import { useCardStore } from "../../state/index.ts";
import { type CardFlags, type FieldDef, fieldSpan } from "../../model/index.ts";
import { SuitText } from "../../render/index.ts";

/** A boolean agreement bound to Card.flags[key] (a text "checkbox" in the PDF).
 *  Laid out like the print: label on the left, the box to its right. */
export function CheckboxField({ def }: { def: FieldDef }): ReactElement {
  const key = def.key as keyof CardFlags;
  const checked = useCardStore((s) => s.card.flags[key]);
  const setFlag = useCardStore((s) => s.setFlag);
  const style = { "--span": fieldSpan(def) } as CSSProperties;
  return (
    <label className="field checkbox-field" style={style}>
      <span className="lbl">
        <SuitText>{def.label}</SuitText>
      </span>
      <input type="checkbox" checked={checked} onChange={(e) => setFlag(key, e.target.checked)} />
    </label>
  );
}
