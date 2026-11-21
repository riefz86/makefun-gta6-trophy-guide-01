import { GRADE_ORDER, GRADE_LABELS } from "../config.js";
import { allTrophies, gradeCounts, countersTotals } from "../data.js";
import { getProgress, earnedCount } from "../store.js";
import { medalDot, fmt } from "../html.js";

// Sunset Platinum — header hero and theme. Retry-2: one clean recording.
export const applyTheme = (theme) => {
  const name = theme === "paper" ? "paper" : "night";
  document.documentElement.setAttribute("data-theme", name);
};

const chipFor = (grade, counts) => {
  const bucket = counts[grade] || { total: 0, earned: 0 };
  const label = GRADE_LABELS[grade];
  const tally = `${bucket.earned}/${bucket.total}`;
  return `<span class="grade-chip">${medalDot(grade)}${label} ${tally}</span>`;
};

export const renderShell = (activeRoute) => {
  const progress = getProgress();
  const total = allTrophies().length;
  const earned = earnedCount();
  const pct = total ? Math.round((earned / total) * 100) : 0;
  const counts = gradeCounts(progress.earned);
  const counters = countersTotals(progress.counts);
  const chips = [];
  for (const grade of GRADE_ORDER) chips.push(chipFor(grade, counts));
  const countBlock = `<div class="hero-count"><span class="big">${earned} / ${total}</span><span class="of">earned · ${pct}% to platinum</span></div>`;
  const barBlock = `<div class="progressbar"><span style="width:${pct}%"></span></div>`;
  const midBlock = `<div class="hero-mid">${barBlock}`
    + `<div class="hero-sub">55 trophies · 1 platinum · 2 gold · 6 silver · 46 bronze · 28 hidden on PlayStation</div>`
    + `<div class="hero-sub">Tracked counters: ${fmt(counters.current)} / ${fmt(counters.target)} (${counters.pct}%) across 20 PSN-tracked trophies</div></div>`;
  const chipsBlock = `<div class="grade-chips">${chips.join("")}</div>`;
  const hero = document.getElementById("hero");
  hero.innerHTML = countBlock + midBlock + chipsBlock;
  const tabs = document.querySelectorAll("#tabs a");
  for (const a of tabs) a.classList.toggle("active", a.dataset.route === activeRoute);
};
// Retry-2: single clean recording — content unchanged.
