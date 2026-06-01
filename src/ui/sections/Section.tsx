import type { ReactElement } from "react";
import type { SectionDef } from "../../model/index.ts";
import { FieldList } from "./FieldList.tsx";
import { Masthead } from "./Masthead.tsx";
import { PlayPairs } from "./PlayPairs.tsx";
import { GridSection } from "./GridSection.tsx";

/** A section's chrome (eyebrow + title) plus a body chosen by its layout. */
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
      body = <FieldList fields={section.fields} />;
  }
  return (
    <section className="card-section" id={section.id} aria-labelledby={`${section.id}-title`}>
      {section.number != null && <p className="sec-eyebrow">Section {section.number}</p>}
      <h2 className="section-title" id={`${section.id}-title`}>
        {section.title}
      </h2>
      {body}
    </section>
  );
}
