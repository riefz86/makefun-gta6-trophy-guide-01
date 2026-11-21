import { allTrophies, trophyById } from "../data.js";
import { getProgress, isEarned, isNext } from "../store.js";
import { esc, medalDot } from "../html.js";
import { GRADE_LABELS } from "../config.js";

// Sunset Platinum — Next up planner. Retry: one clean recording.
const byMissableStage = (a, b) => (a.missable ? 0 : 1) - (b.missable ? 0 : 1) || a.stage - b.stage || a.id - b.id;

const plannerRow = (t) => `<article class="trophy-row${isEarned(t.id) ? " earned" : ""}" data-id="${t.id}">`
  + `<button type="button" class="check" data-action="toggle-earned" data-id="${t.id}" aria-label="Mark ${esc(t.name)} earned">${isEarned(t.id) ? "✓" : ""}</button>`
  + `<div><h3>${medalDot(t.grade)}${esc(t.name)}</h3><p class="desc">${esc(t.description)}</p>`
  + `<div class="meta"><span class="tag">${esc(GRADE_LABELS[t.grade])}</span><span class="tag">Stage ${t.stage}</span>`
  + (t.missable ? `<span class="tag missable">⚑ Missable</span>` : "") + `</div></div>`
  + `<div class="row-side"><button type="button" class="btn ghost small" data-action="toggle-next" data-id="${t.id}">${isNext(t.id) ? "★ Remove" : "☆ Next up"}</button><a class="guide-link" href="#/trophy/${t.id}">Guide →</a></div></article>`;

export const renderPlanner = (root) => {
  const progress = getProgress();
  const starred = progress.next
    .map((id) => trophyById(id))
    .filter((t) => t)
    .sort(byMissableStage);
  const suggested = allTrophies()
    .filter((t) => !isEarned(t.id) && !isNext(t.id))
    .sort(byMissableStage)
    .slice(0, 3);
  root.innerHTML = `<div class="view-head"><h2>Next up</h2>`
    + `<p>Star a trophy anywhere in the guide (☆ on its row or its guide page) and it lands here, missables first, in roadmap order. Finish what is starred, then take the next suggestion.</p></div>`
    + `<h3>Your list (${starred.length})</h3>`
    + `<div class="next-list">${starred.map(plannerRow).join("") || `<p class="empty">Nothing starred yet. Open any trophy and tap ☆ Add to Next up.</p>`}</div>`
    + `<h3 style="margin-top:22px">Suggested next</h3>`
    + `<div class="next-list">${suggested.map(plannerRow).join("") || `<p class="empty">Everything is earned — the platinum is yours.</p>`}</div>`;
};
// Retry: single clean recording — content unchanged.
