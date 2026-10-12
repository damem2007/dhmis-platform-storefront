'use client';

import { useEffect, useRef, useState, type ComponentProps, type CSSProperties, type ReactNode } from "react";
import { installFormEnhancements } from "./formEnhancements";

// Lighter, dependency-free version: one component, hash routing, content and theme overridable by props.
// Wire the CMS by passing `site`, `theme`, `pages` and `articles` (same shapes as the types below).
// The contact form is a stub: send it to your backend's lead endpoint.

type Link = { label: string; href: string };
type Item = { title: string; text: string; href?: string };
type Base = { id?: string; note?: string; more?: Link };
type Block = Base & (
  | { type: "hero"; title: string; accent?: string; text: string; cta: Link; secondary?: Link; micro?: string; chart?: boolean; glance?: { n: number; pre?: string; label: string }[] }
  | { type: "stats"; title: string; items: { n: number; suf?: string; label: string }[] }
  | { type: "quotes"; title: string; items: { text: string; by: string; sample?: boolean }[] }
  | { type: "features"; title: string; items: Item[] }
  | { type: "steps"; title: string; items: { title: string; text: string; status: St }[] }
  | { type: "compare"; title: string; cols: string[]; rows: string[][] }
  | { type: "roi"; title: string; assumption: number }
  | { type: "pricing"; title: string; plans: { name: string; price: string; per: string; text: string; features: string[]; cta: Link; featured?: boolean }[] }
  | { type: "faq"; title: string; items: { q: string; a: string }[] }
  | { type: "resources"; title: string; items: { title: string; links: Link[]; more: Link }[] }
  | { type: "text"; title: string; paragraphs: string[] }
  | { type: "code"; title: string; text: string; code: string }
  | { type: "cta"; title: string; text: string; cta: Link; secondary?: Link }
  | { type: "contact"; title: string; text: string }
);
type Page = { slug: string; title: string; description: string; blocks: Block[] };
type Section = "kb" | "docs";
type Article = { slug: string; section: Section; category: string; title: string; summary: string; body: string[]; code?: string };
type Site = { name: string; tagline: string; nav: Link[]; resources: Link[]; primary: Link; footer: { title: string; links: Link[] }[] };
type Theme = { light: Record<string, string>; dark: Record<string, string> };
type ThemeMode = "system" | "light" | "dark";


// ---------- Tooth shapes ----------
type St = "h" | "w" | "t" | "p";
const ROOT = "M-8-18Q-9-36-3-50Q0-54 3-50Q9-36 8-18Z";
const PATH = {
  i: "M-12-18Q-14 10-9 22Q0 28 9 22Q14 10 12-18Z",
  c: "M-14-18Q-16 8 0 31Q16 8 14-18Z",
  p: "M-17-18Q-19 10-10 23Q0 27 10 23Q19 10 17-18Z",
  m: "M-25-18Q-28 12-17 24Q-9 29 0 22Q9 29 17 24Q28 12 25-18Z",
} as const;

// ---------- Default content (replace with CMS data via props) ----------

const theme: Theme = {
  light: { ink: "#0c2b33", paper: "#f3f8f7", mint: "#cfebe3", mint2: "#e4f3ef", coral: "#c93a60", "on-coral": "#ffffff", blue: "#2d5f8a", amber: "#e8b23a", ok: "#2fa58a", line: "#c9dcd7", card: "#ffffff", tooth: "#ffffff", glow: "rgba(228,87,122,.14)" },
  dark: { ink: "#e6f4f0", paper: "#0a1b20", mint: "#1d4a4a", mint2: "#112d33", coral: "#ff7d9a", "on-coral": "#0a1b20", line: "#27474b", card: "#10282e", tooth: "#e8f5f1", glow: "rgba(228,87,122,.2)" },
};

const site: Site = {
  name: "DHMIS",
  tagline: "Practice management software that keeps every patient's treatment on track.",
  nav: [{ label: "Features", href: "/features" }, { label: "Pricing", href: "/pricing" }, { label: "Developers", href: "/developers" }],
  resources: [{ label: "Knowledge base", href: "/kb" }, { label: "API docs", href: "/docs" }, { label: "FAQ", href: "/faq" }, { label: "Security", href: "/security" }],
  primary: { label: "Start free trial", href: "/contact" },
  footer: [
    { title: "Product", links: [{ label: "Features", href: "/features" }, { label: "Pricing", href: "/pricing" }, { label: "Security", href: "/security" }] },
    { title: "Resources", links: [{ label: "Knowledge base", href: "/kb" }, { label: "API docs", href: "/docs" }, { label: "FAQ", href: "/faq" }] },
    { title: "Company", links: [{ label: "About", href: "/about" }, { label: "Contact", href: "/contact" }, { label: "Developers", href: "/developers" }] },
  ],
};

