// Computed quick-insert shortcuts for the field popover. Unlike the static
// preset codes (CODE_LISTS), these are evaluated at click time, so they can
// produce dynamic values a code list can't express — e.g. the current date for
// the MyRev. revision stamp (Date_A), mirroring the original PDF's
// [ToolBox / Set Dates] action which set Date_A to the formatted date.

export interface QuickAction {
  /** Button label shown in the popover. */
  label: string;
  /** Tooltip / accessible description. */
  title: string;
  /** Computes the value to set when clicked (replaces the field value). */
  run: () => string;
}

/** Today's date as a local-time ISO date string (yyyy-mm-dd). Local — not UTC —
 *  so the stamp matches the user's calendar day. */
export function todayISO(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** The dynamic quick-insert actions for a field, keyed by field key (or
 *  undefined when the field has none). */
export function fieldActions(key: string): QuickAction[] | undefined {
  if (key === "Date_A") {
    return [{ label: "Today", title: "Set to today's date (yyyy-mm-dd)", run: () => todayISO() }];
  }
  return undefined;
}
