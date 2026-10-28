# Notes for Claude

**Read [`docs/SYSTEM.md`](docs/SYSTEM.md) first.** It's the shared map of the whole PMO system (site, Firebase, skills, estimating library, ConnectWise), the per-project workflow, open items and decisions. Update it before you finish if you change anything.

This repo is the Professional Services PMO site, served by GitHub Pages (Jekyll) at https://devinc0922-prog.github.io/PMO/. Data lives in Firebase (Firestore), behind Google sign-in and a team allowlist.

## Hard rule: nothing confidential goes in this repo

The published pages can be opened by anyone with the link. Commit page code, form definitions, blank templates and SOPs only. Never commit client names or details, pricing, rates, margins, or anything from a client's environment. Those belong in Firestore or the Claude project.

## Layout

- `index.md`, `team/index.md` — Jekyll pages using `_layouts/default.html`.
- `intake/index.html` — standalone page (no front matter), relative paths to `../assets/`. `?demo=1` runs it against browser storage with no sign-in.
- `assets/intake/intake-model.js` — the intake form definition. Adding a field or project type is an edit here only; the form, readiness meter and summary build from it. Field ids must stay stable once intakes exist, since stored data is keyed by them.
- `assets/intake/intake-page.js` — form rendering, queue, permissions in the UI. Boot code is at the bottom of the file on purpose (helpers are `const`s defined above it).
- `assets/js/app.js` — Firebase auth, members, intakes. `firebase-config.js` holds the web app config.
- `firestore.rules` — roles: `admin`, `pm`, `submitter`. UI permission checks mirror these; the rules are what enforce them. Pushing a change to `main` deploys it via `.github/workflows/deploy-firestore-rules.yml` (service account in the `FIREBASE_SERVICE_ACCOUNT` secret, rules-only permissions). Don't paste rules into the console by hand; the next deploy would overwrite them.

Firestore: `members/{lowercase email}` `{name, role}`; `intakes/{id}` `{type, status, core{}, details{}, submittedBy, submittedByName, submittedAt (ISO), updatedAt, updatedBy}`.

## Conventions

- Plain ES modules, no build step. Firebase SDK from gstatic, pinned version.
- Escape all user text with `esc()` before putting it in HTML.
- Styles: tokens in `assets/css/site.css` (light and dark); page-specific styles in their own file.
- Pipeline the site supports: Intake → Charter/Scope → Plan (WBS) → Estimate → ConnectWise tickets.