const demo = { label: "Start free trial", href: "/contact" };
const PLANS: Extract<Block, { type: "pricing" }>["plans"] = [
  { name: "Solo", price: "$99", per: "/month", text: "One dentist, one location.", features: ["Charting and treatment plans", "Recalls and reminders", "Patient portal"], cta: demo },
  { name: "Clinic", price: "$299", per: "/month", text: "Up to 8 providers.", features: ["Everything in Solo", "Billing and claims", "Reports and analytics"], cta: demo, featured: true },
  { name: "Group", price: "Custom", per: "", text: "Multiple locations.", features: ["Everything in Clinic", "SSO and audit log", "API, webhooks and sandbox"], cta: { label: "Talk to sales", href: "/contact" } },
];
const FAQS = [
  { q: "Can we import our existing records?", a: "Yes. We import patients, appointments and charts from spreadsheets, paper registers or your current system before you go live." },
  { q: "How long does setup take?", a: "Most clinics are live within two weeks, and training for your team is included." },
  { q: "Do patients need to install an app?", a: "No. They get a link by SMS or email and approve plans from any phone." },
  { q: "Is there a contract?", a: "No. Plans are monthly and you can cancel any time." },
  { q: "Who can see our data?", a: "Only the people you give access to. Replace this answer with your hosting region and compliance details." },
  { q: "Can we connect our other systems?", a: "Yes. A REST API and webhooks are available. See the developer docs." },
];
const TRUST: Block = { type: "features", id: "trust", title: "Patient data, handled carefully", note: "Add your confirmed certifications and regional compliance (HIPAA, NDPR, GDPR, PIPEDA) before launch.", items: [
  { title: "Encrypted", text: "In transit and at rest." }, { title: "Role-based access", text: "Front desk can't see financial reports." }, { title: "Audit trail", text: "Every record view is logged." } ] };

