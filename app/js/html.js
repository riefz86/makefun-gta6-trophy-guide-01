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
