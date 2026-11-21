import { missableTrophies, possiblyMissableTrophies, watchTrophies, auditStats } from "../data.js";
import { getProgress, isEarned } from "../store.js";
import { esc, medalDot } from "../html.js";
import { GRADE_LABELS, MISSABLE_TIER_LABELS } from "../config.js";

// Sunset Platinum — missables page. Retry: one clean recording.
const CHAPTERS = [
  { n: 1, title: "Chapter 1", gates: ["Gone Fishing (first mission)", "Down to Earth (Meet Brian) — the meditation", "Island Dreams (Work for Kenton) — Kenton’s chain opens"] },
  { n: 2, title: "Chapter 2", gates: ["Coffee Break — Billy’s chain opens; both characters playable", "Breakfast Run (Trust)", "Hit Kingpin Bowling (optional)"] },
  { n: 3, title: "Chapter 3", gates: ["The Cartel Heist (Break the Bank)", "Andy’s, Randy’s and Tyrone’s chains open", "Yasmani’s Jewelry Jobs — Snap Gun", "Credit Check — Dye Pack Jammer"] },
  { n: 4, title: "Chapter 4", gates: ["Child’s Play, Headliners, VCIA Takedown", "Starting From Zero (final mission)", "That’s Where The Money Is… — bank vaults open"] },
  { n: 5, title: "Chapter 5", gates: ["Operation Savage Glory (Snow Storm)"] },
  { n: 6, title: "Post-story", gates: ["Free-roam: everything for the 100% checklist is still here", "All five questline finales can be finished here (see the dispute)"] },
];

const missCard = (t) => `<article class="miss-card"><h3>${medalDot(t.grade)}${esc(t.name)} <span class="tag">${esc(GRADE_LABELS[t.grade])}</span> <span class="tag missable">⚑ ${esc(MISSABLE_TIER_LABELS[t.missable.tier])}</span>`
  + (isEarned(t.id) ? ` <span class="tag">✓ Earned</span>` : "") + `</h3>`
  + `<p>${esc(t.description)}</p>`
  + `<p class="why">${esc(t.missable.gate.note)}</p>`
  + `<p class="why"><b>Last chance:</b> Chapter ${t.missable.gate.chapter}, ${esc(t.missable.gate.mission)}.</p>`
  + `<a class="guide-link" href="#/trophy/${t.id}">Guide →</a></article>`;

const timelineCell = (ch, list) => {
  const lastChance = list.filter((t) => t.missable.gate.chapter === ch.n);
  const lastLine = lastChance.length
    ? `<p class="tl-last">Last chance: ${lastChance.map((t) => `<a href="#/trophy/${t.id}">${esc(t.name)}</a>`).join(", ")}</p>`
    : `<p class="tl-last none">No last chance here.</p>`;
  return `<div class="tl-cell"><h4>${esc(ch.title)}</h4>`
    + `<ul>${ch.gates.map((g) => `<li>${esc(g)}</li>`).join("")}</ul>`
    + lastLine + `</div>`;
};

export const renderMissables = (root) => {
  const list = missableTrophies();
  const earned = list.filter((t) => isEarned(t.id)).length;
  const stats = auditStats();
  const cards = list.map(missCard).join("");
  const timeline = CHAPTERS.map((ch) => timelineCell(ch, list)).join("");
  root.innerHTML = `<div class="view-head"><h2>Missables — ${earned} of ${list.length} earned</h2>`
    + `<p><b>How this list was built:</b> the v1 guide flagged 12 trophies as missable — every named story mission plus one story choice. That was wrong. PowerPyx’s played-through guide is clear: <b>story trophies cannot be missed</b> (there is no mission replay, but the missions cannot be skipped either), and the 500 Criminal Profile actions come passively. What remains is <b>1 possibly missable</b> trophy and <b>5 watch-list</b> questlines — ${stats.possiblyMissable} + ${stats.watch} of 55.</p>`
    + `<p><b>Possibly missable (1):</b> Positive Mental Attitude — the Chapter 1 meditation at Jason’s house is gone after Chapter 1, and it is unconfirmed whether the trophy needs it. Do it to be safe.</p>`
    + `<p><b>Watch (5):</b> the five character-questline finales (Andy, Kenton, Billy, Randy, Tyrone). PowerPyx says the questlines stay open after the story; TechWiser (via CryptoGames) warns the chains have story-progress windows. Both versions are shown on each guide page — start each chain when it unlocks and keep it going.</p></div>`
    + `<h3>Timeline — last chances by chapter</h3>`
    + `<div class="timeline">${timeline}</div>`
    + `<div class="miss-grid">${cards}</div>`;
};
// Retry: single clean recording — content unchanged.
