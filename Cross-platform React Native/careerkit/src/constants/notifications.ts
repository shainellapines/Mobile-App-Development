/** Requirement reminders arrive at this hour, local time (FR-Q5: 9:00 AM). */
export const REMINDER_HOUR = 9;

/** Android groups notifications into "channels" the user can mute separately in Settings. */
export const REMINDER_CHANNEL_ID = 'requirement-reminders';
export const REMINDER_CHANNEL_NAME = 'Document expiry reminders';

/** Next-step reminders (FR-A5): the day before at REMINDER_HOUR; if that has passed, on the day itself. */
export const NEXT_STEP_MORNING_HOUR = 7;
export const APPLICATION_CHANNEL_ID = 'application-reminders';
export const APPLICATION_CHANNEL_NAME = 'Interview and next-step reminders';
