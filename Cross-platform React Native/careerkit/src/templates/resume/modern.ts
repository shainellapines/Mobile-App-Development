import { skillCategoryLabel } from '@/constants/vault';
import { Colors } from '@/constants/theme';
import { bullets, groupSkills, joinParts } from '@/templates/resume/shared';
import type { ResumeContent } from '@/types/resume';
import { formatResumeDate, formatResumeDateRange } from '@/utils/dates';
import { escapeHtml } from '@/utils/html';

/**
 * "Modern" resume template (FR-R3, Phase 3).
 * Same data and the same standard headings as ATS Simple, with a more designed look:
 * - a deep-blue header band with the name, target role and (optional) profile photo,
 * - teal section headings with an accent bar, and skills shown as tags,
 * - work first (Experience, Projects), then Education.
 * Best for resumes sent straight to a person (email, printed, walk-in).
 * For online job portals, ATS Simple is still the safer choice.
 */

/** Light tints used only on paper (not in the app theme). */
const LIGHT_TEAL_TEXT = '#CCFBF1'; // target role on the blue header
const TAG_BACKGROUND = '#E0F2F1'; // skill tags

/** One entry: title + dates, then a teal subtitle line, then bullets. */
function entry(title: string, dates: string, subtitle: string, body: string): string {
  return `
    <div class="entry">
      <div class="entry-head">
        <span class="entry-title">${title}</span>
        ${dates ? `<span class="entry-dates">${escapeHtml(dates)}</span>` : ''}
      </div>
      ${subtitle ? `<div class="entry-sub">${subtitle}</div>` : ''}
      ${body}
    </div>`;
}

function section(heading: string, content: string): string {
  return content ? `<section><h2>${heading}</h2>${content}</section>` : '';
}

/**
 * @param photoDataUri the profile photo as a "data:image/...;base64,..." text, or null for no photo.
 *   The photo is put INSIDE the HTML, so the PDF printer never needs to open a file.
 */
export function buildModernHtml(c: ResumeContent, photoDataUri: string | null): string {
  const p = c.profile;

  const contact = [p?.email, p?.phone, p?.address, p?.linkedinUrl, p?.portfolioUrl]
    .filter((v): v is string => Boolean(v && v.trim()))
    .map((v) => `<span>${escapeHtml(v)}</span>`)
    .join('');
  const headline = joinParts([c.targetRole ?? p?.headline], '');

  const experience = c.experience
    .map((e) =>
      entry(
        escapeHtml(e.title),
        formatResumeDateRange(e.startDate, e.endDate),
        joinParts([e.organization, e.location], ' · '),
        bullets(e.description)
      )
    )
    .join('');

  const projects = c.projects
    .map((pr) =>
      entry(
        escapeHtml(pr.name),
        formatResumeDateRange(pr.startDate, pr.endDate),
        joinParts([pr.role, pr.techUsed, pr.link], ' · '),
        bullets(pr.description)
      )
    )
    .join('');

  const education = c.education
    .map((e) =>
      entry(
        escapeHtml(e.degree),
        formatResumeDateRange(e.startDate, e.endDate),
        joinParts([e.school, e.honors], ' · '),
        bullets(e.description)
      )
    )
    .join('');

  // Each skill becomes a small rounded tag, one row per category.
  const skills = groupSkills(c.skills)
    .map(
      ([category, names]) => `
      <div class="skill-row">
        <span class="skill-cat">${escapeHtml(skillCategoryLabel(category))}</span>
        <span class="tags">${names.map((n) => `<span class="tag">${escapeHtml(n)}</span>`).join('')}</span>
      </div>`
    )
    .join('');

  const certifications = c.certifications
    .map((cert) =>
      entry(
        escapeHtml(cert.name),
        formatResumeDate(cert.issueDate),
        joinParts([cert.issuer, cert.credentialId ? `Credential ID: ${cert.credentialId}` : null], ' · '),
        ''
      )
    )
    .join('');

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<title>${escapeHtml(p?.fullName || 'Resume')}</title>
<style>
  @page { size: A4; margin: 14mm 14mm; }
  * { box-sizing: border-box; }
  /* Without this, many PDF printers drop background colors. */
  html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  body { font-family: Arial, Helvetica, sans-serif; font-size: 10.5pt; line-height: 1.4; color: ${Colors.text}; margin: 0; }
  header { display: flex; align-items: center; gap: 14pt; background: ${Colors.primary}; color: ${Colors.onPrimary};
           border-radius: 8pt; padding: 16pt 18pt; }
  .photo { width: 72pt; height: 72pt; border-radius: 50%; object-fit: cover; border: 2pt solid ${Colors.onPrimary}; flex-shrink: 0; }
  h1 { font-size: 22pt; margin: 0; letter-spacing: 0.3pt; }
  .headline { font-size: 11.5pt; margin-top: 2pt; color: ${LIGHT_TEAL_TEXT}; }
  .contact { display: flex; flex-wrap: wrap; gap: 2pt 12pt; margin-top: 6pt; font-size: 9pt; color: ${Colors.border}; }
  .summary { margin: 0 0 0 10pt; }
  section { margin-top: 12pt; }
  h2 { font-size: 11pt; text-transform: uppercase; letter-spacing: 1pt; color: ${Colors.accent};
       border-left: 4pt solid ${Colors.accent}; padding-left: 6pt; margin: 0 0 6pt; }
  .entry { margin: 0 0 8pt 10pt; page-break-inside: avoid; }
  .entry-head { display: flex; justify-content: space-between; gap: 8pt; }
  .entry-title { font-weight: bold; color: ${Colors.primary}; }
  .entry-dates { white-space: nowrap; color: ${Colors.mutedText}; font-size: 9.5pt; }
  .entry-sub { color: ${Colors.accent}; font-size: 9.5pt; }
  ul { margin: 3pt 0 0; padding-left: 14pt; }
  li { margin-bottom: 1pt; }
  .skill-row { display: flex; gap: 8pt; margin: 0 0 5pt 10pt; align-items: baseline; }
  .skill-cat { width: 70pt; flex-shrink: 0; font-weight: bold; font-size: 9.5pt; color: ${Colors.mutedText}; }
  .tags { display: flex; flex-wrap: wrap; gap: 4pt; }
  .tag { background: ${TAG_BACKGROUND}; color: ${Colors.primary}; border-radius: 10pt; padding: 1pt 8pt; font-size: 9.5pt; }
</style>
</head>
<body>
  <header>
    ${photoDataUri ? `<img class="photo" src="${photoDataUri}" alt="" />` : ''}
    <div>
      <h1>${escapeHtml(p?.fullName || 'Your Name')}</h1>
      ${headline ? `<div class="headline">${headline}</div>` : ''}
      ${contact ? `<div class="contact">${contact}</div>` : ''}
    </div>
  </header>
  ${p?.summary ? `<section><h2>Summary</h2><p class="summary">${escapeHtml(p.summary)}</p></section>` : ''}
  ${section('Experience', experience)}
  ${section('Projects', projects)}
  ${section('Education', education)}
  ${section('Skills', skills)}
  ${section('Certifications', certifications)}
</body>
</html>`;
}
