// Intake page: renders the form from intake-model.js, saves to Firestore (or the browser in demo mode),
// and shows the intake queue.
import { TYPES, CORE_TOP, TYPE_FIELDS, CORE_BOTTOM, STATUSES, CLOSED, coreFields, typeFields, filled, readiness, refFor, reviewDue, fmtDate, summary, EXAMPLE } from "./intake-model.js";
import { isConfigured } from "../js/firebase-config.js";

const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const $ = s => document.querySelector(s);
const DEMO = new URLSearchParams(location.search).has("demo");
const DRAFT_KEY = DEMO ? "pmo-intake-draft-demo" : "pmo-intake-draft";

let store = null, me = null, docs = [], editingId = null, stopWatch = null, started = false, friendly = e => String(e?.message || e);

/* ---------- storage: demo (this browser) ---------- */
function demoStore() {
  const KEY = "pmo-intakes-demo"; let listeners = [];
  const read = () => { try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch (e) { return {}; } };
  const write = o => { try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) {} listeners.forEach(fn => fn(Object.entries(o).map(([id, d]) => ({ ...d, _id: id })))); };
  return {
    watch(cb) { listeners.push(cb); cb(Object.entries(read()).map(([id, d]) => ({ ...d, _id: id }))); return () => { listeners = listeners.filter(f => f !== cb); }; },
    async create(me, data) { const o = read(); const id = Math.random().toString(36).slice(2, 10); o[id] = { ...data, status: "New", submittedBy: me.email, submittedByName: me.name, submittedAt: new Date().toISOString() }; write(o); return id; },
    async save(me, id, data) { const o = read(); o[id] = { ...o[id], type: data.type, core: data.core, details: data.details }; write(o); },
    async setStatus(me, id, status) { const o = read(); o[id].status = status; write(o); },
    async remove(id) { const o = read(); delete o[id]; write(o); }
  };
}

/* ---------- boot ---------- */
const gate = html => { $("#gate").innerHTML = html; $("#gate").hidden = false; $("#app").hidden = true; };

function start() {
  $("#gate").hidden = true; $("#app").hidden = false;
  if (!started) { started = true; build(); wire(); if (!loadDraft()) update(); fromHash(); }
  stopWatch = store.watch(list => { docs = list; renderQueue(); if (editingId) setEditing(editingId); },
    e => { $("#queue").innerHTML = `<div class="empty err">${esc(friendly(e))}</div>`; });
}

/* ---------- permissions ---------- */
const isReviewer = () => me && (me.role === "admin" || me.role === "pm");
const isAdmin = () => me && me.role === "admin";
const canEdit = d => isReviewer() || (d.submittedBy === me.email && (d.status || "New") === "New");

