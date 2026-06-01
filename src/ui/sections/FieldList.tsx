import { type ReactElement, Fragment } from "react";
import type { FieldDef } from "../../model/index.ts";
import { CheckboxField, TextField } from "../fields/index.ts";

function renderField(def: FieldDef): ReactElement {
  // Keyed by the wrapping <Fragment> in FieldList, so no key is needed here.
  return def.kind === "checkbox" ? <CheckboxField def={def} /> : <TextField def={def} />;
}

/**
 * A span-aware field grid: each field claims one (`half`) or both (`full`)
 * columns; a `group` label emits a full-width sub-heading before its run. The
 * grid collapses to a single column on mobile (see styles.css).
 */
export function FieldList({ fields }: { fields: readonly FieldDef[] }): ReactElement {
  let lastGroup: string | undefined;
  return (
    <div className="field-grid">
      {fields.map((def) => {
        const head = def.group && def.group !== lastGroup ? def.group : null;
        lastGroup = def.group;
        return (
          <Fragment key={def.key}>
            {head && <h3 className="group-head">{head}</h3>}
            {renderField(def)}
          </Fragment>
        );
      })}
    </div>
  );
}
