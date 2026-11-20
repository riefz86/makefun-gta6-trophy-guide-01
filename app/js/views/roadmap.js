// Roadmap to the platinum: four phases built from the official descriptions.
import { phasesWithTrophies } from '../data.js';
import { getProgress, isEarned } from '../store.js';
import { esc } from '../html.js';

/** Render the roadmap: phases in order, each with its trophies and progress. */
export function renderRoadmap(root) {
  const progress = getProgress();
  const phases = phasesWithTrophies();
  const cards = phases
    .map((phase) => {
      const earned = phase.trophies.filter((t) => isEarned(t.id)).length;
      const pct = phase.trophies.length ? Math.round((earned / phase.trophies.length) * 100) : 0;
      const names = phase.trophies
        .map(
          (t) =>
            '<li class="' +
            (isEarned(t.id) ? 'done' : '') +
            '"><a href="#/trophy/' +
            t.id +
            '">' +
            esc(t.name) +
            '</a>' +
            (t.missable ? ' ⚑' : '') +
            '</li>',
        )
        .join('');
      return (
        '<section class="phase-card"><h3><span class="num">' +
        phase.n +
        '</span>' +
        esc(phase.title) +
        '</h3>' +
        '<p class="blurb">' +
        esc(phase.blurb) +
        '</p>' +
        '<div class="progressbar"><span style="width:' +
        pct +
        '%"></span></div>' +
        '<p class="hero-sub">' +
        earned +
        ' / ' +
        phase.trophies.length +
        ' earned in this phase</p>' +
        '<ul class="trophy-names">' +
        names +
        '</ul></section>'
      );
    })
    .join('');
  root.innerHTML =
    '<div class="view-head"><h2>Roadmap to the platinum</h2>' +
    '<p>The order to earn them in, built from the <b>official descriptions</b>: story first, then activities, then collectibles, then the money and clean-up. The platinum, <b>Vice Got a Price!</b>, unlocks when the other 54 are done. ⚑ marks a missable trophy — earn it when its moment comes.</p></div>' +
    '<div class="phase-grid">' +
    cards +
    '</div>';
}
