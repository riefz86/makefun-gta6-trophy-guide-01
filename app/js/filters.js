// Sunset Platinum — tracker filters. Retry: one clean recording.
export const spoilerHidden = (trophy, settings, earned) =>
  Boolean(settings.spoilers && trophy.hidden && !earned);

export const matchesQuery = (trophy, query) => {
  if (!query) return true;
  const steps = (trophy.steps || []).map((step) => step.t).join(" ");
  const haystack = `${trophy.name} ${trophy.description} ${trophy.guide} ${steps}`.toLowerCase();
  return haystack.includes(query.toLowerCase());
};

const kindPasses = (trophy, kind) => {
  if (!kind || kind === "all") return true;
  if (kind === "missable") return Boolean(trophy.missable);
  return trophy.kind === kind;
};

export const filterTrophies = (list, opts) => {
  const earned = new Set(opts.earnedIds || []);
  return list.filter((trophy) => {
    if (!kindPasses(trophy, opts.kind)) return false;
    if (opts.grade && opts.grade !== "all" && trophy.grade !== opts.grade) return false;
    if (opts.hideEarned && earned.has(trophy.id)) return false;
    if (opts.disputed && !trophy.disputed) return false;
    if (opts.hiddenOnly && !trophy.hidden) return false;
    if (opts.notEarned && earned.has(trophy.id)) return false;
    return matchesQuery(trophy, opts.query || "");
  });
};

const GRADE_RANK = { platinum: 0, gold: 1, silver: 2, bronze: 3 };
const sorters = {
  stage: (a, b) => a.stage - b.stage || a.id - b.id,
  grade: (a, b) => GRADE_RANK[a.grade] - GRADE_RANK[b.grade] || a.id - b.id,
  name: (a, b) => a.name.localeCompare(b.name),
  psn: (a, b) => a.id - b.id,
};

export const sortTrophies = (list, sort) => list.slice().sort(sorters[sort] || sorters.psn);
// Retry: single clean recording — content unchanged.
