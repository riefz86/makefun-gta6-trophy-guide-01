let trophies = [];
let sources = { sources: [], agreed: [], differ: [], unconfirmed: [], readDate: "" };
let loading = null;

const loadJson = async (url) => {
  const res = await fetch(url);
  return res.json();
};

const makeSide = (entry) => {
  const side = { label: entry.l, text: entry.x };
  if (entry.s) side.src = entry.s;
  return side;
};

const makeDispute = (entry) => {
  return { topic: entry.t, a: makeSide(entry.a), b: makeSide(entry.b), decision: entry.d };
};

const decodeStep = (step) => ({ t: step.t, s: step.s });

const decodeTrophy = (row) => {
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
    steps: (row.s || []).map(decodeStep),
  };
  if (row.p) trophy.psn = { target: row.p.t, unit: row.p.u };
  if (row.m) {
    trophy.missable = {
      tier: row.m.t,
      gate: { chapter: row.m.g.c, mission: row.m.g.m, note: row.m.g.n },
    };
  }
  if (row.x) trophy.disputed = makeDispute(row.x);
  return trophy;
};

const decodeSources = (doc) => {
  const record = { sources: [], agreed: [], differ: [], unconfirmed: [], readDate: "" };
  for (const entry of doc.s || []) {
    record.sources.push({
      id: entry.i, site: entry.w, title: entry.t, type: entry.y,
      read: entry.r, url: entry.u, note: entry.n, reliability: entry.l,
    });
  }
  record.agreed = doc.a || [];
  for (const entry of doc.d || []) record.differ.push(makeDispute(entry));
  record.unconfirmed = doc.u || [];
  record.readDate = doc.r || "";
  return record;
};

const fill = async () => {
  const docs = await Promise.all([loadJson("data/trophies.json"), loadJson("data/sources.json")]);
  trophies = docs[0].trophies.map(decodeTrophy);
  sources = decodeSources(docs[1]);
  return trophies;
};

export const loadTrophies = () => {
  if (!loading) loading = fill().catch((err) => { loading = null; throw err; });
  return loading;
};

export const allTrophies = () => trophies;
export const trophyById = (id) => trophies.find((trophy) => trophy.id === id);

const missableRank = (trophy) => (trophy.missable && trophy.missable.tier === "possibly" ? 0 : 1);

const byMissableThenId = (a, b) => {
  const rank = missableRank(a) - missableRank(b);
  return rank !== 0 ? rank : a.id - b.id;
};

export const missableTrophies = () => trophies.filter((trophy) => trophy.missable).sort(byMissableThenId);
export const sourcesRecord = () => sources;
export const sourceById = (id) => sources.sources.find((entry) => entry.id === id);
export const possiblyMissableTrophies = () => trophies.filter((trophy) => trophy.missable && trophy.missable.tier === "possibly");
export const allSources = () => sources.sources;
export const watchTrophies = () => trophies.filter((trophy) => trophy.missable && trophy.missable.tier === "watch");
export const trophiesInStage = (n) => trophies.filter((trophy) => trophy.stage === n);
export const disputedTrophies = () => trophies.filter((trophy) => trophy.disputed);
export const hiddenTrophies = () => trophies.filter((trophy) => trophy.hidden);
export const storyTrophies = () => trophies.filter((trophy) => trophy.story);

export const gradeCounts = (ids) => {
  const have = new Set(ids);
  const counts = {};
  for (const trophy of trophies) {
    if (!counts[trophy.grade]) counts[trophy.grade] = { total: 0, earned: 0 };
    counts[trophy.grade].total += 1;
    if (have.has(trophy.id)) counts[trophy.grade].earned += 1;
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
  for (const trophy of trophies) {
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
  for (const trophy of trophies) {
    if (!trophy.psn) continue;
    target += trophy.psn.target;
    current += Math.min(counts[trophy.id] || 0, trophy.psn.target);
  }
  const pct = target ? Math.round((current / target) * 100) : 0;
  return { current, target, pct };
};

export const auditStats = () => {
  let totalSteps = 0;
  let citedSteps = 0;
  let twoPlusSteps = 0;
  for (const trophy of trophies) {
    for (const step of trophy.steps || []) {
      totalSteps += 1;
      if (step.s && step.s.length) citedSteps += 1;
      if (step.s && step.s.length > 1) twoPlusSteps += 1;
    }
  }
  const topics = new Set();
  for (const trophy of trophies) {
    if (trophy.disputed) topics.add(trophy.disputed.topic);
  }
  const sites = new Set();
  for (const entry of sources.sources) sites.add(entry.site);
  return {
    official: trophies.filter((trophy) => trophy.name && trophy.description && trophy.grade).length,
    totalTrophies: trophies.length,
    totalClaims: totalSteps,
    citedClaims: citedSteps,
    twoPlusClaims: twoPlusSteps,
    sourcePages: sources.sources.length,
    sourceSites: sites.size,
    readDate: sources.readDate,
    disputes: topics.size,
    disputedTrophies: disputedTrophies().length,
    unconfirmed: trophies.filter((trophy) => trophy.unconfirmed).length,
    possiblyMissable: possiblyMissableTrophies().length,
    watch: watchTrophies().length,
  };
};
