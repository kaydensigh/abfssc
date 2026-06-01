import { type ReactElement, useEffect, useId, useRef, useState } from "react";
import { CodedText } from "../../render/index.ts";
import type { CodeOption } from "../../content/codelists.ts";
import { MarkupToolbar } from "./MarkupToolbar.tsx";

interface Props {
  value: string;
  onChange: (v: string) => void;
  /** Accessible label (the visible label is rendered by the field wrapper). */
  ariaLabel: string;
  multiline?: boolean;
  placeholder?: string;
  /** Autocomplete options for a coded field (selecting inserts the phrase). */
  options?: CodeOption[];
  /** Layer-A map so a bare code renders expanded in the preview/display. */
  codeList?: Record<string, string>;
}

// The dual-mode field editor (design §04): the value shows rendered by default;
// on focus it reveals the raw monospace source with a live preview, a markup
// toolbar, and — for coded fields — an autocomplete seeded from the code list.
export function CodedInput({
  value,
  onChange,
  ariaLabel,
  multiline,
  placeholder,
  options,
  codeList,
}: Props): ReactElement {
  const [editing, setEditing] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement & HTMLInputElement>(null);
  const id = useId();

  useEffect(() => {
    if (editing) inputRef.current?.focus();
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

  if (!editing) {
    return (
      <div
        className={`field-display${value ? "" : " empty"}`}
        role="textbox"
        aria-label={ariaLabel}
        tabIndex={0}
        onFocus={() => setEditing(true)}
        onClick={() => setEditing(true)}
      >
        {value ? <CodedText value={value} opts={opts} /> : (placeholder ?? "—")}
      </div>
    );
  }

  return (
    <div className="field-edit" ref={wrapRef} onBlur={onBlur}>
      {multiline ? (
        <textarea
          ref={inputRef}
          id={id}
          aria-label={ariaLabel}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          ref={inputRef}
          id={id}
          aria-label={ariaLabel}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
      <MarkupToolbar onInsert={insertAtCaret} />
      <div className="field-preview" aria-hidden="true">
        <span className="lbl">Preview</span>
        {value ? <CodedText value={value} opts={opts} /> : <span className="empty">nothing yet</span>}
      </div>
      {options && options.length > 0 && (
        <ul className="autocomplete" aria-label="Preset answers">
          {options.map((o) => (
            <li key={o.code}>
              <button
                type="button"
                className="ac-item"
                style={{ all: "unset", cursor: "pointer", display: "flex", gap: "8px", width: "100%" }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  onChange(o.phrase);
                }}
              >
                <span className="code">{o.code}</span>
                <CodedText value={o.phrase} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