const pages: Page[] = [
  { slug: "home", title: "Dental practice management", description: site.tagline, blocks: [
    { type: "hero", title: "See every tooth.", accent: "Miss nothing.", text: "DHMIS turns every patient's chart into a live map of what's healthy, what's planned and what it's worth, so no treatment slips away. Click a tooth to try it.", cta: demo, secondary: { label: "Estimate your return", href: "/#roi" }, micro: "14-day free trial · No card needed · We import your patients", chart: true,
      glance: [{ n: 128, label: "Recalls due this month" }, { n: 17, label: "Plans awaiting approval" }, { n: 48200, pre: "$", label: "Production this week" }], note: "Sample clinic data for illustration." },
    { type: "stats", title: "What clinics get back", note: "Sample outcomes. Replace with measured pilot results.", items: [{ n: 40, suf: "%", label: "fewer missed recalls" }, { n: 22, suf: "%", label: "more plans accepted" }, { n: 10, suf: " h", label: "front-desk hours saved each week" }] },
    { type: "quotes", title: "What clinics say", items: [
      { text: "We stopped losing planned crowns. Every one now has a date and a follow-up.", by: "Dr. Name, Clinic, City", sample: true },
      { text: "Patients approve quotes on their phone before they leave the chair.", by: "Practice manager, Clinic, City", sample: true },
      { text: "Month-end claims used to take two days. Now they take an afternoon.", by: "Owner, Clinic, City", sample: true } ] },
    { type: "features", id: "features", title: "One chart. Everything that follows from it.", more: { label: "See all features", href: "/features" }, items: [
      { title: "Recalls that run themselves", text: "Every finding schedules its own follow-up by SMS or email until the patient is booked." },
      { title: "Plans patients approve on their phone", text: "Quotes with prices, sent as a link." },
      { title: "Full chairs, filled gaps", text: "Cancelled slots go to the waitlist automatically." },
      { title: "Claims without re-keying", text: "Procedure codes flow from the chart to the claim." },
      { title: "Built to integrate", text: "A REST API and webhooks.", href: "/developers" },
      { title: "Reports that explain themselves", text: "Production, acceptance and recall health by provider." } ] },
    { type: "steps", id: "flow", title: "From finding to follow-up", items: [
      { title: "Chart the finding", text: "Record it on the tooth during the exam. It's flagged as Watch until someone decides.", status: "w" },
      { title: "Plan and quote", text: "Turn it into a plan with a price. The patient approves it from their phone.", status: "p" },
      { title: "Treat and follow up", text: "Mark it treated and the next recall books itself. Nothing falls through.", status: "t" } ] },
    { type: "compare", title: "Why clinics switch", note: "Confirm each row against your product before launch.", cols: ["", "DHMIS", "Paper and spreadsheets", "Generic global software"], rows: [
      ["Follow-ups tied to each tooth", "Yes", "No", "Partly"], ["Quotes patients approve on their phone", "Yes", "No", "Partly"],
      ["Local currency and insurance billing", "Yes", "Manual", "Often missing"], ["SMS and chat reminders", "Yes", "Manual calls", "Extra cost"], ["Data import and setup included", "Yes", "None", "Often extra"] ] },
    { type: "roi", id: "roi", title: "What would better recalls be worth to you?", assumption: 0.4 },
    { type: "pricing", id: "pricing", title: "Simple pricing, per clinic", plans: PLANS, note: "14-day free trial on every plan. No card. Cancel any time. We import your data.", more: { label: "Compare plans in detail", href: "/pricing" } },
    TRUST,
    { type: "faq", id: "faq", title: "Questions before you start", items: FAQS.slice(0, 4), more: { label: "Read all FAQs", href: "/faq" } },
    { type: "resources", id: "resources", title: "Learn and build", items: [
      { title: "Knowledge base", links: [{ label: "Import your patient list", href: "/kb/import-patients" }, { label: "Set up recall reminders", href: "/kb/set-up-recalls" }, { label: "Submit an insurance claim", href: "/kb/submit-claim" }], more: { label: "Browse all articles", href: "/kb" } },
      { title: "API documentation", links: [{ label: "Authentication", href: "/docs/authentication" }, { label: "Webhooks", href: "/docs/webhooks" }, { label: "Sandbox", href: "/docs/sandbox" }], more: { label: "Open the docs", href: "/docs" } } ] },
    { type: "cta", title: "Put your patients' charts to work", text: "Start a free trial, or book a demo and we'll load your own patient list so you see real charts, not slides.", cta: demo, secondary: { label: "Book a demo", href: "/contact" } } ] },
  { slug: "features", title: "Features", description: "Charting, scheduling, recalls, billing and reporting.", blocks: [
    { type: "text", title: "One system from check-in to claim", paragraphs: ["DHMIS replaces the mix of charting software, spreadsheets and reminder tools most clinics juggle."] },
    { type: "features", title: "What's included", items: [
      { title: "Scheduling", text: "Multi-chair, multi-location calendars with waitlist fill." }, { title: "Imaging", text: "Attach X-rays and photos directly to a tooth or visit." },
      { title: "Patient portal", text: "Forms, plan approval and payments from a phone." }, { title: "Reporting", text: "Production, acceptance rate and recall health by provider." } ] },
    { type: "cta", title: "Want a walkthrough?", text: "Thirty minutes, no slides.", cta: { label: "Book a demo", href: "/contact" } } ] },
  { slug: "pricing", title: "Pricing", description: "Simple per-clinic pricing.", blocks: [
    { type: "pricing", title: "Pricing per clinic, per month", plans: PLANS, note: "14-day free trial on every plan. No card. Cancel any time." },
    { type: "faq", title: "Billing questions", items: FAQS.slice(3, 4) } ] },
  { slug: "security", title: "Security and compliance", description: "How DHMIS protects patient data.", blocks: [
    { type: "text", title: "Patient data stays protected", paragraphs: ["Data is encrypted in transit and at rest, access is role-based, and every record view is logged.", "Replace this copy with your confirmed compliance status (HIPAA, GDPR, NDPR, PIPEDA) before launch."] }] },
  { slug: "developers", title: "Developers", description: "REST API, webhooks and sandbox.", blocks: [
    { type: "hero", title: "Build on the DHMIS API", text: "Read patients, appointments and treatment plans, and subscribe to events with webhooks.", cta: { label: "Read the docs", href: "/docs" } },
    { type: "code", title: "List today's appointments", text: "Authenticate with an API key from Settings.", code: "curl https://api.example.com/v1/appointments?date=today \\\n  -H \"Authorization: Bearer $DHMIS_API_KEY\"" },
    { type: "features", title: "Start here", items: [
      { title: "Authentication", text: "API keys and OAuth.", href: "/docs/authentication" }, { title: "Webhooks", text: "Events for bookings and payments.", href: "/docs/webhooks" }, { title: "Sandbox", text: "Test with fake patients.", href: "/docs/sandbox" } ] }] },
  { slug: "faq", title: "FAQ", description: "Answers to common questions.", blocks: [{ type: "faq", title: "Frequently asked questions", items: FAQS }] },
  { slug: "about", title: "About", description: "Why we build DHMIS.", blocks: [{ type: "text", title: "Software made with clinicians", paragraphs: ["Replace with your company story, team and mission."] }] },
  { slug: "contact", title: "Contact", description: "Start a trial or book a demo.", blocks: [{ type: "contact", title: "Start your free trial", text: "Tell us about your clinic and we'll reply within one business day." }] },
];

