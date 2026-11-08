import { addDays, addMonths, isWeekend, subDays, subMonths } from 'date-fns';

import { DEFAULT_BREAK_MINUTES, DEFAULT_REQUIRED_HOURS } from '@/constants/ojt';
import { DEFAULT_REMINDER_DAYS } from '@/constants/requirements';
import type { ApplicationInput } from '@/types/application';
import type { CertificationInput } from '@/types/certification';
import type { EducationInput } from '@/types/education';
import type { ExperienceInput } from '@/types/experience';
import type { OjtInfoInput, OjtLogInput } from '@/types/ojt';
import type { ProfileInput } from '@/types/profile';
import type { ProjectInput } from '@/types/project';
import type { RequirementInput } from '@/types/requirement';
import type { SkillInput } from '@/types/skill';
import { toIsoDate } from '@/utils/dates';
import { suggestExpiryDate } from '@/utils/requirementTemplates';

/**
 * DEMO DATA (step 3.5) for the presentation video: one sample BSIT student, "Juan Dela Cruz".
 *
 * A PURE function of `today`: every date is RELATIVE to the day the demo is loaded
 * ("issued 7 months ago", "interview in 2 days"), so the statuses are always right whenever
 * you record: NBI valid, Barangay Clearance expiring soon, Police Clearance EXPIRED.
 * All companies and schools are made up.
 */

export type DemoData = {
  profile: ProfileInput;
  education: EducationInput[];
  experience: ExperienceInput[];
  projects: ProjectInput[];
  skills: SkillInput[];
  certifications: CertificationInput[];
  requirements: RequirementInput[];
  ojtInfo: OjtInfoInput;
  ojtLogs: OjtLogInput[];
  /** How many of the default OJT checklist items (in order) are already done. */
  ojtRequirementsDone: number;
  /** The saved resume: which entries to include, by their position in the lists above. */
  resume: {
    title: string;
    targetRole: string;
    educationIndexes: number[];
    experienceIndexes: number[];
    projectIndexes: number[];
    skillIndexes: number[];
    certificationIndexes: number[];
  };
  /** Applications; `usesResume` links the saved demo resume. */
  applications: (Omit<ApplicationInput, 'resumeId'> & { usesResume: boolean })[];
};

/** How many past weekdays have OJT logs, and the tasks written on them (cycled). */
const OJT_DAYS_LOGGED = 30;
const OJT_TASKS = [
  'Orientation and dev environment setup',
  'Built the login page in React',
  'Fixed layout bugs on mobile screens',
  'Wrote unit tests for the form validators',
  'Joined sprint planning and code review',
  'Connected the dashboard to the REST API',
  'Updated the user guide and README',
];

/** The last `count` weekdays before `today` (OJT is Monday to Friday), oldest first. */
function pastWeekdays(today: Date, count: number): Date[] {
  const days: Date[] = [];
  let day = subDays(today, 1);
  while (days.length < count) {
    if (!isWeekend(day)) days.unshift(day);
    day = subDays(day, 1);
  }
  return days;
}

/** A requirement from the Private template, with the same suggested expiry the app would fill in. */
function requirement(name: string, issued: Date | null): RequirementInput {
  const issueDate = issued ? toIsoDate(issued) : null;
  return {
    name,
    category: 'private',
    referenceNo: null,
    issueDate,
    expiryDate: suggestExpiryDate(name, issueDate),
    statusOverride: issued ? null : 'not_yet_obtained',
    notes: null,
    reminderDaysBefore: DEFAULT_REMINDER_DAYS,
  };
}

