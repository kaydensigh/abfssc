import { type ReactElement, useEffect, useRef, useState } from "react";

// The brand title doubles as an "about" button: clicking it drops a short note
// to the ABF just below the title — who made this and how to get in touch. The
// popover floats over the header (absolute), so opening it never reflows the bar.
export function BrandTitle(): ReactElement {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Close on Escape or a pointer-down outside the brand + popover.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node | null)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
    };
  }, [open]);

  return (
    <div className="brand" ref={wrapRef}>
      <span className="suits" aria-hidden="true">
        <span>♠</span>
        <span className="r">♥</span>
        <span className="r">♦</span>
        <span>♣</span>
      </span>
      <button
        type="button"
        className="brand-name"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        ABF Standard System Card
      </button>
      {open && (
        <div className="brand-pop" role="dialog" aria-label="About this card">
          Dear ABF, this was made with love and the goal of making your system
          card easier to use. If you have any concerns, please{" "}
          <a href="mailto:abfssc@googlegroups.com">contact me</a>.
        </div>
      )}
    </div>
  );
}