/* ---------- form rendering ---------- */
function fieldHTML(f, prefix) {
  const id = prefix + f.id;
  const tag = (f.req ? '<span class="req" aria-hidden="true">*</span>' : "") + (f.drv ? '<span class="drv">driver</span>' : "");
  const hint = f.hint ? `<span class="hint">${esc(f.hint)}</span>` : "";
  const cls = "field" + (f.full ? " full" : "");
  if (f.type === "attest") return `<div class="${cls}" data-f="${id}"><label class="attest" for="${id}"><input type="checkbox" id="${id}" name="${id}"> <span>${esc(f.label)}${tag}</span></label></div>`;
  if (f.type === "checks") return `<div class="${cls}" data-f="${id}"><span class="lbl" id="${id}-l">${esc(f.label)}${tag}</span><div class="checks" role="group" aria-labelledby="${id}-l">${
    f.opts.map((o, i) => `<label class="chk" for="${id}-${i}"><input type="checkbox" id="${id}-${i}" name="${id}" value="${esc(o)}">${esc(o)}</label>`).join("")}</div>${hint}</div>`;
  let input;
  if (f.type === "select") input = `<select id="${id}" name="${id}"><option value="">Select…</option>${f.opts.map(o => `<option>${esc(o)}</option>`).join("")}</select>`;
  else if (f.type === "textarea") input = `<textarea id="${id}" name="${id}" placeholder="${esc(f.ph || "")}"></textarea>`;
  else input = `<input type="${f.type || "text"}" id="${id}" name="${id}" ${f.type === "number" ? 'min="0" inputmode="decimal"' : ""} class="${f.mono ? "mono" : ""}" placeholder="${esc(f.ph || "")}">`;
  return `<div class="${cls}" data-f="${id}"><label for="${id}">${esc(f.label)}${tag}</label>${input}${hint}</div>`;
}
function sectionHTML(num, sec, prefix = "") {
  return `<fieldset id="sec-${sec.id}"><div class="sec-head"><span class="eyebrow mono">${num}</span><h2>${esc(sec.title)}</h2></div><div class="grid">${sec.fields.map(f => fieldHTML(f, prefix)).join("")}</div></fieldset>`;
}
function build() {
  let html = sectionHTML("01", CORE_TOP[0]) + sectionHTML("02", CORE_TOP[1]);
  html += `<fieldset id="sec-type"><div class="sec-head"><span class="eyebrow mono">03</span><h2>Project type</h2></div><div class="types" role="radiogroup" aria-label="Project type">${
    Object.entries(TYPES).map(([k, t]) => `<label class="type" data-t="${k}" for="pt-${k}"><input type="radio" name="ptype" id="pt-${k}" value="${k}"><strong>${esc(t.name)}</strong><span>${esc(t.blurb)}</span></label>`).join("")}</div></fieldset>`;
  for (const [k, fields] of Object.entries(TYPE_FIELDS))
    html += `<div data-typesec="${k}" hidden>${sectionHTML("04", { id: "t-" + k, title: TYPES[k].name + " details", fields }, k + "_")}</div>`;
  html += sectionHTML("05", CORE_BOTTOM[0]) + sectionHTML("06", CORE_BOTTOM[1]);
  $("#sections").innerHTML = html;
  const nav = [["sec-client", "Client & engagement"], ["sec-commercial", "Timeline & commercials"], ["sec-type", "Project type"], ["typesec", "Type details"], ["sec-scope", "Scope & risks"], ["sec-internal", "Internal"]];
  $("#navlist").innerHTML = nav.map(([id, l]) => `<li><a href="#" data-jump="${id}">${l}</a></li>`).join("");
  $("#fType").innerHTML += Object.entries(TYPES).map(([k, t]) => `<option value="${k}">${esc(t.name)}</option>`).join("");
  $("#fStatus").innerHTML += STATUSES.map(s => `<option>${esc(s)}</option>`).join("");
}

const currentType = () => document.querySelector('input[name="ptype"]:checked')?.value || "";
function readField(f) {
  if (f.type === "checks") return [...document.querySelectorAll(`input[name="${f.el}"]:checked`)].map(i => i.value);
  const el = document.getElementById(f.el); if (!el) return "";
  if (f.type === "attest") return el.checked;
  return el.value.trim();
}
function writeField(f, v) {
  if (f.type === "checks") { document.querySelectorAll(`input[name="${f.el}"]`).forEach(i => i.checked = Array.isArray(v) && v.includes(i.value)); return; }
  const el = document.getElementById(f.el); if (!el) return;
  if (f.type === "attest") el.checked = !!v; else el.value = v ?? "";
}
function collect() {
  const t = currentType(), data = { type: t, core: {}, details: {} };
  coreFields().forEach(f => data.core[f.key] = readField(f));
  typeFields(t).forEach(f => data.details[f.key] = readField(f));
  return data;
}
function fill(d) {
  document.querySelectorAll('input[name="ptype"]').forEach(r => r.checked = r.value === d.type);
  showType();
  coreFields().forEach(f => writeField(f, d.core?.[f.key]));
  Object.keys(TYPE_FIELDS).forEach(t => typeFields(t).forEach(f => writeField(f, t === d.type ? d.details?.[f.key] : (f.type === "checks" ? [] : ""))));
  update();
}
function showType() { const t = currentType(); document.querySelectorAll("[data-typesec]").forEach(s => s.hidden = s.dataset.typesec !== t); }

