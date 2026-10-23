import { useEffect, useMemo, useState, type FormEvent } from "react";
import type { PublicPlan } from "./platformHomeTypes";
import { formatPlanPrice } from "./platformHomeContent";
import { Lk } from "./platformHomeChrome";

export function SelfOnboarding({ plans, loading }: { plans: PublicPlan[]; loading: boolean }) {
  const availablePlans = useMemo(() => plans.filter((plan) => plan.active && plan.price_cents > 0), [plans]);
  const [planCode, setPlanCode] = useState("");
  const [form, setForm] = useState({
    name: "",
    slug: "",
    locationName: "",
    locationAddress: "",
    adminName: "",
    adminEmail: "",
    paymentMethodToken: "pm_dummy_success",
    booking: true,
    portal: true,
    trialTermsAccepted: false,
    dataProcessingAcknowledged: false,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ managed_url: string; trial_ends_at: string | null; plan_name?: string; payment?: { status: string; sandbox: boolean; reference: string }; secure_trial?: { phi_import_allowed: boolean; production_activation_required: boolean; custom_domains: string; widgets: string; administrator_verification_required: boolean; mfa_setup_required: boolean } } | null>(null);
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "");
  const update = (key: keyof typeof form, value: string | boolean) => setForm((current) => ({ ...current, [key]: value }));
  useEffect(() => {
    if (!availablePlans.length) return;
    const query = typeof window === "undefined" ? "" : window.location.hash.split("?")[1] || "";
    const requested = new URLSearchParams(query).get("plan");
    const preferred = requested && availablePlans.some((plan) => plan.code === requested) ? requested : availablePlans[0].code;
    if (!availablePlans.some((plan) => plan.code === planCode)) setPlanCode(preferred);
  }, [availablePlans, planCode]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setResult(null);
    try {
      const response = await fetch(apiBase ? `${apiBase}/v1/public/platform/onboarding` : "/api/public/platform/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan_code: planCode,
          payment_method_token: form.paymentMethodToken,
          name: form.name,
          slug: form.slug,
          region: "CA",
          location_name: form.locationName,
          location_address: form.locationAddress,
          location_timezone: "America/Vancouver",
          admin_name: form.adminName,
          admin_email: form.adminEmail,
          front_office_enabled: true,
          booking_enabled: form.booking,
          patient_portal_enabled: form.portal,
          trial_terms_accepted: form.trialTermsAccepted,
          data_processing_acknowledged: form.dataProcessingAcknowledged,
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.detail || payload.message || "We could not start the trial.");
      setResult(payload);
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "We could not start the trial.");
    } finally {
      setSaving(false);
    }
  }

  if (result) {
    return <section className="wrap narrow"><h1>Secure trial started</h1><p className="lede">Your empty clinic workspace is ready. We sent the tenant administrator an invitation to verify their email, create a password, and enrol MFA.</p>
      <div className="card"><h3>Managed workspace</h3><p><a href={result.managed_url}>{result.managed_url}</a></p>
        {result.plan_name && <p><strong>Plan:</strong> {result.plan_name}</p>}
        {result.payment && <p><strong>Payment method:</strong> {result.payment.status} ({result.payment.sandbox ? "sandbox authorization; no trial charge" : "authorized"})</p>}
        {result.trial_ends_at && <p>Your trial ends on {new Date(result.trial_ends_at).toLocaleDateString("en-CA")}.</p>}
        <p><strong>Production activation is required before go-live.</strong> Until Platform Admin review is complete, do not import PHI or connect production integrations.</p>
        <p>Custom domains, appointment widgets, SSO, imports, and other reviewed capabilities can be requested after the administrator completes verification.</p>
      </div></section>;
  }

  if (loading || !availablePlans.length) {
    return <section className="wrap narrow"><h1>Start a secure trial</h1><p className="lede">Choose a live plan from Platform Admin before creating a workspace.</p>
      <div className="card" role="status" aria-live="polite"><h3>{loading ? "Loading current plans…" : "Plan catalogue unavailable"}</h3><p>{loading ? "We are retrieving current prices, entitlements and trial terms." : "The live plan catalogue could not be loaded. Return to pricing and try again when the platform is available."}</p><p><Lk href="/pricing">Return to pricing</Lk></p></div></section>;
  }

  return <section className="wrap narrow"><h1>Start a secure trial</h1><p className="lede">Create an empty, isolated clinic workspace, verify the administrator by email, and enrol MFA. Add a payment method for future billing; the sandbox gateway authorizes it without charging during the trial.</p>
    <form className="form" onSubmit={submit}>
      <label>Plan<select value={planCode} onChange={(event) => setPlanCode(event.target.value)}>{availablePlans.map((plan) => <option key={plan.code} value={plan.code}>{plan.name} · {formatPlanPrice(plan.price_cents, plan.currency)}/{plan.interval} · {plan.trial_days}-day trial</option>)}</select></label>
      <label>Clinic name<input required value={form.name} onChange={(event) => update("name", event.target.value)} /></label>
      <label>Managed URL slug<input required minLength={3} value={form.slug} onChange={(event) => update("slug", event.target.value)} placeholder="smile-clinic" /></label>
      <label>First location<input required value={form.locationName} onChange={(event) => update("locationName", event.target.value)} /></label>
      <label>Location address<input value={form.locationAddress} onChange={(event) => update("locationAddress", event.target.value)} placeholder="Street, city, postal code" /></label>
      <label>Administrator name<input required value={form.adminName} onChange={(event) => update("adminName", event.target.value)} /></label>
      <label>Administrator email<input required type="email" value={form.adminEmail} onChange={(event) => update("adminEmail", event.target.value)} /></label>
      <label>Payment method token (sandbox)<input required value={form.paymentMethodToken} onChange={(event) => update("paymentMethodToken", event.target.value)} /><small>No real payment is captured during the trial.</small></label>
      <fieldset><legend>Enable experiences</legend><label><input type="checkbox" checked={form.booking} onChange={(event) => update("booking", event.target.checked)} /> Booking</label><label><input type="checkbox" checked={form.portal} onChange={(event) => update("portal", event.target.checked)} /> Patient portal</label></fieldset>
      <div className="card"><h3>Secure trial boundaries</h3><p>No PHI import, custom domain, appointment widget, SSO, or production integration is enabled by public signup. Those capabilities require administrator verification and Platform Admin production review.</p>
        <label><input type="checkbox" checked={form.trialTermsAccepted} onChange={(event) => update("trialTermsAccepted", event.target.checked)} required /> I accept the secure trial terms.</label>
        <label><input type="checkbox" checked={form.dataProcessingAcknowledged} onChange={(event) => update("dataProcessingAcknowledged", event.target.checked)} required /> I understand that I must not enter or import PHI until production activation is approved.</label>
      </div>
      {error && <p role="alert" className="form-error">{error}</p>}
      <button className="btn" type="submit" disabled={saving}>{saving ? "Starting secure trial…" : "Start secure trial"}</button>
    </form></section>;
}

