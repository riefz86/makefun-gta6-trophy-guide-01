// data loading — retry-3
const emptyRec = () => ({ sources: [], agreed: [], differ: [], unconfirmed: [], readDate: "" });
let all = [];
let record = emptyRec();
let pending = null;

const side = (e) => ({ label: e.l, text: e.x, ...(e.s ? { src: e.s } : {}) });

const dsp = (entry) => ({
  topic: entry.t,
  a: side(entry.a),
  b: side(entry.b),
  decision: entry.d,
});

const stp = (step) => ({ t: step.t, s: step.s });

const tr = (row) => {
  const trophy = {
    id: row.i,
    name: row.name,
    description: row.d,
    grade: row.g,
    kind: row.k,
    story: Boolean(row.y),
    hidden: Boolean(row.h),
    chapter: row.c === undefined ? null : row.c,
    opens: row.o === undefined ? null : row.o,
    stage: row.st,
    psn: null,
    missable: null,
    disputed: null,
    unconfirmed: row.u === undefined ? null : row.u,
    partial: row.r === undefined ? null : row.r,
    guide: row.guide,
    steps: (row.s || []).map(stp),
  };
  if (row.p) trophy.psn = { target: row.p.t, unit: row.p.u };
  if (row.m) {
    trophy.missable = {
      tier: row.m.t,
      gate: { chapter: row.m.g.c, mission: row.m.g.m, note: row.m.g.n },
    };
  }
  if (row.x) trophy.disputed = dsp(row.x);
  return trophy;
};

const srcs = (doc) => {
  const out = emptyRec();
  for (const entry of doc.s || []) {
    out.sources.push({
      id: entry.i,
      site: entry.w,
      title: entry.t,
      type: entry.y,
      read: entry.r,
      url: entry.u,
      note: entry.n,
      reliability: entry.l,
    });
  }
  out.agreed = doc.a || [];
  for (const entry of doc.d || []) out.differ.push(dsp(entry));
  out.unconfirmed = doc.u || [];
  out.readDate = doc.r || "";
  return out;
};

const fill = async () => {
  const docs = await Promise.all([
    fetch("data/trophies.json").then((r) => r.json()),
    fetch("data/sources.json").then((r) => r.json()),
  ]);
  all = docs[0].trophies.map(tr);
  record = srcs(docs[1]);
  return all;
};

export const loadTrophies = () => {
  if (!pending) {
    pending = fill().catch((err) => {
      pending = null;
      throw err;
    });
  }
  return pending;
};

export const allTrophies = () => all;
export const trophyById = (id) => all.find((trophy) => trophy.id === id);

const mTier = (trophy) => (trophy.missable && trophy.missable.tier === "possibly" ? 0 : 1);

const mFirst = (a, b) => {
  const rank = mTier(a) - mTier(b);
  return rank !== 0 ? rank : a.id - b.id;
};

export const missableTrophies = () =>
  all.filter((trophy) => trophy.missable).sort(mFirst);
export const sourcesRecord = () => record;
export const sourceById = (id) => record.sources.find((entry) => entry.id === id);
export const possiblyMissableTrophies = () =>
  all.filter((trophy) => trophy.missable && trophy.missable.tier === "possibly");
export const allSources = () => record.sources;
export const watchTrophies = () =>
  all.filter((trophy) => trophy.missable && trophy.missable.tier === "watch");
export const trophiesInStage = (n) => all.filter((trophy) => trophy.stage === n);
export const disputedTrophies = () => all.filter((trophy) => trophy.disputed);
export const hiddenTrophies = () => all.filter((trophy) => trophy.hidden);
export const storyTrophies = () => all.filter((trophy) => trophy.story);

export const gradeCounts = (ids) => {
  const have = new Set(ids);
  const counts = {};
  for (const t of all) {
    if (!counts[t.grade]) counts[t.grade] = { total: 0, earned: 0 };
    counts[t.grade].total += 1;
    if (have.has(t.id)) counts[t.grade].earned += 1;
  }
  return counts;
};

export const guideSources = (trophy) => {
  const seen = new Set();
  for (const step of trophy.steps || []) {
    for (const id of step.s || []) seen.add(id);
  }
  return [...seen];
};

export const guidesUsingSource = (id) => {
  let n = 0;
  for (const trophy of all) {
    if (guideSources(trophy).includes(id)) n += 1;
  }
  return n;
};

export const matrixCell = (trophy, id) => {
  let n = 0;
  for (const step of trophy.steps || []) {
    if ((step.s || []).includes(id)) n += 1;
  }
  return n;
};

export const countersTotals = (counts) => {
  let current = 0;
  let target = 0;
  for (const t of all) {
    if (!t.psn) continue;
    target += t.psn.target;
    current += Math.min(counts[t.id] || 0, t.psn.target);
  }
  return { current, target, pct: target ? Math.round((current / target) * 100) : 0 };
};

export const auditStats = () => {
  let totalSteps = 0;
  let citedSteps = 0;
  let twoPlusSteps = 0;
  for (const trophy of all) {
    for (const step of trophy.steps || []) {
      totalSteps += 1;
      if (step.s && step.s.length) citedSteps += 1;
      if (step.s && step.s.length > 1) twoPlusSteps += 1;
    }
  }
  const topics = new Set();
  for (const trophy of all) {
    if (trophy.disputed) topics.add(trophy.disputed.topic);
  }
  const sites = new Set();
  for (const entry of record.sources) sites.add(entry.site);
  return {
    official: all.filter((trophy) => trophy.name && trophy.description && trophy.grade).length,
    totalTrophies: all.length,
    totalClaims: totalSteps,
    citedClaims: citedSteps,
    twoPlusClaims: twoPlusSteps,
    sourcePages: record.sources.length,
    sourceSites: sites.size,
    readDate: record.readDate,
    disputes: topics.size,
    disputedTrophies: disputedTrophies().length,
    unconfirmed: all.filter((trophy) => trophy.unconfirmed).length,
    possiblyMissable: possiblyMissableTrophies().length,
    watch: watchTrophies().length,
  };
};
