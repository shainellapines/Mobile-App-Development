/** OJT Logger defaults and limits (FR-O1, O2). */

/** Common required OJT hours for many Philippine college programs; the user can change it. */
export const DEFAULT_REQUIRED_HOURS = 486;
export const MAX_REQUIRED_HOURS = 3000;

/** A new daily log starts as 8:00 AM – 5:00 PM with a 1-hour lunch break (= 8 hours). */
export const DEFAULT_TIME_IN = '08:00';
export const DEFAULT_TIME_OUT = '17:00';
export const DEFAULT_BREAK_MINUTES = 60;
export const MAX_BREAK_MINUTES = 240;

/** How many of the latest logs the OJT overview shows before "View all". */
export const RECENT_LOGS_SHOWN = 5;
