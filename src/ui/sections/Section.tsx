import type { ReactElement } from "react";
import type { FieldDef, SectionDef } from "../../model/index.ts";
import { CheckboxField, TextField } from "../fields/index.ts";
import { Masthead } from "./Masthead.tsx";
import { PlayPairs } from "./PlayPairs.tsx";
import { GridSection } from "./GridSection.tsx";

function renderField(def: FieldDef): ReactElement {
  return def.kind === "checkbox" ? (
    <CheckboxField key={def.key} def={def} />
  ) : (
    <TextField key={def.key} def={def} />
  );
}

function GenericFields({ fields }: { fields: readonly FieldDef[] }): ReactElement {
  return <div className="field-grid">{fields.map(renderField)}</div>;
}

/** A section's chrome (number + title) plus a body chosen by its layout. */
export function Section({ section }: { section: SectionDef }): ReactElement {
  let body: ReactElement;
  switch (section.layout) {
    case "masthead":
      body = <Masthead section={section} />;
      break;
    case "grid":
      body = <GridSection section={section} />;
      break;
    case "playPairs":
      body = <PlayPairs section={section} />;
      break;
    default:
      body = <GenericFields fields={section.fields} />;
  }
  return (
    <section className="card-section" id={section.id} aria-labelledby={`${section.id}-title`}>
      <h2>{section.number ? `Section ${section.number}` : "Card"}</h2>
      <div className="section-title" id={`${section.id}-title`}>
        {section.title}
      </div>
      {body}
    </section>
  );
}
