import { skillCategoryLabel } from '@/constants/vault';
import type { ResumeContent } from '@/types/resume';
import type { SkillCategory } from '@/types/skill';
import { formatResumeDate, formatResumeDateRange } from '@/utils/dates';
import { escapeHtml, toBulletLines } from '@/utils/html';

/**
 * "ATS Simple" resume template (FR-R6).
 * ATS = Applicant Tracking System: software many companies use to read resumes automatically.
 * To be easy for it to read, this template uses:
 * - one column, top to bottom (no sidebars, no tables for layout),
 * - standard headings: Summary, Education, Experience, Projects, Skills, Certifications,
 * - real text only (no text inside images), a standard font, and A4 paper.
 */

/** Escapes and joins the non-empty parts with a separator. */
function joinParts(parts: (string | null | undefined)[], separator: string): string {
  return parts
    .filter((p): p is string => Boolean(p && p.trim()))
    .map(escapeHtml)
    .join(separator);
}

function bullets(text: string | null): string {
  const lines = toBulletLines(text);
  if (lines.length === 0) return '';
  return `<ul>${lines.map((l) => `<li>${escapeHtml(l)}</li>`).join('')}</ul>`;
}

/** One entry: bold title + dates on the first line, details below. */
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
  return content ? `<h2>${heading}</h2>${content}` : '';
}

export function buildAtsSimpleHtml(c: ResumeContent): string {
  const p = c.profile;

  const contact = joinParts([p?.email, p?.phone, p?.address, p?.linkedinUrl, p?.portfolioUrl], ' &nbsp;|&nbsp; ');
  const headline = joinParts([c.targetRole ?? p?.headline], '');

  const education = c.education
    .map((e) =>
      entry(
        escapeHtml(e.degree),
        formatResumeDateRange(e.startDate, e.endDate),
        joinParts([e.school, e.honors], ' — '),
        bullets(e.description)
      )
    )
    .join('');

  const experience = c.experience
    .map((e) =>
      entry(
        escapeHtml(e.title),
        formatResumeDateRange(e.startDate, e.endDate),
        joinParts([e.organization, e.location], ' — '),
        bullets(e.description)
      )
    )
    .join('');

  const projects = c.projects
    .map((pr) =>
      entry(
        escapeHtml(pr.name),
        formatResumeDateRange(pr.startDate, pr.endDate),
        joinParts([pr.role, pr.techUsed, pr.link], ' — '),
        bullets(pr.description)
      )
    )
    .join('');

  // Skills are grouped by category on one line each: "Technical: React, TypeScript".
  const skillGroups = new Map<SkillCategory, string[]>();
  for (const s of c.skills) {
    skillGroups.set(s.category, [...(skillGroups.get(s.category) ?? []), s.name]);
  }
  const skills = [...skillGroups.entries()]
    .map(([category, names]) => `<p><strong>${escapeHtml(skillCategoryLabel(category))}:</strong> ${joinParts(names, ', ')}</p>`)
    .join('');

  const certifications = c.certifications
    .map((cert) =>
      entry(
        escapeHtml(cert.name),
        formatResumeDate(cert.issueDate),
        joinParts([cert.issuer, cert.credentialId ? `Credential ID: ${cert.credentialId}` : null], ' — '),
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
  @page { size: A4; margin: 16mm 16mm; }
  * { box-sizing: border-box; }
  body { font-family: Arial, Helvetica, sans-serif; font-size: 10.5pt; line-height: 1.35; color: #000; margin: 0; }
  h1 { font-size: 20pt; margin: 0; }
  .headline { font-size: 11pt; margin-top: 2pt; }
  .contact { font-size: 9.5pt; margin-top: 4pt; }
  h2 { font-size: 11.5pt; text-transform: uppercase; letter-spacing: 0.5pt;
       border-bottom: 1px solid #000; padding-bottom: 2pt; margin: 14pt 0 6pt; }
  .entry { margin-bottom: 8pt; page-break-inside: avoid; }
  .entry-head { display: flex; justify-content: space-between; gap: 8pt; }
  .entry-title { font-weight: bold; }
  .entry-dates { white-space: nowrap; }
  .entry-sub { font-style: italic; }
  ul { margin: 3pt 0 0 0; padding-left: 16pt; }
  li { margin-bottom: 1pt; }
  p { margin: 0 0 3pt; }
</style>
</head>
<body>
  <h1>${escapeHtml(p?.fullName || 'Your Name')}</h1>
  ${headline ? `<div class="headline">${headline}</div>` : ''}
  ${contact ? `<div class="contact">${contact}</div>` : ''}
  ${section('Summary', p?.summary ? `<p>${escapeHtml(p.summary)}</p>` : '')}
  ${section('Education', education)}
  ${section('Experience', experience)}
  ${section('Projects', projects)}
  ${section('Skills', skills)}
  ${section('Certifications', certifications)}
</body>
</html>`;
}
