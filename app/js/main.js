// Boot and hash routing for the Sunset Platinum guide.
import { loadTrophies, trophyById } from './data.js';
import {
  loadProgress,
  getProgress,
  saveProgress,
  toggleEarned,
  setCount,
  setNote,
  toggleNext,
  exportProgress,
  importProgress,
  resetProgress,
  getCount,
} from './store.js';
import { applyTheme, renderShell } from './views/shell.js';
import { renderChecklist } from './views/checklist.js';
import { renderDetail } from './views/detail.js';
import { renderRoadmap } from './views/roadmap.js';
import { renderMissables } from './views/missables.js';
import { renderPlanner } from './views/planner.js';
import { renderSettings } from './views/settings.js';

const view = document.getElementById('view');
const ui = { kind: 'all', grade: 'all', query: '' };

/** Read the current route from the hash: #/ tracker, #/roadmap, #/missables, #/planner, #/settings, #/trophy/<id>. */
function parseHash() {
  const hash = window.location.hash.replace(/^#\/?/, '');
  const parts = hash.split('/');
  if (parts[0] === 'roadmap') return { name: 'roadmap' };
  if (parts[0] === 'missables') return { name: 'missables' };
  if (parts[0] === 'planner') return { name: 'planner' };
  if (parts[0] === 'settings') return { name: 'settings' };
  if (parts[0] === 'trophy' && parts[1]) return { name: 'trophy', id: Number(parts[1]) };
  return { name: 'tracker' };
}

/** Render the shell and the active view. */
function render() {
  const route = parseHash();
  renderShell(route.name === 'trophy' ? '' : route.name);
  if (route.name === 'roadmap') renderRoadmap(view);
  else if (route.name === 'missables') renderMissables(view);
  else if (route.name === 'planner') renderPlanner(view);
  else if (route.name === 'settings') renderSettings(view);
  else if (route.name === 'trophy') renderDetail(view, route.id);
  else renderChecklist(view, ui);
  window.scrollTo(0, 0);
}

/** Offer a text file as a download. */
function download(filename, text) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

// One delegated click handler for every button in the app.
document.addEventListener('click', (event) => {
  const el = event.target.closest('[data-action]');
  if (!el) return;
  const action = el.dataset.action;
  const id = Number(el.dataset.id);
  if (action === 'toggle-earned') {
    toggleEarned(id);
    render();
  } else if (action === 'toggle-next') {
    toggleNext(id);
    render();
  } else if (action === 'count-plus' || action === 'count-minus') {
    const t = trophyById(id);
    if (t && t.psn) {
      setCount(id, getCount(id) + (action === 'count-plus' ? 1 : -1), t.psn.target);
      render();
    }
  } else if (action === 'set-kind') {
    ui.kind = el.dataset.kind;
    render();
  } else if (action === 'toggle-theme') {
    const settings = getProgress().settings;
    settings.theme = settings.theme === 'paper' ? 'night' : 'paper';
    saveProgress();
    applyTheme(settings.theme);
    render();
  } else if (action === 'export') {
    download('sunset-platinum-progress.json', exportProgress());
  } else if (action === 'reset') {
    if (window.confirm('Reset all progress, notes and Next up marks?')) {
      resetProgress();
      render();
    }
  }
});

// Notes save as you type, without re-rendering.
document.addEventListener('input', (event) => {
  const note = event.target.closest('textarea.note');
  if (!note) return;
  setNote(Number(note.dataset.note), note.value);
  const saved = document.getElementById('note-saved');
  if (saved) saved.textContent = 'Saved in this browser.';
});

// The settings page reports its changes through custom events.
window.addEventListener('sunset-theme-changed', () => {
  saveProgress();
  applyTheme(getProgress().settings.theme);
  render();
});
window.addEventListener('sunset-settings-changed', () => {
  saveProgress();
  render();
});
window.addEventListener('sunset-import-file', async (event) => {
  const file = event.detail;
  const result = importProgress(await file.text());
  const status = document.getElementById('import-status');
  if (status) status.textContent = result.ok ? 'Imported.' : 'Import failed: ' + result.error;
  if (result.ok) render();
});

// Keyboard: / focuses search, Esc goes back from a trophy page.
document.addEventListener('keydown', (event) => {
  const active = document.activeElement;
  const typing = active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA');
  if (event.key === '/' && !typing) {
    const search = document.getElementById('search');
    if (search) {
      event.preventDefault();
      search.focus();
    }
  }
  if (event.key === 'Escape' && parseHash().name === 'trophy') {
    window.location.hash = '#/';
  }
});

window.addEventListener('hashchange', render);

/** Boot: load the trophy list, restore progress, apply the theme, render. */
async function boot() {
  await loadTrophies();
  loadProgress();
  applyTheme(getProgress().settings.theme);
  render();
}

boot();
