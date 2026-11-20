// Trophy detail: official description, numbered cited steps, PSN counter, dispute and
// unconfirmed boxes, per-guide source list with coverage, and notes.
import { EXOPHASE_URL, PSNPROFILES_URL, GRADE_LABELS, KIND_LABELS, MISSABLE_TIER_LABELS } from '../config.js';
import { trophyById, guideSources, guidesUsingSource, allTrophies, sourceById } from '../data.js';
import { getProgress, isEarned, getCount, getNote, isNext } from '../store.js';
import { spoilerHidden } from '../filters.js';
import { esc, medalDot, guideParagraphs, citeSups, singleSourceTag, fmt } from '../html.js';

/** Render one trophy's full guide page. */
export function renderDetail(root, id) {
  const t = trophyById(id);
  const progress = getProgress();
  if (!t) {
    root.innerHTML = '<div class="view-head"><h2>Not found</h2><p>No trophy with that number. <a href="#/">Back to the tracker</a>.</p></div>';
    return;
  }
  const earned = isEarned(t.id);
  const hidden = spoilerHidden(t, progress.settings, earned);
  const count = t.psn ? getCount(t.id) : 0;
  const tags = [];
  tags.push('<span class="tag">' + esc(GRADE_LABELS[t.grade]) + '</span>');
  tags.push('<span class="tag psn-num">#' + t.id + ' of 55</span>');
  if (t.kind !== 'platinum') tags.push('<span class="tag">' + esc(KIND_LABELS[t.kind]) + '</span>');
  if (t.missable) tags.push('<span class="tag missable">⚑ ' + esc(MISSABLE_TIER_LABELS[t.missable.tier]) + '</span>');
  if (t.disputed) tags.push('<span class="tag disputed">Sources differ</span>');
  if (t.unconfirmed) tags.push('<span class="tag unconfirmed">Method unconfirmed</span>');
  if (t.hidden) tags.push('<span class="tag hidden-tag">PSN-hidden</span>');
  if (t.story) tags.push('<span class="tag story">Story</span>');
  if (t.chapter) tags.push('<span class="tag">Chapter ' + t.chapter + '</span>');
  tags.push('<span class="tag">Stage ' + t.stage + '</span>');
  if (t.psn) {
    const pct = t.psn.target ? Math.round((count / t.psn.target) * 100) : 0;
    tags.push('<span class="tag psn">PSN ' + fmt(count) + '/' + fmt(t.psn.target) + ' ' + esc(t.psn.unit) + ' · ' + pct + '%</span>');
  }

  const head = hidden
    ? '<h2>' +
      medalDot(t.grade) +
      '<span class="hidden-mask">Hidden trophy</span></h2>' +
      '<p class="desc hidden-mask">This is a PSN-hidden trophy, hidden by your spoiler shield until it is earned. Turn the shield off in Settings to reveal its name and description.</p>'
    : '<h2>' + medalDot(t.grade) + esc(t.name) + '</h2>';

  const official = hidden
    ? ''
    : '<div class="official"><p class="label">Official description — as PlayStation publishes it</p><p>' +
      esc(t.description) +
      '</p></div>';

  const guide = hidden
    ? ''
    : '<div class="guide-body">' +
      guideParagraphs(t.guide)
        .map((p) => '<p>' + esc(p) + '</p>')
        .join('') +
      '</div>';

  // Numbered steps with inline citations. The guide's sources get local numbers [1], [2]…
  const srcIds = guideSources(t);
  const localMap = {};
  srcIds.forEach((id, i) => {
    localMap[id] = i + 1;
  });
  const steps = hidden
    ? ''
    : '<div class="steps"><h3>Steps</h3><ol>' +
      t.steps
        .map(
          (step) =>
            '<li>' +
            esc(step.t) +
            citeSups(step, localMap) +
            singleSourceTag(step) +
            '</li>',
        )
        .join('') +
      '</ol></div>';

  const missable = !hidden && t.missable
    ? '<div class="callout"><b>⚑ ' +
      esc(MISSABLE_TIER_LABELS[t.missable.tier]) +
      '.</b> ' +
      esc(t.missable.gate.note) +
      ' Last chance: Chapter ' +
      t.missable.gate.chapter +
      ', ' +
      esc(t.missable.gate.mission) +
      '.</div>'
    : '';

  const dispute = !hidden && t.disputed
    ? '<div class="dispute"><h3>Sources differ — ' +
      esc(t.disputed.topic) +
      '</h3>' +
      '<p><b>A — ' +
      esc(t.disputed.a.label) +
      ':</b> ' +
      esc(t.disputed.a.text) +
      '</p>' +
      '<p><b>B — ' +
      esc(t.disputed.b.label) +
      ':</b> ' +
      esc(t.disputed.b.text) +
      '</p>' +
      '<p><b>Our call:</b> ' +
      esc(t.disputed.decision) +
      '</p></div>'
    : '';

  const unconfirmed = !hidden && t.unconfirmed
    ? '<div class="unconfirmed"><b>METHOD UNCONFIRMED.</b> ' + esc(t.unconfirmed) + '</div>'
    : '';

  const partial = !hidden && t.partial
    ? '<div class="callout partial"><b>Partly confirmed.</b> ' + esc(t.partial) + '</div>'
    : '';

  const stepper = !hidden && t.psn
    ? '<div class="panel"><h3>PSN counter</h3><p>PlayStation tracks this one: <b>' +
      fmt(count) +
      ' / ' +
      fmt(t.psn.target) +
      ' ' +
      esc(t.psn.unit) +
      '</b> (' +
      (t.psn.target ? Math.round((count / t.psn.target) * 100) : 0) +
      '%). Use the stepper to keep your count here — it feeds the total in the header.</p>' +
      '<span class="stepper"><button type="button" data-action="count-minus" data-id="' +
      t.id +
      '" aria-label="Decrease counter">−</button><span>' +
      fmt(count) +
      ' / ' +
      fmt(t.psn.target) +
      '</span><button type="button" data-action="count-plus" data-id="' +
      t.id +
      '" aria-label="Increase counter">+</button></span></div>'
    : '';

  // Per-guide source list with coverage: "cited in N/55 guides".
  const total = allTrophies().length;
  const sourceList = !hidden
    ? '<div class="sources"><h3>Sources for this guide</h3><ol>' +
      srcIds
        .map((id) => {
          const n = guidesUsingSource(id);
          const rec = sourceById(id);
          const label = rec ? rec.site + ' — ' + rec.title : id;
          return '<li><b>[' + localMap[id] + ']</b> ' + esc(label) + ' — cited in ' + n + '/' + total + ' guides</li>';
        })
        .join('') +
      '</ol><p>Every step above cites its sources. Steps marked <span class="tag single">1 source</span> rest on a single source — check the <a href="#/sources">Sources tab</a> before you trust them alone. Guide text is this guide’s own words, written from the sources; where a place or step is not pinned down, the guide says so instead of inventing one.</p></div>'
    : '';

  const legacySources = !hidden
    ? '<p class="sources-line">Official list: <a href="' +
      esc(EXOPHASE_URL) +
      '" target="_blank" rel="noopener">Exophase</a>' +
      (t.psn
        ? ' · PSN target: <a href="' +
          esc(PSNPROFILES_URL) +
          '" target="_blank" rel="noopener">PSNProfiles</a>'
        : '') +
      ' · Full source table, matrix and disputes: <a href="#/sources">Sources tab</a>.</p>'
    : '';

  root.innerHTML =
    '<p><a class="backlink" href="#/">← Back to tracker</a></p>' +
    '<div class="detail-head">' +
    head +
    '</div>' +
    '<div class="meta">' +
    tags.join('') +
    '</div>' +
    official +
    missable +
    dispute +
    unconfirmed +
    partial +
    guide +
    steps +
    sourceList +
    legacySources +
    '<div class="detail-actions">' +
    '<button type="button" class="btn" data-action="toggle-earned" data-id="' +
    t.id +
    '">' +
    (earned ? '✓ Earned — mark not earned' : 'Mark earned') +
    '</button>' +
    '<button type="button" class="btn ghost" data-action="toggle-next" data-id="' +
    t.id +
    '">' +
    (isNext(t.id) ? '★ On your Next up list — remove' : '☆ Add to Next up') +
    '</button>' +
    '</div>' +
    '<div class="detail-grid">' +
    stepper +
    '<div class="panel"><h3>Your note</h3>' +
    '<textarea class="note" data-note="' +
    t.id +
    '" placeholder="Where you found it, what worked, what to try next…">' +
    esc(getNote(t.id)) +
    '</textarea>' +
    '<p class="note-saved" id="note-saved"></p></div>' +
    '</div>';
}
