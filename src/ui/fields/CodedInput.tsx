import { type CSSProperties, type ReactElement, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { CodedText } from "../../render/index.ts";
import type { CodeOption } from "../../content/codelists.ts";
import { MarkupToolbar } from "./MarkupToolbar.tsx";
import type { QuickAction } from "./quickActions.ts";

interface Props {
  value: string;
  onChange: (v: string) => void;
  /** Accessible label (the visible label is rendered by the field wrapper). */
  ariaLabel: string;
  multiline?: boolean;
  /** Autocomplete options for a coded field (selecting inserts the phrase). */
  options?: CodeOption[];
  /** Layer-A map so a bare code renders expanded in the preview/display. */
  codeList?: Record<string, string>;
  /** Computed quick-insert shortcuts (e.g. "Today" → current date); clicking
   *  replaces the field value with the freshly computed string. */
  actions?: QuickAction[];
}

// The dual-mode field editor (design §04): the value shows rendered by default;
// clicking drops a POPOVER just below the box, holding the raw monospace source, a
// markup toolbar, and — for coded fields — an autocomplete. The display box stays
// in place and IS the live preview: as you edit the raw source the rendered value
// above the editor updates in step. The popover floats over the card (absolute),
// so opening a field never reflows the page.
export function CodedInput({ value, onChange, ariaLabel, multiline, options, codeList, actions }: Props): ReactElement {
  const [editing, setEditing] = useState(false);
  // The popover always drops below the field, left-aligned by default; on open we
  // measure and flip to right-aligned if a left-aligned box would spill past the
  // viewport's right edge (narrow fields in the right column).
  const [alignEnd, setAlignEnd] = useState(false);
  // On mobile the popover breaks out of its (possibly narrow/nested) value box to
  // span ~full viewport width; null on desktop. Measured per-open below.
  const [bleed, setBleed] = useState<{ left: number; width: number } | null>(null);
  // On mobile, a height cap so the field + popover both fit above the soft keyboard;
  // null when uncapped (desktop). The preset list scrolls within it (see CSS).
  const [maxH, setMaxH] = useState<number | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const displayRef = useRef<HTMLDivElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement & HTMLInputElement>(null);
  // Set when a keyboard action (Escape) closes the editor, so focus returns to
  // the box it grew from rather than falling to <body>. Stays false for
  // blur-close (the user moved focus away deliberately).
  const restoreFocus = useRef(false);
  const id = useId();

  // Keep the popover on-screen: right-align when a left-aligned box would overflow
  // the right edge, and on mobile stretch it to ~full viewport width (a narrow or
  // nested field's box is too cramped to edit in). Runs before paint to avoid a flash.
  useLayoutEffect(() => {
    if (!editing) return;
    const anchor = wrapRef.current;
    const pop = popRef.current;
    if (!anchor || !pop) return;
    const a = anchor.getBoundingClientRect();
    const vw = document.documentElement.clientWidth;
    setAlignEnd(a.left + pop.offsetWidth > vw - 8);
    // Full-bleed on mobile (viewport ≤ 720px, matching the CSS breakpoint): break
    // out of the value box — its left edge sits a.left from the viewport — so the
    // editor spans the screen with an 8px margin each side. The offset is relative
    // to .coded-input (the popover's containing block), so it survives page scroll.
    const MARGIN = 8;
    setBleed(vw <= 720 ? { left: MARGIN - a.left, width: vw - MARGIN * 2 } : null);
  }, [editing]);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus({ preventScroll: true });
      // Desktop: bring the whole editor into view (tall coded popovers near the
      // fold). Mobile scrolling is handled by the keyboard-aware effect below.
      if (document.documentElement.clientWidth > 720) {
        try {
          popRef.current?.scrollIntoView({ block: "nearest" });
        } catch {
          /* jsdom / unsupported — positioning is best-effort */
        }
      }
    } else if (restoreFocus.current) {
      restoreFocus.current = false;
      displayRef.current?.focus();
    }
  }, [editing]);

  // Mobile: keep the field and its popover visible above the soft keyboard. The
  // keyboard shrinks window.visualViewport; lift a too-low field up so the popover
  // below it has room, then cap the popover to the space that's actually left (its
  // preset list scrolls within the cap — see CSS). No visualViewport (desktop /
  // older browsers) → skip; the effect above covers it.
  useEffect(() => {
    if (!editing) return;
    const vv = window.visualViewport;
    const wrap = wrapRef.current;
    if (!vv || !wrap) return;
    if (document.documentElement.clientWidth > 720) return;
    const fit = () => {
      const visTop = vv.offsetTop;
      const visBottom = visTop + vv.height;
      const before = (displayRef.current ?? wrap).getBoundingClientRect();
      // Only scroll when the room below the field is too tight for a comfortable
      // popover, and only as far as the top of the visible area — a field with room
      // to spare stays put ("a bit" of scroll, not a jump every time). While editing
      // the field floats above the sticky header (see CSS), so the top is safe.
      const room = visBottom - before.bottom - 12;
      if (room < 240) {
        const lift = Math.min(240 - room, before.top - (visTop + 8));
        // behavior:"instant" overrides the global `scroll-behavior: smooth`, so the
        // scroll lands now and the cap below reflects the field's new position.
        if (lift > 2) window.scrollBy({ top: lift, behavior: "instant" });
      }
      // Cap the popover to the room actually left below the field, so it never runs
      // under the keyboard; its preset list scrolls within the cap (see CSS).
      const after = (displayRef.current ?? wrap).getBoundingClientRect();
      setMaxH(Math.max(140, Math.round(visBottom - after.bottom - 12)));
    };
    fit();
    // The keyboard animates in after focus → re-fit when the viewport resizes.
    vv.addEventListener("resize", fit);
    return () => {
      vv.removeEventListener("resize", fit);
      setMaxH(null);
    };
  }, [editing]);

  // Close on Escape, returning focus to the display box it grew from.
  useEffect(() => {
    if (!editing) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        restoreFocus.current = true;
        setEditing(false);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [editing]);

  const opts = { multiline, codeList };

  const insertAtCaret = (code: string) => {
    const el = inputRef.current;
    if (!el) {
      onChange(value + code);
      return;
    }
    const start = el.selectionStart ?? value.length;
    const end = el.selectionEnd ?? value.length;
    onChange(value.slice(0, start) + code + value.slice(end));
    const caret = start + code.length;
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(caret, caret);
    });
  };

  const onBlur = (e: React.FocusEvent) => {
    // Leave edit mode only when focus exits the whole field (input/toolbar/list).
    if (!wrapRef.current?.contains(e.relatedTarget as Node | null)) setEditing(false);
  };

  // Mobile-only geometry CSS can't express: the horizontal bleed to ~full viewport
  // width (right/maxWidth reset so left+width position it and override align-end),
  // and the keyboard-aware height cap. Both empty on desktop.
  const popStyle: CSSProperties = {};
  if (bleed) Object.assign(popStyle, { left: bleed.left, width: bleed.width, right: "auto", maxWidth: "none" });
  if (maxH != null) popStyle.maxHeight = maxH;

  return (
    <div className={`coded-input${editing ? " is-editing" : ""}`} ref={wrapRef} onBlur={onBlur}>
      {/* The display box always occupies the layout — it anchors the popover and
          keeps the row's height stable while editing. */}
      <div
        ref={displayRef}
        className={`field-display${editing ? " is-editing" : ""}`}
        role={editing ? undefined : "textbox"}
        aria-label={editing ? undefined : ariaLabel}
        aria-hidden={editing || undefined}
        tabIndex={editing ? -1 : 0}
        onFocus={editing ? undefined : () => setEditing(true)}
        onClick={() => setEditing(true)}
      >
        {value ? <CodedText value={value} opts={opts} /> : " "}
      </div>

      {editing && (
        <div
          className={`field-pop${alignEnd ? " align-end" : ""}`}
          ref={popRef}
          role="group"
          aria-label={`Edit ${ariaLabel}`}
          style={popStyle}
        >
          {multiline ? (
            <textarea ref={inputRef} id={id} aria-label={ariaLabel} value={value} onChange={(e) => onChange(e.target.value)} />
          ) : (
            <input ref={inputRef} id={id} aria-label={ariaLabel} value={value} onChange={(e) => onChange(e.target.value)} />
          )}
          <MarkupToolbar onInsert={insertAtCaret} />
          {actions && actions.length > 0 && (
            <div className="quick-actions" role="group" aria-label="Quick insert">
              {actions.map((a) => (
                <button
                  key={a.label}
                  type="button"
                  className="quick-action"
                  title={a.title}
                  // preventDefault keeps focus in the field; onClick replaces the
                  // value with the freshly computed string (faithful to the PDF's
                  // "Set Dates", which set the value rather than appending).
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => onChange(a.run())}
                >
                  {a.label}
                </button>
              ))}
            </div>
          )}
          {options && options.length > 0 && (
            <ul className="autocomplete" aria-label="Preset answers">
              {options.map((o) => (
                // preventDefault on the whole row keeps focus in the field, so a
                // click on the row's padding can't blur-close without inserting.
                <li key={o.code} onMouseDown={(e) => e.preventDefault()}>
                  <button
                    type="button"
                    className="ac-item"
                    style={{ all: "unset", cursor: "pointer", display: "flex", gap: "8px", width: "100%" }}
                    onMouseDown={() => onChange(o.phrase)}
                    onClick={() => onChange(o.phrase)}
                  >
                    <span className="code">{o.code}</span>
                    <CodedText value={o.phrase} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
