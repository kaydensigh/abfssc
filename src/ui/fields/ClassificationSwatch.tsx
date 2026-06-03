import { type ReactElement, useRef } from "react";
import { useCardStore } from "../../state/index.ts";
import { CLASSIFICATIONS } from "../../content/classification.ts";

/**
 * System classification as four colour swatches (a radio group). Clicking the
 * active swatch clears it to unset — the original's radio-from-one-string
 * behaviour. Follows the WAI-ARIA radio pattern: a single tab stop on the group,
 * arrow keys move and select. Carries text labels + aria-checked, never colour
 * alone (a11y).
 */
export function ClassificationSwatch(): ReactElement {
  const value = useCardStore((s) => s.card.classification);
  const toggle = useCardStore((s) => s.toggleClassification);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  // Single tab stop: the checked swatch, or the first one when nothing is set.
  const checkedIndex = CLASSIFICATIONS.findIndex((c) => c.value === value);
  const tabStop = checkedIndex === -1 ? 0 : checkedIndex;

  const onKeyDown = (e: React.KeyboardEvent, i: number) => {
    let next = i;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (i + 1) % CLASSIFICATIONS.length;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = (i - 1 + CLASSIFICATIONS.length) % CLASSIFICATIONS.length;
    else return;
    e.preventDefault();
    refs.current[next]?.focus();
    const target = CLASSIFICATIONS[next].value;
    if (value !== target) toggle(target); // moving selects (radio pattern)
  };

  return (
    <div>
      <div className="classification" role="radiogroup" aria-label="System classification">
        {CLASSIFICATIONS.map((c, i) => (
          <button
            key={c.value}
            type="button"
            className="swatch"
            role="radio"
            aria-checked={value === c.value}
            tabIndex={i === tabStop ? 0 : -1}
            style={{ "--swatch": c.swatch } as React.CSSProperties}
            ref={(el) => {
              refs.current[i] = el;
            }}
            onClick={() => toggle(c.value)}
            onKeyDown={(e) => onKeyDown(e, i)}
          >
            {c.label}
          </button>
        ))}
      </div>
    </div>
  );
}
