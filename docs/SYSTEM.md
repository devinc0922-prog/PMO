# PMO System — start here

**Every chat working on the PMO system reads this first.** It's the shared memory between chats: chats in a Claude project can't see each other's conversations, only project files, skills and this repo. If a chat decides or changes something, it updates this file before it ends (see *Keeping this file current*).

Owner: Devin (VP, Professional Services). Last updated: 2026-10-28.

---

## 1. What we're building

One repeatable path from "a client wants a project" to "tickets exist in ConnectWise", with as little manual project management as possible:

**Intake → Charter / Scope → Plan (WBS) → Estimate → ConnectWise tickets**

Four project types cover almost all work. Everything else is ad hoc for now.

| Code | Project type |
|---|---|
| `acq` | Acquisition integration (Venture clients absorbing a new company) |
| `m365` | Microsoft 365 migration |
| `cmmc` | CMMC Level 2 implementation (we are the implementer, never the assessor, for that client) |
| `infra` | Infrastructure upgrade (servers, hypervisors, storage, network) |

## 2. The end state: built once vs. done per project

The build work (site, library, skills, export) happens **once**. After that, each new engagement is **one chat**.

### Built once

| Piece | Where it lives | Status |
|---|---|---|
| Intake form + queue + team access | PMO site: https://devinc0922-prog.github.io/PMO/ (this repo) | **Live** |
| Data store + sign-in | Firebase project `project-management-offic-a2dfb` (Firestore + Google sign-in) | **Live** |
| Security rules deploy | GitHub Action on push to `main` (`.github/workflows/deploy-firestore-rules.yml`) | **Live** |
| Rate card (bill rates, cost rates, pricing rules) | Claude project file `estimating/rate_card.md` only (confidential) | **Done** |
| Estimating library (4 types: phases, tasks, owner role, low/expected/high hours, intake drivers, scope modules) | Claude project file `estimating/ps_estimating_library.md`; full calculator workbook kept by Devin (binary files can't be project files) | **Done** |
| Pipeline reference (driver mapping for all 4 types, estimate math, output formats) | Claude project file `pmo/pipeline_reference.md` | **Done**, keep current |
| Skill: intake → charter | Claude skill `pmo-intake-to-charter` | Built |
| Skill: charter → WBS + estimate | Claude skill `pmo-charter-to-estimate` | Built (defers to the pipeline reference where they differ) |
| ConnectWise export | Devin's ConnectWise REST script + the estimate sheet's import columns | In progress |

### Per project (the routine)

1. **Intake:** sales/AM submits on the PMO site. It appears in the queue with a review due date (two business days, per the intake/dispatch SOP).
2. **One new chat** in the dedicated Claude project. Paste the intake's **Copy summary** from the queue.
3. **Charter:** `pmo-intake-to-charter` produces the charter/SOW doc. Fields marked `(missing)` become open questions, never assumptions.
4. **Plan + estimate:** `pmo-charter-to-estimate` produces the WBS and estimate sheet (hours by phase and role, contingency, fixed-fee price, margin and fixed-fee exposure, billing model explicit).
5. **Review**, resolve open questions with the client, then **export to ConnectWise**.
6. **Close the loop on the site:** set the intake's status (Charter drafted → Won – in delivery / Declined).

## 3. Where things live (and what must never go where)

| Place | Holds | Never holds |
|---|---|---|
| This repo (public) | Page code, form definition, blank templates, SOPs, this file | Client names/details, rates, pricing, margins, anything from a client environment |
| Firestore | Submitted intakes, team list | — (behind sign-in + rules) |
| Claude project files | Rate card, estimating library, pipeline reference, SOPs, templates, a copy of this file | — |
| Claude chats | Per-project work (charter, plan, estimate) | Anything other chats need later. Put that in this file or a project file |
| ConnectWise | The delivered project, phases, tickets | — |

## 4. PMO site reference

- **Pages:** `/` home · `/intake/` form · `/intake/#submissions` queue · `/team/` access · `/intake/?demo=1` demo (browser-only, no sign-in).
- **Roles** (Firestore `members/{lowercase email}` → `{name, role}`):
  - `submitter`: submit, edit own intake while New
  - `pm`: edit any intake, change status
  - `admin`: everything + team list + delete
- **Intake record:** `intakes/{id}` → `{type, status, core{}, details{}, submittedBy, submittedByName, submittedAt, updatedAt, updatedBy}`.
- **Statuses:** New → In review → Scoped → Charter drafted → Won – in delivery / Declined.
- **Changing the form:** edit `assets/intake/intake-model.js` only. Adding fields/options is safe any time. Renaming or removing a field id breaks old intakes, so do big revisions before real intakes pile up.
- **Changing security rules:** edit `firestore.rules`, push to `main`; the Action deploys it. Never edit rules in the Firebase console (the next deploy overwrites it).
- **Sign-in:** Google accounts only today. Coworkers can create a Google account on their work email. Microsoft 365 / Entra sign-in is planned (needs an Entra app registration and a rules change, because Firebase doesn't mark Microsoft emails as verified).

## 5. Open items

Keep this list current. Remove items when done; add new ones with the date.

- [ ] **Charter / estimate links on the queue**, so the site shows where each engagement's documents live (one place to see everything).
- [ ] **ConnectWise export:** finalize the sheet's import columns against the REST script.
- [ ] **Estimate calculator page** on the site (hour formulas only, never rates).
- [ ] **Microsoft 365 sign-in** when the team starts using the site.
- [ ] **First real intake run** end to end with the finished library and pricing rules (2026-10-28).
- [ ] **Calibrate the library** once 3–5 projects per type have closed (ConnectWise actuals vs estimate; time logged against the library's phase names) (2026-10-28).
- [ ] Delete the unused claude.ai intake artifact from the old Pro Services project.

## 6. Decisions log

Newest at the bottom. One line each: date, decision, why.

- 2026-10-28: Intake site uses GitHub Pages + Firebase (same pattern as Devin's dndadventures site) so it's shareable with the team behind sign-in.
- 2026-10-28: Repo made public; GitHub Pages on a private repo needs a paid plan. Data protection comes from Firestore rules, not repo privacy.
- 2026-10-28: Separate Firebase project under Devin's work Google account, which is also the first admin.
- 2026-10-28: Rules deploy from GitHub Actions with a rules-only service account; Claude never holds Firebase credentials and can't read intake data.
- 2026-10-28: Build work happens in a dedicated Claude project; this file is the shared context between its chats.
- 2026-10-28: Estimating library built for all four types; project types can combine in one estimate (e.g. acquisition + M365) so a Venture deal is one estimate and one CW project.
- 2026-10-28: Estimating method: PM/PC effort as a % of engineering hours (PMI benchmark) and contingency from three-point (PERT) estimates at 80% confidence (AACE 18R-97); no flat percentages.
- 2026-10-28: All projects are priced as a flat fixed fee from initial scoping. Pricing rules (PM fee, cost rates, margin target) live only in the project's rate card.
- 2026-10-28: Library and rate card are stored as project text files; the calculator .xlsx stays outside the project because project files can't hold binaries.
- 2026-10-28: Intake form revised to capture the estimating library's drivers (count fields per type, on-site visits, enclave type, "AD / domain" scope, mail/file migration on acquisitions). Additive only: no field ids renamed or removed, so existing intakes still load. The field-to-driver mapping lives in project file `pmo/pipeline_reference.md`.

## 7. Keeping this file current

**For every chat:** before you finish, if you decided, built or changed anything in the PMO system:

1. Update sections 2, 5 and 6 of this file.
2. If the repo is attached: commit the change to `docs/SYSTEM.md`.
3. Give Devin the updated file to re-upload to the Claude project's files, replacing the old copy, so both copies match.

Don't put confidential details here; it's public in the repo. Rates, client names and estimates stay in project files.

**Starting a new chat:** say what you're doing and which step of section 2 it is. Example: *"Per-project run, step 2: here's the intake summary."* or *"Build work: open item 'Intake form revision'."*
