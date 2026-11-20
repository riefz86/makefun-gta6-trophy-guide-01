// Roadmap to the platinum: five stages, each with numbered cited steps, trophy chips,
// and a platinum summary whose every number comes from a source.
import { stagesWithTrophies } from '../data.js';
import { getProgress, isEarned } from '../store.js';
import { esc, citeSups } from '../html.js';
import { PLATINUM_SUMMARY } from '../config.js';

/** Render the roadmap: platinum summary, then five stages in order. */
export function renderRoadmap(root) {
  const progress = getProgress();
  const stages = stagesWithTrophies();
  const summary = PLATINUM_SUMMARY.map(
    (row) => '<div class="summary-row"><span>' + esc(row.label) + '</span><b>' + esc(row.value) + '</b></div>',
  ).join('');
  const cards = stages
    .map((stage) => {
      const earned = stage.trophies.filter((t) => isEarned(t.id)).length;
      const pct = stage.trophies.length ? Math.round((earned / stage.trophies.length) * 100) : 0;
      // The stage's own sources get local numbers for its steps.
      const srcIds = [];
      for (const step of stage.steps || []) {
        for (const id of step.s || []) {
          if (srcIds.indexOf(id) === -1) srcIds.push(id);
        }
      }
      const localMap = {};
      srcIds.forEach((id, i) => {
        localMap[id] = i + 1;
      });
      const steps = (stage.steps || [])
        .map((step) => '<li>' + esc(step.t) + citeSups(step, localMap) + '</li>')
        .join('');
      const names = stage.trophies
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
        stage.n +
        '</span>' +
        esc(stage.title) +
        '</h3>' +
        '<p class="blurb">' +
        esc(stage.blurb) +
        '</p>' +
        '<ol class="stage-steps">' +
        steps +
        '</ol>' +
        '<p class="stage-sources">Sources: ' +
        srcIds
          .map((id, i) => '[' + (i + 1) + '] ' + esc(id === 'exo' ? 'Exophase' : id === 'pyx' ? 'PowerPyx' : id))
          .join(', ') +
        ' — see the <a href="#/sources">Sources tab</a>.</p>' +
        '<div class="progressbar"><span style="width:' +
        pct +
        '%"></span></div>' +
        '<p class="hero-sub">' +
        earned +
        ' / ' +
        stage.trophies.length +
        ' earned in this stage</p>' +
        '<ul class="trophy-names">' +
        names +
        '</ul></section>'
      );
    })
    .join('');
  root.innerHTML =
    '<div class="view-head"><h2>Roadmap to the platinum</h2>' +
    '<p>The order to earn them in, in five stages: story first, then activities, then collectibles, then the questlines, money and clean-up. The platinum, <b>Vice Got a Price!</b>, unlocks when the other 54 are done. ⚑ marks a missable or watch trophy — see the Missables page. Every step below cites its source.</p></div>' +
    '<section class="panel platinum-summary"><h3>Platinum at a glance</h3>' +
    summary +
    '<p>All numbers from PowerPyx’s roadmap (see the <a href="#/sources">Sources tab</a>). Any number with no source was left out rather than invented.</p></section>' +
    '<div class="phase-grid">' +
    cards +
    '</div>';
}
