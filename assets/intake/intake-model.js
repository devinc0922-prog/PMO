// Intake form definition: project types, fields, statuses, and helpers.
// Edit this file to add a field or a project type; the form, readiness meter
// and copyable summary all build from it.
//
// Field shape: { id, label, type?, opts?, req?, drv?, full?, hint?, ph?, mono? }
//   type: text (default) | email | number | date | select | textarea | checks | attest
//   req:  must be filled to submit
//   drv:  estimate driver — counted by the readiness meter
//   full: spans both columns

export const TYPES = {
  acq:   { name: "Acquisition integration", blurb: "Venture client absorbing a new company" },
  m365:  { name: "Microsoft 365 migration", blurb: "Mail, files, tenant moves" },
  cmmc:  { name: "CMMC L2 implementation", blurb: "NIST 800-171 readiness build" },
  infra: { name: "Infrastructure upgrade", blurb: "Servers, hypervisors, network" }
};
const YN = ["Yes", "No", "Unknown"];

export const CORE_TOP = [
  { id: "client", title: "Client & engagement", fields: [
    { id: "client", label: "Client name", req: 1, drv: 1 },
    { id: "projectName", label: "Project name", req: 1, ph: "e.g. Hartwell – Google to M365 migration" },
    { id: "relationship", label: "Client relationship", type: "select", opts: ["Managed services (TeamLogic IT)", "Co-managed", "Project only", "Prospect"] },
    { id: "source", label: "Request came from", type: "select", opts: ["Sales / account manager", "Client directly", "Service desk escalation", "Venture client referral", "Internal"] },
    { id: "contactName", label: "Client sponsor / decision maker", req: 1, drv: 1 },
    { id: "contactEmail", label: "Sponsor email", type: "email" },
    { id: "techContact", label: "Client technical contact" },
    { id: "cwOpp", label: "ConnectWise opportunity #", mono: 1 }
  ]},
  { id: "commercial", title: "Timeline & commercials", fields: [
    { id: "targetStart", label: "Target start", type: "date" },
    { id: "hardDeadline", label: "Hard deadline", type: "date", hint: "Leave blank if none" },
    { id: "deadlineDriver", label: "What drives the deadline", full: 1, ph: "Contract award, lease end, deal close, hardware EOL…" },
    { id: "billing", label: "Billing model", type: "select", req: 1, drv: 1, opts: ["Fixed fee", "Time & materials", "Fixed fee + T&M change orders", "Prepaid block hours", "Not decided"] },
    { id: "budget", label: "Client budget range", type: "select", opts: ["Under $5k", "$5k–$15k", "$15k–$40k", "$40k–$100k", "Over $100k", "Unknown"] },
    { id: "priority", label: "Priority", type: "select", opts: ["Standard", "High", "Urgent – contractual or regulatory date"] }
  ]}
];

