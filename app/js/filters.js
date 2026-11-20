// Filtering: kind, grade, search text, hide-earned, and the spoiler rule.

/**
 * A trophy is hidden by the spoiler setting when it is a story trophy and not yet earned.
 * The rule is stated in the app: spoilers hide the 17 story trophies (chapter and mission
 * completions) until earned. The official list marks 28 trophies hidden on PlayStation, but
 * which ones is not published in the list this guide has, so this guide hides story trophies
 * rather than guessing at the rest.
 */
export function spoilerHidden(trophy, settings, earned) {
  return Boolean(settings.spoilers && trophy.story && !earned);
}

/** Text match for the search box: name, official description and guide. */
export function matchesQuery(trophy, query) {
  if (!query) return true;
  const haystack = (trophy.name + ' ' + trophy.description + ' ' + trophy.guide).toLowerCase();
  return haystack.indexOf(query.toLowerCase()) !== -1;
}

/**
 * Apply the checklist filters. opts: { kind, grade, query, hideEarned, settings, earnedIds }.
 * kind 'missable' matches the missable flag; any other kind matches the trophy's kind.
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
    if (!matchesQuery(t, opts.query || '')) return false;
    return true;
  });
}
