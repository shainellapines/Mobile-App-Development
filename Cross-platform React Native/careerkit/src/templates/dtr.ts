import { Colors } from '@/constants/theme';
import type { OjtInfo, OjtLog } from '@/types/ojt';
import { formatDate, toIsoDate } from '@/utils/dates';
import { escapeHtml } from '@/utils/html';
import { formatHours, formatTime } from '@/utils/ojtHours';
import type { OjtProgress } from '@/utils/ojtProgress';

/**
 * OJT Daily Time Record (DTR) summary as HTML, for the PDF export (FR-O5).
 * Unlike a resume, a DTR IS a table of data, so an HTML <table> is the right tool here.
 * Ends with signature lines for the trainee and the supervisor, as schools usually require.
 */
export function buildDtrHtml(args: {
  traineeName: string;
  info: OjtInfo;
  /** Oldest first, like a paper DTR. */
  logs: OjtLog[];
  progress: OjtProgress;
}): string {
  const { traineeName, info, logs, progress } = args;

  const rows = logs
    .map(
      (log, i) => `
      <tr>
        <td class="num">${i + 1}</td>
        <td>${escapeHtml(formatDate(log.logDate))}</td>
        <td>${escapeHtml(formatTime(log.timeIn))}</td>
        <td>${escapeHtml(formatTime(log.timeOut))}</td>
        <td class="num">${log.breakMinutes}</td>
        <td class="num">${log.hours}</td>
        <td>${escapeHtml(log.tasks ?? '')}</td>
      </tr>`
    )
    .join('');

  const detail = (label: string, value: string | null) =>
    value ? `<div><span class="label">${label}:</span> ${escapeHtml(value)}</div>` : '';

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<title>Daily Time Record</title>
<style>
  @page { size: A4; margin: 14mm; }
  html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  body { font-family: Arial, Helvetica, sans-serif; font-size: 9.5pt; color: ${Colors.text}; margin: 0; }
  h1 { font-size: 16pt; margin: 0 0 2pt; color: ${Colors.primary}; }
  .details { display: grid; grid-template-columns: 1fr 1fr; gap: 2pt 16pt; margin: 6pt 0 10pt; }
  .label { color: ${Colors.mutedText}; }
  table { width: 100%; border-collapse: collapse; }
  th { background: ${Colors.primary}; color: ${Colors.onPrimary}; text-align: left; font-weight: 600; }
  th, td { border: 1px solid ${Colors.border}; padding: 4pt 5pt; vertical-align: top; }
  tr { page-break-inside: avoid; }
  thead { display: table-header-group; } /* repeat the header row on every page */
  .num { text-align: right; white-space: nowrap; }
  .total td { font-weight: bold; background: ${Colors.background}; }
  .summary { margin-top: 10pt; }
  .signatures { display: flex; gap: 40pt; margin-top: 40pt; page-break-inside: avoid; }
  .sign { flex: 1; text-align: center; border-top: 1px solid ${Colors.text}; padding-top: 3pt; }
  .footer { margin-top: 16pt; font-size: 8pt; color: ${Colors.mutedText}; }
</style>
</head>
<body>
  <h1>OJT Daily Time Record</h1>
  <div class="details">
    ${detail('Trainee', traineeName || null)}
    ${detail('Company', info.company)}
    ${detail('Supervisor', info.supervisor)}
    ${detail('Period', info.startDate ? `${formatDate(info.startDate)} – ${formatDate(info.targetEndDate) || 'ongoing'}` : null)}
  </div>

  <table>
    <thead>
      <tr><th>#</th><th>Date</th><th>Time in</th><th>Time out</th><th>Break (min)</th><th>Hours</th><th>Tasks</th></tr>
    </thead>
    <tbody>
      ${rows || '<tr><td colspan="7">No time records yet.</td></tr>'}
      <tr class="total"><td colspan="5">Total rendered hours</td><td class="num">${progress.renderedHours}</td><td></td></tr>
    </tbody>
  </table>

  <div class="summary">
    Required: <strong>${formatHours(progress.requiredHours)}</strong> &nbsp;·&nbsp;
    Rendered: <strong>${formatHours(progress.renderedHours)}</strong> &nbsp;·&nbsp;
    Remaining: <strong>${formatHours(progress.remainingHours)}</strong> &nbsp;·&nbsp;
    Days logged: <strong>${progress.daysLogged}</strong>
  </div>

  <div class="signatures">
    <div class="sign">${escapeHtml(traineeName || 'Trainee')}<br />Trainee</div>
    <div class="sign">${escapeHtml(info.supervisor ?? '')}<br />Supervisor (signature over printed name)</div>
  </div>
  <div class="footer">Generated with CareerKit on ${escapeHtml(formatDate(toIsoDate(new Date())))}.</div>
</body>
</html>`;
}