export const TYPE_FIELDS = {
  acq: [
    { id: "parentCo", label: "Acquiring company (Venture client)", req: 1 },
    { id: "acquiredCo", label: "Acquired company", req: 1 },
    { id: "closeDate", label: "Deal close / Day 1", type: "date", drv: 1 },
    { id: "tsaEnd", label: "Seller support (TSA) ends", type: "date", hint: "When the seller stops supporting their IT" },
    { id: "acqUsers", label: "Users joining", type: "number", drv: 1 },
    { id: "acqSites", label: "Sites / locations", type: "number", drv: 1 },
    { id: "acqProvider", label: "Acquired company's IT today", type: "select", opts: ["In-house IT", "Another MSP", "Seller corporate IT (carve-out)", "None / ad hoc"] },
    { id: "acqIdentity", label: "Their identity / email platform", type: "select", drv: 1, opts: ["Microsoft 365", "Google Workspace", "On-prem AD + Exchange", "Hybrid AD", "Other"] },
    { id: "integrationModel", label: "Integration model", type: "select", drv: 1, opts: ["Full absorb into parent tenant", "Cross-tenant coexistence, then migrate", "Stay separate, managed by us", "Not decided"] },
    { id: "acqEndpoints", label: "Endpoints (PCs / laptops)", type: "number", drv: 1 },
    { id: "deviceApproach", label: "Device approach", type: "select", opts: ["Re-enroll in Intune / Autopilot", "Reimage", "Replace hardware", "Not decided"] },
    { id: "networkJoin", label: "Site connectivity", type: "select", opts: ["Site-to-site VPN", "SD-WAN", "Cloud only, no site link", "Not decided"] },
    { id: "acqData", label: "File data location & size", ph: "e.g. 1.2 TB on a Synology + Dropbox" },
    { id: "voip", label: "Phones / VoIP in scope", type: "select", opts: YN },
    { id: "day1", label: "Day 1 must-haves", type: "textarea", full: 1, hint: "What has to work on close day: email, payroll, shared drives, building access" },
    { id: "lobApps", label: "Line-of-business apps", type: "textarea", full: 1 },
    { id: "secAlign", label: "Security stack to bring in line", type: "checks", full: 1, opts: ["EDR", "MFA / Conditional Access", "Email security", "Backup", "RMM agent", "Security awareness training"] },
    { id: "acqCompliance", label: "Compliance obligations", type: "checks", full: 1, opts: ["CMMC / DFARS", "HIPAA", "SOC 2", "PCI", "None known"] }
  ],
  m365: [
    { id: "source", label: "Source platform", type: "select", req: 1, drv: 1, opts: ["Google Workspace", "Exchange on-prem", "Another Microsoft 365 tenant", "IMAP / hosted email", "Other"] },
    { id: "mailboxes", label: "User mailboxes", type: "number", drv: 1 },
    { id: "sharedMbx", label: "Shared / resource mailboxes", type: "number" },
    { id: "mailData", label: "Total mail data (GB)", type: "number", drv: 1 },
    { id: "fileSource", label: "File data sources", type: "checks", full: 1, drv: 1, opts: ["File server", "Box", "Dropbox", "Google Drive", "Existing SharePoint / OneDrive", "None"] },
    { id: "fileData", label: "File data (GB)", type: "number", drv: 1 },
    { id: "teams", label: "SharePoint / Teams site build in scope", type: "select", opts: YN },
    { id: "license", label: "Target licensing", type: "select", drv: 1, opts: ["Business Basic", "Business Standard", "Business Premium", "E3", "E5", "GCC", "GCC High", "Not decided"] },
    { id: "cutover", label: "Cutover approach", type: "select", drv: 1, opts: ["Single cutover (weekend)", "Staged batches", "Hybrid / coexistence", "Not decided"] },
    { id: "domains", label: "Email domains", type: "number" },
    { id: "dnsOwner", label: "DNS managed by", type: "select", opts: ["Us", "Client", "Third party / registrar", "Unknown"] },
    { id: "devices", label: "Devices to reconfigure", type: "number", drv: 1 },
    { id: "tool", label: "Migration tool", type: "select", opts: ["BitTitan MigrationWiz", "Movebot", "ShareGate", "Native / cross-tenant", "Not decided"] },
    { id: "afterHours", label: "After-hours cutover required", type: "select", opts: YN },
    { id: "security", label: "Security baseline in scope", type: "checks", full: 1, opts: ["MFA", "Conditional Access", "Intune enrollment", "Defender for Business", "Purview / DLP", "Third-party email security"] }
  ],
  cmmc: [
    { id: "roleAttest", label: "Confirmed: we are the implementer for this client and will not perform their C3PAO assessment.", type: "attest", req: 1, full: 1 },
    { id: "assessType", label: "Assessment path", type: "select", opts: ["Level 2 C3PAO certification", "Level 2 self-assessment", "Not sure yet"] },
    { id: "targetAssess", label: "Target assessment date", type: "date", drv: 1 },
    { id: "contractDriver", label: "Contract driver", type: "select", opts: ["Existing DFARS 252.204-7012 contract", "Prime flow-down", "Upcoming solicitation", "Proactive / no contract yet"] },
    { id: "sprs", label: "Current SPRS score", mono: 1, hint: "−203 to 110" },
    { id: "gap", label: "Gap assessment status", type: "select", drv: 1, opts: ["None done", "Client self-assessment", "Third-party gap assessment", "Our gap assessment"] },
    { id: "scopeApproach", label: "CUI scoping approach", type: "select", drv: 1, opts: ["Enterprise-wide", "Enclave", "Not decided"] },
    { id: "cloud", label: "Target environment", type: "select", drv: 1, opts: ["GCC High", "GCC", "Commercial M365 (no CUI)", "On-prem", "Hybrid", "Not decided"] },
    { id: "headcount", label: "Total employees", type: "number" },
    { id: "cuiUsers", label: "Users handling CUI", type: "number", drv: 1 },
    { id: "sitesInScope", label: "Physical sites in scope", type: "number", drv: 1 },
    { id: "docOwner", label: "Who writes the documentation", type: "select", drv: 1, opts: ["Us", "Client", "Shared"] },
    { id: "docs", label: "Documentation that exists today", type: "checks", full: 1, opts: ["SSP", "POA&M", "Policies & procedures", "Network diagram", "CUI data flow diagram", "Asset inventory", "None"] },
    { id: "esps", label: "External service providers / cloud services touching CUI", type: "textarea", full: 1 },
    { id: "ongoing", label: "Ongoing managed compliance after go-live", type: "select", opts: YN }
  ],
  infra: [
    { id: "infraScope", label: "What's in scope", type: "checks", req: 1, drv: 1, full: 1, opts: ["Servers / hosts", "Hypervisor & VMs", "Storage (SAN / NAS)", "Switching", "Firewall", "Wireless", "Backup / DR", "UPS / power", "Server OS upgrades"] },
    { id: "hvCurrent", label: "Current hypervisor", type: "select", opts: ["Hyper-V", "VMware", "None (physical)", "Other"] },
    { id: "hvTarget", label: "Target platform", type: "select", drv: 1, opts: ["Hyper-V", "VMware", "Proxmox", "Azure / cloud", "Hybrid", "Not decided"] },
    { id: "hostsCurrent", label: "Physical hosts today", type: "number" },
    { id: "hostsTarget", label: "Physical hosts after", type: "number", drv: 1 },
    { id: "vmCount", label: "VMs to build or migrate", type: "number", drv: 1 },
    { id: "storageTB", label: "Storage (TB)", type: "number" },
    { id: "procurement", label: "Hardware procured by", type: "select", drv: 1, opts: ["Us (resale)", "Client directly", "Already purchased", "Not decided"] },
    { id: "quoteRef", label: "Hardware quote / vendor ref", mono: 1 },
    { id: "infraSites", label: "Sites", type: "number", drv: 1 },
    { id: "onsite", label: "On-site work", type: "select", drv: 1, opts: ["Required throughout", "Some days", "Remote only"] },
    { id: "window", label: "Maintenance window", type: "select", opts: ["Business hours OK", "Evenings", "Weekends only", "Specific change window"] },
    { id: "downtime", label: "Downtime tolerance", type: "select", opts: ["Hours acceptable", "Under 1 hour", "Near-zero (parallel build)"] },
    { id: "backupSol", label: "Backup solution" },
    { id: "osEol", label: "End-of-life OS present", type: "checks", full: 1, opts: ["Server 2012 / R2", "Server 2016", "Server 2019", "None"] },
    { id: "appsOnHosts", label: "Critical apps on these systems", type: "textarea", full: 1, hint: "SQL, ERP, file shares, line-of-business" }
  ]
};

