# PMO

Professional Services project management tools: intake forms now, then charter, plan and estimate tooling.

**Site:** https://devinc0922-prog.github.io/PMO/ (after [SETUP.md](SETUP.md))

- **Project intake** (`/intake/`): one form for acquisition integrations, Microsoft 365 migrations, CMMC L2 implementations and infrastructure upgrades. Shows which estimate inputs are still missing.
- **Intake queue** (`/intake/#submissions`): submitted intakes with their two-business-day review date, status, and a copyable summary for the Claude project.
- **Team** (`/team/`): who can sign in, and their role.
- **Demo**: [`/intake/?demo=1`](https://devinc0922-prog.github.io/PMO/intake/?demo=1) works without sign-in and saves in your browser only.

## What goes where

| Where | What |
|---|---|
| This repository | Page code, form definitions, blank templates, SOPs. Nothing client-specific. |
| Firebase (Firestore) | Submitted intakes and the team list. Needs sign-in. |
| Claude project | Rate card, estimating library, client documents. Charters, plans and estimates are produced there. |

Keep pricing, rates and client details out of the repository: the published pages can be opened by anyone with the link.

## Files

| Path | What it's for |
|---|---|
| [SETUP.md](SETUP.md) | One-time GitHub Pages and Firebase setup |
| `assets/intake/intake-model.js` | The intake form definition: project types, fields, estimate drivers, statuses |
| `assets/intake/intake-page.js` | Intake page behaviour |
| `assets/js/app.js` | Sign-in, team list and intake storage (Firebase) |
| `firestore.rules` | Who can read and change what |
| [CLAUDE.md](CLAUDE.md) | Notes for Claude working in this repo |
