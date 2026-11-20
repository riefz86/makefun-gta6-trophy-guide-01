// Trophy data: loads app/data/trophies.json (the official 55) and exposes derived groups.
import { PHASES } from './config.js';

let trophies = [];

/** Fetch the official trophy list. Called once at boot. */
export async function loadTrophies() {
  const response = await fetch('data/trophies.json');
  const doc = await response.json();
  trophies = doc.trophies;
  return trophies;
}

/** The whole official list, in PlayStation order. */
export function allTrophies() {
  return trophies;
}

/** One trophy by its id, or undefined. */
export function trophyById(id) {
  return trophies.find((t) => t.id === id);
}

/** Trophies of one roadmap phase, in list order. */
export function trophiesInPhase(n) {
  return trophies.filter((t) => t.phase === n);
}

/** The roadmap phases with their trophies attached. */
export function phasesWithTrophies() {
  return PHASES.map((p) => ({ ...p, trophies: trophiesInPhase(p.n) }));
}

/** Every trophy flagged missable. */
export function missableTrophies() {
  return trophies.filter((t) => t.missable);
}

/** Every story trophy (chapter and mission completions). */
export function storyTrophies() {
  return trophies.filter((t) => t.story);
}

/** Earned counts per grade, from an earned-id set. */
export function gradeCounts(earnedIds) {
  const earned = new Set(earnedIds);
  const counts = {};
  for (const t of trophies) {
    counts[t.grade] = counts[t.grade] || { total: 0, earned: 0 };
    counts[t.grade].total += 1;
    if (earned.has(t.id)) counts[t.grade].earned += 1;
  }
  return counts;
}
