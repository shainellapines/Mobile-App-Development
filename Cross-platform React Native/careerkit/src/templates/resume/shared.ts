import type { Skill, SkillCategory } from '@/types/skill';
import { escapeHtml, toBulletLines } from '@/utils/html';

/** Helpers used by every resume template, so all templates treat the data the same way. */

/** Escapes and joins the non-empty parts with a separator. */
export function joinParts(parts: (string | null | undefined)[], separator: string): string {
  return parts
    .filter((p): p is string => Boolean(p && p.trim()))
    .map(escapeHtml)
    .join(separator);
}

/** A multi-line description → an HTML bullet list ('' when empty). */
export function bullets(text: string | null): string {
  const lines = toBulletLines(text);
  if (lines.length === 0) return '';
  return `<ul>${lines.map((l) => `<li>${escapeHtml(l)}</li>`).join('')}</ul>`;
}

/** Skills grouped by category, keeping the user's order: [['technical', ['React', 'SQL']], ...]. */
export function groupSkills(skills: Skill[]): [SkillCategory, string[]][] {
  const groups = new Map<SkillCategory, string[]>();
  for (const s of skills) groups.set(s.category, [...(groups.get(s.category) ?? []), s.name]);
  return [...groups.entries()];
}
