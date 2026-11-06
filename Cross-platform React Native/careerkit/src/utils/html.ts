/**
 * Makes user text safe to put inside HTML. Without this, a name like "R&D <Team>" would
 * break the resume layout, because "&" and "<" have special meaning in HTML.
 */
export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Splits a multi-line description into bullet points: one per non-empty line.
 * Leading "-", "*", or "•" typed by the user are removed (the template adds its own bullets).
 */
export function toBulletLines(text: string | null): string[] {
  if (!text) return [];
  return text
    .split('\n')
    .map((line) => line.trim().replace(/^[-*•]\s*/, ''))
    .filter((line) => line !== '');
}