function update() {
  const r = readiness(collect());
  $("#readyPct").textContent = r.pct + "%";
  $("#readyFrac").textContent = `${r.done} of ${r.total} drivers`;
  $("#readyBar").style.width = r.pct + "%";
  $("#missing").innerHTML = r.items.map(x => `<li class="${x.ok ? "done" : ""}">${esc(x.label)}</li>`).join("");
  saveDraft();
}

/* ---------- drafts (this browser only) ---------- */
let draftTimer;
function saveDraft() { clearTimeout(draftTimer); draftTimer = setTimeout(() => { try { localStorage.setItem(DRAFT_KEY, JSON.stringify({ d: collect(), editing: editingId })); } catch (e) {} }, 400); }
function loadDraft() { try { const o = JSON.parse(localStorage.getItem(DRAFT_KEY) || "null"); if (o?.d) { fill(o.d); if (o.editing) setEditing(o.editing); return true; } } catch (e) {} return false; }

/* ---------- submit ---------- */
function validate() {
  document.querySelectorAll(".invalid").forEach(e => e.classList.remove("invalid"));
  const t = currentType(), bad = [];
  if (!t) { $("#sec-type").classList.add("invalid"); bad.push($("#sec-type")); }
  [...coreFields(), ...typeFields(t)].filter(f => f.req).forEach(f => {
    if (!filled(readField(f))) { const w = document.querySelector(`[data-f="${f.el}"]`); if (w) { w.classList.add("invalid"); bad.push(w); } }
  });
  return bad;
}
const msg = (t, kind) => { const m = $("#saveMsg"); m.textContent = t; m.className = "status-line " + (kind || ""); };
function setEditing(id) {
  editingId = id || null;
  const d = editingId ? docs.find(x => x._id === editingId) : null;
  $("#editingBar").hidden = !editingId;
  if (editingId) {
    $("#editingRef").textContent = refFor(editingId, d?.submittedAt);
    $("#editingNote").textContent = d && !canEdit(d) ? "Read only: it's past New, so only a PM or admin can change it." : "";
  }
  const locked = d && !canEdit(d);
  $("#submitBtn").disabled = !!locked;
  $("#submitBtn").textContent = editingId ? "Save changes" : "Submit intake";
}
function clearForm(clearMsg = true) {
  fill({ type: "", core: {}, details: {} });
  document.querySelectorAll(".invalid").forEach(e => e.classList.remove("invalid"));
  setEditing(null); if (clearMsg) msg("");
  try { localStorage.removeItem(DRAFT_KEY); } catch (e) {}
}

