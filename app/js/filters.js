// Filtering: kind, grade, search text, hide-earned, disputed, PSN-hidden, not-earned,
// and the spoiler rule.

/**
 * A trophy is hidden by the spoiler setting when PlayStation marks it hidden and it is
 * not yet earned. The official list marks 28 trophies hidden (27 bronze, 1 gold); this
 * guide reads that split from the trophy list itself, so it hides exactly those 28.
 */
export function spoilerHidden(trophy, settings, earned) {
  return Boolean(settings.spoilers && trophy.hidden && !earned);
}

/** Text match for the search box: name, official description, guide and step text. */
export function matchesQuery(trophy, query) {
  if (!query) return true;
  const steps = (trophy.steps || []).map((s) => s.t).join(' ');
  const haystack = (trophy.name + ' ' + trophy.description + ' ' + trophy.guide + ' ' + steps).toLowerCase();
  return haystack.indexOf(query.toLowerCase()) !== -1;
}

/**
 * Apply the checklist filters. opts: { kind, grade, query, hideEarned, disputed,
 * hiddenOnly, notEarned, settings, earnedIds }.
 * kind 'missable' matches any missable tier; any other kind matches the trophy's kind.
 */
export function filterTrophies(list, opts) {
  const earned = new Set(opts.earnedIds || []);
  return list.filter((t) => {
    if (opts.kind && opts.kind !== 'all') {
      if (opts.kind === 'missable') {
        if (!t.missable) return false;
      } else if (t.kind !== opts.kind) {
        return false;
      }
    }
    if (opts.grade && opts.grade !== 'all' && t.grade !== opts.grade) return false;
    if (opts.hideEarned && earned.has(t.id)) return false;
    if (opts.disputed && !t.disputed) return false;
    if (opts.hiddenOnly && !t.hidden) return false;
    if (opts.notEarned && earned.has(t.id)) return false;
    if (!matchesQuery(t, opts.query || '')) return false;
    return true;
  });
}

/**
 * Sort a filtered list. 'psn' is PlayStation order (the list's own order); 'stage' is
 * roadmap order; 'grade' is platinum first, then gold, silver, bronze; 'name' is A–Z.
 */
export function sortTrophies(list, sort) {
  const gradeRank = { platinum: 0, gold: 1, silver: 2, bronze: 3 };
  const sorted = list.slice();
  if (sort === 'stage') sorted.sort((a, b) => a.stage - b.stage || a.id - b.id);
  else if (sort === 'grade') sorted.sort((a, b) => gradeRank[a.grade] - gradeRank[b.grade] || a.id - b.id);
  else if (sort === 'name') sorted.sort((a, b) => a.name.localeCompare(b.name));
  else sorted.sort((a, b) => a.id - b.id);
  return sorted;
}
