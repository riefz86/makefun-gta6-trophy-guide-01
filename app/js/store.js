// Progress store: earned set, PSN counters, notes, next-up list and settings in localStorage.
import { STORAGE_KEY } from './config.js';

function blankProgress() {
  return {
    earned: [],
    counts: {},
    notes: {},
    next: [],
    settings: { theme: 'night', spoilers: true, hideEarned: false },
  };
}

let progress = blankProgress();

/** Load saved progress from localStorage, or start blank. */
export function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      progress = Object.assign(blankProgress(), parsed);
      progress.settings = Object.assign(blankProgress().settings, parsed.settings || {});
      progress.earned = Array.isArray(parsed.earned) ? parsed.earned : [];
      progress.counts = parsed.counts && typeof parsed.counts === 'object' ? parsed.counts : {};
      progress.notes = parsed.notes && typeof parsed.notes === 'object' ? parsed.notes : {};
      progress.next = Array.isArray(parsed.next) ? parsed.next : [];
    }
  } catch (err) {
    progress = blankProgress();
  }
  return progress;
}

/** The live progress object. */
export function getProgress() {
  return progress;
}

/** Write progress back to localStorage. */
export function saveProgress() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (err) {
    // Storage full or unavailable: the app still works for this session.
  }
}

/** How many trophies are earned. */
export function earnedCount() {
  return progress.earned.length;
}

export function isEarned(id) {
  return progress.earned.indexOf(id) !== -1;
}

/** Flip one trophy's earned state and save. */
export function toggleEarned(id) {
  const at = progress.earned.indexOf(id);
  if (at === -1) progress.earned.push(id);
  else progress.earned.splice(at, 1);
  saveProgress();
  return isEarned(id);
}

/** A PSN-tracked counter value (0 when never set). */
export function getCount(id) {
  return progress.counts[id] || 0;
}

/** Set a PSN-tracked counter, clamped to 0..target, and save. */
export function setCount(id, value, target) {
  const clamped = Math.max(0, Math.min(target, Math.round(value) || 0));
  if (clamped === 0) delete progress.counts[id];
  else progress.counts[id] = clamped;
  saveProgress();
  return clamped;
}

/** A per-trophy note, or ''. */
export function getNote(id) {
  return progress.notes[id] || '';
}

/** Save a per-trophy note (blank removes it). */
export function setNote(id, text) {
  const trimmed = (text || '').trim();
  if (trimmed === '') delete progress.notes[id];
  else progress.notes[id] = trimmed;
  saveProgress();
}

/** Whether a trophy is on the Next up list. */
export function isNext(id) {
  return progress.next.indexOf(id) !== -1;
}

/** Add or remove a trophy from the Next up list. */
export function toggleNext(id) {
  const at = progress.next.indexOf(id);
  if (at === -1) progress.next.push(id);
  else progress.next.splice(at, 1);
  saveProgress();
  return isNext(id);
}

/** The whole progress as a JSON file's text, for export. */
export function exportProgress() {
  return JSON.stringify({ app: 'sunset-platinum', version: 2, progress }, null, 2);
}

/** Replace progress from an exported file's text. Returns { ok, error }. */
export function importProgress(text) {
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch (err) {
    return { ok: false, error: 'That file is not valid JSON.' };
  }
  const incoming = parsed.progress || parsed;
  if (!incoming || !Array.isArray(incoming.earned)) {
    return { ok: false, error: 'That file is not a Sunset Platinum export.' };
  }
  progress = Object.assign(blankProgress(), incoming);
  progress.settings = Object.assign(blankProgress().settings, incoming.settings || {});
  saveProgress();
  return { ok: true };
}

/** Clear every tick, counter, note and next-up mark. */
export function resetProgress() {
  progress = blankProgress();
  saveProgress();
}