function wire() {
  $("#navlist").addEventListener("click", e => {
    const a = e.target.closest("[data-jump]"); if (!a) return; e.preventDefault();
    const el = a.dataset.jump === "typesec" ? (document.querySelector("[data-typesec]:not([hidden])") || $("#sec-type")) : document.getElementById(a.dataset.jump);
    el.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
  });
  $("#intake").addEventListener("submit", async e => {
    e.preventDefault();
    const bad = validate();
    if (bad.length) { msg(`${bad.length} required ${bad.length === 1 ? "item is" : "items are"} missing. They're outlined in red.`, "err"); bad[0].scrollIntoView({ block: "center" }); return; }
    const data = collect();
    $("#submitBtn").disabled = true;
    try {
      if (editingId) {
        const prev = docs.find(x => x._id === editingId);
        await store.save(me, editingId, data);
        msg(`Saved ${refFor(editingId, prev?.submittedAt)}.`, "ok");
      } else {
        const id = await store.create(me, data); const now = new Date();
        clearForm(false);
        msg(`Submitted ${refFor(id, now)}. Review due ${fmtDate(reviewDue(now))}.`, "ok");
      }
    } catch (err) { msg(friendly(err), "err"); }
    finally { $("#submitBtn").disabled = false; }
  });
  $("#clearBtn").addEventListener("click", () => clearForm());
  $("#newBlank").addEventListener("click", () => clearForm());
  $("#exampleBtn").addEventListener("click", () => { setEditing(null); fill(EXAMPLE); msg("Example loaded. Replace it with real details before submitting."); });
  document.addEventListener("input", e => { if (e.target.closest("#intake")) { e.target.closest(".field")?.classList.remove("invalid"); update(); } });
  document.addEventListener("change", e => { if (e.target.name === "ptype") { showType(); $("#sec-type").classList.remove("invalid"); update(); } });

  $("#queue").addEventListener("click", onQueueClick);
  $("#queue").addEventListener("change", async e => {
    const s = e.target.closest("[data-status]"); if (!s) return;
    try { await store.setStatus(me, s.dataset.status, s.value); } catch (err) { s.disabled = true; alertRow(s, friendly(err)); }
  });
  $("#closeCopy").addEventListener("click", () => $("#copyPanel").hidden = true);
  ["#fType", "#fStatus"].forEach(s => $(s).addEventListener("change", renderQueue));
  document.querySelectorAll(".tab").forEach(t => t.addEventListener("click", () => go(t.dataset.view)));
  window.addEventListener("hashchange", fromHash);
}

/* ---------- queue ---------- */
function alertRow(el, text) { const row = el.closest(".qrow"); if (row) { let n = row.querySelector(".rowerr"); if (!n) { n = document.createElement("div"); n.className = "rowerr note err"; row.querySelector(".side").append(n); } n.textContent = text; } }
function renderQueue() {
  $("#qcount").textContent = docs.filter(d => !CLOSED.has(d.status)).length;
  const ft = $("#fType").value, fs = $("#fStatus").value;
  const list = docs.filter(d => (!ft || d.type === ft) && (fs === "*" ? true : fs ? d.status === fs : !CLOSED.has(d.status)))
    .sort((a, b) => String(b.submittedAt).localeCompare(String(a.submittedAt)));
  if (!list.length) { $("#queue").innerHTML = `<div class="empty">${docs.length ? "No intakes match these filters." : "No intakes yet. Submitted intakes appear here with their review-gate due date."}</div>`; return; }
  const today = new Date(); today.setHours(0, 0, 0, 0);
  $("#queue").innerHTML = list.map(d => {
    const status = d.status || "New", due = reviewDue(d.submittedAt); due.setHours(0, 0, 0, 0);
    const open = status === "New" || status === "In review";
    const dueCls = !open ? "" : due < today ? "late" : due.getTime() === today.getTime() ? "soon" : "";
    const r = readiness(d);
    const statusCtl = isReviewer()
      ? `<select aria-label="Status" data-status="${esc(d._id)}">${STATUSES.map(s => `<option ${s === status ? "selected" : ""}>${esc(s)}</option>`).join("")}</select>`
      : `<span class="status-pill">${esc(status)}</span>`;
    return `<article class="qrow" data-t="${esc(d.type)}">
      <span class="chip">${esc(d.type || "—")}</span>
      <div style="min-width:0"><h3>${esc(d.core?.projectName || "Untitled")}</h3>
        <div class="meta"><span class="mono">${refFor(d._id, d.submittedAt)}</span><span>${esc(d.core?.client || "")}</span><span>${esc(d.core?.billing || "Billing TBD")}</span><span>Submitted ${fmtDate(d.submittedAt)}${d.submittedByName ? " by " + esc(d.submittedByName) : ""}</span><span>Readiness ${r.pct}%</span></div></div>
      <div class="side">
        <span class="due ${dueCls}">${open ? "Review due " + fmtDate(due) : esc(status)}</span>
        ${statusCtl}
        <div class="btns"><button class="small" data-open="${esc(d._id)}">${canEdit(d) ? "Open" : "View"}</button><button class="small" data-copy="${esc(d._id)}">Copy summary</button>${isAdmin() ? `<button class="small danger" data-del="${esc(d._id)}">Delete</button>` : ""}</div>
      </div></article>`;
  }).join("");
}
async function onQueueClick(e) {
  const b = e.target.closest("button"); if (!b) return;
  const d = docs.find(x => x._id === (b.dataset.open || b.dataset.copy || b.dataset.del));
  if (b.dataset.open && d) { fill(d); setEditing(d._id); msg(""); go("new"); window.scrollTo(0, 0); }
  if (b.dataset.copy && d) {
    const text = summary(d);
    try { await navigator.clipboard.writeText(text); b.textContent = "Copied"; setTimeout(() => b.textContent = "Copy summary", 1600); }
    catch (_) { $("#copyPanel").hidden = false; $("#copyTitle").textContent = refFor(d._id, d.submittedAt) + " summary"; $("#copyBox").value = text; $("#copyBox").focus(); $("#copyBox").select(); }
  }
  if (b.dataset.del) {
    if (b.dataset.confirm !== "1") { b.dataset.confirm = "1"; b.textContent = "Confirm delete"; setTimeout(() => { if (b.isConnected) { b.dataset.confirm = ""; b.textContent = "Delete"; } }, 4000); return; }
    try { await store.remove(b.dataset.del); if (editingId === b.dataset.del) clearForm(); } catch (err) { alertRow(b, friendly(err)); }
  }
}

