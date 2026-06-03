import { type ReactElement, type ReactNode, Fragment } from "react";
import { type FieldDef, fieldSpan } from "../../model/index.ts";
import { SuitText } from "../../render/index.ts";
import { CheckboxField, TextField } from "../fields/index.ts";

function renderField(def: FieldDef): ReactElement {
  return def.kind === "checkbox" ? <CheckboxField def={def} /> : <TextField def={def} />;
}

const isCheckbox = (def: FieldDef): boolean => def.kind === "checkbox";

/**
 * Slice the next visual row off `fields` starting at index `i`: the run of
 * same-group fields whose `span`s fill (without overflowing) the 12 columns —
 * i.e. the fields the grid would place on one row.
 */
function takeRow(fields: readonly FieldDef[], i: number): FieldDef[] {
  const group = fields[i].group;
  const row: FieldDef[] = [];
  let cols = 0;
  while (i < fields.length && fields[i].group === group) {
    const span = fieldSpan(fields[i]);
    if (row.length > 0 && cols + span > 12) break;
    row.push(fields[i]);
    cols += span;
    i++;
    if (cols >= 12) break;
  }
  return row;
}

/**
 * Render one visual row. A row that carries a checkbox is wrapped in a flex
 * `.field-row` so the checkbox hugs its content (label + box) while its text
 * row-mate grows to take the slack (see styles.css). A checkbox-free row flows
 * straight into the 12-column grid as before — each field keeps its `span`.
 */
function renderRow(row: FieldDef[]): ReactNode {
  const keyed = row.map((d) => <Fragment key={d.key}>{renderField(d)}</Fragment>);
  if (row.some(isCheckbox)) {
    return (
      <div className="field-row" key={`row-${row[0].key}`}>
        {keyed}
      </div>
    );
  }
  return <Fragment key={`row-${row[0].key}`}>{keyed}</Fragment>;
}

/**
 * A 12-column field grid (see styles.css). Each field claims `span` columns and
 * flows left→right, wrapping when a row fills — reproducing the printed card's
 * full / half / uneven rows. A `group` emits a full-width sub-heading before its
 * run; a group named in `boxedGroups` is instead wrapped in a bordered
 * `<fieldset>` (the PDF's "1NT Responses" / "Defence to strong" panels). Rows
 * that carry a checkbox are flex-laid so the box hugs its phrase (see renderRow).
 * The grid collapses to a single column on mobile. `header` fields are skipped —
 * the Section renders them in its head row beside the title, not in the body.
 */
export function FieldList({
  fields,
  boxedGroups = [],
}: {
  fields: readonly FieldDef[];
  boxedGroups?: readonly string[];
}): ReactElement {
  const bodyFields = fields.filter((f) => !f.header);
  const items: ReactNode[] = [];
  let lastGroup: string | undefined;
  let i = 0;
  while (i < bodyFields.length) {
    const def = bodyFields[i];
    // A boxed group: gather its contiguous run into a bordered fieldset.
    if (def.group && boxedGroups.includes(def.group)) {
      const group = def.group;
      const run: FieldDef[] = [];
      while (i < bodyFields.length && bodyFields[i].group === group) run.push(bodyFields[i++]);
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
    // A (non-boxed) group sub-heading precedes the first row of a new group.
    if (def.group && def.group !== lastGroup) {
      items.push(
        <h3 className="group-head" key={`head-${def.key}`}>
          <SuitText>{def.group}</SuitText>
        </h3>,
      );
    }
    lastGroup = def.group;
    // Emit the next visual row (flex-wrapped when it carries a checkbox).
    const row = takeRow(bodyFields, i);
    items.push(renderRow(row));
    i += row.length;
  }
  return <div className="field-grid">{items}</div>;
}
