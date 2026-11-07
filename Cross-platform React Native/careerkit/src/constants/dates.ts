/** How dates are SAVED in the database (Section 5): sortable text like "2026-11-06". */
export const ISO_DATE_FORMAT = 'yyyy-MM-dd';

/** How dates are SHOWN to the user (Section 7.3): "Nov 6, 2026". */
export const DISPLAY_DATE_FORMAT = 'MMM d, yyyy';

/** How dates appear ON THE RESUME: "Jun 2025" (month + year is the resume convention). */
export const RESUME_DATE_FORMAT = 'MMM yyyy';

/** How times are SAVED (ojt_logs.time_in / time_out): 24-hour "13:30". */
export const TIME_STORE_FORMAT = 'HH:mm';

/** How times are SHOWN: "1:30 PM". */
export const TIME_DISPLAY_FORMAT = 'h:mm a';
