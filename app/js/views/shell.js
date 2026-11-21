// Sunset Platinum — header hero and theme. Retry-3: re-derived.
import { GRADE_ORDER, GRADE_LABELS } from "../config.js";
import { allTrophies, gradeCounts, countersTotals } from "../data.js";
import { getProgress, earnedCount } from "../store.js";
import { medalDot, fmt } from "../html.js";

export const applyTheme = (theme) => {
  document.documentElement.setAttribute("data-theme", theme === "paper" ? "paper" : "night");
};

const gradeChip = (grade, counts) => {
  const bucket = counts[grade] || { total: 0, earned: 0 };
  return (
    '<span class="grade-chip">' + medalDot(grade) + GRADE_LABELS[grade] +
    " " + bucket.earned + "/" + bucket.total + "</span>"
  );
};

export const renderShell = (activeRoute) => {
  const progress = getProgress();
  const total = allTrophies().length;
  const earned = earnedCount();
  const pct = total ? Math.round((earned / total) * 100) : 0;
  const counts = gradeCounts(progress.earned);
  const counters = countersTotals(progress.counts);
  const chips = GRADE_ORDER.map((grade) => gradeChip(grade, counts)).join("");
  const heroHtml =
    '<div class="hero-count"><span class="big">' + earned + " / " + total + '</span>' +
    '<span class="of">earned · ' + pct + '% to platinum</span></div>' +
    '<div class="hero-mid">' +
    '<div class="progressbar"><span style="width:' + pct + '%"></span></div>' +
    '<div class="hero-sub">55 trophies · 1 platinum · 2 gold · 6 silver · 46 bronze · 28 hidden on PlayStation</div>' +
    '<div class="hero-sub">Tracked counters: ' + fmt(counters.current) + " / " + fmt(counters.target) +
    " (" + counters.pct + "%) across 20 PSN-tracked trophies</div></div>" +
    '<div class="grade-chips">' + chips + "</div>";
  document.getElementById("hero").innerHTML = heroHtml;
  const tabs = document.querySelectorAll("#tabs a");
  for (const a of tabs) a.classList.toggle("active", a.dataset.route === activeRoute);
};
