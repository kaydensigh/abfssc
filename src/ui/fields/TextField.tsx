import type { ReactElement } from "react";
import { useCardStore } from "../../state/index.ts";
import { type FieldDef, fieldKind, fieldWidth } from "../../model/index.ts";
import { CODE_LISTS, codeMap } from "../../content/codelists.ts";
import { SuitText } from "../../render/index.ts";
import { CodedInput } from "./CodedInput.tsx";

/** A rich / coded / notes / player text field bound to Card.fields[key]. */
export function TextField({ def }: { def: FieldDef }): ReactElement {
  const kind = fieldKind(def);
  const value = useCardStore((s) => s.card.fields[def.key] ?? "");
  const setField = useCardStore((s) => s.setField);
  const list = CODE_LISTS[def.key];
  const isCoded = kind === "coded";
  const multiline = kind === "notes" || def.multiline === true;
  // Background hint: the field's own PDF guidance (def.hint) wins; coded fields
  // fall back to their code-list prompt.
  const placeholder = def.hint ?? list?.prompt;
  return (
    <div className={`field ${fieldWidth(def)}${isCoded ? " coded" : ""}`}>
      <label>
        <SuitText>{def.label}</SuitText>
      </label>
      <CodedInput
        value={value}
        onChange={(v) => setField(def.key, v)}
        ariaLabel={def.label}
        multiline={multiline}
        placeholder={placeholder}
        options={isCoded ? list?.codes : undefined}
        codeList={isCoded ? codeMap(def.key) : undefined}
      />
    </div>
  );
}
