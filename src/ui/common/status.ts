/** A transient outcome message for a header action (import or export). The
 *  button reports it up to the host (App), which surfaces it on its own
 *  right-aligned row below the buttons rather than inline beside the button. */
export type ActionStatus = { kind: "error" | "notice"; text: string };
