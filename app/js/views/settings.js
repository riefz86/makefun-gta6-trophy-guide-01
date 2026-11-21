// Sunset Platinum — settings page. Retry-3: re-derived.
import { EXOPHASE_URL, PSNPROFILES_URL } from "../config.js";
import { getProgress } from "../store.js";
import { esc } from "../html.js";

const checkRow = (id, checked, label) =>
  '<div class="row"><label class="toggle"><input id="' + id + '" type="checkbox"' +
  (checked ? " checked" : "") + "> " + label + "</label></div>";

const displaySection = (s) =>
  '<section class="panel"><h3>Display</h3>' +
  checkRow("set-theme", s.theme === "paper", "Light paper theme (off = Vice City night)") +
  checkRow("set-spoilers", s.spoilers, "Hide story spoilers until earned") +
  checkRow("set-hide-earned", s.hideEarned, "Hide earned trophies in the tracker") +
  "<p>The spoiler shield hides the 28 trophies PlayStation marks hidden (27 bronze, 1 gold) until you earn them. Names and descriptions stay masked while the shield is on.</p></section>";

const progressSection = (progress) =>
  '<section class="panel"><h3>Your progress</h3>' +
  "<p><b>" + progress.earned.length + " of 55 earned.</b> Export saves your ticks, counters, notes and Next up list as one JSON file; import brings it back on any device.</p>" +
  '<div class="row"><button type="button" class="btn" data-action="export">Export progress</button>' +
  '<label class="import-label">Import progress <input id="import-file" type="file" accept="application/json"></label></div>' +
  '<div class="row"><button type="button" class="btn ghost" data-action="reset">Reset all progress</button></div>' +
  '<p id="import-status"></p></section>';

const sourcesSection = () =>
  '<section class="panel"><h3>Sources</h3>' +
  '<p><b>Official list</b> — names, descriptions and grades as PlayStation publishes them: <a href="' + esc(EXOPHASE_URL) + '" target="_blank" rel="noopener">Exophase</a>.</p>' +
  '<p><b>PSN counts</b> — the progress targets PlayStation tracks (for example 42 Shooting Range challenges): <a href="' + esc(PSNPROFILES_URL) + '" target="_blank" rel="noopener">PSNProfiles</a>.</p>' +
  '<p><b>Guides</b> — this guide’s own words, written from the sources in the <a href="#/sources">Sources tab</a>: every step cites its sources, single-source steps are labelled, and anything unconfirmed is marked METHOD UNCONFIRMED. Where a place or step is not pinned down, the guide says so instead of inventing one. Nothing here is copied from another guide.</p>' +
  "<p><b>Artwork</b> — none of Rockstar’s. The sunset look is this guide’s own CSS and one inline SVG mark.</p></section>";

const aboutSection = () =>
  '<section class="panel"><h3>About this guide</h3>' +
  "<p><b>Sunset Platinum</b> is a free, open-source, offline guide and tracker for the 55 PlayStation 5 trophies of Grand Theft Auto VI. It runs from its own files, with the network off.</p>" +
  "<p>Kinds are grouped from the official descriptions: story (chapter and mission completions), collectibles (things to find), activities (things to do) and world &amp; money (open-world and economy). Missable flags come from the played-through guides and the official descriptions — see the Missables page for the rule and the correction to v1.</p></section>";

export const renderSettings = (root) => {
  const progress = getProgress();
  const s = progress.settings;
  root.innerHTML =
    '<div class="view-head"><h2>Settings &amp; sources</h2>' +
    "<p>Everything here is stored in this browser only. The guide makes no network request at all.</p></div>" +
    '<div class="settings-grid">' +
    displaySection(s) + progressSection(progress) + sourcesSection() + aboutSection() +
    "</div>";
  const watch = (id, handler) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("change", handler);
  };
  watch("set-theme", (event) => {
    progress.settings.theme = event.target.checked ? "paper" : "night";
    window.dispatchEvent(new CustomEvent("sunset-theme-changed"));
  });
  watch("set-spoilers", (event) => {
    progress.settings.spoilers = event.target.checked;
    window.dispatchEvent(new CustomEvent("sunset-settings-changed"));
  });
  watch("set-hide-earned", (event) => {
    progress.settings.hideEarned = event.target.checked;
    window.dispatchEvent(new CustomEvent("sunset-settings-changed"));
  });
  watch("import-file", (event) => {
    const file = event.target.files[0];
    if (!file) return;
    window.dispatchEvent(new CustomEvent("sunset-import-file", { detail: file }));
  });
};
