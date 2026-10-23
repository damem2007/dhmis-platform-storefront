import type { Block } from "./platformHomeTypes";
import { Chart, Counter, PATH, ROOT, Roi } from "./platformHomeWidgets";
import { Lk } from "./platformHomeChrome";

function Tail({ b }: { b: Block }) {
  return (
    <>
      {b.note && <p className="fine">{b.note}</p>}
      {b.more && <p><Lk href={b.more.href}>{b.more.label}</Lk></p>}
    </>
  );
}

export function Blocks({ blocks }: { blocks: Block[] }) {
  return <>{blocks.map((b, i) => <BlockView key={i} b={b} first={i === 0} />)}</>;
}

export function BlockView({ b, first }: { b: Block; first: boolean }) {
  const H = first ? "h1" : "h2";
  switch (b.type) {
    case "hero":
      return (
        <section className="sec hero" id={b.id}><div className="wrap">
          <div className="hero-grid">
            <div className="hero-copy">
              <p className="eyebrow">DHMIS CLOUD PLATFORM</p>
              <H>{b.title}{b.accent && <><br /><em>{b.accent}</em></>}</H>
              <p className="lede">{b.text}</p>
              <p className="row">
                <Lk className="btn" href={b.cta.href}>{b.cta.label}</Lk>
                {b.secondary && <Lk className="btn ghost" href={b.secondary.href}>{b.secondary.label}</Lk>}
                {b.micro && <span className="micro">{b.micro}</span>}
              </p>
            </div>
            {b.chart && <div className="hero-demo"><Chart /></div>}
          </div>
          {b.glance && <div className="glance">{b.glance.map((g) => <div key={g.label}><span>{g.label}</span><Counter n={g.n} pre={g.pre} /></div>)}</div>}
          <Tail b={b} />
        </div></section>
      );
    case "stats":
      return (
        <section className="wrap" id={b.id}><H>{b.title}</H>
          <div className="out">{b.items.map((s) => <div key={s.label}><Counter n={s.n} suf={s.suf} /><span>{s.label}</span></div>)}</div><Tail b={b} /></section>
      );
    case "audiences":
      return (
        <section className="sec solutions-section" id={b.id}><div className="wrap"><p className="eyebrow">SOLUTIONS</p><H>{b.title}</H>{b.intro && <p className="section-intro">{b.intro}</p>}
          <div className="audience-grid">{b.items.map((item) => <article className="audience-card" key={item.title}><p className="eyebrow">{item.label}</p><h3>{item.href ? <Lk href={item.href}>{item.title}</Lk> : item.title}</h3><p>{item.text}</p></article>)}</div><Tail b={b} /></div></section>
      );
    case "platform":
      return (
        <section className="sec" id={b.id}><div className="wrap"><p className="eyebrow">PLATFORM</p><H>{b.title}</H>{b.intro && <p className="section-intro">{b.intro}</p>}
          <div className="platform-grid">{b.items.map((item) => <article className={`platform-card ${item.tone}`} key={item.title}><h3>{item.title}</h3><p>{item.text}</p><span aria-hidden="true">↗</span></article>)}</div><Tail b={b} /></div></section>
      );
    case "quotes":
      return (
        <section className="wrap" id={b.id}><H>{b.title}</H>
          <div className="grid3">{b.items.map((q) => (
            <figure className="card quote" key={q.text}>{q.sample && <span className="tag">Sample quote</span>}<blockquote>{q.text}</blockquote><figcaption>{q.by}</figcaption></figure>))}</div><Tail b={b} /></section>
      );
    case "features":
      return (
        <section className="wrap" id={b.id}><p className="eyebrow">{b.id === "trust" ? "SECURITY" : "PLATFORM"}</p><H>{b.title}</H>
          <div className="bento">{b.items.map((i) => (
            <article className="card" key={i.title}><h3>{i.href ? <Lk href={i.href}>{i.title}</Lk> : i.title}</h3><p>{i.text}</p></article>))}</div><Tail b={b} /></section>
      );
    case "steps":
      return (
        <section className="sec steps-section" id={b.id}><div className="wrap"><p className="eyebrow">HOW IT WORKS</p><H>{b.title}</H>
          <div className="flow">{b.items.map((i) => (
            <article key={i.title}>
              <span className={`step-icon step-${i.status}`} aria-hidden="true"><svg viewBox="-30 -56 60 90" data-s={i.status}><path className="root" d={ROOT} /><path className="crown" d={PATH.m} /></svg></span>
              <h3>{i.title}</h3><p>{i.text}</p>
            </article>))}</div><Tail b={b} /></div></section>
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
        <section className="sec pricing-section" id={b.id}><div className="wrap"><p className="eyebrow">PRICING</p><H>{b.title}</H>
          <div className="grid3">{b.plans.map((p) => (
            <article key={p.name} className={p.featured ? "plan hot" : "plan"}>
              {p.featured && <span className="pop">Most popular</span>}
              <h3>{p.name}</h3><p className="price">{p.price}<small>{p.per}</small></p><p>{p.text}</p><p className="plan-locations"><strong>{p.locations}</strong></p><p className="plan-entitlements">Included features</p>
              <ul>{p.features.map((f) => <li key={f}>{f}</li>)}</ul>
              <Lk className={p.featured ? "btn" : "btn ghost"} href={p.cta.href}>{p.cta.label}</Lk>
            </article>))}</div><Tail b={b} /></div></section>
      );
    case "faq":
      return (
        <section className="sec faq-section" id={b.id}><div className="wrap narrow"><p className="eyebrow">FAQ</p><H>{b.title}</H>
          {b.items.map((f) => <details key={f.q} className="qa"><summary>{f.q}</summary><p>{f.a}</p></details>)}<Tail b={b} /></div></section>
      );
    case "resources":
      return (
        <section className="wrap" id={b.id}><p className="eyebrow">RESOURCES</p><H>{b.title}</H>
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

