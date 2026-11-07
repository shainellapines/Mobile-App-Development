import type Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';

import type { TileTone } from '@/components/Tile';

/** One intro slide. `icon: 'logo'` shows the app logo instead of an icon. */
export type OnboardingSlide = {
  key: string;
  icon: ComponentProps<typeof Ionicons>['name'] | 'logo';
  tone: TileTone;
  title: string;
  body: string;
  points: string[];
};

/**
 * The intro shown on first launch: what CareerKit is for, then one slide per core feature.
 * The big icons are PLACEHOLDER illustrations; swap them for real artwork later.
 */
export const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    key: 'welcome',
    icon: 'logo',
    tone: 'primary',
    title: 'Welcome to CareerKit',
    body: 'Your offline career companion, from your first OJT to your first job.',
    points: ['No account and no internet needed', 'Everything stays private on your phone', 'Made for Filipino students and job seekers'],
  },
  {
    key: 'vault',
    icon: 'briefcase-outline',
    tone: 'primary',
    title: 'Career Vault',
    body: 'Store your career once and reuse it everywhere.',
    points: [
      'Education, experience, projects, skills, certifications',
      'Attach proof: certificates, IDs, photos, PDFs',
      'No more rewriting your resume from scratch',
    ],
  },
  {
    key: 'resume',
    icon: 'document-text-outline',
    tone: 'secondary',
    title: 'Resume Builder',
    body: 'A tailored resume for every job in seconds.',
    points: [
      'Tick the entries that fit the job',
      'ATS Simple or Modern design',
      'Export and share as PDF',
    ],
  },
  {
    key: 'requirements',
    icon: 'shield-checkmark-outline',
    tone: 'primary',
    title: 'Requirements Tracker',
    body: 'Never be surprised by an expired document again.',
    points: [
      'Smart templates: NBI, Police, Barangay Clearance and more',
      'Expiry status at a glance',
      'Reminders before a document expires',
    ],
  },
  {
    key: 'applications',
    icon: 'paper-plane-outline',
    tone: 'secondary',
    title: 'Application Tracker',
    body: 'Know where you applied and how it is going.',
    points: [
      'Applied → Interview → Offer pipeline',
      'Remember which resume you sent',
      'Reminders the day before an interview',
    ],
  },
  {
    key: 'ojt',
    icon: 'time-outline',
    tone: 'primary',
    title: 'OJT Logger',
    body: 'Track your OJT hours without a paper logbook.',
    points: [
      'Daily time in / time out',
      'Progress bar and estimated finish date',
      'OJT requirements checklist and DTR PDF',
    ],
  },
  {
    key: 'readiness',
    icon: 'trophy-outline',
    tone: 'secondary',
    title: 'Career Readiness Score',
    body: 'See how job-ready you are, and what to do next.',
    points: ['A score from 0 to 100', 'Suggestions you can act on in one tap', 'Watch it grow as you build your toolkit'],
  },
];
