let list = [];
let src = { sources: [], agreed: [], differ: [], unconfirmed: [], readDate: "" };
let pending = null;

async function getJson(url) {
  const res = await fetch(url);
  return res.json();
}

function oneSide(s) {
  const out = { label: s.l, text: s.x };
  if (s.s) out.src = s.s;
  return out;
}

function twoWay(x) {
  return { topic: x.t, a: oneSide(x.a), b: oneSide(x.b), decision: x.d };
}

function decodeTrophy(r) {
  const t = {
    id: r.i, name: r.name, description: r.d, grade: r.g, kind: r.k,
    story: !!r.y, hidden: !!r.h, chapter: r.c ?? null, opens: r.o ?? null,
    stage: r.st, psn: null, missable: null, disputed: null,
    unconfirmed: r.u ?? null, partial: r.r ?? null,
    guide: r.guide, steps: (r.s || []).map(s => ({ t: s.t, s: s.s }))
  };
  if (r.p) t.psn = { target: r.p.t, unit: r.p.u };
  if (r.m) t.missable = { tier: r.m.t, gate: { chapter: r.m.g.c, mission: r.m.g.m, note: r.m.g.n } };
  if (r.x) t.disputed = twoWay(r.x);
  return t;
}

function decodeSources(d) {
  return {
    sources: (d.s || []).map(s => ({ id: s.i, site: s.w, title: s.t, type: s.y, read: s.r, url: s.u, note: s.n, reliability: s.l })),
    agreed: d.a || [],
    differ: (d.d || []).map(twoWay),
    unconfirmed: d.u || [],
    readDate: d.r || ""
  };
}

async function fill() {
  const [td, sd] = await Promise.all([getJson("data/trophies.json"), getJson("data/sources.json")]);
  list = td.trophies.map(decodeTrophy);
  src = decodeSources(sd);
  return list;
}

export function loadTrophies() {
  if (!pending) pending = fill().catch(err => { pending = null; throw err; });
  return pending;
}

export function allTrophies() { return list; }
export function trophyById(id) { return list.find(t => t.id === id); }
export function sourcesRecord() { return src; }
export function sourceById(id) { return src.sources.find(s => s.id === id); }
export function allSources() { return src.sources; }
export function trophiesInStage(n) { return list.filter(t => t.stage === n); }

function rankMissable(t) {
  return t.missable && t.missable.tier === "possibly" ? 0 : 1;
}

export function missableTrophies() {
  return list.filter(t => t.missable).sort((a, b) => rankMissable(a) - rankMissable(b) || a.id - b.id);
}
export function possiblyMissableTrophies() {
  return list.filter(t => t.missable && t.missable.tier === "possibly");
}
export function watchTrophies() {
  return list.filter(t => t.missable && t.missable.tier === "watch");
}
export function disputedTrophies() { return list.filter(t => t.disputed); }
export function hiddenTrophies() { return list.filter(t => t.hidden); }
export function storyTrophies() { return list.filter(t => t.story); }

export function gradeCounts(ids) {
  const have = new Set(ids);
  const out = {};
  for (const t of list) {
    const g = out[t.grade] || (out[t.grade] = { total: 0, earned: 0 });
    g.total += 1;
    if (have.has(t.id)) g.earned += 1;
  }
  return out;
}

export function guideSources(t) {
  const ids = [];
  for (const step of t.steps || []) {
    for (const id of step.s || []) {
      if (!ids.includes(id)) ids.push(id);
    }
  }
  return ids;
}

export function guidesUsingSource(id) {
  return list.filter(t => guideSources(t).includes(id)).length;
}

export function matrixCell(t, id) {
  return (t.steps || []).filter(s => (s.s || []).includes(id)).length;
}

export function countersTotals(counts) {
  let cur = 0, goal = 0;
  for (const t of list) {
    if (!t.psn) continue;
    goal += t.psn.target;
    cur += Math.min(counts[t.id] || 0, t.psn.target);
  }
  return { current: cur, target: goal, pct: goal ? Math.round(cur / goal * 100) : 0 };
}

export function auditStats() {
  let total = 0, cited = 0, two = 0;
  for (const t of list) {
    for (const s of t.steps || []) {
      total += 1;
      if (s.s && s.s.length) cited += 1;
      if (s.s && s.s.length > 1) two += 1;
    }
  }
  const topics = new Set();
  const sites = new Set(src.sources.map(s => s.site));
  for (const t of list) if (t.disputed) topics.add(t.disputed.topic);
  return {
    official: list.filter(t => t.name && t.description && t.grade).length,
    totalTrophies: list.length,
    totalClaims: total, citedClaims: cited, twoPlusClaims: two,
    sourcePages: src.sources.length, sourceSites: sites.size, readDate: src.readDate,
    disputes: topics.size,
    disputedTrophies: list.filter(t => t.disputed).length,
    unconfirmed: list.filter(t => t.unconfirmed).length,
    possiblyMissable: possiblyMissableTrophies().length,
    watch: watchTrophies().length
  };
}
