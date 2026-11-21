// Sunset Platinum — missables page. Retry-3: re-derived.
import { missableTrophies, possiblyMissableTrophies, watchTrophies, auditStats } from "../data.js";
import { getProgress, isEarned } from "../store.js";
import { esc, medalDot } from "../html.js";
import { GRADE_LABELS, MISSABLE_TIER_LABELS } from "../config.js";

const CHAPTERS = [
  [1, "Chapter 1", ["Gone Fishing (first mission)", "Down to Earth (Meet Brian) — the meditation", "Island Dreams (Work for Kenton) — Kenton’s chain opens"]],
  [2, "Chapter 2", ["Coffee Break — Billy’s chain opens; both characters playable", "Breakfast Run (Trust)", "Hit Kingpin Bowling (optional)"]],
  [3, "Chapter 3", ["The Cartel Heist (Break the Bank)", "Andy’s, Randy’s and Tyrone’s chains open", "Yasmani’s Jewelry Jobs — Snap Gun", "Credit Check — Dye Pack Jammer"]],
  [4, "Chapter 4", ["Child’s Play, Headliners, VCIA Takedown", "Starting From Zero (final mission)", "That’s Where The Money Is… — bank vaults open"]],
  [5, "Chapter 5", ["Operation Savage Glory (Snow Storm)"]],
  [6, "Post-story", ["Free-roam: everything for the 100% checklist is still here", "All five questline finales can be finished here (see the dispute)"]],
];

const missCard = (t) => {
  const earnedTag = isEarned(t.id) ? ' <span class="tag">✓ Earned</span>' : "";
  return (
    '<article class="miss-card"><h3>' + medalDot(t.grade) + esc(t.name) +
    ' <span class="tag">' + esc(GRADE_LABELS[t.grade]) + '</span> ' +
    '<span class="tag missable">⚑ ' + esc(MISSABLE_TIER_LABELS[t.missable.tier]) + "</span>" + earnedTag + "</h3>" +
    "<p>" + esc(t.description) + "</p>" +
    '<p class="why">' + esc(t.missable.gate.note) + "</p>" +
    '<p class="why"><b>Last chance:</b> Chapter ' + t.missable.gate.chapter + ", " + esc(t.missable.gate.mission) + ".</p>" +
    '<a class="guide-link" href="#/trophy/' + t.id + '">Guide →</a></article>'
  );
};

const timelineCell = (chapter, list) => {
  const [n, title, gates] = chapter;
  const lastChance = [];
  for (const t of list) {
    if (t.missable.gate.chapter === n) lastChance.push(t);
  }
  const links = lastChance.map((t) => '<a href="#/trophy/' + t.id + '">' + esc(t.name) + "</a>").join(", ");
  const lastLine = lastChance.length
    ? '<p class="tl-last">Last chance: ' + links + "</p>"
    : '<p class="tl-last none">No last chance here.</p>';
  const gateItems = gates.map((g) => "<li>" + esc(g) + "</li>").join("");
  return '<div class="tl-cell"><h4>' + esc(title) + "</h4><ul>" + gateItems + "</ul>" + lastLine + "</div>";
};

export const renderMissables = (root) => {
  const list = missableTrophies();
  let earned = 0;
  for (const t of list) if (isEarned(t.id)) earned += 1;
  const stats = auditStats();
  const cards = [];
  for (const t of list) cards.push(missCard(t));
  const cells = [];
  for (const ch of CHAPTERS) cells.push(timelineCell(ch, list));
  root.innerHTML =
    '<div class="view-head"><h2>Missables — ' + earned + " of " + list.length + " earned</h2>" +
    "<p><b>How this list was built:</b> the v1 guide flagged 12 trophies as missable — every named story mission plus one story choice. That was wrong. PowerPyx’s played-through guide is clear: <b>story trophies cannot be missed</b> (there is no mission replay, but the missions cannot be skipped either), and the 500 Criminal Profile actions come passively. What remains is <b>1 possibly missable</b> trophy and <b>5 watch-list</b> questlines — " +
    stats.possiblyMissable + " + " + stats.watch + " of 55.</p>" +
    "<p><b>Possibly missable (1):</b> Positive Mental Attitude — the Chapter 1 meditation at Jason’s house is gone after Chapter 1, and it is unconfirmed whether the trophy needs it. Do it to be safe.</p>" +
    "<p><b>Watch (5):</b> the five character-questline finales (Andy, Kenton, Billy, Randy, Tyrone). PowerPyx says the questlines stay open after the story; TechWiser (via CryptoGames) warns the chains have story-progress windows. Both versions are shown on each guide page — start each chain when it unlocks and keep it going.</p></div>" +
    "<h3>Timeline — last chances by chapter</h3>" +
    '<div class="timeline">' + cells.join("") + "</div>" +
    '<div class="miss-grid">' + cards.join("") + "</div>";
};