export const CORE_BOTTOM = [
  { id: "scope", title: "Scope, risks & dependencies", fields: [
    { id: "objective", label: "Business objective", type: "textarea", req: 1, drv: 1, full: 1, hint: "Why the client is doing this, in their words" },
    { id: "success", label: "Success criteria", type: "textarea", full: 1 },
    { id: "inScope", label: "Known in scope", type: "textarea" },
    { id: "outScope", label: "Explicitly out of scope", type: "textarea" },
    { id: "risks", label: "Known risks / constraints", type: "textarea", full: 1 },
    { id: "deps", label: "Client-side dependencies", type: "checks", full: 1, opts: ["Admin credentials / GDAP", "Third-party vendor cooperation", "Outgoing MSP handoff", "Client scheduling / change freeze", "Hardware lead time", "Licensing purchase"] },
    { id: "links", label: "Links to notes, quotes, diagrams", type: "textarea", full: 1 }
  ]},
  { id: "internal", title: "Internal", fields: [
    { id: "proposedPM", label: "Proposed PM" },
    { id: "resources", label: "Resources likely needed", type: "checks", full: 1, opts: ["Project manager", "Senior engineer", "Systems admin", "UK engineer (off-hours)", "CMMC RP / CCP", "Contractor"] },
    { id: "notes", label: "Internal notes", type: "textarea", full: 1 }
  ]}
];

export const STATUSES = ["New", "In review", "Scoped", "Charter drafted", "Won – in delivery", "Declined"];
export const CLOSED = new Set(["Won – in delivery", "Declined"]);

