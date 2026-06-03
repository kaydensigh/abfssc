// Legacy field-name normalization — a faithful port of the form's own migration
// DSL so that pre-2020 ABF cards (and FDF files) map onto our canonical field
// names on import. The rules and the loop that applies them come verbatim from
// the form's JS (`gRtFL` + `gMRFL`/`gARFE` in abf/extracted/beautified_*.js);
// we materialise the concrete old→new pairs by running the loop against our
// current model field-name list, exactly as the design (§05) prescribes.
//
// Direction: gARFE(old, new) registers `old → new`, and the new field must
// exist in the current form. The three templated rules (`~`) are prefix +
// substring substitutions with `!`-delimited ignore-tokens; the rest are plain
// OLD>NEW pairs. On import we look each raw field name up in the resulting map.

import { OPENINGS, GRID_CELLS, gridFieldName, allTextFieldKeys, FLAG_KEYS } from "../model/index.ts";

/**
 * The form's retired-field DSL, transcribed exactly from `_openaction_clean.js`
 * (`var gRtFL='…'`). Space-separated rules; `~` marks a templated rule.
 */
export const G_RT_FL =
  "Player~.>_ Resp~.O>_O Resp!ons!Oth!._~._>_ Resp1NT2COther>Resp1NT2CStyle " +
  "JumpRaiseMinorOther>JumpRaiseMinor JumpRaiseMajorOther>JumpRaiseMajor " +
  "UnusualNTOther>UnusualNoTrump Over1NTInterfMore>Over1NTInterf";

/** Every canonical field name our model owns (the current form's editable set). */
export function currentModelNames(): string[] {
  const names = [...allTextFieldKeys(), ...FLAG_KEYS, "Classification"];
  for (const opening of OPENINGS) {
    for (const bid of GRID_CELLS[opening]) names.push(gridFieldName(opening, bid));
  }
  return names;
}

/**
 * Port of `gMRFL`: walk `gRtFL` against `currentNames` and return the concrete
 * `old → new` rename map. Two faithfulness rules from `gARFE`, plus one of ours:
 *  • a rule is only registered if its NEW name exists in the current set
 *    (gARFE bails when `getField(new)` is null);
 *  • we additionally DROP any rule whose OLD name is itself a current model
 *    field — we never rename away a value that has its own editable home (this
 *    is what keeps our dotted legacy mirrors from clobbering the flat cells).
 *
 * The four `…Other/More>parent` rules ARE active here, on purpose: the overflow
 * inputs (JumpRaiseMinorOther, …) are NOT model fields — we drop them because
 * the real form keeps them off-page/Hidden and never displays them (see
 * src/model/sections.ts §4). So a legacy value found under an old `…Other` name
 * folds into the visible parent (the original form's own gMRFL merge) instead of
 * being lost. Our own exports never write those fields, so the round-trip is
 * unaffected.
 */
export function buildRenameMap(currentNames: string[]): Map<string, string> {
  const nameSet = new Set(currentNames);
  const map = new Map<string, string>();

  const add = (oldName: string, newName: string): void => {
    if (oldName === newName) return;
    if (!nameSet.has(newName)) return; // gARFE: the new (target) field must exist
    if (nameSet.has(oldName)) return; // never rename a value off its own home (see doc)
    map.set(oldName, newName);
  };

  for (const rule of G_RT_FL.split(" ")) {
    if (rule.length === 0) continue;
    const tilde = rule.indexOf("~");
    if (tilde > 0) {
      // Templated rule: "<prefix>[!ign…]~<oldSub>><newSub>".
      let prefix = rule.slice(0, tilde);
      const ignores: string[] = [];
      const parts = prefix.split("!");
      if (parts.length > 1) {
        prefix = parts[0];
        for (let i = 1; i < parts.length; i++) ignores.push(parts[i]);
      }
      const gt = rule.slice(tilde + 1).split(">");
      if (gt.length !== 2) continue;
      const [oldSub, newSub] = gt;
      const newSubLen = newSub.length;
      for (const nm of currentNames) {
        if (nm.slice(0, prefix.length) !== prefix) continue;
        // The original uses indexOf(ig) > 0 (token must NOT sit at index 0).
        if (ignores.some((ig) => nm.indexOf(ig) > 0)) continue;
        const ix = nm.indexOf(newSub);
        if (ix < 0) continue;
        const oldName = nm.slice(0, ix) + oldSub + nm.slice(ix + newSubLen);
        add(oldName, nm);
      }
    } else {
      const gt = rule.split(">");
      if (gt.length === 2) add(gt[0], gt[1]);
    }
  }
  return map;
}

/** Materialised once against the live model field set. */
export const RENAME_MAP: ReadonlyMap<string, string> = buildRenameMap(currentModelNames());

/**
 * Normalise a raw (possibly legacy) field name to its canonical current form.
 * Unknown names pass through unchanged — they're logged at a higher layer if
 * they fail to map onto a model field.
 */
export function normalizeFieldName(raw: string): string {
  return RENAME_MAP.get(raw) ?? raw;
}
