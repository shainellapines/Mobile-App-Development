# CareerKit — Final Device Test Checklist (Step 3.6)

Use this to test CareerKit on a **real Android phone** and a **real iPhone** (or emulators) before the presentation.
Mark each row ✅ (works), ❌ (bug — write it in the Bug Log at the bottom), or ➖ (not applicable).

**Tester:** ____________ **Date:** ____________
**Android device / OS:** ____________ **iOS device / OS:** ____________

---

## 0. Setup

1. On the laptop: `cd careerkit` → `npx expo start -c` (the `-c` clears old cache).
2. Phones: install **Expo Go**, be on the **same Wi‑Fi** as the laptop, scan the QR code.
3. For a "first launch" test, delete Expo Go's data for the app, or use **Settings → Reset all data**.

> **Known Expo Go limits (not bugs):**
> - The **app icon** and **native splash** only appear in a real build (APK / development build). In Expo Go you see Expo Go's icon.
> - **Face ID** may not work inside Expo Go on iOS. The **PIN must always work.**
> - The app does **not** support **web**. Test on phones only.

---

## 1. Startup

| # | Do this | Expected | Android | iOS |
|---|---|---|---|---|
| 1.1 | Open the app (fresh) | Splash: CareerKit logo + "From OJT to your first job", visible ~2–3 s, fades out | ☐ | ☐ |
| 1.2 | First launch | Onboarding appears: 7 slides (Welcome, Vault, Resume, Requirements, Applications, OJT, Readiness) | ☐ | ☐ |
| 1.3 | Swipe and tap **Next** | Dots and the "1 / 7" counter update; the last slide shows **Get started** | ☐ | ☐ |
| 1.4 | Tap **Get started** (or **Skip**) | Dashboard opens; close and reopen the app → onboarding does NOT appear again | ☐ | ☐ |
| 1.5 | Settings → **View intro again** | Slides open; finishing goes back to Settings | ☐ | ☐ |

## 2. Dashboard (Home)

| # | Do this | Expected | Android | iOS |
|---|---|---|---|---|
| 2.1 | Open Home with an empty app | Score ring shows a low score, "Let's get started", up to 3 suggestions with +points | ☐ | ☐ |
| 2.2 | Tap a suggestion | Opens the right screen (e.g., "Add your education" → Education form) | ☐ | ☐ |
| 2.3 | Add something, go back to Home | Score updates right away (no app restart) | ☐ | ☐ |
| 2.4 | Tap the Documents / Applications / OJT tiles | Each opens its module | ☐ | ☐ |
| 2.5 | Tap the 3 quick-action tiles | Add Experience / New Resume / Log OJT Hours (or Set Up OJT) open | ☐ | ☐ |
| 2.6 | Tap the ⚙ in the header | Settings opens | ☐ | ☐ |

## 3. Career Vault + Document Locker

| # | Do this | Expected | Android | iOS |
|---|---|---|---|---|
| 3.1 | Vault → Profile: fill all fields, save | "Saved" message; the name shows on the Vault tile | ☐ | ☐ |
| 3.2 | Profile: type a bad email / link, save | Red inline errors; nothing saved | ☐ | ☐ |
| 3.3 | Profile photo: take with camera, then choose from gallery, then remove | Photo updates each time; permission prompts appear the first time | ☐ | ☐ |
| 3.4 | Each category (Education, Experience, Projects, Skills, Certifications): **add** an entry | Appears in the list; the Vault tile count goes up | ☐ | ☐ |
| 3.5 | Edit an entry, then delete it | Changes saved; delete asks for confirmation, then removes it | ☐ | ☐ |
| 3.6 | Set an end date **before** the start date | Error: "End date cannot be before the start date" | ☐ | ☐ |
| 3.7 | Empty category | Friendly empty state with an "Add" button | ☐ | ☐ |
| 3.8 | Search a list (type part of a name) | List filters; "Showing X of Y" appears | ☐ | ☐ |
| 3.9 | Certification → **Attach file → PDF** | File appears; tap it → PDF opens / share sheet | ☐ | ☐ |
| 3.10 | Attach an **image** (camera and gallery) | Thumbnail shows; tap → full-screen viewer | ☐ | ☐ |
| 3.11 | **Replace** an attachment, then **delete** it | Replaced; delete asks to confirm, then removes it | ☐ | ☐ |
| 3.12 | Attach a file **over 10 MB** | Error message about the 10 MB limit | ☐ | ☐ |
| 3.13 | Delete an entry that has attachments | Entry and its files are gone | ☐ | ☐ |

