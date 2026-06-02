import type { ReactElement } from "react";
import type { SectionDef } from "../../model/index.ts";
import { SuitText } from "../../render/index.ts";
import { FieldList } from "./FieldList.tsx";
import { Masthead } from "./Masthead.tsx";
import { PlayPairs } from "./PlayPairs.tsx";
import { GridSection } from "./GridSection.tsx";

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
  return (
    <section className="card-section" id={section.id} aria-labelledby={titleId}>
      {section.number != null ? (
        // Numbered sections get the PDF-style banner bar (number badge + title,
        // caption trailing on the same line).
        <h2 className="section-banner" id={titleId}>
          <span className="sec-num" aria-hidden="true">
            {section.number}
          </span>
          <span className="sec-name">
            <SuitText>{section.title}</SuitText>
          </span>
          {section.caption && <span className="sec-cap">{section.caption}</span>}
        </h2>
      ) : (
        // The masthead keeps a cover-style title rather than a numbered banner.
        <>
          <h2 className="section-cover" id={titleId}>
            <SuitText>{section.title}</SuitText>
          </h2>
          {section.caption && <p className="sec-caption">{section.caption}</p>}
        </>
      )}
      {body}
    </section>
  );
}
