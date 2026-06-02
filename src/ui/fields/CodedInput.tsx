import { type ReactElement, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { CodedText } from "../../render/index.ts";
import type { CodeOption } from "../../content/codelists.ts";
import { MarkupToolbar } from "./MarkupToolbar.tsx";

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
}

// The dual-mode field editor (design §04): the value shows rendered by default;
// clicking opens the raw monospace source with a live preview, a markup toolbar,
// and — for coded fields — an autocomplete. The editor is a POPOVER floating over
// the card: the display box stays in the layout (same height) so editing one
// field never reflows the page.
export function CodedInput({ value, onChange, ariaLabel, multiline, options, codeList }: Props): ReactElement {
  const [editing, setEditing] = useState(false);
  // The popover opens downward, left-aligned by default; on open we measure and
  // flip to right-aligned if a left-aligned box would spill past the viewport
  // (narrow fields in the right column), then scroll it fully into view.
  const [alignEnd, setAlignEnd] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const displayRef = useRef<HTMLDivElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement & HTMLInputElement>(null);
  // Set when a keyboard action (Escape) closes the editor, so focus returns to
  // the box it grew from rather than falling to <body>. Stays false for
  // blur-close (the user moved focus away deliberately).
  const restoreFocus = useRef(false);
  const id = useId();

  // Keep the popover on-screen: right-align when a left-aligned box would
  // overflow the viewport. Runs before paint to avoid a wrong-side flash.
  useLayoutEffect(() => {
    if (!editing) return;
    const anchor = wrapRef.current;
    const pop = popRef.current;
    if (!anchor || !pop) return;
    const a = anchor.getBoundingClientRect();
    const vw = document.documentElement.clientWidth;
    setAlignEnd(a.left + pop.offsetWidth > vw - 8);
  }, [editing]);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus({ preventScroll: true });
      // Bring the whole editor into view (tall coded popovers near the fold).
      try {
        popRef.current?.scrollIntoView({ block: "nearest" });
      } catch {
        /* jsdom / unsupported — positioning is best-effort */
      }
    } else if (restoreFocus.current) {
      restoreFocus.current = false;
      displayRef.current?.focus();
    }
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

  return (
    <div className="coded-input" ref={wrapRef} onBlur={onBlur}>
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
        <div className={`field-pop${alignEnd ? " align-end" : ""}`} ref={popRef} role="group" aria-label={`Edit ${ariaLabel}`}>
          {multiline ? (
            <textarea ref={inputRef} id={id} aria-label={ariaLabel} value={value} onChange={(e) => onChange(e.target.value)} />
          ) : (
            <input ref={inputRef} id={id} aria-label={ariaLabel} value={value} onChange={(e) => onChange(e.target.value)} />
          )}
          <MarkupToolbar onInsert={insertAtCaret} />
          <div className="field-preview" aria-hidden="true">
            <span className="lbl">Preview</span>
            {value ? <CodedText value={value} opts={opts} /> : <span className="empty">nothing yet</span>}
          </div>
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
