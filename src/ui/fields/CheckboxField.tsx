import type { ReactElement } from "react";
import { useCardStore } from "../../state/index.ts";
import type { CardFlags, FieldDef } from "../../model/index.ts";

/** A boolean agreement bound to Card.flags[key] (a text "checkbox" in the PDF). */
export function CheckboxField({ def }: { def: FieldDef }): ReactElement {
  const key = def.key as keyof CardFlags;
  const checked = useCardStore((s) => s.card.flags[key]);
  const setFlag = useCardStore((s) => s.setFlag);
  return (
    <label className="checkbox">
      <input type="checkbox" checked={checked} onChange={(e) => setFlag(key, e.target.checked)} />
      <span>{def.label}</span>
    </label>
  );
}