## 4. Resume Builder

| # | Do this | Expected | Android | iOS |
|---|---|---|---|---|
| 4.1 | More → Resume Builder → new resume: title, target role, tick entries | Counts like "(2 of 3)" update | ☐ | ☐ |
| 4.2 | Use ▲ ▼ to reorder selected items | Order changes; the PDF follows that order | ☐ | ☐ |
| 4.3 | Template **ATS Simple** → Save & preview | Spinner, then a black-and-white one-column PDF (A4) | ☐ | ☐ |
| 4.4 | Template **Modern** (with a profile photo) | Blue header **with photo**, teal headings, skill tags | ☐ | ☐ |
| 4.5 | **Share PDF** | Share sheet opens (Messenger, Gmail, Drive…) with the PDF | ☐ | ☐ |
| 4.6 | **Duplicate**, then **Delete** a resume | Copy appears; delete asks to confirm | ☐ | ☐ |
| 4.7 | Edit a vault entry, export the resume again | The new text appears in the PDF | ☐ | ☐ |

## 5. Requirements Tracker

| # | Do this | Expected | Android | iOS |
|---|---|---|---|---|
| 5.1 | Requirements → **Smart Templates → Private** → tick a few → Add | Items added as **Not yet obtained** | ☐ | ☐ |
| 5.2 | Open **NBI Clearance**, set an issue date | Expiry date auto-fills **12 months later**; the badge turns **Valid** | ☐ | ☐ |
| 5.3 | Set an issue date **7 months ago** on Police Clearance | Badge shows **Expired** (red); "Expired X days ago" | ☐ | ☐ |
| 5.4 | Set an expiry date within 30 days | Badge shows **Expiring soon** (amber) | ☐ | ☐ |
| 5.5 | Filter by status and category | List filters correctly | ☐ | ☐ |
| 5.6 | Save with an expiry date | Message: "We'll remind you on … at 9:00 AM" (allow notifications) | ☐ | ☐ |
| 5.7 | Tap **Send a test reminder (10 s)**, then leave the app | A notification arrives in ~10 s | ☐ | ☐ |
| 5.8 | Add a custom requirement with an attachment; delete it | Works like vault entries | ☐ | ☐ |

## 6. Application Tracker

| # | Do this | Expected | Android | iOS |
|---|---|---|---|---|
| 6.1 | Applications → add: company, position, channel, **Resume sent** | Saved; blue **Applied** badge in the list | ☐ | ☐ |
| 6.2 | Set **Next step date** = the day after tomorrow, save | Message: "We'll remind you on … about the next step" | ☐ | ☐ |
| 6.3 | Open it → tap **Interview** | Badge turns purple with ✓ right away | ☐ | ☐ |
| 6.4 | "Resume sent" card → **Open PDF / Share PDF** | The linked resume opens / shares | ☐ | ☐ |
| 6.5 | Filter by status, search by company | Counts like "Interview (1)" are correct | ☐ | ☐ |
| 6.6 | Delete the linked resume, reopen the application | Shows "The linked resume was deleted"; the application is still there | ☐ | ☐ |
| 6.7 | Edit → Delete application | Returns to the list (not to the deleted detail screen) | ☐ | ☐ |

## 7. OJT Logger