export function buildDemoData(today: Date = new Date()): DemoData {
  const iso = (d: Date) => toIsoDate(d);
  const ojtDays = pastWeekdays(today, OJT_DAYS_LOGGED);
  const ojtStart = ojtDays[0];

  const ojtLogs: OjtLogInput[] = ojtDays.map((day, i) => {
    // Mostly 8:00–5:00 (8 hrs); every 7th day overtime to 5:30; every 10th day a half day.
    const halfDay = i % 10 === 9;
    const overtime = i % 7 === 3;
    return {
      logDate: iso(day),
      timeIn: '08:00',
      timeOut: halfDay ? '12:00' : overtime ? '17:30' : '17:00',
      breakMinutes: halfDay ? 0 : DEFAULT_BREAK_MINUTES,
      tasks: OJT_TASKS[i % OJT_TASKS.length],
    };
  });

  return {
    profile: {
      fullName: 'Juan Dela Cruz',
      headline: 'BSIT Student | Aspiring Front-End Developer',
      email: 'juan.delacruz@email.com',
      phone: '0917 123 4567',
      address: 'Quezon City, Metro Manila',
      summary:
        'Graduating BSIT student with hands-on OJT experience building web apps in React and TypeScript. ' +
        'Detail-oriented team player who enjoys turning designs into fast, accessible interfaces.',
      linkedinUrl: 'linkedin.com/in/juandelacruz',
      portfolioUrl: 'juandelacruz.dev',
    },

    education: [
      {
        school: 'Metro Manila State University',
        degree: 'BS Information Technology',
        startDate: '2022-08-15',
        endDate: null, // still studying
        honors: "Dean's Lister",
        description: 'Major in Web and Mobile Development\nCapstone: Barangay Clearance Online Queue',
      },
      {
        school: 'Rizal Integrated Senior High School',
        degree: 'Senior High School – STEM Strand',
        startDate: '2020-06-15',
        endDate: '2022-06-30',
        honors: 'With Honors',
        description: null,
      },
    ],

    experience: [
      {
        title: 'Web Developer Intern',
        organization: 'Northwind Tech PH',
        type: 'ojt',
        location: 'Taguig City',
        startDate: iso(ojtStart),
        endDate: null,
        description:
          'Built responsive React pages for the client portal\n' +
          'Fixed 30+ UI bugs reported by QA\n' +
          'Wrote unit tests for form validation',
      },
      {
        title: 'Public Relations Officer',
        organization: 'Junior IT Society – MMSU Chapter',
        type: 'organization',
        location: 'Quezon City',
        startDate: '2024-08-01',
        endDate: '2025-06-30',
        description: 'Organized two campus tech talks with 200+ attendees\nManaged the chapter Facebook page',
      },
    ],

    projects: [
      {
        name: 'Barangay Clearance Online Queue',
        role: 'Lead Developer (Capstone)',
        techUsed: 'React, Node.js, MySQL',
        link: 'github.com/juandelacruz/brgy-queue',
        startDate: '2025-08-01',
        endDate: iso(subMonths(today, 1)),
        description: 'Online queue that cut walk-in waiting time\nSMS-style status updates for residents',
      },
      {
        name: 'Personal Portfolio Website',
        role: 'Designer & Developer',
        techUsed: 'HTML, CSS, JavaScript',
        link: 'juandelacruz.dev',
        startDate: '2025-03-01',
        endDate: '2025-04-15',
        description: 'Responsive site showcasing school and OJT projects',
      },
    ],

    skills: [
      { name: 'React', category: 'technical', level: 'intermediate' },
      { name: 'TypeScript', category: 'technical', level: 'intermediate' },
      { name: 'HTML & CSS', category: 'technical', level: 'advanced' },
      { name: 'SQL', category: 'technical', level: 'intermediate' },
      { name: 'Git & GitHub', category: 'tool', level: 'intermediate' },
      { name: 'Figma', category: 'tool', level: 'beginner' },
      { name: 'Teamwork', category: 'soft', level: null },
      { name: 'Communication', category: 'soft', level: null },
      { name: 'English', category: 'language', level: 'advanced' },
      { name: 'Filipino', category: 'language', level: 'advanced' },
    ],

    certifications: [
      {
        name: 'Computer Systems Servicing NC II',
        issuer: 'TESDA',
        issueDate: '2024-03-15',
        expiryDate: '2029-03-15',
        credentialId: 'CSS-NCII-2024-0315',
      },
      {
        name: 'Responsive Web Design',
        issuer: 'freeCodeCamp',
        issueDate: '2025-06-10',
        expiryDate: null,
        credentialId: null,
      },
    ],

    requirements: [
      requirement('NBI Clearance', subMonths(today, 2)), // valid (12 months)
      requirement('Police Clearance', subDays(subMonths(today, 6), 20)), // EXPIRED 20 days ago
      requirement('Barangay Clearance', addDays(subMonths(today, 6), 20)), // expiring in ~20 days
      requirement('PSA Birth Certificate', subMonths(today, 3)), // valid (no expiry)
      requirement('Medical Certificate / Pre-employment Medical', null), // not yet obtained
      requirement('TIN', null),
      requirement('SSS Number', null),
    ],

    ojtInfo: {
      company: 'Northwind Tech PH',
      supervisor: 'Engr. Ana Reyes',
      requiredHours: DEFAULT_REQUIRED_HOURS,
      startDate: iso(ojtStart),
      targetEndDate: iso(addMonths(ojtStart, 3)),
    },
    ojtLogs,
    ojtRequirementsDone: 5, // Endorsement, MOA, Waiver, Medical, Insurance

    resume: {
      title: 'Junior Web Developer – Northwind',
      targetRole: 'Junior Web Developer',
      educationIndexes: [0],
      experienceIndexes: [0, 1],
      projectIndexes: [0, 1],
      skillIndexes: [0, 1, 2, 3, 4, 6],
      certificationIndexes: [0, 1],
    },

    applications: [
      {
        company: 'Northwind Tech PH',
        position: 'Junior Web Developer',
        dateApplied: iso(subDays(today, 10)),
        channel: 'Referral',
        status: 'interview',
        usesResume: true,
        salaryOffer: null,
        nextStepDate: iso(addDays(today, 2)), // interview in 2 days → reminder tomorrow
        notes: 'Technical interview with the team lead. Review React hooks and SQL joins.',
      },
      {
        company: 'Lakbay Digital Inc.',
        position: 'Front-End Developer Trainee',
        dateApplied: iso(subDays(today, 3)),
        channel: 'JobStreet',
        status: 'applied',
        usesResume: true,
        salaryOffer: null,
        nextStepDate: null,
        notes: null,
      },
      {
        company: 'Sampaguita Software',
        position: 'QA Tester',
        dateApplied: iso(subDays(today, 25)),
        channel: 'LinkedIn',
        status: 'rejected',
        usesResume: false,
        salaryOffer: null,
        nextStepDate: null,
        notes: 'Looking for 1+ year of experience. Re-apply after graduation.',
      },
    ],
  };
}
