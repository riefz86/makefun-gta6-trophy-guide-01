// Sunset Platinum — tracker filters. Retry-2: one clean recording.
export const spoilerHidden = (trophy, settings, earned) => {
  return Boolean(settings.spoilers && trophy.hidden && !earned);
};

export const matchesQuery = (trophy, query) => {
  if (!query) return true;
  const needle = query.toLowerCase();
  const stepText = (trophy.steps || []).map((step) => step.t).join(" ");
  const haystack = [trophy.name, trophy.description, trophy.guide, stepText].join(" ").toLowerCase();
  return haystack.includes(needle);
};

const kindMatches = (trophy, kind) => {
  if (!kind || kind === "all") return true;
  if (kind === "missable") return Boolean(trophy.missable);
  return trophy.kind === kind;
};

const gradeMatches = (trophy, grade) => {
  if (!grade || grade === "all") return true;
  return trophy.grade === grade;
};

export const filterTrophies = (list, opts) => {
  const earned = new Set(opts.earnedIds || []);
  const out = [];
  for (const trophy of list) {
    if (!kindMatches(trophy, opts.kind)) continue;
    if (!gradeMatches(trophy, opts.grade)) continue;
    if (opts.hideEarned && earned.has(trophy.id)) continue;
    if (opts.disputed && !trophy.disputed) continue;
    if (opts.hiddenOnly && !trophy.hidden) continue;
    if (opts.notEarned && earned.has(trophy.id)) continue;
    if (!matchesQuery(trophy, opts.query || "")) continue;
    out.push(trophy);
  }
  return out;
};

const GRADE_RANK = { platinum: 0, gold: 1, silver: 2, bronze: 3 };

const compareStage = (a, b) => (a.stage - b.stage) || (a.id - b.id);
const compareGrade = (a, b) => (GRADE_RANK[a.grade] - GRADE_RANK[b.grade]) || (a.id - b.id);
const compareName = (a, b) => a.name.localeCompare(b.name);
const comparePsn = (a, b) => a.id - b.id;

export const sortTrophies = (list, sort) => {
  const copy = list.slice();
  if (sort === "stage") return copy.sort(compareStage);
  if (sort === "grade") return copy.sort(compareGrade);
  if (sort === "name") return copy.sort(compareName);
  return copy.sort(comparePsn);
};
// Retry-2: single clean recording — content unchanged.