const articles: Article[] = [
  { slug: "import-patients", section: "kb", category: "Getting started", title: "Import your patient list", summary: "Bring patients over from a CSV or your old system.", body: ["Go to Settings, then Import, and upload a CSV.", "Review the column mapping and confirm. Duplicates are flagged before anything is saved."] },
  { slug: "set-up-recalls", section: "kb", category: "Getting started", title: "Set up recall reminders", summary: "Choose when patients are contacted.", body: ["Open Recalls and pick an interval per treatment type.", "Choose SMS, email or both."] },
  { slug: "submit-claim", section: "kb", category: "Billing", title: "Submit an insurance claim", summary: "Send a claim from a completed visit.", body: ["Open the visit and select Create claim.", "Check the procedure codes and send."] },
  { slug: "authentication", section: "docs", category: "API", title: "Authentication", summary: "Authenticate API requests.", body: ["Send your API key as a Bearer token in the Authorization header."], code: "Authorization: Bearer $DHMIS_API_KEY" },
  { slug: "webhooks", section: "docs", category: "API", title: "Webhooks", summary: "Receive events when data changes.", body: ["Register an HTTPS endpoint in Settings. We send a signed POST for each event, such as appointment.created."], code: "{ \"event\": \"appointment.created\", \"id\": \"apt_123\" }" },
  { slug: "sandbox", section: "docs", category: "API", title: "Sandbox", summary: "Test without real patient data.", body: ["The sandbox has its own keys and seeded fake patients. Nothing you do there affects live data."] },
];

const defaults = { site, theme, pages, articles };

// ---------- Interactive pieces ----------

type T = keyof typeof PATH;
type Tooth = { idx: number; c: T; st: St; tf: string; title: string; val: number };

const ROW = "mmmppciiiicppmmm";
const W: Record<T, number> = { i: 30, c: 34, p: 38, m: 52 };
const S = "hhwhthphhphthhwh" + "hhhthhwhhphhhthh";
const VALS = [1150, 2400, 860];
const NAMES = ["central incisor", "lateral incisor", "canine", "first premolar", "second premolar", "first molar", "second molar", "third molar"];
const INFO: Record<St, [string, string, string]> = {
  h: ["Healthy", "No findings at the last exam.", "Next check-up in 5 months."],
  w: ["Watch", "Early DHMIS wear on the biting surface.", "Re-image at the 3-month recall."],
  t: ["Treated", "Composite filling placed, two surfaces.", "Reviewed at the next hygiene visit."],
  p: ["Planned", "Crown recommended after the last exam.", "Quote sent, awaiting patient approval."],
};
const fmt = (n: number) => n.toLocaleString("en-US");

// Pure layout: same result on server and client, so the chart renders without JS.
const TEETH: Tooth[] = (() => {
  const G = 3, tot = ROW.split("").reduce((a, c) => a + W[c as T] + G, 0) - G, half = tot / 2, CX = 380, out: Tooth[] = [];
  let pc = 0;
  [0, 1].forEach((r) => {
    let x = CX - half;
    ROW.split("").forEach((ch, i) => {
      const c = ch as T, cx = x + W[c] / 2;
      x += W[c] + G;
      const t = (cx - CX) / half, up = r === 0, y = up ? 120 + 60 * (1 - t * t) : 300 - 60 * (1 - t * t);
      const a = (Math.atan(((up ? -1 : 1) * 120 * t) / half) * 180) / Math.PI;
      const idx = r * 16 + i, st = S[idx] as St, p = i < 8 ? 7 - i : i - 8, n = up ? i + 1 : 32 - i;
      out.push({ idx, c, st, tf: `translate(${cx.toFixed(1)} ${y.toFixed(1)}) rotate(${a.toFixed(1)})${up ? "" : " scale(1 -1)"}`, val: st === "p" ? VALS[pc++ % 3] : 0,
        title: `#${n} · ${up ? "Upper" : "Lower"} ${i < 8 ? "right" : "left"} ${NAMES[p]}` });
    });
  });
  return out;
})();

