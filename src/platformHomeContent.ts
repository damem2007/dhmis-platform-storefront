import type { Article, Block, Page, PublicPlan, Site, Theme } from "./platformHomeTypes";

export const theme: Theme = {
  light: { ink: "#11201A", paper: "#F7F8F6", mint: "#E4F3EA", mint2: "#F3F6F4", coral: "#1F6F46", "on-coral": "#FFFFFF", blue: "#3B5F8A", amber: "#E3B94C", ok: "#1F6F46", line: "#DCE4DF", card: "#FFFFFF", tooth: "#FFFFFF", glow: "rgba(31,111,70,.14)" },
  dark: { ink: "#E6F4F0", paper: "#10231B", mint: "#1D4A35", mint2: "#163026", coral: "#7AD6A2", "on-coral": "#10231B", blue: "#8FB7D7", amber: "#E3B94C", ok: "#7AD6A2", line: "#345347", card: "#173027", tooth: "#E8F5F1", glow: "rgba(122,214,162,.2)" },
};

export const site: Site = {
  name: "DHMIS",
  tagline: "The cloud platform for connected dental care.",
  nav: [{ label: "Platform", href: "/#platform" }, { label: "Solutions", href: "/#solutions" }, { label: "Pricing", href: "/pricing" }, { label: "Developers", href: "/developers" }, { label: "Resources", href: "/#resources" }],
  audiences: [{ label: "For clinical teams", href: "/#solutions" }, { label: "For practice operations", href: "/#solutions" }, { label: "For patients", href: "/#solutions" }, { label: "For growing groups", href: "/#solutions" }],
  resources: [{ label: "Knowledge base", href: "/kb" }, { label: "API docs", href: "/docs" }, { label: "FAQ", href: "/faq" }, { label: "Privacy Policies", href: "/privacy" }, { label: "Security", href: "/security" }],
  primary: { label: "Start free trial", href: "/signup" },
  signIn: { label: "Sign in", href: process.env.NEXT_PUBLIC_PLATFORM_ADMIN_URL || "http://platform.dhmis.test/" },
  showTheme: true,
  footer: [
    { title: "Solutions", links: [{ label: "Clinical teams", href: "/#solutions" }, { label: "Practice operations", href: "/#solutions" }, { label: "Growing groups", href: "/#solutions" }] },
    { title: "Product", links: [{ label: "Features", href: "/features" }, { label: "Pricing", href: "/pricing" }, { label: "Security", href: "/security" }] },
    { title: "Resources", links: [{ label: "Knowledge base", href: "/kb" }, { label: "API docs", href: "/docs" }, { label: "FAQ", href: "/faq" }] },
    { title: "Privacy & Security", links: [{ label: "Privacy Policies", href: "/privacy" }, { label: "Security", href: "/security" }, { label: "Fair Principles", href: "/fair-principles" }, { label: "Terms of Use", href: "/terms-of-use" }] },
    { title: "Company", links: [{ label: "About", href: "/about" }, { label: "Contact", href: "/contact" }, { label: "Developers", href: "/developers" }] },
  ],
};