/* ---------- views ---------- */
function go(v) {
  $("#view-new").hidden = v !== "new"; $("#view-queue").hidden = v !== "queue";
  $("#tab-new").setAttribute("aria-selected", v === "new"); $("#tab-queue").setAttribute("aria-selected", v === "queue");
  $("#navIntake").toggleAttribute("aria-current", v === "new"); $("#navQueue").toggleAttribute("aria-current", v === "queue");
  const h = v === "queue" ? "#submissions" : "";
  if (location.hash !== h) history.replaceState(null, "", location.pathname + location.search + h);
}
function fromHash() { go(location.hash === "#submissions" ? "queue" : "new"); }

/* ---------- boot (last, so every helper above is defined) ---------- */
if (DEMO) {
  $("#demoBanner").hidden = false;
  store = demoStore();
  me = { email: "demo@example.com", name: "Demo user", role: "admin" };
  start();
} else if (!isConfigured) {
  gate(`<h2>Almost ready</h2><p>Firebase isn't connected yet, so intakes can't be saved. Follow SETUP.md in the repository.</p><p><a class="btn primary" href="?demo=1">Try the demo intake</a></p>`);
} else {
  const fb = await import("../js/app.js");
  friendly = fb.friendlyError;
  store = { watch: fb.watchIntakes, create: fb.createIntake, save: fb.saveIntake, setStatus: fb.setIntakeStatus, remove: fb.deleteIntake };
  $("#signOutBtn").onclick = () => fb.signOut();
  fb.watchSession(({ user, email, member }) => {
    if (stopWatch) { stopWatch(); stopWatch = null; }
    $("#signOutBtn").hidden = !user;
    $("#who").textContent = user ? (member?.name || email) : "";
    if (!user) {
      gate(`<h2>Sign in</h2><p>Intakes are for the Professional Services team. Sign in with the Google account an admin added for you.</p><p><button type="button" class="primary" id="go">Sign in with Google</button></p><p class="err" id="err"></p>`);
      $("#go").onclick = () => fb.signIn().catch(e => $("#err").textContent = friendly(e));
      return;
    }
    if (!member) return gate(`<h2>Not on the team list yet</h2><p>You're signed in as <b>${esc(email)}</b>. Ask an admin to add this account on the Team page, then reload.</p>`);
    me = { email, name: member.name || email, role: member.role };
    start();
  });
}
