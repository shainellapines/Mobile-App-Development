/**
 * Common Philippine pre-employment documents (Section 7.2, FR-Q2).
 * defaultValidityMonths are EDITABLE SUGGESTIONS ONLY: rules vary by issuing office and employer,
 * so the user can always change the expiry date. null = usually does not expire.
 */
export const REQUIREMENT_TEMPLATES = {
  private: [
    { name: 'NBI Clearance', defaultValidityMonths: 12 },
    { name: 'Police Clearance', defaultValidityMonths: 6 },
    { name: 'Barangay Clearance', defaultValidityMonths: 6 },
    { name: 'Medical Certificate / Pre-employment Medical', defaultValidityMonths: 6 },
    { name: 'PSA Birth Certificate', defaultValidityMonths: null },
    { name: 'TIN', defaultValidityMonths: null },
    { name: 'SSS Number', defaultValidityMonths: null },
    { name: 'PhilHealth Number', defaultValidityMonths: null },
    { name: 'Pag-IBIG MID Number', defaultValidityMonths: null },
    { name: 'Transcript of Records / Diploma', defaultValidityMonths: null },
    { name: '2x2 ID Photos', defaultValidityMonths: null },
  ],
  government: [
    { name: 'Personal Data Sheet (CS Form 212)', defaultValidityMonths: null },
    { name: 'CSC Eligibility / Certificate of Eligibility', defaultValidityMonths: null },
    { name: 'NBI Clearance', defaultValidityMonths: 12 },
    { name: 'PSA Birth Certificate', defaultValidityMonths: null },
    { name: 'Transcript of Records / Diploma', defaultValidityMonths: null },
    { name: 'Medical Certificate', defaultValidityMonths: 6 },
    { name: 'Certificate of Employment / Service Record (if any)', defaultValidityMonths: null },
  ],
  abroad: [
    { name: 'Passport', defaultValidityMonths: 120 },
    { name: 'PSA Birth Certificate', defaultValidityMonths: null },
    { name: 'NBI Clearance', defaultValidityMonths: 12 },
    { name: 'Transcript of Records / Diploma', defaultValidityMonths: null },
    { name: 'Medical Exam Result', defaultValidityMonths: 3 },
  ],
} as const;

export const OJT_REQUIREMENT_DEFAULTS = [
  'Endorsement Letter',
  'Memorandum of Agreement (MOA)',
  'Parent/Guardian Consent (Waiver)',
  'Medical Certificate',
  'Insurance',
  'Resume',
  'Daily Time Record (DTR)',
  'Training Plan',
  'Weekly / Narrative Reports',
  'Certificate of Completion',
  'Supervisor Evaluation Form',
];

/** 'private' | 'government' | 'abroad' — the three template sets. */
export type TemplateSet = keyof typeof REQUIREMENT_TEMPLATES;

export type RequirementTemplate = (typeof REQUIREMENT_TEMPLATES)[TemplateSet][number];

/** Shown wherever a suggested expiry appears (Section 7.2 asks for this note in the UI). */
export const VALIDITY_DISCLAIMER =
  'Validity periods are suggestions only — rules differ by issuing office and employer. You can always change the expiry date.';