| # | Do this | Expected | Android | iOS |
|---|---|---|---|---|
| 7.1 | More → OJT Logger → **Set up OJT** (required hours 486) | Saved; checklist gets **11 default requirements** | ☐ | ☐ |
| 7.2 | **Log today's hours** (8:00 AM – 5:00 PM, 60 min break) | Live preview shows **8 hrs**; time pickers work | ☐ | ☐ |
| 7.3 | Set time out **before** time in | Error: "Time out must be after time in" | ☐ | ☐ |
| 7.4 | Log a second record on the **same date** | Warning shown; "Save anyway?" | ☐ | ☐ |
| 7.5 | Overview | Progress bar, hours remaining, average per day, estimated finish date | ☐ | ☐ |
| 7.6 | Tick / untick checklist items; open one, add a due date and an attachment | Count "x/11 done" updates; overdue items say "Overdue" | ☐ | ☐ |
| 7.7 | **Export DTR (PDF)** | PDF table of records, total hours, signature lines → share sheet | ☐ | ☐ |

## 8. Settings, App Lock, Data

| # | Do this | Expected | Android | iOS |
|---|---|---|---|---|
| 8.1 | **Turn on App Lock**: enter a PIN, Next, confirm | "App Lock is on" | ☐ | ☐ |
| 8.2 | Type a **different** PIN when confirming | "The PINs didn't match", starts again | ☐ | ☐ |
| 8.3 | Close the app fully and reopen | Lock screen; correct PIN unlocks | ☐ | ☐ |
| 8.4 | Enter a wrong PIN 5 times | Keypad pauses for 30 s with a countdown | ☐ | ☐ |
| 8.5 | Turn on **Unlock with Fingerprint / Face ID**, reopen the app | Biometric prompt appears; "Use PIN" falls back to the PIN | ☐ | ☐ |
| 8.6 | Leave the app for **over 1 minute**, return | Locked again; after unlock you are on the same screen | ☐ | ☐ |
| 8.7 | Leave the app for **under 1 minute**, return | NOT locked | ☐ | ☐ |
| 8.8 | **Android:** press the back button on the lock screen | Nothing happens (cannot get past the lock) | ☐ | ➖ |
| 8.9 | Change PIN / Turn off App Lock | Asks for the **current PIN** first | ☐ | ☐ |
| 8.10 | **Load demo data** → confirm | Dashboard shows Juan Dela Cruz: score **85**, "Renew your expired Police Clearance"; PIN still on | ☐ | ☐ |
| 8.11 | **Reset all data** → Continue → Delete everything | Two confirmations; app becomes empty; onboarding shows again; PIN off | ☐ | ☐ |

## 9. Offline and privacy (NFR-2, NFR-3)

| # | Do this | Expected | Android | iOS |
|---|---|---|---|---|
| 9.1 | After the app has loaded, turn on **Airplane mode** | Every module still works (add, edit, PDF, attachments) | ☐ | ☐ |

## 10. UI and usability (NFR-4, NFR-6)

| # | Do this | Expected | Android | iOS |
|---|---|---|---|---|
| 10.1 | Type in fields near the bottom of long forms | The keyboard never covers the field you type in | ☐ | ☐ |
| 10.2 | Look through every screen | Same colors, headings, buttons, chips; nothing cut off or overlapping | ☐ | ☐ |
| 10.3 | With demo data loaded, open each list | Opens in under ~1 second | ☐ | ☐ |
| 10.4 | Small-screen phone (if available) | Bento tiles and text still fit | ☐ | ☐ |

## 11. Full demo run-through (Section 13 of CLAUDE.md)

| # | Do this | Expected | Android | iOS |
|---|---|---|---|---|
| 11.1 | Settings → Load demo data | Dashboard: 85, "Almost job-ready" | ☐ | ☐ |
| 11.2 | Requirements → Police Clearance → set issue date to today | Expiry auto-fills; badge **Valid** | ☐ | ☐ |
| 11.3 | Back to Dashboard | Score **100, "Job-ready!"** | ☐ | ☐ |
| 11.4 | Resume Builder → export and share "Junior Web Developer" PDF | Works | ☐ | ☐ |
| 11.5 | Applications → log a new one with that resume → move to **Interview** | Works | ☐ | ☐ |
| 11.6 | Time the whole demo | Fits your presentation time slot | ☐ | ☐ |

---

## Bug Log

When something fails, write it here (or send a screenshot of the error). Include the steps, so it can be reproduced.

| Test # | Device | What happened (and the error text, if any) | Screenshot? |
|---|---|---|---|
| | | | |
| | | | |
| | | | |
