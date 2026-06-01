import type { Card } from "../model/index.ts";

// Card identity & import resolution. The full replace / keep-both / compare UI
// lands in M3, but the *branch* is pure logic and the identity stamps (id +
// revision) are carried from M0, so the rule lives here, tested, ready to wire.
//
// Design §03/§10:
//  • Unknown id (every legacy file — it has none of ours) → a NEW card.
//  • Known id → our plan again. Use revision.parent to tell linear succession
//    (their rev descends from mine → safe replace) from a fork (both descend
//    from a shared rev → must compare). Absent a parent link, do NOT auto-pick a
//    winner by timestamp — route to compare.

export type ImportRelation =
  | { kind: "new" }
  | { kind: "succession"; newer: "incoming" | "local" }
  | { kind: "fork" };

export function classifyImport(local: Card | null, incoming: Card): ImportRelation {
  if (!local || local.id !== incoming.id) return { kind: "new" };
  const l = local.revision.counter;
  const i = incoming.revision.counter;
  if (incoming.revision.parent === l && i > l) return { kind: "succession", newer: "incoming" };
  if (local.revision.parent === i && l > i) return { kind: "succession", newer: "local" };
  return { kind: "fork" };
}