export const demo = { label: "Start free trial", href: "/signup" };
export const PLANS: Extract<Block, { type: "pricing" }>["plans"] = [
  { name: "Solo", price: "$99", per: "/month", text: "For one dentist and one location.", locations: "1 location", features: ["Charting and treatment plans", "Recalls and reminders", "Patient portal"], cta: { ...demo, href: "/signup?plan=solo" } },
  { name: "Clinic", price: "$299", per: "/month", text: "For growing teams across up to three locations.", locations: "Up to 3 locations", features: ["Everything in Solo", "Billing and claims", "Reports and analytics"], cta: { ...demo, href: "/signup?plan=clinic" }, featured: true },
  { name: "Group", price: "Custom", per: "", text: "For multi-location organizations.", locations: "Unlimited locations", features: ["Everything in Clinic", "SSO and audit log", "API, webhooks and sandbox"], cta: { label: "Talk to sales", href: "/contact" } },
];
export const publicPlanView = (plan: PublicPlan): Extract<Block, { type: "pricing" }>["plans"][number] => ({
  name: plan.name,
  price: plan.price_cents === 0 ? "Custom" : formatPlanPrice(plan.price_cents, plan.currency),
  per: plan.price_cents === 0 ? "" : `/${plan.interval}`,
  text: plan.description,
  locations: (() => { const limit = plan.entitlements?.find((item) => item.key === "limit.locations"); const maximum = limit ? (limit.unlimited ? null : limit.value) : plan.max_locations; return maximum === null ? "Unlimited locations" : `${maximum} location${maximum === 1 ? "" : "s"}`; })(),
  features: plan.features.length ? plan.features : (plan.entitlements || []).filter((item) => item.enabled && item.key !== "limit.locations").map((item) => item.public_label || item.name),
  cta: plan.price_cents === 0 ? { label: "Talk to sales", href: "/contact" } : { ...demo, href: `/signup?plan=${encodeURIComponent(plan.code)}` },
  featured: plan.code === "clinic",
});
const CURRENCY_SYMBOLS: Record<string, string> = { USD: "$", CAD: "CA$", AUD: "A$", GBP: "£", EUR: "€", NZD: "NZ$" };
export function formatPlanPrice(cents: number, currency: string) {
  const code = currency.toUpperCase();
  const symbol = CURRENCY_SYMBOLS[code] || `${code} `;
  return `${symbol}${Math.round(cents / 100).toLocaleString("en-CA")}`;
}
export const FAQS = [
  { q: "Can we import our existing records?", a: "Yes. Imports are handled during assisted production activation after the administrator is verified and the platform review is complete. Do not import PHI during a public trial." },
  { q: "How long does setup take?", a: "Most clinics are live within two weeks, and training for your team is included." },
  { q: "Do patients need to install an app?", a: "No. They get a link by SMS or email and approve plans from any phone." },
  { q: "Is there a contract?", a: "No. Plans are monthly and you can cancel any time." },
  { q: "Who can see our data?", a: "Access is controlled by tenant-aware roles and permissions, so teams see the records and workflows that belong in their scope." },
  { q: "Can we connect our other systems?", a: "Yes. A REST API and webhooks are available. See the developer docs." },
];
export const TRUST: Block = { type: "features", id: "trust", title: "Built for accountable care", note: "Access, audit history and tenant boundaries are part of the product foundation. Publish confirmed compliance commitments separately.", items: [
  { title: "Encrypted", text: "In transit and at rest." }, { title: "Role-based access", text: "Front desk can't see financial reports." }, { title: "Audit trail", text: "Every record view is logged." } ] };

