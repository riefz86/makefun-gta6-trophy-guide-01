// Sunset Platinum — roadmap to the platinum. Retry-3: re-derived.
import { trophiesInStage } from "../data.js";
import { getProgress, isEarned } from "../store.js";
import { esc, citeSups } from "../html.js";

export const STAGES = [
  {
    title: "Story, Chapters 1–2", n: 1,
    blurb: "Play the story from the start. Four trophies land in the first two chapters — and do the Chapter 1 meditation while you are there.",
    steps: [
      { s: ["pyx"], t: "Play the story in order. Do the Chapter 1 meditation at Jason’s house before the chapter ends — it may be the one missable trophy." },
      { s: ["pyx"], t: "Scan vehicles and study animals as you go; progress toward the 100% checklist already counts." },
      { s: ["pyx"], t: "Keep a save at the start and end of each chapter. There are 15 manual save slots plus 1 autosave, and there is no mission replay." },
    ],
  },
  {
    title: "Story, Chapters 3–5", n: 2,
    blurb: "Finish the story. Eight trophies land in the last three chapters, including the final mission.",
    steps: [
      { s: ["pyx"], t: "Finish the story; take optional missions as they appear — you need 100 of them for the checklist, and there are 200–300+ in the world." },
      { s: ["pyx"], t: "Start the character questlines when they unlock (Andy, Randy and Tyrone in Chapter 3)." },
      { s: ["pyx"], t: "After the credits you return to free-roam — everything for the checklist is still there." },
    ],
  },
  {
    title: "Activities & skills", n: 3,
    blurb: "The open-world skill set: shooting ranges, races, drone races, fishing, arcade, stranger strands and the one-off feats.",
    steps: [
      { s: ["pyx"], t: "Work the activity trophies in any order: shooting ranges (42 golds), drone races (14 spots), races (20 of 40), stunts (250 of 397)." },
      { s: ["pyx"], t: "Do each of the 9 activity types once for Master of None; the story introduces most of them." },
      { s: ["pyx"], t: "Finish the 8 stranger strands — only Kirk, Kyle, Yago and Pilot Pete count." },
    ],
  },
  {
    title: "Collectibles & the map", n: 4,
    blurb: "The slow hunt: meditation spots, card sets, WAiNK locations, vehicles, the whole of Leonida and the garages.",
    steps: [
      { s: ["pyx"], t: "Meditate at all 18 spots, with both characters at each spot — it counts double." },
      { s: ["pyx"], t: "Scan 100 WAiNK locations; complete 3 of the 18 card sets." },
      { s: ["pyx"], t: "Discover 100 vehicles by scanning; buy the 8 garages for sale." },
    ],
  },
  {
    title: "Questlines, money & clean-up", n: 5,
    blurb: "The five character-questline finales, the economy and chaos trophies, the 100% checklist and the platinum.",
    steps: [
      { s: ["pyx"], t: "Finish the five character questlines (Andy, Kenton, Billy, Randy, Tyrone)." },
      { s: ["pyx"], t: "Work the 100% checklist under Progress > Stats — roughly 60% true completion; 70 of 80 challenges." },
      { s: ["pyx"], t: "Rob the 8 bank vaults, launder $250,000 in marked bills and spend $100,000 — the money trophies fall out of the checklist." },
      { s: ["exo"], t: "The platinum unlocks when the other 54 are done." },
    ],
  },
];

export const PLATINUM_SUMMARY = [
  ["Difficulty", "4/10"],
  ["Time to platinum", "~200 hours (60–80 story, ~100 checklist, ~10 clean-up)"],
  ["Playthroughs", "1"],
  ["Online trophies", "0"],
  ["Glitched trophies", "0"],
  ["Saves", "15 manual + 1 autosave"],
  ["Cheats", "Using a cheat disables trophies and saving"],
  ["Mission replay", "None — free-roam after the story"],
];

const sourceName = (id) => {
  if (id === "exo") return "Exophase";
  if (id === "pyx") return "PowerPyx";
  return id;
};

const stageCard = (stage) => {
  let earned = 0;
  for (const t of stage.trophies) if (isEarned(t.id)) earned += 1;
  const pct = stage.trophies.length ? Math.round((earned / stage.trophies.length) * 100) : 0;
  const srcIds = [];
  for (const step of stage.steps || []) {
    for (const id of step.s || []) {
      if (srcIds.indexOf(id) === -1) srcIds.push(id);
    }
  }
  const localMap = {};
  srcIds.forEach((id, i) => { localMap[id] = i + 1; });
  const steps = [];
  for (const step of stage.steps || []) steps.push("<li>" + esc(step.t) + citeSups(step, localMap) + "</li>");
  const names = [];
  for (const t of stage.trophies) {
    const done = isEarned(t.id) ? "done" : "";
    const flag = t.missable ? " ⚑" : "";
    names.push('<li class="' + done + '"><a href="#/trophy/' + t.id + '">' + esc(t.name) + "</a>" + flag + "</li>");
  }
  const sourceList = srcIds.map((id, i) => "[" + (i + 1) + "] " + esc(sourceName(id))).join(", ");
  return (
    '<section class="phase-card"><h3><span class="num">' + stage.n + "</span>" + esc(stage.title) + "</h3>" +
    '<p class="blurb">' + esc(stage.blurb) + "</p>" +
    '<ol class="stage-steps">' + steps.join("") + "</ol>" +
    '<p class="stage-sources">Sources: ' + sourceList + ' — see the <a href="#/sources">Sources tab</a>.</p>' +
    '<div class="progressbar"><span style="width:' + pct + '%"></span></div>' +
    '<p class="hero-sub">' + earned + " / " + stage.trophies.length + " earned in this stage</p>" +
    '<ul class="trophy-names">' + names.join("") + "</ul></section>"
  );
};

export const renderRoadmap = (root) => {
  const stages = [];
  for (const stage of STAGES) stages.push({ ...stage, trophies: trophiesInStage(stage.n) });
  const summary = [];
  for (const [label, value] of PLATINUM_SUMMARY) {
    summary.push('<div class="summary-row"><span>' + esc(label) + "</span><b>" + esc(value) + "</b></div>");
  }
  const cards = [];
  for (const stage of stages) cards.push(stageCard(stage));
  root.innerHTML =
    '<div class="view-head"><h2>Roadmap to the platinum</h2>' +
    "<p>The order to earn them in, in five stages: story first, then activities, then collectibles, then the questlines, money and clean-up. The platinum, <b>Vice Got a Price!</b>, unlocks when the other 54 are done. ⚑ marks a missable or watch trophy — see the Missables page. Every step below cites its source.</p></div>" +
    '<section class="panel platinum-summary"><h3>Platinum at a glance</h3>' + summary.join("") +
    '<p>All numbers from PowerPyx’s roadmap (see the <a href="#/sources">Sources tab</a>). Any number with no source was left out rather than invented.</p></section>' +
    '<div class="phase-grid">' + cards.join("") + "</div>";
};