function Chart({ currency = "$" }: { currency?: string }) {
  const hot = TEETH.filter((t) => t.st !== "h").map((t) => t.idx);
  const [sel, setSel] = useState(hot[0]);
  const [f, setF] = useState<St | "">("");
  const auto = useRef(true);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let k = 0;
    const id = setInterval(() => { if (auto.current) { k = (k + 1) % hot.length; setSel(hot[k]); } }, 3500);
    return () => clearInterval(id);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const pick = (i: number) => { auto.current = false; setSel(i); };
  const cnt = { h: 0, w: 0, t: 0, p: 0 };
  TEETH.forEach((t) => cnt[t.st]++);
  const pct = Math.round(((cnt.h + cnt.t) / 32) * 100), worth = TEETH.reduce((a, t) => a + t.val, 0);
  const T = TEETH[sel], info = INFO[T.st];
  return (
    <div className="stage">
      <div>
        <p className="worth"><b>{currency}{fmt(worth)}</b>of planned treatment is waiting on this chart.</p>
        <div className="top">
          <div className="ring" style={{ "--p": pct } as CSSProperties} role="img" aria-label={`Chart health ${pct}%`}><b>{pct}%</b></div>
          <div><strong>Chart health</strong><small>Healthy or treated teeth</small></div>
          <div id="chips" role="group" aria-label="Filter teeth by status">
            {(Object.keys(INFO) as St[]).map((k) => (
              <button key={k} aria-pressed={f === k} onClick={() => setF(f === k ? "" : k)}><i data-s={k} />{INFO[k][0]} <b>{cnt[k]}</b></button>
            ))}
          </div>
        </div>
        <svg className="arch" data-f={f} viewBox="0 0 760 400" role="group" aria-label="Interactive chart of 32 teeth">
          {TEETH.map((t) => (
            <g key={t.idx} transform={t.tf}>
              <g className={t.idx === sel ? "t sel" : "t"} tabIndex={0} role="button" data-s={t.st} aria-label={`${t.title}, ${INFO[t.st][0]}`}
                onClick={() => pick(t.idx)} onFocus={() => pick(t.idx)} onMouseEnter={() => pick(t.idx)}>
                <path className="root" d={ROOT} /><path className="crown" d={PATH[t.c]} />
              </g>
            </g>
          ))}
        </svg>
      </div>
      <aside className="panel" aria-live="polite">
        <p className="k">{T.title}</p>
        <p className="badge" data-s={T.st}>{info[0]}</p>
        <p>{info[1]}</p><p className="nx">{info[2]}</p>
        {T.val > 0 && <p className="val">Worth {currency}{fmt(T.val)} if booked</p>}
      </aside>
    </div>
  );
}

function Roi({ assumption = 0.4, currency = "$" }: { assumption?: number; currency?: string }) {
  const [a, setA] = useState(600), [n, setN] = useState(15), [v, setV] = useState(80);
  const m = Math.round(((a * n) / 100) * assumption * v);
  return (
    <div className="roicalc">
      <div>
        <label>Appointments per month <b>{a}</b><input type="range" min={100} max={2000} step={50} value={a} onChange={(e) => setA(+e.target.value)} /></label>
        <label>Current no-show rate <b>{n}%</b><input type="range" min={5} max={35} value={n} onChange={(e) => setN(+e.target.value)} /></label>
        <label>Average visit value <b>{currency}{v}</b><input type="range" min={20} max={500} step={10} value={v} onChange={(e) => setV(+e.target.value)} /></label>
      </div>
      <div className="res">
        <p>Estimated revenue recovered each month</p>
        <p className="big">{currency}{fmt(m)}</p>
        <p>About <b>{currency}{fmt(m * 12)}</b> a year</p>
        <p className="fine" style={{ color: "inherit" }}>Assumes {Math.round(assumption * 100)}% of no-shows are rebooked with automated reminders. Your results will differ.</p>
      </div>
    </div>
  );
}

