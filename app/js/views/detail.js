// Sunset Platinum — one trophy's guide page. Retry-3: re-derived.
import { EXOPHASE_URL, PSNPROFILES_URL, GRADE_LABELS, KIND_LABELS, MISSABLE_TIER_LABELS } from "../config.js";
import { trophyById, guideSources, guidesUsingSource, allTrophies, sourceById } from "../data.js";
import { getProgress, isEarned, getCount, getNote, isNext } from "../store.js";
import { spoilerHidden } from "../filters.js";
import { esc, medalDot, guideParagraphs, citeSups, singleSourceTag, fmt } from "../html.js";

const detailTags = (t, count) => {
  const tags = [];
  tags.push('<span class="tag">' + esc(GRADE_LABELS[t.grade]) + "</span>");
  tags.push('<span class="tag psn-num">#' + t.id + " of 55</span>");
  if (t.kind !== "platinum") tags.push('<span class="tag">' + esc(KIND_LABELS[t.kind]) + "</span>");
  if (t.missable) {
    tags.push('<span class="tag missable">⚑ ' + esc(MISSABLE_TIER_LABELS[t.missable.tier]) + "</span>");
  }
  if (t.disputed) tags.push('<span class="tag disputed">Sources differ</span>');
  if (t.unconfirmed) tags.push('<span class="tag unconfirmed">Method unconfirmed</span>');
  if (t.hidden) tags.push('<span class="tag hidden-tag">PSN-hidden</span>');
  if (t.story) tags.push('<span class="tag story">Story</span>');
  if (t.chapter) tags.push('<span class="tag">Chapter ' + t.chapter + "</span>");
  tags.push('<span class="tag">Stage ' + t.stage + "</span>");
  if (t.psn) {
    const pct = t.psn.target ? Math.round((count / t.psn.target) * 100) : 0;
    tags.push(
      '<span class="tag psn">PSN ' + fmt(count) + "/" + fmt(t.psn.target) + " " + esc(t.psn.unit) +
      " · " + pct + "%</span>",
    );
  }
  return tags.join("");
};

const stepperBlock = (t, count) => {
  if (!t.psn) return "";
  const pct = t.psn.target ? Math.round((count / t.psn.target) * 100) : 0;
  const stepper =
    '<span class="stepper"><button type="button" data-action="count-minus" data-id="' + t.id +
    '" aria-label="Decrease counter">−</button><span>' + fmt(count) + " / " + fmt(t.psn.target) +
    '</span><button type="button" data-action="count-plus" data-id="' + t.id +
    '" aria-label="Increase counter">+</button></span>';
  return (
    '<div class="panel"><h3>PSN counter</h3><p>PlayStation tracks this one: <b>' + fmt(count) + " / " +
    fmt(t.psn.target) + " " + esc(t.psn.unit) + "</b> (" + pct +
    "%). Use the stepper to keep your count here — it feeds the total in the header.</p>" + stepper + "</div>"
  );
};

const sourceListBlock = (t, srcIds, localMap, total) => {
  const items = [];
  for (const sourceId of srcIds) {
    const n = guidesUsingSource(sourceId);
    const rec = sourceById(sourceId);
    const label = rec ? rec.site + " — " + rec.title : sourceId;
    items.push("<li><b>[" + localMap[sourceId] + "]</b> " + esc(label) + " — cited in " + n + "/" + total + " guides</li>");
  }
  return (
    '<div class="sources"><h3>Sources for this guide</h3><ol>' + items.join("") + "</ol>" +
    '<p>Every step above cites its sources. Steps marked <span class="tag single">1 source</span> rest on a single source — check the <a href="#/sources">Sources tab</a> before you trust them alone. Guide text is this guide’s own words, written from the sources; where a place or step is not pinned down, the guide says so instead of inventing one.</p></div>'
  );
};

