import type { ReactElement } from "react";
import type { FieldDef, SectionDef } from "../../model/index.ts";
import { SuitText } from "../../render/index.ts";
import { CheckboxField, TextField } from "../fields/index.ts";
import { FieldList } from "./FieldList.tsx";
import { Masthead } from "./Masthead.tsx";
import { PlayPairs } from "./PlayPairs.tsx";
import { GridSection } from "./GridSection.tsx";

/** A single field bound to the store (used for the head-row fields, e.g. §1 Canapé). */
function HeaderField({ def }: { def: FieldDef }): ReactElement {
  return def.kind === "checkbox" ? <CheckboxField def={def} /> : <TextField def={def} />;
}

/** A section's chrome (banner header) plus a body chosen by its layout. */
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
      body = <FieldList fields={section.fields} boxedGroups={section.boxedGroups} />;
  }
  const titleId = `${section.id}-title`;
  const headerFields = section.fields.filter((f) => f.header);
  return (
    <section className="card-section" id={section.id} aria-labelledby={titleId}>
      {section.number != null ? (
        // Numbered sections get the PDF-style red banner bar (number badge +
        // title). The bar shrinks to its title so header fields (e.g. §1 Canapé)
        // can share the row to its right; on mobile they wrap below.
        <div className="section-head">
          <h2 className="section-banner" id={titleId}>
            <span className="sec-num" aria-hidden="true">
              {section.number}
            </span>
            <span className="sec-name">
              <SuitText>{section.title}</SuitText>
            </span>
          </h2>
          {headerFields.map((def) => (
            <HeaderField def={def} key={def.key} />
          ))}
        </div>
      ) : (
        // The masthead shows no visible heading (the brand bar names the card);
        // keep the title as a hidden accessible label for the section.
        <h2 className="visually-hidden" id={titleId}>
          <SuitText>{section.title}</SuitText>
        </h2>
      )}
      {body}
    </section>
  );
}
