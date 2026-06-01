import type { CSSProperties, ReactElement, ReactNode } from "react";
import type { RenderOptions, Span } from "./types.ts";
import { renderCoded } from "./engine.ts";

const BASE_SIZE = 10; // engine default; spans carry absolute pt → scale to em

function spanStyle(s: Span): CSSProperties {
  const style: CSSProperties = { color: s.color };
  if (s.bold) style.fontWeight = 600;
  if (s.italic) style.fontStyle = "italic";
  if (s.underline) style.textDecoration = "underline";
  if (s.sizePt !== BASE_SIZE) style.fontSize = `${(s.sizePt / BASE_SIZE).toFixed(3)}em`;
  return style;
}

/** Render one span to a React node, honouring suit glyphs and super/subscript. */
function renderSpan(s: Span, key: number): ReactNode {
  const style = spanStyle(s);
  // Force text-presentation for ♥/♦ (avoid emoji rendering) with VS-15.
  const content = s.suit ? `${s.text}︎` : s.text;
  const inner = s.suit ? (
    <span className={`suit suit-${s.suit}`} style={style} key={key}>
      {content}
    </span>
  ) : s.vshift === 1 ? (
    <sup style={style} key={key}>
      {content}
    </sup>
  ) : s.vshift === -1 ? (
    <sub style={style} key={key}>
      {content}
    </sub>
  ) : (
    <span style={style} key={key}>
      {content}
    </span>
  );
  return inner;
}

/** Render an already-computed Span[] to React nodes. */
export function renderSpans(spans: Span[]): ReactNode {
  return spans.map((s, i) => renderSpan(s, i));
}

export interface CodedTextProps {
  value: string;
  opts?: RenderOptions;
  /** Element to render when the value is empty (e.g. a placeholder). */
  empty?: ReactNode;
  className?: string;
}

/**
 * Live, read-only rendering of a coded value. Suits become Unicode glyphs,
 * `!`-markup becomes styled spans, alignment wraps the whole value.
 */
export function CodedText({ value, opts, empty, className }: CodedTextProps): ReactElement {
  const spans = renderCoded(value, opts);
  if (spans.length === 0) {
    return <span className={className}>{empty ?? null}</span>;
  }
  const align = spans[0]?.align;
  const style: CSSProperties | undefined = align ? { textAlign: align, display: "block" } : undefined;
  return (
    <span className={className} style={style}>
      {renderSpans(spans)}
    </span>
  );
}
