import { GRADE_LABELS, KIND_LABELS, MISSABLE_TIER_LABELS } from "../config.js";
import { allTrophies, auditStats, trophyById } from "../data.js";
import { getProgress, isEarned, getCount, isNext, saveProgress } from "../store.js";
import { filterTrophies, sortTrophies, spoilerHidden } from "../filters.js";
import { esc, medalDot, fmt } from "../html.js";

// Sunset Platinum — tracker checklist. Retry: one clean recording.
const KINDS = ["all", "story", "missable", "collectible", "activity", "world"];

const auditCells = () => {
  const a = auditStats();
  const cells = [
    [`${a.official}/${a.totalTrophies}`, "official names, descriptions & grades verified"],
    [`${a.citedClaims}/${a.totalClaims}`, "guide steps cited"],
    [`${a.twoPlusClaims}`, "claims with 2+ sources"],
    [`${a.sourcePages} pages · ${a.sourceSites} sites`, `sources read ${a.readDate}`],
    [`${a.disputes}`, "disputes shown two-way"],
    [`${a.unconfirmed}`, "methods unconfirmed"],
  ];
  return `<section class="audit" aria-label="Data audit">${cells.map(([big, small]) => `<div class="audit-cell"><span class="audit-big">${esc(big)}</span><span class="audit-small">${esc(small)}</span></div>`).join("")}</section>`;
};

const kindLabel = (kind) => {
  if (kind === "all") return "All";
  if (kind === "missable") return "Missable";
  return KIND_LABELS[kind];
};

const option = (value, label, current) => `<option value="${value}"${current === value ? " selected" : ""}>${label}</option>`;

const bind = (id, event, handler) => {
  const el = document.getElementById(id);
  if (el) el.addEventListener(event, handler);
};

export const renderChecklist = (root, ui) => {
  const progress = getProgress();
  const kindChips = KINDS.map((kind) => `<button type="button" class="chip" data-action="set-kind" data-kind="${kind}" aria-pressed="${ui.kind === kind}">${esc(kindLabel(kind))}</button>`).join("");
  const gradeOptions = ["all", "platinum", "gold", "silver", "bronze"]
    .map((g) => option(g, g === "all" ? "All grades" : GRADE_LABELS[g], ui.grade)).join("");
  const sortOptions = [["psn", "PSN order"], ["stage", "Roadmap order"], ["grade", "By grade"], ["name", "A–Z"]]
    .map(([value, label]) => option(value, label, ui.sort)).join("");
  root.innerHTML = `<div class="view-head"><h2>Tracker</h2>`
    + `<p>Every one of the 55 official trophies with its <b>official name, description and grade</b>. Tick one off when you earn it — progress is saved in this browser. Open a trophy for its full guide, with every step cited. The audit strip below is computed from the guide’s own data.</p></div>`
    + auditCells()
    + `<div class="controls">`
    + `<input id="search" type="search" placeholder="Search name, description, guide or steps…  ( / )" value="${esc(ui.query)}" aria-label="Search trophies">`
    + `<select id="grade" aria-label="Filter by grade">${gradeOptions}</select>`
    + `<select id="sort" aria-label="Sort trophies">${sortOptions}</select>`
    + `<label class="toggle"><input id="hide-earned" type="checkbox"${progress.settings.hideEarned ? " checked" : ""}> Hide earned</label>`
    + `<label class="toggle"><input id="spoilers" type="checkbox"${progress.settings.spoilers ? " checked" : ""}> Spoiler shield</label>`
    + `</div>`
    + `<div class="controls flags">`
    + `<label class="toggle"><input id="flag-disputed" type="checkbox"${ui.disputed ? " checked" : ""}> Disputed only</label>`
    + `<label class="toggle"><input id="flag-hidden" type="checkbox"${ui.hiddenOnly ? " checked" : ""}> PSN-hidden only (28)</label>`
    + `<label class="toggle"><input id="flag-not-earned" type="checkbox"${ui.notEarned ? " checked" : ""}> Not earned</label>`
    + `</div>`
    + `<div class="kind-chips" role="group" aria-label="Filter by kind">${kindChips}</div>`
    + `<p class="count-line" id="count-line"></p>`
    + `<div class="tracker-layout"><div id="rows" class="rows"></div><aside class="next-sidebar" id="next-sidebar" aria-label="Next up"></aside></div>`;
  bind("search", "input", () => { ui.query = document.getElementById("search").value; renderRows(ui); });
  bind("grade", "change", (event) => { ui.grade = event.target.value; renderRows(ui); });
  bind("sort", "change", (event) => { ui.sort = event.target.value; renderRows(ui); });
  bind("hide-earned", "change", (event) => { progress.settings.hideEarned = event.target.checked; saveSettingsAndRefresh(ui); });
  bind("spoilers", "change", (event) => { progress.settings.spoilers = event.target.checked; saveSettingsAndRefresh(ui); });
  bind("flag-disputed", "change", (event) => { ui.disputed = event.target.checked; renderRows(ui); });
  bind("flag-hidden", "change", (event) => { ui.hiddenOnly = event.target.checked; renderRows(ui); });
  bind("flag-not-earned", "change", (event) => { ui.notEarned = event.target.checked; renderRows(ui); });
  renderRows(ui);
};

const saveSettingsAndRefresh = (ui) => {
  saveProgress();
  renderRows(ui);
};

