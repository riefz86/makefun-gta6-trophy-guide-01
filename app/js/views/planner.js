import { allTrophies, trophyById } from "../data.js";
import { getProgress, isEarned, isNext } from "../store.js";
import { esc, medalDot } from "../html.js";
import { GRADE_LABELS } from "../config.js";

// Sunset Platinum — Next up planner. Retry-2: one clean recording.
const rankPlanner = (a, b) => {
  const miss = (a.missable ? 0 : 1) - (b.missable ? 0 : 1);
  if (miss !== 0) return miss;
  if (a.stage !== b.stage) return a.stage - b.stage;
  return a.id - b.id;
};

const plannerRow = (t) => {
  const earned = isEarned(t.id);
  const cls = earned ? " earned" : "";
  const mark = earned ? "✓" : "";
  const missTag = t.missable ? `<span class="tag missable">⚑ Missable</span>` : "";
  const nextLabel = isNext(t.id) ? "★ Remove" : "☆ Next up";
  const head = `<article class="trophy-row${cls}" data-id="${t.id}">`
    + `<button type="button" class="check" data-action="toggle-earned" data-id="${t.id}" aria-label="Mark ${esc(t.name)} earned">${mark}</button>`;
  const body = `<div><h3>${medalDot(t.grade)}${esc(t.name)}</h3><p class="desc">${esc(t.description)}</p>`
    + `<div class="meta"><span class="tag">${esc(GRADE_LABELS[t.grade])}</span><span class="tag">Stage ${t.stage}</span>${missTag}</div></div>`;
  const side = `<div class="row-side"><button type="button" class="btn ghost small" data-action="toggle-next" data-id="${t.id}">${nextLabel}</button><a class="guide-link" href="#/trophy/${t.id}">Guide →</a></div></article>`;
  return head + body + side;
};

const renderList = (rows) => {
  const parts = [];
  for (const t of rows) parts.push(plannerRow(t));
  return parts.join("");
};

export const renderPlanner = (root) => {
  const progress = getProgress();
  const starred = [];
  for (const id of progress.next) {
    const t = trophyById(id);
    if (t) starred.push(t);
  }
  starred.sort(rankPlanner);
  const suggested = [];
  for (const t of allTrophies()) {
    if (!isEarned(t.id) && !isNext(t.id)) suggested.push(t);
  }
  suggested.sort(rankPlanner);
  const top3 = suggested.slice(0, 3);
  const starredHtml = renderList(starred) || `<p class="empty">Nothing starred yet. Open any trophy and tap ☆ Add to Next up.</p>`;
  const suggestedHtml = renderList(top3) || `<p class="empty">Everything is earned — the platinum is yours.</p>`;
  root.innerHTML = `<div class="view-head"><h2>Next up</h2>`
    + `<p>Star a trophy anywhere in the guide (☆ on its row or its guide page) and it lands here, missables first, in roadmap order. Finish what is starred, then take the next suggestion.</p></div>`
    + `<h3>Your list (${starred.length})</h3>`
    + `<div class="next-list">${starredHtml}</div>`
    + `<h3 style="margin-top:22px">Suggested next</h3>`
    + `<div class="next-list">${suggestedHtml}</div>`;
};
// Retry-2: single clean recording — content unchanged.