/* ---------- helpers ---------- */
export const coreFields = () => [...CORE_TOP, ...CORE_BOTTOM].flatMap(s => s.fields.map(f => ({ ...f, key: f.id, el: f.id })));
export const typeFields = t => (t && TYPE_FIELDS[t]) ? TYPE_FIELDS[t].map(f => ({ ...f, key: f.id, el: t + "_" + f.id })) : [];
export const filled = v => Array.isArray(v) ? v.length > 0 : (typeof v === "boolean" ? v : String(v ?? "").length > 0);

// Readiness = project type chosen + every estimate driver filled.
export function readiness(d) {
  const c = coreFields().filter(f => f.drv), t = typeFields(d.type).filter(f => f.drv);
  const items = [{ label: "Project type", ok: !!d.type },
    ...c.map(f => ({ label: f.label, ok: filled(d.core?.[f.key]) })),
    ...t.map(f => ({ label: f.label, ok: filled(d.details?.[f.key]) }))];
  const done = items.filter(x => x.ok).length;
  return { items, done, total: items.length, pct: Math.round(done / items.length * 100) };
}

export function refFor(id, ts) {
  const d = new Date(ts || Date.now());
  return `PS-${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}-${String(id).slice(-4).toUpperCase()}`;
}
// Review gate from the PS intake/dispatch SOP: two business days.
export function reviewDue(ts) {
  const d = new Date(ts); let added = 0;
  while (added < 2) { d.setDate(d.getDate() + 1); const w = d.getDay(); if (w !== 0 && w !== 6) added++; }
  return d;
}
export const fmtDate = d => new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });

// Plain-text summary to paste into the Claude project for charter / plan / estimate.
export function summary(doc) {
  const r = readiness(doc);
  const lines = [`# Intake ${refFor(doc._id, doc.submittedAt)} – ${doc.core?.projectName || ""}`,
    `Type: ${TYPES[doc.type]?.name || "—"} | Status: ${doc.status || "New"} | Submitted ${fmtDate(doc.submittedAt)}${doc.submittedByName ? " by " + doc.submittedByName : ""} | Estimate readiness ${r.pct}%`, ""];
  const section = (title, fields, src) => {
    lines.push(`## ${title}`);
    fields.forEach(f => {
      const v = src?.[f.id];
      const s = Array.isArray(v) ? v.join(", ") : (typeof v === "boolean" ? (v ? "Yes" : "No") : v);
      lines.push(`- ${f.label}: ${filled(v) ? s : "(missing)"}`);
    });
    lines.push("");
  };
  CORE_TOP.forEach(s => section(s.title, s.fields, doc.core));
  if (doc.type && TYPE_FIELDS[doc.type]) section(TYPES[doc.type].name + " details", TYPE_FIELDS[doc.type], doc.details);
  CORE_BOTTOM.forEach(s => section(s.title, s.fields, doc.core));
  return lines.join("\n");
}

export const EXAMPLE = {
  type: "m365",
  core: { client: "Example: Hartwell Precision", projectName: "Example – Google Workspace to M365 migration", relationship: "Managed services (TeamLogic IT)", source: "Sales / account manager", contactName: "Dana Ruiz (COO)", contactEmail: "dana@example.com", techContact: "Office manager", cwOpp: "OPP-0000", targetStart: "", hardDeadline: "", deadlineDriver: "Google Workspace renewal at end of quarter", billing: "Fixed fee", budget: "$15k–$40k", priority: "High", objective: "Consolidate on Microsoft 365 ahead of Workspace renewal and bring devices under Intune.", success: "All mail, calendars and Drive data moved with no lost mail; users on Outlook and OneDrive by Monday after cutover.", inScope: "Mailboxes, shared drives, MFA, Intune enrollment", outScope: "Third-party app SSO, phone system", risks: "Large shared drives with deep folder nesting; renewal date is fixed.", deps: ["Admin credentials / GDAP", "Licensing purchase"], links: "", proposedPM: "", resources: ["Project manager", "Senior engineer", "UK engineer (off-hours)"], notes: "Example data – clear before submitting a real intake." },
  details: { source: "Google Workspace", mailboxes: "42", sharedMbx: "6", mailData: "380", fileSource: ["Google Drive"], fileData: "900", teams: "Yes", license: "Business Premium", cutover: "Single cutover (weekend)", domains: "2", dnsOwner: "Us", devices: "45", tool: "BitTitan MigrationWiz", afterHours: "Yes", security: ["MFA", "Conditional Access", "Intune enrollment"] }
};