function Counter({ n, suf = "", pre = "" }: { n: number; suf?: string; pre?: string }) {
  const [x, setX] = useState(n); // final value is server-rendered, so it shows without JS
  const ref = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !ref.current) return;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const s = performance.now();
      const step = (t: number) => { const p = Math.min(1, (t - s) / 1100); setX(Math.round(n * (1 - Math.pow(1 - p, 3)))); if (p < 1) requestAnimationFrame(step); };
      requestAnimationFrame(step);
    }, { threshold: 0.2 });
    io.observe(ref.current);
    return () => io.disconnect();
  }, [n]);
  return <p ref={ref} className="num">{pre}{fmt(x)}{suf}</p>;
}

// ---------- Blocks ----------

const Tail = ({ b }: { b: Block }) => (
  <>
    {b.note && <p className="fine">{b.note}</p>}
    {b.more && <p><Lk href={b.more.href}>{b.more.label}</Lk></p>}
  </>
);

function Blocks({ blocks }: { blocks: Block[] }) {
  return <>{blocks.map((b, i) => <BlockView key={i} b={b} first={i === 0} />)}</>;
}

function BlockView({ b, first }: { b: Block; first: boolean }) {
  const H = first ? "h1" : "h2";
  switch (b.type) {
    case "hero":
      return (
        <section className="wrap hero" id={b.id}>
          <H>{b.title}{b.accent && <><br /><em>{b.accent}</em></>}</H>
          <p className="lede">{b.text}</p>
          <p className="row">
            <Lk className="btn" href={b.cta.href}>{b.cta.label}</Lk>
            {b.secondary && <Lk className="btn ghost" href={b.secondary.href}>{b.secondary.label}</Lk>}
            {b.micro && <span className="micro">{b.micro}</span>}
          </p>
          {b.chart && <Chart />}
          {b.glance && <div className="glance">{b.glance.map((g) => <div key={g.label}><span>{g.label}</span><Counter n={g.n} pre={g.pre} /></div>)}</div>}
          <Tail b={b} />
        </section>
      );
    case "stats":
      return (
        <section className="wrap" id={b.id}><H>{b.title}</H>
          <div className="out">{b.items.map((s) => <div key={s.label}><Counter n={s.n} suf={s.suf} /><span>{s.label}</span></div>)}</div><Tail b={b} /></section>
      );
    case "quotes":
      return (
        <section className="wrap" id={b.id}><H>{b.title}</H>
          <div className="grid3">{b.items.map((q) => (
            <figure className="card quote" key={q.text}>{q.sample && <span className="tag">Sample quote</span>}<blockquote>{q.text}</blockquote><figcaption>{q.by}</figcaption></figure>))}</div><Tail b={b} /></section>
      );
    case "features":
      return (
        <section className="wrap" id={b.id}><H>{b.title}</H>
          <div className="bento">{b.items.map((i) => (
            <article className="card" key={i.title}><h3>{i.href ? <Lk href={i.href}>{i.title}</Lk> : i.title}</h3><p>{i.text}</p></article>))}</div><Tail b={b} /></section>
      );
    case "steps":
      return (
        <section className="wrap" id={b.id}><H>{b.title}</H>
          <div className="flow">{b.items.map((i) => (
            <article key={i.title}>
              <svg viewBox="-30 -56 60 90" data-s={i.status} aria-hidden="true"><path className="root" d={ROOT} /><path className="crown" d={PATH.m} /></svg>
              <h3>{i.title}</h3><p>{i.text}</p>
            </article>))}</div><Tail b={b} /></section>
      );
    case "compare":
      return (
        <section className="wrap" id={b.id}><H>{b.title}</H>
          <div className="tbl"><table>
            <thead><tr>{b.cols.map((c, i) => <th key={i}>{c}</th>)}</tr></thead>
            <tbody>{b.rows.map((r) => <tr key={r[0]}>{r.map((c, i) => <td key={i}>{c}</td>)}</tr>)}</tbody>
          </table></div><Tail b={b} /></section>
      );
    case "roi":
      return <section className="wrap" id={b.id}><H>{b.title}</H><Roi assumption={b.assumption} /><Tail b={b} /></section>;
    case "pricing":
      return (
        <section className="wrap" id={b.id}><H>{b.title}</H>
          <div className="grid3">{b.plans.map((p) => (
            <article key={p.name} className={p.featured ? "plan hot" : "plan"}>
              {p.featured && <span className="pop">Most popular</span>}
              <h3>{p.name}</h3><p className="price">{p.price}<small>{p.per}</small></p><p>{p.text}</p>
              <ul>{p.features.map((f) => <li key={f}>{f}</li>)}</ul>
              <Lk className={p.featured ? "btn" : "btn ghost"} href={p.cta.href}>{p.cta.label}</Lk>
            </article>))}</div><Tail b={b} /></section>
      );
    case "faq":
      return (
        <section className="wrap narrow" id={b.id}><H>{b.title}</H>
          {b.items.map((f) => <details key={f.q} className="qa"><summary>{f.q}</summary><p>{f.a}</p></details>)}<Tail b={b} /></section>
      );
    case "resources":
      return (
        <section className="wrap" id={b.id}><H>{b.title}</H>
          <div className="grid3">{b.items.map((r) => (
            <article className="card" key={r.title}><h3>{r.title}</h3>
              <ul>{r.links.map((l) => <li key={l.href}><Lk href={l.href}>{l.label}</Lk></li>)}</ul>
              <Lk href={r.more.href}>{r.more.label}</Lk></article>))}</div><Tail b={b} /></section>
      );
    case "text":
      return <section className="wrap narrow" id={b.id}><H>{b.title}</H>{b.paragraphs.map((p) => <p key={p}>{p}</p>)}<Tail b={b} /></section>;
    case "code":
      return <section className="wrap narrow" id={b.id}><H>{b.title}</H><p>{b.text}</p><pre><code>{b.code}</code></pre><Tail b={b} /></section>;
    case "cta":
      return (
        <section className="wrap" id={b.id}><div className="cta"><H>{b.title}</H><p>{b.text}</p>
          <p className="row" style={{ justifyContent: "center", margin: 0 }}>
            <Lk className="btn" href={b.cta.href}>{b.cta.label}</Lk>
            {b.secondary && <Lk className="btn ghost" style={{ color: "var(--paper)", borderColor: "var(--paper)" }} href={b.secondary.href}>{b.secondary.label}</Lk>}
          </p></div></section>
      );
    case "contact":
      return (
        <section className="wrap narrow" id={b.id}><H>{b.title}</H><p>{b.text}</p>
          <form onSubmit={(e) => e.preventDefault()} className="form">
            <label>Name<input name="name" required /></label>
            <label>Work email<input name="email" type="email" required /></label>
            <label>Clinic name<input name="clinic" /></label>
            <label>Message<textarea name="message" rows={4} /></label>
            <button className="btn" type="submit">Send message</button>
          </form></section>
      );
  }
}

