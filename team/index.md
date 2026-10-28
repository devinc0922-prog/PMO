---
title: Team
---
<p class="eyebrow">Access</p>
<div class="row" style="justify-content:space-between;align-items:baseline">
  <h1>Team</h1>
  <div class="who"><span id="who"></span><button type="button" class="small" id="signOutBtn" hidden>Sign out</button></div>
</div>

<div id="gate" class="card" style="margin-top:16px"><p>Loading…</p></div>

<div id="main" hidden style="display:flex;flex-direction:column;gap:16px;margin-top:16px">
  <p class="lede" style="margin:0">Only Google accounts on this list can sign in. Remove someone and they lose access right away. Their intakes stay.</p>
  <div class="card tablewrap">
    <table>
      <thead><tr><th>Name</th><th>Google account</th><th>Role</th><th></th></tr></thead>
      <tbody id="members"></tbody>
    </table>
  </div>

  <section id="adminPanel" hidden class="card" style="display:grid;gap:12px">
    <h2>Add someone</h2>
    <form class="row" id="addMember">
      <input id="mName" placeholder="Name" required aria-label="Name">
      <input id="mEmail" type="email" placeholder="name@company.com" required aria-label="Google account email" style="flex:1;min-width:220px">
      <select id="mRole" aria-label="Role">
        <option value="submitter">Submitter</option>
        <option value="pm">Project manager</option>
        <option value="admin">Admin</option>
      </select>
      <button type="submit" class="primary">Add</button>
    </form>
    <div class="note err" id="mErr"></div>
    <table class="note" style="max-width:640px">
      <tbody>
        <tr><td><b>Submitter</b></td><td>Submits intakes and edits their own while they're still New.</td></tr>
        <tr><td><b>Project manager</b></td><td>Reviews any intake, edits it and changes its status.</td></tr>
        <tr><td><b>Admin</b></td><td>Everything a PM can do, plus managing this list and deleting intakes.</td></tr>
      </tbody>
    </table>
  </section>
</div>

<script type="module">
import { isConfigured, watchSession, signIn, signOut, watchMembers, addMember, removeMember, ROLES, esc, friendlyError } from "{{ '/assets/js/app.js' | relative_url }}";
const $ = id => document.getElementById(id);
let me = null, stop = null;

if (!isConfigured) {
  $("gate").innerHTML = `<p>Firebase isn't connected yet, so the team list can't load. Follow SETUP.md in the repository.</p>`;
} else {
  watchSession(({ user, email, member }) => {
    if (stop) { stop(); stop = null; }
    $("signOutBtn").hidden = !user;
    $("who").textContent = user ? "Signed in as " + (member && member.name ? member.name : email) : "";
    $("main").hidden = true; $("gate").hidden = false;
    if (!user) {
      $("gate").innerHTML = `<p>Sign in with the Google account an admin added for you.</p><p><button type="button" class="primary" id="go">Sign in with Google</button></p><p class="err" id="err"></p>`;
      $("go").onclick = () => signIn().catch(e => $("err").textContent = friendlyError(e));
      return;
    }
    if (!member) {
      $("gate").innerHTML = `<p>You're signed in as <b>${esc(email)}</b>, but that account isn't on the team list yet. Ask an admin to add it, then reload this page.</p>`;
      return;
    }
    me = { email, admin: member.role === "admin" };
    $("gate").hidden = true; $("main").hidden = false;
    $("adminPanel").hidden = !me.admin;
    stop = watchMembers(render, e => $("members").innerHTML = `<tr><td colspan="4" class="err">${esc(friendlyError(e))}</td></tr>`);
  });
  $("signOutBtn").onclick = () => signOut();
}

function render(list) {
  list.sort((a, b) => (a.name || a.email).localeCompare(b.name || b.email));
  $("members").innerHTML = list.map(m => `<tr><td>${esc(m.name || "")}</td><td class="mono">${esc(m.email)}</td><td>${esc(ROLES[m.role] || m.role)}</td>
    <td style="text-align:right">${me.admin && m.email !== me.email ? `<button type="button" class="small danger" data-rm="${esc(m.email)}">Remove</button>` : ""}</td></tr>`).join("");
}
document.addEventListener("click", e => {
  const b = e.target.closest("[data-rm]"); if (!b) return;
  if (b.dataset.confirm !== "1") { b.dataset.confirm = "1"; b.textContent = "Confirm remove"; setTimeout(() => { if (b.isConnected) { b.dataset.confirm = ""; b.textContent = "Remove"; } }, 4000); return; }
  removeMember(b.dataset.rm).catch(err => $("mErr").textContent = friendlyError(err));
});
$("addMember").addEventListener("submit", e => {
  e.preventDefault(); $("mErr").textContent = "";
  addMember($("mEmail").value, $("mName").value, $("mRole").value)
    .then(() => { $("mEmail").value = ""; $("mName").value = ""; $("mRole").value = "submitter"; })
    .catch(err => $("mErr").textContent = friendlyError(err));
});
</script>
