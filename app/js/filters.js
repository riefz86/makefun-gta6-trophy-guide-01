// Sunset Platinum — tracker filters. Retry-3: re-derived in one clean recording.
export const spoilerHidden = (trophy, settings, earned) =>
  Boolean(settings.spoilers && trophy.hidden && !earned);

export const matchesQuery = (trophy, query) => {
  if (!query) return true;
  const needle = query.toLowerCase();
  const steps = (trophy.steps || []).map((step) => step.t).join(" ");
  const haystack = (trophy.name + " " + trophy.description + " " + trophy.guide + " " + steps).toLowerCase();
  return haystack.indexOf(needle) !== -1;
};

const kindOk = (trophy, kind) => {
  if (!kind || kind === "all") return true;
  if (kind === "missable") return Boolean(trophy.missable);
  return trophy.kind === kind;
};

const gradeOk = (trophy, grade) => !grade || grade === "all" || trophy.grade === grade;

export const filterTrophies = (list, opts) => {
  const earned = new Set(opts.earnedIds || []);
  const kept = [];
  for (const trophy of list) {
    if (!kindOk(trophy, opts.kind)) continue;
    if (!gradeOk(trophy, opts.grade)) continue;
    if (opts.hideEarned && earned.has(trophy.id)) continue;
    if (opts.disputed && !trophy.disputed) continue;
    if (opts.hiddenOnly && !trophy.hidden) continue;
    if (opts.notEarned && earned.has(trophy.id)) continue;
    if (!matchesQuery(trophy, opts.query || "")) continue;
    kept.push(trophy);
  }
  return kept;
};

const RANK = { platinum: 0, gold: 1, silver: 2, bronze: 3 };

const byStage = (a, b) => (a.stage - b.stage) || (a.id - b.id);
const byGrade = (a, b) => (RANK[a.grade] - RANK[b.grade]) || (a.id - b.id);
const byName = (a, b) => a.name.localeCompare(b.name);
const byPsn = (a, b) => a.id - b.id;

export const sortTrophies = (list, sort) => {
  const copy = list.slice();
  if (sort === "stage") return copy.sort(byStage);
  if (sort === "grade") return copy.sort(byGrade);
  if (sort === "name") return copy.sort(byName);
  return copy.sort(byPsn);
};