export const pages: Page[] = [
  { slug: "home", title: "Dental practice management", description: site.tagline, blocks: [
    { type: "hero", title: "One chart.", accent: "Every follow-up.", text: "DHMIS keeps charting, plans, recalls and billing in one connected record, so nothing falls through between the chair and the front desk.", cta: demo, secondary: { label: "Book a demo", href: "/contact" }, micro: "14-day free trial · Payment method required · No charge during the trial", chart: true },
    { type: "platform", id: "platform", title: "Everything that follows from the chart", items: [
      { title: "Recalls that run themselves", text: "Every finding schedules its own follow-up by SMS or email until the patient is booked.", tone: "paper" },
      { title: "Plans patients approve on their phone", text: "Quotes with prices, sent as a link.", tone: "paper" },
      { title: "Full chairs, filled gaps", text: "Cancelled slots go to the waitlist automatically.", tone: "paper" },
      { title: "Claims without re-keying", text: "Procedure codes flow from the chart to the claim.", tone: "paper" },
      { title: "Built to integrate", text: "A REST API and webhooks.", tone: "paper" },
      { title: "Reports that explain themselves", text: "Production, acceptance and recall health by provider.", tone: "paper" } ] },
    { type: "audiences", id: "solutions", title: "A better experience for every team around the patient", intro: "DHMIS gives each person the right view of the same care journey, with permissions and context built in.", items: [
      { label: "For clinical teams", title: "Make the chart the centre of care", text: "Capture findings on the odontogram, turn them into treatment plans and keep clinical history available at every visit.", href: "/features" },
      { label: "For practice operations", title: "Keep the day moving", text: "Connect schedules, recalls, billing and reporting so the front desk spends less time reconciling separate systems.", href: "/features" },
      { label: "For patients", title: "Make next steps clear", text: "Share forms, treatment options and approvals through a simple patient experience that works from any phone.", href: "/features" },
      { label: "For growing groups", title: "Operate with confidence", text: "Bring locations together with role-based access, shared visibility, audit history and APIs built for extension.", href: "/developers" },
    ] },
    { type: "steps", id: "flow", title: "From finding to follow-up", items: [
      { title: "Chart the finding", text: "Record it on the tooth during the exam. It's flagged as Watch until someone decides.", status: "w" },
      { title: "Plan and quote", text: "Turn it into a plan with a price. The patient approves it from their phone.", status: "p" },
      { title: "Treat and follow up", text: "Mark it treated and the next recall books itself. Nothing falls through.", status: "t" } ] },
    { type: "compare", title: "Why clinics switch", note: "Confirm each row against your product before launch.", cols: ["", "DHMIS", "Paper and spreadsheets", "Generic global software"], rows: [
      ["Follow-ups tied to each tooth", "Yes", "No", "Partly"], ["Quotes patients approve on their phone", "Yes", "No", "Partly"],
      ["Local currency and insurance billing", "Yes", "Manual", "Often missing"], ["SMS and chat reminders", "Yes", "Manual calls", "Extra cost"], ["Data import and setup included", "Yes", "None", "Often extra"] ] },
    { type: "roi", id: "roi", title: "What would better recalls be worth to you?", assumption: 0.4 },
    { type: "pricing", id: "pricing", title: "Simple pricing, per clinic", plans: PLANS, note: "Start with a trial. A payment method is required, but no charge is made during the trial.", more: { label: "Compare plans in detail", href: "/pricing" } },
    TRUST,
    { type: "faq", id: "faq", title: "Questions before you start", items: FAQS.slice(0, 4), more: { label: "Read all FAQs", href: "/faq" } },
    { type: "resources", id: "resources", title: "Learn and build", items: [
      { title: "Knowledge base", links: [{ label: "Import your patient list", href: "/kb/import-patients" }, { label: "Set up recall reminders", href: "/kb/set-up-recalls" }, { label: "Submit an insurance claim", href: "/kb/submit-claim" }], more: { label: "Browse all articles", href: "/kb" } },
      { title: "API documentation", links: [{ label: "Authentication", href: "/docs/authentication" }, { label: "Webhooks", href: "/docs/webhooks" }, { label: "Sandbox", href: "/docs/sandbox" }], more: { label: "Open the docs", href: "/docs" } } ] },
    { type: "cta", title: "See your own charts, not slides.", text: "Start a free trial, or book a demo and we'll load your own patient list.", cta: demo, secondary: { label: "Book a demo", href: "/contact" } } ] },
  { slug: "features", title: "Features", description: "Charting, scheduling, recalls, billing and reporting.", blocks: [
    { type: "text", title: "One system from check-in to claim", paragraphs: ["DHMIS replaces the mix of charting software, spreadsheets and reminder tools most clinics juggle."] },
    { type: "features", title: "What's included", items: [
      { title: "Scheduling", text: "Multi-chair, multi-location calendars with waitlist fill." }, { title: "Imaging", text: "Attach X-rays and photos directly to a tooth or visit." },
      { title: "Patient portal", text: "Forms, plan approval and payments from a phone." }, { title: "Reporting", text: "Production, acceptance rate and recall health by provider." } ] },
    { type: "cta", title: "Want a walkthrough?", text: "Thirty minutes, no slides.", cta: { label: "Book a demo", href: "/contact" } } ] },
  { slug: "pricing", title: "Pricing", description: "Simple per-clinic pricing.", blocks: [
    { type: "pricing", title: "Pricing per clinic, per month", plans: PLANS, note: "Start with a trial. A payment method is required, but no charge is made during the trial." },
    { type: "faq", title: "Billing questions", items: FAQS.slice(3, 4) } ] },
  { slug: "privacy", title: "Privacy Policies", description: "Privacy information for clinics, staff and patients.", blocks: [
    { type: "text", title: "Privacy information for the DHMIS care network", paragraphs: ["DHMIS supports dental teams, patients and platform operators across connected care workflows. This page is the starting point for understanding the boundaries between a tenant's clinic records, the platform control plane and the public website.", "The linked documents are presented as a product framework. The operating entity must replace the draft notices with approved jurisdiction-specific language, retention rules and contact details before production use."] },
    { type: "features", title: "Choose a document", items: [
      { title: "Privacy Policy", text: "A draft explanation of the information DHMIS handles, the reasons for handling it, and the controls around disclosure and retention.", href: "/privacy-policy" },
      { title: "DHMIS privacy principles", text: "Ten practical commitments that shape how DHMIS designs collection, access, accuracy, safeguards and accountability.", href: "/fair-principles" },
      { title: "Terms of Use", text: "A draft service agreement covering the public site, trials, subscriptions, tenant responsibilities and approved integrations.", href: "/terms-of-use" },
    ] },
    { type: "text", title: "Privacy depends on security", paragraphs: ["DHMIS combines encryption, tenant-scoped permissions and audit records to protect operational and clinical workflows. Trial workspaces are separated from production activation, so PHI import and production connections remain gated until the required review is complete.", "The security page describes the product controls currently represented in the application."], more: { label: "View security controls", href: "/security" } },
    { type: "text", title: "Need to ask about privacy?", paragraphs: ["Use the support route associated with your DHMIS deployment. Identify the organization and account involved, but leave clinical details and other sensitive health information out of the first request."] },
  ] },
  { slug: "privacy-policy", title: "Privacy Policy", description: "DHMIS privacy policy draft for legal review.", blocks: [
    { type: "text", title: "Privacy Policy", paragraphs: ["Draft for legal review. This screen is a DHMIS content scaffold and must be replaced by the approved notice for the entity operating each deployment.", "It is intended to cover the public website, trial and production tenants, platform administration, staff applications, patient-facing pages, appointment widgets, APIs and support conversations. A more specific notice may apply to a particular workflow."] },
    { type: "features", title: "Information handled by DHMIS", items: [
      { title: "Public-site signals", text: "The public site may receive request metadata, device characteristics and saved preferences so it can load reliably, remember choices and resist misuse." },
      { title: "Organization and account details", text: "A clinic may provide names, contact details, organization information, subscription details and other details when requesting access, starting a trial or opening a support case." },
      { title: "Care-workflow records", text: "A production tenant can hold staff, patient, appointment, chart, treatment, billing and portal records. The tenant decides why those records are used and remains responsible for the permissions and legal basis behind them." },
      { title: "Service telemetry", text: "Login, permission, configuration, approval, billing and audit events help DHMIS run the service, investigate issues and maintain the separation between tenants." },
    ] },
    { type: "features", title: "Reasons for processing", items: [
      { title: "Run clinic workspaces", text: "Provision tenants, deliver the selected surfaces and make approved appointment and integration workflows available." },
      { title: "Protect the service", text: "Verify identities, enforce permissions, detect abuse, diagnose faults and understand service health." },
      { title: "Provide assistance", text: "Answer support questions and send account, service or security notices that an organization needs." },
      { title: "Keep required records", text: "Maintain billing, audit, dispute and security records where the approved deployment rules require them. The final notice must specify the applicable legal grounds." },
    ] },
    { type: "features", title: "Boundaries, providers and retention", items: [
      { title: "Organization scope", text: "The backend applies organization and location permissions to tenant records. Platform staff receive only the control-plane access authorized for administration, support or security investigation." },
      { title: "Approved vendors", text: "Infrastructure, communications, payments, monitoring and support may be supplied by external vendors. The final notice must name the relevant categories, safeguards and transfer arrangements." },
      { title: "Keeping records", text: "The correct retention period varies by record type, tenant direction, billing need, audit obligation and local law. The approved schedule belongs in the final policy." },
      { title: "Security events", text: "Access controls, encryption and audit records support protection of the service. The operating entity must document its incident handling and notification process before launch." },
    ] },
    { type: "text", title: "Requests and choices", paragraphs: ["The final policy will describe the rights available in each jurisdiction and the process for asking to view, correct or otherwise manage personal information. Until that notice is approved, contact the deployment support team and keep sensitive health details out of the initial request."] },
  ] },
  { slug: "fair-principles", title: "DHMIS privacy principles", description: "DHMIS privacy principles draft for legal review.", blocks: [
    { type: "text", title: "DHMIS privacy principles", paragraphs: ["Draft for legal review. The list below is an internal design guide for handling personal information; it does not replace a signed privacy notice or the law that applies to a deployment."] },
    { type: "features", title: "Ten design commitments", items: [
      { title: "1. Named responsibility", text: "A person or team is accountable for privacy, security, tenant administration and support decisions." },
      { title: "2. Clear purpose", text: "The reason for requesting information is identified before the information is collected." },
      { title: "3. Appropriate authority", text: "Use a documented consent, contract, operational need or other approved basis for each processing activity." },
      { title: "4. Smallest useful set", text: "Request the minimum information needed for the care, service, billing or security task." },
      { title: "5. Controlled reuse", text: "Do not repurpose, disclose or keep information beyond the approved need without authorization." },
      { title: "6. Reliable records", text: "Give authorized people a way to correct information that is incomplete or wrong." },
      { title: "7. Practical safeguards", text: "Use tenant-scoped permissions, encryption, audit records and operational controls to reduce exposure." },
      { title: "8. Understandable notices", text: "Describe the service, its boundaries and its privacy practices in language users can follow." },
      { title: "9. Usable requests", text: "Maintain a documented route for people and organizations to ask about their information or exercise an approved right." },
      { title: "10. Escalation", text: "Provide a path for questions, complaints, incidents and regulator engagement to reach the right owner." },
    ] },
    { type: "text", title: "Where the product reflects these commitments", paragraphs: ["Role and location permissions narrow staff access. Audit records preserve important administration and approval events. Trial gating prevents PHI import before production activation. Those mechanisms support the design commitments, but they are not by themselves a certification or legal conclusion."] },
  ] },
  { slug: "terms-of-use", title: "Terms of Use", description: "DHMIS terms of use draft for legal review.", blocks: [
    { type: "text", title: "Terms of Use", paragraphs: ["Draft for legal review. The final agreement will set the rules for using the DHMIS website, trial environments, production workspaces, administrative tools, APIs, appointment widgets and documentation.", "Before publication, the agreement must name the contracting entity and address eligibility, account duties, permitted use, subscriptions, trials, tenant data, intellectual property, external services, suspension, termination, warranties, liability, governing law and disputes."] },
    { type: "features", title: "What organizations agree to", items: [
      { title: "Protect the account", text: "Keep organization details current, give access only to authorized people, protect credentials and report suspected compromise promptly." },
      { title: "Take responsibility for tenant records", text: "The organization is responsible for the lawfulness, accuracy and permission to use anything it enters or imports into its workspace." },
      { title: "Stay within the approved configuration", text: "Use only the plan, surfaces, integrations, custom domains and widget origins that the subscription and DHMIS approval make available." },
      { title: "Use the service responsibly", text: "Do not cross tenant boundaries, defeat an approval control, evade a rate limit or interfere with a security safeguard." },
      { title: "Follow the commercial terms", text: "Trial duration, payment, renewal, cancellation, plan limits and production activation are governed by the applicable order and final subscription terms." },
    ] },
    { type: "text", title: "Questions about this draft", paragraphs: ["Send subscription, data-processing, security-review or service questions through the deployment support or commercial channel. This draft is a planning page and is not the final contract."] },
  ] },
  { slug: "security", title: "Security and compliance", description: "How DHMIS protects patient data.", blocks: [
    { type: "text", title: "Security controls for connected care", paragraphs: ["DHMIS combines encrypted transport and storage with tenant-scoped authorization and an audit history for material administration and access events.", "A public trial starts with restricted capabilities. PHI import, custom domains, appointment widgets, SSO and production integrations remain closed until the required administrator verification and Platform Admin review are finished."] },
    { type: "features", title: "Controls represented in the product", items: [
      { title: "Scoped permissions", text: "The authorization model checks the organization and, where applicable, the location before allowing a staff action." },
      { title: "Recorded decisions", text: "Configuration changes, approvals and other protected operations leave an audit record for authorized review." },
      { title: "Review before production", text: "Public signup does not automatically unlock production workflows; activation follows an explicit review path." },
    ] },
    { type: "faq", title: "Security questions", items: [
      { q: "Can a trial workspace receive real patient records?", a: "No. The trial is for an empty evaluation workspace. Complete production activation before importing PHI." },
      { q: "How is clinic access limited?", a: "DHMIS evaluates tenant roles and location scope before allowing a staff member to view or change a record." },
      { q: "How do I request security evidence?", a: "Use the support route for your deployment and request the current hosting, retention, security or compliance material available for your account." },
    ] },
  ] },
  { slug: "developers", title: "Developers", description: "REST API, webhooks and sandbox.", blocks: [
    { type: "hero", title: "Build on the DHMIS API", text: "Read patients, appointments and treatment plans, and subscribe to events with webhooks.", cta: { label: "Read the docs", href: "/docs" } },
    { type: "code", title: "List today's appointments", text: "Authenticate with an API key from Settings.", code: "curl https://api.example.com/v1/appointments?date=today \\\n  -H \"Authorization: Bearer $DHMIS_API_KEY\"" },
    { type: "features", title: "Start here", items: [
      { title: "Authentication", text: "API keys and OAuth.", href: "/docs/authentication" }, { title: "Webhooks", text: "Events for bookings and payments.", href: "/docs/webhooks" }, { title: "Sandbox", text: "Test with fake patients.", href: "/docs/sandbox" } ] }] },
  { slug: "faq", title: "FAQ", description: "Answers to common questions.", blocks: [{ type: "faq", title: "Frequently asked questions", items: FAQS }] },
  { slug: "about", title: "About", description: "Why we build DHMIS.", blocks: [{ type: "text", title: "Software made with clinicians", paragraphs: ["Replace with your company story, team and mission."] }] },
  { slug: "contact", title: "Contact", description: "Start a trial or book a demo.", blocks: [{ type: "contact", title: "Start your free trial", text: "Tell us about your clinic and we'll reply within one business day." }] },
];

