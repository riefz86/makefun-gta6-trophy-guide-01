// Sunset Platinum — trophy data layer. Retry: one clean recording.
let trophies = [];
let sources = { sources: [], agreed: [], differ: [], unconfirmed: [], readDate: "" };
let loading = null;

const fetchJson = async (url) => (await fetch(url)).json();

const sideOf = (entry) => {
  const side = { label: entry.l, text: entry.x };
  if (entry.s) side.src = entry.s;
  return side;
};

const disputeOf = (entry) => ({ topic: entry.t, a: sideOf(entry.a), b: sideOf(entry.b), decision: entry.d });

const trophyOf = (row) => {
  const trophy = {};
  trophy.id = row.i;
  trophy.name = row.name;
  trophy.description = row.d;
  trophy.grade = row.g;
  trophy.kind = row.k;
  trophy.story = Boolean(row.y);
  trophy.hidden = Boolean(row.h);
  trophy.chapter = row.c === undefined ? null : row.c;
  trophy.opens = row.o === undefined ? null : row.o;
  trophy.stage = row.st;
  trophy.psn = null;
  trophy.missable = null;
  trophy.disputed = null;
  trophy.unconfirmed = row.u === undefined ? null : row.u;
  trophy.partial = row.r === undefined ? null : row.r;
  trophy.guide = row.guide;
  trophy.steps = (row.s || []).map((step) => ({ t: step.t, s: step.s }));
  if (row.p) trophy.psn = { target: row.p.t, unit: row.p.u };
  if (row.m) trophy.missable = { tier: row.m.t, gate: { chapter: row.m.g.c, mission: row.m.g.m, note: row.m.g.n } };
  if (row.x) trophy.disputed = disputeOf(row.x);
  return trophy;
};

const sourcesOf = (doc) => {
  const record = {};
  record.sources = (doc.s || []).map((entry) => ({ id: entry.i, site: entry.w, title: entry.t, type: entry.y, read: entry.r, url: entry.u, note: entry.n, reliability: entry.l }));
  record.agreed = doc.a || [];
  record.differ = (doc.d || []).map(disputeOf);
  record.unconfirmed = doc.u || [];
  record.readDate = doc.r || "";
  return record;
};

const fill = async () => {
  const docs = await Promise.all([fetchJson("data/trophies.json"), fetchJson("data/sources.json")]);
  trophies = docs[0].trophies.map(trophyOf);
  sources = sourcesOf(docs[1]);
  return trophies;
};

export const loadTrophies = () => {
  if (!loading) loading = fill().catch((err) => { loading = null; throw err; });
  return loading;
};

export const allTrophies = () => trophies;
export const trophyById = (id) => trophies.find((trophy) => trophy.id === id);

const missableRank = (trophy) => (trophy.missable && trophy.missable.tier === "possibly" ? 0 : 1);
const byMissableThenId = (a, b) => missableRank(a) - missableRank(b) || a.id - b.id;

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
  return trophies.reduce((counts, trophy) => {
    const bucket = counts[trophy.grade] ?? (counts[trophy.grade] = { total: 0, earned: 0 });
    bucket.total += 1;
    if (have.has(trophy.id)) bucket.earned += 1;
    return counts;
  }, {});
};

export const guideSources = (trophy) =>
  [...new Set((trophy.steps || []).flatMap((step) => step.s || []))];

export const guidesUsingSource = (id) =>
  trophies.reduce((n, trophy) => n + (guideSources(trophy).includes(id) ? 1 : 0), 0);

export const matrixCell = (trophy, id) =>
  (trophy.steps || []).reduce((n, step) => n + ((step.s || []).includes(id) ? 1 : 0), 0);

export const countersTotals = (counts) => {
  const totals = trophies.reduce(
    (acc, trophy) => {
      if (!trophy.psn) return acc;
      acc.target += trophy.psn.target;
      acc.current += Math.min(counts[trophy.id] || 0, trophy.psn.target);
      return acc;
    },
    { current: 0, target: 0 }
  );
  return { ...totals, pct: totals.target ? Math.round((totals.current / totals.target) * 100) : 0 };
};

export const auditStats = () => {
  const stepStats = trophies
    .flatMap((trophy) => trophy.steps || [])
    .reduce(
      (acc, step) => ({
        total: acc.total + 1,
        cited: acc.cited + (step.s && step.s.length ? 1 : 0),
        two: acc.two + (step.s && step.s.length > 1 ? 1 : 0),
      }),
      { total: 0, cited: 0, two: 0 }
    );
  const topics = new Set(trophies.filter((trophy) => trophy.disputed).map((trophy) => trophy.disputed.topic));
  const sites = new Set(sources.sources.map((entry) => entry.site));
  return {
    official: trophies.filter((trophy) => trophy.name && trophy.description && trophy.grade).length,
    totalTrophies: trophies.length,
    totalClaims: stepStats.total,
    citedClaims: stepStats.cited,
    twoPlusClaims: stepStats.two,
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
