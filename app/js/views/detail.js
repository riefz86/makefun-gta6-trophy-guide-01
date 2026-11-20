// Trophy detail: official description, full guide, PSN counter, sources, notes.
import { EXOPHASE_URL, PSNPROFILES_URL, GRADE_LABELS, KIND_LABELS } from '../config.js';
import { trophyById } from '../data.js';
import { getProgress, isEarned, getCount, getNote, isNext } from '../store.js';
import { spoilerHidden } from '../filters.js';
import { esc, medalDot, guideParagraphs } from '../html.js';

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
  if (t.kind !== 'platinum') tags.push('<span class="tag">' + esc(KIND_LABELS[t.kind]) + '</span>');
  if (t.missable) tags.push('<span class="tag missable">⚑ Missable</span>');
  if (t.story) tags.push('<span class="tag story">Story</span>');
  if (t.psn) tags.push('<span class="tag psn">PSN ' + count + '/' + t.psn.target + ' ' + esc(t.psn.unit) + '</span>');

  const head = hidden
    ? '<h2>' +
      medalDot(t.grade) +
      '<span class="hidden-mask">Hidden trophy</span></h2>' +
      '<p class="desc hidden-mask">This is a story trophy, hidden by your spoiler setting until it is earned. Turn spoilers off in Settings to reveal its name and description.</p>'
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

  const missable = !hidden && t.missable
    ? '<div class="callout"><b>⚑ Missable.</b> ' + esc(t.missableNote || '') + '</div>'
    : '';

  const stepper = !hidden && t.psn
    ? '<div class="panel"><h3>PSN counter</h3><p>PlayStation tracks this one: <b>' +
      count +
      ' / ' +
      t.psn.target +
      ' ' +
      esc(t.psn.unit) +
      '</b>. Use the stepper to keep your count here.</p>' +
      '<span class="stepper"><button type="button" data-action="count-minus" data-id="' +
      t.id +
      '" aria-label="Decrease counter">−</button><span>' +
      count +
      ' / ' +
      t.psn.target +
      '</span><button type="button" data-action="count-plus" data-id="' +
      t.id +
      '" aria-label="Increase counter">+</button></span></div>'
    : '';

  const sources = hidden
    ? ''
    : '<div class="sources"><b>Sources:</b> <a href="' +
      EXOPHASE_URL +
      '" target="_blank" rel="noopener">Exophase</a> — the official list (name, description, grade)' +
      (t.psn
        ? '; <a href="' +
          PSNPROFILES_URL +
          '" target="_blank" rel="noopener">PSNProfiles</a> — the PSN-tracked target of ' +
          t.psn.target +
          ' ' +
          esc(t.psn.unit)
        : '') +
      '. <b>Guide:</b> our own advice from the official description, not yet checked in the game. Where a place or step is not pinned down, the guide says so instead of inventing one.</div>';

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
    guide +
    sources +
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
