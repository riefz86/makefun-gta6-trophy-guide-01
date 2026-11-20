// Tracker checklist: controls (search, kind, grade, spoilers) plus one row per trophy.
import { GRADE_LABELS, KIND_LABELS } from '../config.js';
import { allTrophies, trophyById } from '../data.js';
import { getProgress, isEarned, getCount, isNext, saveProgress } from '../store.js';
import { filterTrophies, spoilerHidden } from '../filters.js';
import { esc, medalDot } from '../html.js';

const KINDS = ['all', 'story', 'missable', 'collectible', 'activity', 'world'];

/** Render the tracker view: controls once, rows through renderRows. */
export function renderChecklist(root, ui) {
  const progress = getProgress();
  const kindChips = KINDS.map((kind) => {
    const label = kind === 'all' ? 'All' : kind === 'missable' ? 'Missable' : KIND_LABELS[kind];
    return (
      '<button type="button" class="chip" data-action="set-kind" data-kind="' +
      kind +
      '" aria-pressed="' +
      (ui.kind === kind) +
      '">' +
      esc(label) +
      '</button>'
    );
  }).join('');
  const gradeOptions = ['all', 'platinum', 'gold', 'silver', 'bronze']
    .map(
      (g) =>
        '<option value="' +
        g +
        '"' +
        (ui.grade === g ? ' selected' : '') +
        '>' +
        (g === 'all' ? 'All grades' : GRADE_LABELS[g]) +
        '</option>',
    )
    .join('');
  root.innerHTML =
    '<div class="view-head"><h2>Tracker</h2>' +
    '<p>Every one of the 55 official trophies with its <b>official name, description and grade</b>. Tick one off when you earn it — progress is saved in this browser. Open a trophy for its full guide and sources.</p></div>' +
    '<div class="controls">' +
    '<input id="search" type="search" placeholder="Search name, description or guide…  ( / )" value="' +
    esc(ui.query) +
    '" aria-label="Search trophies">' +
    '<select id="grade" aria-label="Filter by grade">' +
    gradeOptions +
    '</select>' +
    '<label class="toggle"><input id="hide-earned" type="checkbox"' +
    (progress.settings.hideEarned ? ' checked' : '') +
    '> Hide earned</label>' +
    '<label class="toggle"><input id="spoilers" type="checkbox"' +
    (progress.settings.spoilers ? ' checked' : '') +
    '> Hide story spoilers</label>' +
    '</div>' +
    '<div class="kind-chips" role="group" aria-label="Filter by kind">' +
    kindChips +
    '</div>' +
    '<p class="count-line" id="count-line"></p>' +
    '<div id="rows" class="rows"></div>';

  const search = document.getElementById('search');
  search.addEventListener('input', () => {
    ui.query = search.value;
    renderRows(ui);
  });
  document.getElementById('grade').addEventListener('change', (event) => {
    ui.grade = event.target.value;
    renderRows(ui);
  });
  document.getElementById('hide-earned').addEventListener('change', (event) => {
    progress.settings.hideEarned = event.target.checked;
    saveSettingsAndRefresh(ui);
  });
  document.getElementById('spoilers').addEventListener('change', (event) => {
    progress.settings.spoilers = event.target.checked;
    saveSettingsAndRefresh(ui);
  });
  renderRows(ui);
}

function saveSettingsAndRefresh(ui) {
  saveProgress();
  renderRows(ui);
}

/** Re-render only the rows (keeps the search box focused). */
export function renderRows(ui) {
  const progress = getProgress();
  const rowsEl = document.getElementById('rows');
  if (!rowsEl) return;
  const filtered = filterTrophies(allTrophies(), {
    kind: ui.kind,
    grade: ui.grade,
    query: ui.query,
    hideEarned: progress.settings.hideEarned,
    earnedIds: progress.earned,
  });
  const countLine = document.getElementById('count-line');
  if (countLine) {
    countLine.textContent =
      'Showing ' + filtered.length + ' of 55 trophies' + (progress.settings.spoilers ? ' · story spoilers hidden until earned' : '');
  }
  rowsEl.innerHTML = filtered.map((t) => rowHtml(t, progress)).join('') || '<p class="empty">No trophies match these filters.</p>';
}

function rowHtml(t, progress) {
  const earned = isEarned(t.id);
  const hidden = spoilerHidden(t, progress.settings, earned);
  const count = t.psn ? getCount(t.id) : 0;
  const excerpt = hidden ? '' : t.guide.length > 150 ? t.guide.slice(0, 150) + '…' : t.guide;
  const tags = [];
  tags.push('<span class="tag">' + esc(GRADE_LABELS[t.grade]) + '</span>');
  if (t.kind !== 'platinum') tags.push('<span class="tag">' + esc(KIND_LABELS[t.kind]) + '</span>');
  if (t.missable) tags.push('<span class="tag missable">⚑ Missable</span>');
  if (t.story) tags.push('<span class="tag story">Story</span>');
  if (t.psn) tags.push('<span class="tag psn">PSN ' + count + '/' + t.psn.target + ' ' + esc(t.psn.unit) + '</span>');
  if (progress.notes[t.id]) tags.push('<span class="tag">✎ Note</span>');
  if (isNext(t.id)) tags.push('<span class="tag">★ Next up</span>');
  const nameBlock = hidden
    ? '<h3>' + medalDot(t.grade) + '<span class="hidden-mask">Hidden trophy — story trophy, hidden until earned</span></h3>' +
      '<p class="desc hidden-mask">Turn spoilers off in Settings to reveal it, or earn it in the game.</p>'
    : '<h3>' +
      medalDot(t.grade) +
      esc(t.name) +
      '</h3>' +
      '<p class="desc">' +
      esc(t.description) +
      '</p>' +
      '<p class="excerpt">' +
      esc(excerpt) +
      '</p>';
  const stepper = t.psn
    ? '<span class="stepper"><button type="button" data-action="count-minus" data-id="' +
      t.id +
      '" aria-label="Decrease counter">−</button><span>' +
      count +
      ' / ' +
      t.psn.target +
      '</span><button type="button" data-action="count-plus" data-id="' +
      t.id +
      '" aria-label="Increase counter">+</button></span>'
    : '';
  return (
    '<article class="trophy-row' +
    (earned ? ' earned' : '') +
    '" data-id="' +
    t.id +
    '">' +
    '<button type="button" class="check" data-action="toggle-earned" data-id="' +
    t.id +
    '" aria-label="Mark ' +
    esc(t.name) +
    ' earned">' +
    (earned ? '✓' : '') +
    '</button>' +
    '<div>' +
    nameBlock +
    '<div class="meta">' +
    tags.join('') +
    '</div></div>' +
    '<div class="row-side">' +
    stepper +
    '<a class="guide-link" href="#/trophy/' +
    t.id +
    '">Guide →</a>' +
    '</div></article>'
  );
}
