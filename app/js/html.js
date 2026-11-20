// Small HTML helpers shared by every view: escaping and the medal dot.

/** Escape text for safe insertion into HTML. */
export function esc(text) {
  return String(text == null ? '' : text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** A coloured medal dot for a trophy grade. */
export function medalDot(grade) {
  return '<span class="medal ' + esc(grade) + '" title="' + esc(grade) + '"></span>';
}

/** Split guide text into paragraphs of up to two sentences each. */
export function guideParagraphs(text) {
  const sentences = String(text || '')
    .split(/(?<=[.!?])\s+/)
    .filter((s) => s.trim() !== '');
  const paragraphs = [];
  for (let i = 0; i < sentences.length; i += 2) {
    paragraphs.push(sentences.slice(i, i + 2).join(' '));
  }
  return paragraphs;
}

/**
 * Numbered citation superscripts for one step, using the guide's own source numbering.
 * localMap maps a source id to its number within this guide (1-based). A step with a
 * single source is marked as single-source, so the reader can tell at a glance.
 */
export function citeSups(step, localMap) {
  const ids = step.s || [];
  return ids
    .map((id) => '<sup class="cite"><a href="#/sources" title="See the Sources tab">[' + (localMap[id] || '?') + ']</a></sup>')
    .join('');
}

/** The "1 source" tag shown on a step that only one source supports. */
export function singleSourceTag(step) {
  return step.s && step.s.length === 1 ? ' <span class="tag single">1 source</span>' : '';
}

/** Format a number with thousands separators (for PSN money counters). */
export function fmt(n) {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
