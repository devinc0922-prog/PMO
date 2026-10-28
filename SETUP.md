# Setup

One-time steps to put the site online and connect it to Firebase so sign-in and saved intakes work. About 15 minutes.

The pages are served by GitHub Pages. Intake data is stored in Firebase (Firestore) and only loads for Google accounts on the team list. Nothing about clients is stored in this repository.

## 1. Turn on GitHub Pages

This repository is private. GitHub Pages only publishes private repositories on a paid plan (GitHub Pro, Team or Enterprise). On the free plan you can either upgrade or make the repository public. Making it public is safe as long as nothing confidential is committed (see *What goes where* in the README), because the data itself sits behind sign-in.

Repository **Settings → Pages**. Under *Build and deployment*, choose **Deploy from a branch**, branch **main**, folder **/ (root)**, and save. A minute later the site is live at:

`https://devinc0922-prog.github.io/PMO/`

The pages themselves (the empty form, the home page) are visible to anyone with the link, even when the repository is private. Saved intakes are not: they need sign-in.

## 2. Create a Firebase project

Use a new project for work, separate from the D&D one.

1. In the [Firebase console](https://console.firebase.google.com/), click **Create a project**. Name it something like `pmo`. Google Analytics isn't needed.
2. **Build → Firestore Database → Create database.** Location `us-east1`, **production mode**.
3. Open the **Rules** tab, replace everything with the contents of [`firestore.rules`](firestore.rules), and click **Publish**.

## 3. Turn on Google sign-in

**Build → Authentication → Get started → Sign-in method → Google → Enable**, choose a support email, and save.

## 4. Allow the site's address

**Authentication → Settings → Authorized domains → Add domain**:

`devinc0922-prog.github.io`

Without this, the sign-in popup fails with an "unauthorized domain" error.

## 5. Register the web app and paste its config

1. **Project settings** (gear icon) → **General** → *Your apps* → the **</>** (Web) icon. Give it a nickname and leave Firebase Hosting unchecked.
2. Copy the `firebaseConfig` values into [`assets/js/firebase-config.js`](assets/js/firebase-config.js), replacing every `PASTE_…` placeholder.
3. Commit the change. These values are safe to publish; the rules from step 2 protect the data.

## 6. Make yourself an admin

The first admin has to be added by hand, because the rules only let an admin add people.

1. **Firestore Database → Data → Start collection**. Collection ID: `members`.
2. Document ID: your Google account email, **all lowercase**.
3. Add two string fields: `name` = your name, `role` = `admin`. Save.

Open the site's **Team** page and sign in. Add everyone else there.

## Roles

| Role | Can do |
|---|---|
| `submitter` | Submit intakes; edit their own while the status is New |
| `pm` | Edit any intake and change its status |
| `admin` | Everything a PM can do, manage the team list, delete intakes |

## Accounts without Google

Sign-in uses Google accounts. A work address that isn't Gmail can still be a Google account: the person creates one at [accounts.google.com/signup](https://accounts.google.com/signup) with *Use my current email address instead*. Microsoft (Entra ID) sign-in can be added later; it needs an app registration in Entra and a change to the rules.

## Troubleshooting

| Problem | Fix |
|---|---|
| Sign-in popup closes with "unauthorized domain" | Step 4 |
| Signed in but "not on the team list" | Add the email on the Team page, lowercase, exactly matching the Google account |
| "You don't have access to do that" | Rules not published (step 2), or the person's role doesn't allow it |
| Intake page says Firebase isn't connected | Placeholders still in `assets/js/firebase-config.js` (step 5) |
| 404 at the Pages address | Pages not turned on (step 1), or the first build hasn't finished. Check the repository's **Actions** tab |
