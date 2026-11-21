// Sunset Platinum — sources page. Retry-3: re-derived.
import { allSources, allTrophies, auditStats, guidesUsingSource, matrixCell, sourcesRecord } from "../data.js";
import { esc } from "../html.js";

const siteLink = (s) => {
  if (!s.url) return esc(s.site) + " (quoted)";
  return '<a href="' + esc(s.url) + '" target="_blank" rel="noopener">' + esc(s.site) + "</a>";
};

const sourceRow = (s, trophies) => {
  let claims = 0;
  for (const t of trophies) claims += matrixCell(t, s.id);
  const guides = guidesUsingSource(s.id);
  return (
    "<tr><td>" + siteLink(s) + "</td><td>" + esc(s.title) + "</td><td>" + esc(s.type) + "</td>" +
    "<td>" + esc(s.read) + "</td><td>" + claims + "</td><td>" + guides + " / 55</td></tr>"
  );
};

const matrixRow = (t, sources) => {
  const cells = [];
  for (const s of sources) {
    const n = matrixCell(t, s.id);
    cells.push('<td class="' + (n ? "hit" : "miss") + '">' + (n || "·") + "</td>");
  }
  return (
    '<tr><td><a href="#/trophy/' + t.id + '">' + esc(t.name) + "</a></td>" +
    cells.join("") + "<td>" + t.steps.length + "</td></tr>"
  );
};

const joinItems = (items, render) => {
  const parts = [];
  for (const item of items) parts.push(render(item));
  return parts.join("");
};

export const renderSources = (root) => {
  const stats = auditStats();
  const rec = sourcesRecord();
  const sources = allSources();
  const trophies = allTrophies();
  const tableRows = joinItems(sources, (s) => sourceRow(s, trophies));
  const notes = joinItems(
    sources,
    (s) => "<li><b>" + esc(s.site) + ":</b> " + esc(s.note) + " <b>Reliability:</b> " + esc(s.reliability) + "</li>",
  );
  const headCells = joinItems(sources, (s) => "<th>" + esc(s.site) + "</th>");
  const matrixHead = "<tr><th>Trophy</th>" + headCells + "<th>Steps</th></tr>";
  const matrixRows = joinItems(trophies, (t) => matrixRow(t, sources));
  const agreed = joinItems(rec.agreed || [], (a) => "<li>" + esc(a) + "</li>");
  const differ = joinItems(
    rec.differ || [],
    (d) =>
      "<li><b>" + esc(d.topic) + "</b><br>A — " + esc(d.a.label) + ": " + esc(d.a.text) +
      "<br>B — " + esc(d.b.label) + ": " + esc(d.b.text) + "<br><b>Our call:</b> " + esc(d.decision) + "</li>",
  );
  const unconfirmed = joinItems(rec.unconfirmed || [], (u) => "<li>" + esc(u) + "</li>");
  root.innerHTML =
    '<div class="view-head"><h2>Sources</h2>' +
    "<p>Every step in this guide cites its sources, and every number in the audit strip is computed from the data below. " +
    stats.citedClaims + " of " + stats.totalClaims + " steps are cited, " + stats.twoPlusClaims +
    " with two or more sources, across " + stats.sourcePages + " pages from " + stats.sourceSites +
    " sites, read " + esc(stats.readDate) + ". A step that only one source supports is labelled " +
    '<span class="tag single">1 source</span> on its guide page.</p></div>' +
    "<h3>Source pages</h3>" +
    '<div class="table-wrap"><table class="sources-table"><thead><tr><th>Site</th><th>Title</th><th>Type</th><th>Read</th><th>Claims</th><th>Guides</th></tr></thead><tbody>' +
    tableRows + "</tbody></table></div>" +
    '<h3>Notes on each source</h3><ul class="source-notes">' + notes + "</ul>" +
    "<h3>Trophy × source matrix</h3>" +
    "<p>Each cell counts how many steps of that trophy cite that source. A dot means the source is not used in that guide.</p>" +
    '<div class="table-wrap"><table class="matrix-table"><thead>' + matrixHead + "</thead><tbody>" + matrixRows + "</tbody></table></div>" +
    "<h3>What the sources agree on</h3><ul>" + agreed + "</ul>" +
    "<h3>Where the sources differ</h3><ul>" + differ + "</ul>" +
    "<h3>What is still unconfirmed</h3><ul>" + unconfirmed + "</ul>";
};
