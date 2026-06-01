// The four "pages" of the screen card — a presentation-only grouping layered
// over SECTIONS. It mirrors the original ABF card's four printed panels (front
// cover + the three following panels), so the on-screen card reads in the same
// chunks a player knows from paper, while editing stays in natural 1→10 order.
//
// This does NOT touch SECTIONS (the empty-card factory and the model tests still
// walk that registry); it only decides which sections stack on which page.

export interface PageDef {
  /** "p1".."p4" — used in the nav, aria ids. */
  id: string;
  /** 1..4, shown as a badge in the nav and page header. */
  number: number;
  /** Page title shown in the nav tab and the page header. */
  title: string;
  /** Section ids (from SECTIONS) rendered top-to-bottom inside this page. */
  sectionIds: readonly string[];
}

export const PAGES: readonly PageDef[] = [
  { id: "p1", number: 1, title: "Openings & Competitive", sectionIds: ["masthead", "s1", "s2", "s3"] },
  { id: "p2", number: 2, title: "Responses & Play", sectionIds: ["s4", "s5", "s6", "s7"] },
  { id: "p3", number: 3, title: "Responses to Openings", sectionIds: ["s8"] },
  { id: "p4", number: 4, title: "Conventions & Notes", sectionIds: ["s9", "s10"] },
];

export const PAGE_BY_ID: Readonly<Record<string, PageDef>> = Object.fromEntries(PAGES.map((p) => [p.id, p]));
