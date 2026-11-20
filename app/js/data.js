// Trophy data: loads app/data/trophies.json (the official 55) and app/data/sources.json,
// and computes every audit number from that data — nothing is hardcoded.
import { STAGES } from './config.js';

let trophies = [];
let sourcesDoc = { sources: [], agreed: [], differ: [], unconfirmed: [], readDate: '' };

/** Fetch the official trophy list and the sources record. Called once at boot. */
export async function loadTrophies() {
  const [tRes, sRes] = await Promise.all([fetch('data/trophies.json'), fetch('data/sources.json')]);
  const doc = await tRes.json();
  trophies = doc.trophies;
  sourcesDoc = await sRes.json();
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

/** The sources record (pages, agreements, disputes, unconfirmed items). */
export function sourcesRecord() {
  return sourcesDoc;
}

/** One source record by its id, or undefined. */
export function sourceById(id) {
  return sourcesDoc.sources.find((s) => s.id === id);
}

/** The source records in file order. */
export function allSources() {
  return sourcesDoc.sources;
}

/** Trophies of one roadmap stage, in list order. */
export function trophiesInStage(n) {
  return trophies.filter((t) => t.stage === n);
}

/** The roadmap stages with their trophies attached. */
export function stagesWithTrophies() {
  return STAGES.map((p) => ({ ...p, trophies: trophiesInStage(p.n) }));
}

/** Every trophy with a missable tier, possibly-missable first. */
export function missableTrophies() {
  return trophies
    .filter((t) => t.missable)
    .sort((a, b) => (a.missable.tier === 'possibly' ? 0 : 1) - (b.missable.tier === 'possibly' ? 0 : 1) || a.id - b.id);
}

/** Every trophy flagged as possibly missable. */
export function possiblyMissableTrophies() {
  return trophies.filter((t) => t.missable && t.missable.tier === 'possibly');
}

/** Every trophy on the watch list (questline finales). */
export function watchTrophies() {
  return trophies.filter((t) => t.missable && t.missable.tier === 'watch');
}

/** Every trophy with a dispute box. */
export function disputedTrophies() {
  return trophies.filter((t) => t.disputed);
}

/** Every trophy hidden on PlayStation. */
export function hiddenTrophies() {
  return trophies.filter((t) => t.hidden);
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

/** The distinct source ids a guide cites, in first-use order. */
export function guideSources(t) {
  const seen = [];
  for (const step of t.steps || []) {
    for (const id of step.s || []) {
      if (seen.indexOf(id) === -1) seen.push(id);
    }
  }
  return seen;
}

/** How many guides cite a source (a guide counts once per source, however many steps use it). */
export function guidesUsingSource(sourceId) {
  return trophies.filter((t) => guideSources(t).indexOf(sourceId) !== -1).length;
}

/** How many steps of one trophy cite a source — the trophy × source matrix cell. */
export function matrixCell(t, sourceId) {
  return (t.steps || []).filter((step) => (step.s || []).indexOf(sourceId) !== -1).length;
}

/** Sum of PSN counters vs sum of PSN targets, from a counts map {id: value}. */
export function countersTotals(counts) {
  let current = 0;
  let target = 0;
  for (const t of trophies) {
    if (!t.psn) continue;
    target += t.psn.target;
    current += Math.min(counts[t.id] || 0, t.psn.target);
  }
  return { current, target, pct: target ? Math.round((current / target) * 100) : 0 };
}

/**
 * The audit strip numbers, computed from the loaded data — never hardcoded.
 * official: trophies whose name, description and grade are all present (verified against
 * the starter list at build time; the build check is 0 diff on all 55).
 * claims: guide steps; cited: steps with at least one source; twoPlus: steps with 2+.
 * disputes: distinct dispute topics across trophies; unconfirmed: trophies with an
 * unconfirmed method or requirement; pages/sites: the sources record.
 */
export function auditStats() {
  const official = trophies.filter((t) => t.name && t.description && t.grade).length;
  let total = 0;
  let cited = 0;
  let twoPlus = 0;
  for (const t of trophies) {
    for (const step of t.steps || []) {
      total += 1;
      if (step.s && step.s.length > 0) cited += 1;
      if (step.s && step.s.length >= 2) twoPlus += 1;
    }
  }
  const disputeTopics = new Set(trophies.filter((t) => t.disputed).map((t) => t.disputed.topic));
  const sites = new Set(sourcesDoc.sources.map((s) => s.site));
  return {
    official,
    totalTrophies: trophies.length,
    totalClaims: total,
    citedClaims: cited,
    twoPlusClaims: twoPlus,
    sourcePages: sourcesDoc.sources.length,
    sourceSites: sites.size,
    readDate: sourcesDoc.readDate,
    disputes: disputeTopics.size,
    disputedTrophies: trophies.filter((t) => t.disputed).length,
    unconfirmed: trophies.filter((t) => t.unconfirmed).length,
    possiblyMissable: possiblyMissableTrophies().length,
    watch: watchTrophies().length,
  };
}