// ---------- Routing and chrome ----------
function Lk({ href, ...p }: { href: string } & Omit<ComponentProps<"a">, "href">) {
  return <a href={href.startsWith("/#") ? "#/" + href.slice(2) : "#" + href} {...p} />;
}

// Theme tokens from the CMS become CSS variables scoped to this app only. Keys and values are validated.
const KEY = /^[a-z0-9-]+$/, VAL = /^[#a-zA-Z0-9(),.%\s-]+$/;
const vars = (m: Record<string, string>) => Object.entries(m).filter(([k, v]) => KEY.test(k) && VAL.test(v)).map(([k, v]) => `--${k}:${v}`).join(";");
const themeCss = (t: Theme) => `.platform-home{${vars(t.light)}}@media(prefers-color-scheme:dark){.platform-home{${vars(t.dark)}}}.platform-home[data-theme="light"]{${vars(t.light)}}.platform-home[data-theme="dark"]{${vars(t.dark)}}`;

function Header({ site, themeMode, onThemeModeChange }: { site: Site; themeMode: ThemeMode; onThemeModeChange: (mode: ThemeMode) => void }) {
  const links = (l: Link[]) => l.map((n) => <Lk key={n.href} href={n.href}>{n.label}</Lk>);
  return (
    <header className="bar">
      <a className="skip" href="#main-content">Skip to content</a>
      <Lk className="logo" href="/">{site.name}</Lk>
      <nav aria-label="Main">
        {links(site.nav)}
        <details className="dd d"><summary>Resources</summary><div>{links(site.resources)}</div></details>
        <details className="dd m"><summary>Menu</summary><div>{links([...site.nav, ...site.resources])}</div></details>
        <label className="theme-control">Theme
          <select aria-label="Colour theme" value={themeMode} onChange={(event) => onThemeModeChange(event.target.value as ThemeMode)}>
            <option value="system">System</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </label>
        <Lk className="btn" href={site.primary.href}>{site.primary.label}</Lk>
      </nav>
    </header>
  );
}

function Footer({ site }: { site: Site }) {
  return (
    <footer className="foot2">
      <div><strong className="logo">{site.name}</strong><p>{site.tagline}</p></div>
      {site.footer.map((c) => (
        <nav key={c.title} aria-label={c.title}><h4>{c.title}</h4>{c.links.map((l) => <Lk key={l.href + l.label} href={l.href}>{l.label}</Lk>)}</nav>
      ))}
    </footer>
  );
}

const SECTIONS: Record<Section, { title: string; intro: string }> = {
  kb: { title: "Knowledge base", intro: "Step-by-step help for your clinic team." },
  docs: { title: "API documentation", intro: "Everything you need to integrate with DHMIS." },
};

function Index({ section, items }: { section: Section; items: Article[] }) {
  const cats = [...new Set(items.map((a) => a.category))];
  return (
    <section className="wrap narrow">
      <h1>{SECTIONS[section].title}</h1><p className="lede">{SECTIONS[section].intro}</p>
      {cats.map((c) => (
        <div key={c}><h2>{c}</h2>
          <ul className="list">{items.filter((a) => a.category === c).map((a) => (
            <li key={a.slug}><Lk href={`/${section}/${a.slug}`}>{a.title}</Lk><span>{a.summary}</span></li>))}</ul></div>))}
    </section>
  );
}

function ArticleView({ section, a }: { section: Section; a: Article }) {
  return (
    <article className="wrap narrow">
      <Lk href={`/${section}`}>Back to {SECTIONS[section].title}</Lk>
      <h1>{a.title}</h1>{a.body.map((p) => <p key={p}>{p}</p>)}
      {a.code && <pre><code>{a.code}</code></pre>}
    </article>
  );
}

const NotFound = () => <section className="wrap narrow"><h1>Page not found</h1><p>That page doesn&apos;t exist.</p></section>;

const readRoute = () => typeof window === 'undefined' ? [''] : (window.location.hash || "#/").slice(2).split("/");
function useRoute() {
  // Keep the first client render identical to the server render. The hash is
  // applied after hydration so direct hash links do not trigger a mismatch.
  const [route, setRoute] = useState<string[]>(['']);
  useEffect(() => {
    const onChange = () => { setRoute(readRoute()); window.scrollTo(0, 0); };
    onChange();
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  return route;
}

type Props = { site?: Site; theme?: Theme; pages?: Page[]; articles?: Article[] };

export default function PlatformHome({ site = defaults.site, theme = defaults.theme, pages = defaults.pages, articles = defaults.articles }: Props) {
  const [s = "", slug] = useRoute();
  const [themeMode, setThemeMode] = useState<ThemeMode>("system");
  const home = pages.find((p) => p.slug === "home");
  const page = pages.find((p) => p.slug === s);
  const items = s === "kb" || s === "docs" ? articles.filter((a) => a.section === s) : [];
  const article = items.find((a) => a.slug === slug);
  const anchor = !page && s && s !== "kb" && s !== "docs" && home?.blocks.some((b) => b.id === s) ? s : "";

  let view: ReactNode, title = "Home";
  if (s === "kb" || s === "docs") {
    if (!slug) { view = <Index section={s} items={items} />; title = SECTIONS[s].title; }
    else if (article) { view = <ArticleView section={s} a={article} />; title = article.title; }
    else view = <NotFound />;
  } else if (!s || anchor) view = <Blocks blocks={home?.blocks ?? []} />;
  else if (page) { view = <Blocks blocks={page.blocks} />; title = page.title; }
  else view = <NotFound />;

  useEffect(() => {
    document.title = `${title} · ${site.name}`;
    if (anchor) document.getElementById(anchor)?.scrollIntoView();
  }, [title, anchor, site.name]);

  useEffect(() => installFormEnhancements(), []);

  useEffect(() => {
    const saved = window.localStorage.getItem("dhmis-platform-home-theme");
    if (saved === "system" || saved === "light" || saved === "dark") setThemeMode(saved);
  }, []);

  const changeThemeMode = (mode: ThemeMode) => {
    setThemeMode(mode);
    window.localStorage.setItem("dhmis-platform-home-theme", mode);
  };

  return (
    <div className="platform-home" data-theme={themeMode === "system" ? undefined : themeMode}>
      <style>{themeCss(theme)}</style>
      <Header key={s + (slug ?? "")} site={site} themeMode={themeMode} onThemeModeChange={changeThemeMode} />
      <main id="main-content">{view}</main>
      <Footer site={site} />
    </div>
  );
}
