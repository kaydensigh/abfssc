import { type ReactElement, type ReactNode, Fragment } from "react";
import type { FieldDef } from "../../model/index.ts";
import { SuitText } from "../../render/index.ts";
import { CheckboxField, TextField } from "../fields/index.ts";

function renderField(def: FieldDef): ReactElement {
  return def.kind === "checkbox" ? <CheckboxField def={def} /> : <TextField def={def} />;
}

/**
 * A 12-column field grid (see styles.css). Each field claims `span` columns and
 * flows left→right, wrapping when a row fills — reproducing the printed card's
 * full / half / uneven rows. A `group` emits a full-width sub-heading before its
 * run; a group named in `boxedGroups` is instead wrapped in a bordered
 * `<fieldset>` (the PDF's "1NT Responses" / "Defence to strong" panels). The
 * grid collapses to a single column on mobile.
 */
export function FieldList({
  fields,
  boxedGroups = [],
}: {
  fields: readonly FieldDef[];
  boxedGroups?: readonly string[];
}): ReactElement {
  const items: ReactNode[] = [];
  let lastGroup: string | undefined;
  let i = 0;
  while (i < fields.length) {
    const def = fields[i];
    // A boxed group: gather its contiguous run into a bordered fieldset.
    if (def.group && boxedGroups.includes(def.group)) {
      const group = def.group;
      const run: FieldDef[] = [];
      while (i < fields.length && fields[i].group === group) run.push(fields[i++]);
      items.push(
        <fieldset className="group-box" key={`box-${group}`}>
          <legend>
            <SuitText>{group}</SuitText>
          </legend>
          <div className="field-grid">{run.map((d) => <Fragment key={d.key}>{renderField(d)}</Fragment>)}</div>
        </fieldset>,
      );
      lastGroup = group;
      continue;
    }
    // A plain field, optionally preceded by a (non-boxed) group sub-heading.
    const head = def.group && def.group !== lastGroup ? def.group : null;
    lastGroup = def.group;
    items.push(
      <Fragment key={def.key}>
        {head && (
          <h3 className="group-head">
            <SuitText>{head}</SuitText>
          </h3>
        )}
        {renderField(def)}
      </Fragment>,
    );
    i++;
  }
  return <div className="field-grid">{items}</div>;
}
