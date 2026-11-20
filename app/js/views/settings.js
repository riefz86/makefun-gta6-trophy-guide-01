// Settings: theme, spoilers, hide-earned, export/import/reset, and the sources page.
import { EXOPHASE_URL, PSNPROFILES_URL } from '../config.js';
import { getProgress } from '../store.js';
import { esc } from '../html.js';

/** Render the settings and sources page. */
export function renderSettings(root) {
  const progress = getProgress();
  const s = progress.settings;
  root.innerHTML =
    '<div class="view-head"><h2>Settings &amp; sources</h2>' +
    '<p>Everything here is stored in this browser only. The guide makes no network request at all.</p></div>' +
    '<div class="settings-grid">' +
    '<section class="panel"><h3>Display</h3>' +
    '<div class="row"><label class="toggle"><input id="set-theme" type="checkbox"' +
    (s.theme === 'paper' ? ' checked' : '') +
    '> Light paper theme (off = Vice City night)</label></div>' +
    '<div class="row"><label class="toggle"><input id="set-spoilers" type="checkbox"' +
    (s.spoilers ? ' checked' : '') +
    '> Hide story spoilers until earned</label></div>' +
    '<div class="row"><label class="toggle"><input id="set-hide-earned" type="checkbox"' +
    (s.hideEarned ? ' checked' : '') +
    '> Hide earned trophies in the tracker</label></div>' +
    '<p>The spoiler setting hides the 17 story trophies (chapter and mission completions) until you earn them. The official list marks 28 trophies hidden on PlayStation; which ones is not published in the list this guide has, so this guide hides story trophies rather than guessing at the rest.</p></section>' +
    '<section class="panel"><h3>Your progress</h3>' +
    '<p><b>' +
    progress.earned.length +
    ' of 55 earned.</b> Export saves your ticks, counters, notes and Next up list as one JSON file; import brings it back on any device.</p>' +
    '<div class="row"><button type="button" class="btn" data-action="export">Export progress</button>' +
    '<label class="import-label">Import progress <input id="import-file" type="file" accept="application/json"></label></div>' +
    '<div class="row"><button type="button" class="btn ghost" data-action="reset">Reset all progress</button></div>' +
    '<p id="import-status"></p></section>' +
    '<section class="panel"><h3>Sources</h3>' +
    '<p><b>Official list</b> — names, descriptions and grades as PlayStation publishes them: <a href="' +
    esc(EXOPHASE_URL) +
    '" target="_blank" rel="noopener">Exophase</a>.</p>' +
    '<p><b>PSN counts</b> — the progress targets PlayStation tracks (for example 42 Shooting Range challenges): <a href="' +
    esc(PSNPROFILES_URL) +
    '" target="_blank" rel="noopener">PSNProfiles</a>.</p>' +
    '<p><b>Guides</b> — this guide\u2019s own words, written from the official descriptions. Where a place or step is not pinned down, the guide says so instead of inventing one. Nothing here is copied from another guide.</p>' +
    '<p><b>Artwork</b> — none of Rockstar\u2019s. The sunset look is this guide\u2019s own CSS and one inline SVG mark.</p></section>' +
    '<section class="panel"><h3>About this guide</h3>' +
    '<p><b>Sunset Platinum</b> is a free, open-source, offline guide and tracker for the 55 PlayStation 5 trophies of Grand Theft Auto VI. It runs from its own files, with the network off.</p>' +
    '<p>Kinds are grouped from the official descriptions: story (chapter and mission completions), collectibles (things to find), activities (things to do) and world &amp; money (open-world and economy). Missable flags come from the descriptions too — see the Missables page for the rule and the caveat.</p></section>' +
    '</div>';

  document.getElementById('set-theme').addEventListener('change', (event) => {
    progress.settings.theme = event.target.checked ? 'paper' : 'night';
    window.dispatchEvent(new CustomEvent('sunset-theme-changed'));
  });
  document.getElementById('set-spoilers').addEventListener('change', (event) => {
    progress.settings.spoilers = event.target.checked;
    window.dispatchEvent(new CustomEvent('sunset-settings-changed'));
  });
  document.getElementById('set-hide-earned').addEventListener('change', (event) => {
    progress.settings.hideEarned = event.target.checked;
    window.dispatchEvent(new CustomEvent('sunset-settings-changed'));
  });
  document.getElementById('import-file').addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;
    window.dispatchEvent(new CustomEvent('sunset-import-file', { detail: file }));
  });
}
