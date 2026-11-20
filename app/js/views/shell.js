// App shell: header progress hero, tab navigation and theme switch.
import { GRADE_ORDER, GRADE_LABELS } from '../config.js';
import { allTrophies, gradeCounts } from '../data.js';
import { getProgress, earnedCount } from '../store.js';
import { medalDot } from '../html.js';

/** Apply a theme name to the document element. */
export function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme === 'paper' ? 'paper' : 'night');
}

/** Render the progress hero and mark the active tab. */
export function renderShell(activeRoute) {
  const progress = getProgress();
  const total = allTrophies().length;
  const earned = earnedCount();
  const pct = total ? Math.round((earned / total) * 100) : 0;
  const counts = gradeCounts(progress.earned);
  const chips = GRADE_ORDER.map((grade) => {
    const c = counts[grade] || { total: 0, earned: 0 };
    return (
      '<span class="grade-chip">' +
      medalDot(grade) +
      GRADE_LABELS[grade] +
      ' ' +
      c.earned +
      '/' +
      c.total +
      '</span>'
    );
  }).join('');
  const hero = document.getElementById('hero');
  hero.innerHTML =
    '<div class="hero-count"><span class="big">' +
    earned +
    ' / ' +
    total +
    '</span><span class="of">earned · ' +
    pct +
    '% to platinum</span></div>' +
    '<div class="hero-mid"><div class="progressbar"><span style="width:' +
    pct +
    '%"></span></div>' +
    '<div class="hero-sub">55 trophies · 1 platinum · 2 gold · 6 silver · 46 bronze · 28 hidden on PlayStation</div></div>' +
    '<div class="grade-chips">' +
    chips +
    '</div>';
  const tabs = document.querySelectorAll('#tabs a');
  tabs.forEach((a) => {
    a.classList.toggle('active', a.dataset.route === activeRoute);
  });
}
