// Configuration for the Sunset Platinum guide: storage key, kinds, roadmap phases, sources.
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
export const PHASES = [
  {
    n: 1,
    title: 'Story first',
    blurb: 'Play the story. Chapter trophies, named missions and the character finales all come from the main story — 17 trophies, none of them a grind.',
  },
  {
    n: 2,
    title: 'Activities & skills',
    blurb: 'The open-world skill set: shooting range, races, drone races, fishing, arcade, stranger strands and the one-off feats — 14 trophies.',
  },
  {
    n: 3,
    title: 'Collectibles & the map',
    blurb: 'The slow hunt: meditation spots, card sets, WAiNK locations, vehicles, the whole of Leonida and the garages — 6 trophies.',
  },
  {
    n: 4,
    title: 'Money, mayhem & clean-up',
    blurb: 'Economy and chaos, then 100% completion and the platinum. The long grinds live here — 18 trophies.',
  },
];