export const renderRows = (ui) => {
  const progress = getProgress();
  const rowsEl = document.getElementById("rows");
  if (!rowsEl) return;
  const filtered = sortTrophies(filterTrophies(allTrophies(), {
    kind: ui.kind, grade: ui.grade, query: ui.query,
    hideEarned: progress.settings.hideEarned, disputed: ui.disputed,
    hiddenOnly: ui.hiddenOnly, notEarned: ui.notEarned, earnedIds: progress.earned,
  }), ui.sort);
  const countLine = document.getElementById("count-line");
  if (countLine) {
    countLine.textContent = `Showing ${filtered.length} of 55 trophies`
      + (progress.settings.spoilers ? " · spoiler shield on — PSN-hidden trophies hidden until earned" : "");
  }
  rowsEl.innerHTML = filtered.map((t) => rowHtml(t, progress)).join("") || `<p class="empty">No trophies match these filters.</p>`;
  renderNextSidebar();
};

const renderNextSidebar = () => {
  const el = document.getElementById("next-sidebar");
  if (!el) return;
  const progress = getProgress();
  const starred = progress.next
    .map((id) => trophyById(id))
    .filter((t) => t)
    .sort((a, b) => (a.missable ? 0 : 1) - (b.missable ? 0 : 1) || a.stage - b.stage || a.id - b.id);
  const items = starred.map((t) => `<li class="${isEarned(t.id) ? "done" : ""}"><a href="#/trophy/${t.id}">${esc(t.name)}</a>`
    + (t.missable ? ` <span class="tag missable">${esc(MISSABLE_TIER_LABELS[t.missable.tier])}</span>` : "") + `</li>`).join("");
  el.innerHTML = `<h3>Next up</h3>`
    + `<p>Star a trophy (☆) and it lands here, missables first, in roadmap order.</p>`
    + (items ? `<ul class="next-side-list">${items}</ul>` : `<p class="empty">Nothing starred yet. Open any trophy and tap ☆ Add to Next up.</p>`)
    + `<p><a href="#/planner">Open the planner →</a></p>`;
};

const rowTags = (t, progress) => {
  const tags = [];
  tags.push(`<span class="tag">${esc(GRADE_LABELS[t.grade])}</span>`);
  tags.push(`<span class="tag psn-num">#${t.id} of 55</span>`);
  if (t.kind !== "platinum") tags.push(`<span class="tag">${esc(KIND_LABELS[t.kind])}</span>`);
  if (t.missable) tags.push(`<span class="tag missable">⚑ ${esc(MISSABLE_TIER_LABELS[t.missable.tier])}</span>`);
  if (t.disputed) tags.push(`<span class="tag disputed">Sources differ</span>`);
  if (t.unconfirmed) tags.push(`<span class="tag unconfirmed">Method unconfirmed</span>`);
  if (t.hidden) tags.push(`<span class="tag hidden-tag">PSN-hidden</span>`);
  if (t.story) tags.push(`<span class="tag story">Story</span>`);
  if (t.psn) {
    const count = getCount(t.id);
    const pct = t.psn.target ? Math.round((count / t.psn.target) * 100) : 0;
    tags.push(`<span class="tag psn">PSN ${fmt(count)}/${fmt(t.psn.target)} ${esc(t.psn.unit)} · ${pct}%</span>`);
  }
  if (progress.notes[t.id]) tags.push(`<span class="tag">✎ Note</span>`);
  if (isNext(t.id)) tags.push(`<span class="tag">★ Next up</span>`);
  return tags.join("");
};

const rowHtml = (t, progress) => {
  const earned = isEarned(t.id);
  const hidden = spoilerHidden(t, progress.settings, earned);
  const count = t.psn ? getCount(t.id) : 0;
  const excerpt = hidden ? "" : t.guide.length > 150 ? t.guide.slice(0, 150) + "…" : t.guide;
  const nameBlock = hidden
    ? `<h3>${medalDot(t.grade)}<span class="hidden-mask">Hidden trophy — PSN-hidden, hidden until earned</span></h3>`
      + `<p class="desc hidden-mask">The spoiler shield hides this trophy’s name and description. Turn it off in Settings to reveal it, or earn it in the game.</p>`
    : `<h3>${medalDot(t.grade)}${esc(t.name)}</h3><p class="desc">${esc(t.description)}</p><p class="excerpt">${esc(excerpt)}</p>`;
  const stepper = t.psn
    ? `<span class="stepper"><button type="button" data-action="count-minus" data-id="${t.id}" aria-label="Decrease counter">−</button><span>${fmt(count)} / ${fmt(t.psn.target)}</span><button type="button" data-action="count-plus" data-id="${t.id}" aria-label="Increase counter">+</button></span>`
    : "";
  return `<article class="trophy-row${earned ? " earned" : ""}" data-id="${t.id}">`
    + `<button type="button" class="check" data-action="toggle-earned" data-id="${t.id}" aria-label="Mark ${esc(t.name)} earned">${earned ? "✓" : ""}</button>`
    + `<div>${nameBlock}<div class="meta">${rowTags(t, progress)}</div></div>`
    + `<div class="row-side">${stepper}<a class="guide-link" href="#/trophy/${t.id}">Guide →</a></div></article>`;
};
// Retry: single clean recording — content unchanged.