export const articles: Article[] = [
  { slug: "import-patients", section: "kb", category: "Getting started", title: "Import your patient list", summary: "Bring patients over from a CSV or your old system.", body: ["Go to Settings, then Import, and upload a CSV.", "Review the column mapping and confirm. Duplicates are flagged before anything is saved."] },
  { slug: "set-up-recalls", section: "kb", category: "Getting started", title: "Set up recall reminders", summary: "Choose when patients are contacted.", body: ["Open Recalls and pick an interval per treatment type.", "Choose SMS, email or both."] },
  { slug: "submit-claim", section: "kb", category: "Billing", title: "Submit an insurance claim", summary: "Send a claim from a completed visit.", body: ["Open the visit and select Create claim.", "Check the procedure codes and send."] },
  { slug: "authentication", section: "docs", category: "API", title: "Authentication", summary: "Authenticate API requests.", body: ["Send your API key as a Bearer token in the Authorization header."], code: "Authorization: Bearer $DHMIS_API_KEY" },
  { slug: "webhooks", section: "docs", category: "API", title: "Webhooks", summary: "Receive events when data changes.", body: ["Register an HTTPS endpoint in Settings. We send a signed POST for each event, such as appointment.created."], code: "{ \"event\": \"appointment.created\", \"id\": \"apt_123\" }" },
  { slug: "sandbox", section: "docs", category: "API", title: "Sandbox", summary: "Test without real patient data.", body: ["The sandbox has its own keys and seeded fake patients. Nothing you do there affects live data."] },
];

export const defaults = { site, theme, pages, articles };

