// Configuration for the Sunset Platinum guide: storage key, kinds, roadmap stages, sources.
export const STORAGE_KEY = 'sunset-platinum.v1';
export const EXOPHASE_URL = 'https://www.exophase.com/game/grand-theft-auto-vi-psn/trophies/';
export const PSNPROFILES_URL = 'https://psnprofiles.com/trophies/43531-grand-theft-auto-vi';
export const GRADE_ORDER = ['platinum', 'gold', 'silver', 'bronze'];
export const GRADE_LABELS = { platinum: 'Platinum', gold: 'Gold', silver: 'Silver', bronze: 'Bronze' };
export const KIND_LABELS = {
  story: 'Story',
  collectible: 'Collectibles',
  activity: 'Activities',
  world: 'World & money',
  platinum: 'Platinum',
};
export const MISSABLE_TIER_LABELS = { possibly: 'Possibly missable', watch: 'Watch' };
// Stage steps are this guide's own roadmap advice; each step cites its source(s).
// Source ids: exo Exophase, psn PSNProfiles, pyx PowerPyx, gzn GTA Zone, cry CryptoGames,
// gtb GTABase (quoted), tch TechWiser (quoted). Full records live in app/data/sources.json.
export const STAGES = [
  {
    n: 1,
    title: 'Story, Chapters 1–2',
    blurb: 'Play the story from the start. Four trophies land in the first two chapters — and do the Chapter 1 meditation while you are there.',
    steps: [
      { t: 'Play the story in order. Do the Chapter 1 meditation at Jason’s house before the chapter ends — it may be the one missable trophy.', s: ['pyx'] },
      { t: 'Scan vehicles and study animals as you go; progress toward the 100% checklist already counts.', s: ['pyx'] },
      { t: 'Keep a save at the start and end of each chapter. There are 15 manual save slots plus 1 autosave, and there is no mission replay.', s: ['pyx'] },
    ],
  },
  {
    n: 2,
    title: 'Story, Chapters 3–5',
    blurb: 'Finish the story. Eight trophies land in the last three chapters, including the final mission.',
    steps: [
      { t: 'Finish the story; take optional missions as they appear — you need 100 of them for the checklist, and there are 200–300+ in the world.', s: ['pyx'] },
      { t: 'Start the character questlines when they unlock (Andy, Randy and Tyrone in Chapter 3).', s: ['pyx'] },
      { t: 'After the credits you return to free-roam — everything for the checklist is still there.', s: ['pyx'] },
    ],
  },
  {
    n: 3,
    title: 'Activities & skills',
    blurb: 'The open-world skill set: shooting ranges, races, drone races, fishing, arcade, stranger strands and the one-off feats.',
    steps: [
      { t: 'Work the activity trophies in any order: shooting ranges (42 golds), drone races (14 spots), races (20 of 40), stunts (250 of 397).', s: ['pyx'] },
      { t: 'Do each of the 9 activity types once for Master of None; the story introduces most of them.', s: ['pyx'] },
      { t: 'Finish the 8 stranger strands — only Kirk, Kyle, Yago and Pilot Pete count.', s: ['pyx'] },
    ],
  },
  {
    n: 4,
    title: 'Collectibles & the map',
    blurb: 'The slow hunt: meditation spots, card sets, WAiNK locations, vehicles, the whole of Leonida and the garages.',
    steps: [
      { t: 'Meditate at all 18 spots, with both characters at each spot — it counts double.', s: ['pyx'] },
      { t: 'Scan 100 WAiNK locations; complete 3 of the 18 card sets.', s: ['pyx'] },
      { t: 'Discover 100 vehicles by scanning; buy the 8 garages for sale.', s: ['pyx'] },
    ],
  },
  {
    n: 5,
    title: 'Questlines, money & clean-up',
    blurb: 'The five character-questline finales, the economy and chaos trophies, the 100% checklist and the platinum.',
    steps: [
      { t: 'Finish the five character questlines (Andy, Kenton, Billy, Randy, Tyrone).', s: ['pyx'] },
      { t: 'Work the 100% checklist under Progress > Stats — roughly 60% true completion; 70 of 80 challenges.', s: ['pyx'] },
      { t: 'Rob the 8 bank vaults, launder $250,000 in marked bills and spend $100,000 — the money trophies fall out of the checklist.', s: ['pyx'] },
      { t: 'The platinum unlocks when the other 54 are done.', s: ['exo'] },
    ],
  },
];
// Platinum summary — every number comes from PowerPyx's roadmap (see the Sources tab).
export const PLATINUM_SUMMARY = [
  { label: 'Difficulty', value: '4/10' },
  { label: 'Time to platinum', value: '~200 hours (60–80 story, ~100 checklist, ~10 clean-up)' },
  { label: 'Playthroughs', value: '1' },
  { label: 'Online trophies', value: '0' },
  { label: 'Glitched trophies', value: '0' },
  { label: 'Saves', value: '15 manual + 1 autosave' },
  { label: 'Cheats', value: 'Using a cheat disables trophies and saving' },
  { label: 'Mission replay', value: 'None — free-roam after the story' },
];
