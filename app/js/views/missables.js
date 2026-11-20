// Missables: the trophies tied to one-time story moments, and why only these are flagged.
import { missableTrophies } from '../data.js';
import { getProgress, isEarned } from '../store.js';
import { esc, medalDot } from '../html.js';
import { GRADE_LABELS } from '../config.js';

/** Render the missables page. */
export function renderMissables(root) {
  const progress = getProgress();
  const list = missableTrophies();
  const earned = list.filter((t) => isEarned(t.id)).length;
  const cards = list
    .map(
      (t) =>
        '<article class="miss-card"><h3>' +
        medalDot(t.grade) +
        esc(t.name) +
        ' <span class="tag">' +
        esc(GRADE_LABELS[t.grade]) +
        '</span>' +
        (isEarned(t.id) ? ' <span class="tag">✓ Earned</span>' : '') +
        '</h3>' +
        '<p>' +
        esc(t.description) +
        '</p>' +
        '<p class="why">' +
        esc(t.missableNote || '') +
        '</p>' +
        '<a class="guide-link" href="#/trophy/' +
        t.id +
        '">Guide →</a></article>',
    )
    .join('');
  root.innerHTML =
    '<div class="view-head"><h2>Missables — ' +
    earned +
    ' of ' +
    list.length +
    ' earned</h2>' +
    '<p><b>How this list was built:</b> a trophy is flagged missable when its official description ties it to a one-time story moment — a named mission, or a story choice. Nothing else in the official list is flagged, because nothing else in the descriptions ties a trophy to a moment that may not come back.</p>' +
    '<p><b>The honest caveat:</b> whether story missions can be replayed has not been confirmed. Until it is, treat every trophy below as earn-it-when-you-see-it. Chapter trophies are <b>not</b> flagged: finishing a chapter cannot be missed, you only have to play through it.</p></div>' +
    '<div class="miss-grid">' +
    cards +
    '</div>';
}
