import type { ReactElement } from "react";
import { PALETTE_HEX } from "../../render/index.ts";

interface Props {
  onInsert: (code: string) => void;
}

// Inserts the common !-codes at the caret so casual users never type a code and
// power users still can (design §04). onMouseDown/preventDefault keeps focus in
// the text input while the button is pressed.
export function MarkupToolbar({ onInsert }: Props): ReactElement {
  const ins = (code: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    onInsert(code);
  };
  const suit = (glyph: string, code: string, cls: string) => (
    <button type="button" className={cls} title={`Insert ${code}`} onMouseDown={ins(code)}>
      {glyph}
    </button>
  );
  const colour = (idx: number, name: string) => (
    <button
      type="button"
      className="swatch"
      title={`Colour ${name} (!${idx})`}
      style={{ background: PALETTE_HEX[idx] }}
      onMouseDown={ins(`!${idx}`)}
    >
      &nbsp;
    </button>
  );
  return (
    <div className="toolbar" role="toolbar" aria-label="Insert markup">
      {suit("♠", "!S", "suit-S")}
      {suit("♥", "!H", "suit-H")}
      {suit("♦", "!D", "suit-D")}
      {suit("♣", "!C", "suit-C")}
      <span className="sep" />
      {colour(0, "black")}
      {colour(1, "red")}
      {colour(2, "blue")}
      {colour(4, "green")}
      <span className="sep" />
      <button type="button" title="Bold (!b)" style={{ fontWeight: 700 }} onMouseDown={ins("!b")}>
        B
      </button>
      <button type="button" title="Italic (!i)" style={{ fontStyle: "italic" }} onMouseDown={ins("!i")}>
        I
      </button>
      <button type="button" title="Underline (!u)" style={{ textDecoration: "underline" }} onMouseDown={ins("!u")}>
        U
      </button>
      <span className="sep" />
      <button type="button" title="Superscript (!^)" onMouseDown={ins("!^")}>
        x²
      </button>
      <button type="button" title="Subscript (!v)" onMouseDown={ins("!v")}>
        x₂
      </button>
    </div>
  );
}