export const renderDetail = (root, id) => {
  const t = trophyById(id);
  const progress = getProgress();
  if (!t) {
    root.innerHTML =
      '<div class="view-head"><h2>Not found</h2><p>No trophy with that number. <a href="#/">Back to the tracker</a>.</p></div>';
    return;
  }
  const earned = isEarned(t.id);
  const hidden = spoilerHidden(t, progress.settings, earned);
  const count = t.psn ? getCount(t.id) : 0;
  const total = allTrophies().length;
  const srcIds = guideSources(t);
  const localMap = {};
  srcIds.forEach((sourceId, i) => { localMap[sourceId] = i + 1; });

  let head;
  if (hidden) {
    head =
      "<h2>" + medalDot(t.grade) + '<span class="hidden-mask">Hidden trophy</span></h2>' +
      '<p class="desc hidden-mask">This is a PSN-hidden trophy, hidden by your spoiler shield until it is earned. Turn the shield off in Settings to reveal its name and description.</p>';
  } else {
    head = "<h2>" + medalDot(t.grade) + esc(t.name) + "</h2>";
  }
  const official = hidden
    ? ""
    : '<div class="official"><p class="label">Official description — as PlayStation publishes it</p><p>' + esc(t.description) + "</p></div>";
  const guide = hidden
    ? ""
    : '<div class="guide-body">' +
      guideParagraphs(t.guide).map((p) => "<p>" + esc(p) + "</p>").join("") + "</div>";
  const steps = hidden
    ? ""
    : '<div class="steps"><h3>Steps</h3><ol>' +
      t.steps.map((step) => "<li>" + esc(step.t) + citeSups(step, localMap) + singleSourceTag(step) + "</li>").join("") +
      "</ol></div>";
  let missable = "";
  if (!hidden && t.missable) {
    missable =
      '<div class="callout"><b>⚑ ' + esc(MISSABLE_TIER_LABELS[t.missable.tier]) + ".</b> " +
      esc(t.missable.gate.note) + " Last chance: Chapter " + t.missable.gate.chapter + ", " +
      esc(t.missable.gate.mission) + ".</div>";
  }
  let dispute = "";
  if (!hidden && t.disputed) {
    dispute =
      '<div class="dispute"><h3>Sources differ — ' + esc(t.disputed.topic) + "</h3>" +
      "<p><b>A — " + esc(t.disputed.a.label) + ":</b> " + esc(t.disputed.a.text) + "</p>" +
      "<p><b>B — " + esc(t.disputed.b.label) + ":</b> " + esc(t.disputed.b.text) + "</p>" +
      "<p><b>Our call:</b> " + esc(t.disputed.decision) + "</p></div>";
  }
  const unconfirmed = (!hidden && t.unconfirmed)
    ? '<div class="unconfirmed"><b>METHOD UNCONFIRMED.</b> ' + esc(t.unconfirmed) + "</div>"
    : "";
  const partial = (!hidden && t.partial)
    ? '<div class="callout partial"><b>Partly confirmed.</b> ' + esc(t.partial) + "</div>"
    : "";
  const stepper = !hidden ? stepperBlock(t, count) : "";
  const sourceList = !hidden ? sourceListBlock(t, srcIds, localMap, total) : "";
  let legacySources = "";
  if (!hidden) {
    legacySources =
      '<p class="sources-line">Official list: <a href="' + esc(EXOPHASE_URL) + '" target="_blank" rel="noopener">Exophase</a>';
    if (t.psn) {
      legacySources += ' · PSN target: <a href="' + esc(PSNPROFILES_URL) + '" target="_blank" rel="noopener">PSNProfiles</a>';
    }
    legacySources += ' · Full source table, matrix and disputes: <a href="#/sources">Sources tab</a>.</p>';
  }
  const earnedLabel = earned ? "✓ Earned — mark not earned" : "Mark earned";
  const nextLabel = isNext(t.id) ? "★ On your Next up list — remove" : "☆ Add to Next up";
  const actions =
    '<div class="detail-actions">' +
    '<button type="button" class="btn" data-action="toggle-earned" data-id="' + t.id + '">' + earnedLabel + "</button>" +
    '<button type="button" class="btn ghost" data-action="toggle-next" data-id="' + t.id + '">' + nextLabel + "</button>" +
    "</div>";
  const notePanel =
    '<div class="panel"><h3>Your note</h3>' +
    '<textarea class="note" data-note="' + t.id + '" placeholder="Where you found it, what worked, what to try next…">' +
    esc(getNote(t.id)) + '</textarea>' +
    '<p class="note-saved" id="note-saved"></p></div>';
  root.innerHTML =
    '<p><a class="backlink" href="#/">← Back to tracker</a></p>' +
    '<div class="detail-head">' + head + "</div>" +
    '<div class="meta">' + detailTags(t, count) + "</div>" +
    official + missable + dispute + unconfirmed + partial + guide + steps + sourceList + legacySources +
    actions +
    '<div class="detail-grid">' + stepper + notePanel + "</div>";
};
