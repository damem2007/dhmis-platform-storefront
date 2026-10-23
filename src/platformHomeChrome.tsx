import type { ComponentProps } from "react";
import type { Article, Link, Section, Site, Theme, ThemeMode } from "./platformHomeTypes";

// ---------- Routing and chrome ----------
export function Lk({ href, ...p }: { href: string } & Omit<ComponentProps<"a">, "href">) {
  const external = /^(https?:|mailto:)/i.test(href);
  return <a href={external ? href : href.startsWith("/#") ? "#/" + href.slice(2) : "#" + href} {...p} />;
}

// Theme tokens from the CMS become CSS variables scoped to this app only. Keys and values are validated.
const KEY = /^[a-z0-9-]+$/, VAL = /^[#a-zA-Z0-9(),.%\s-]+$/;
const vars = (m: Record<string, string>) => Object.entries(m).filter(([k, v]) => KEY.test(k) && VAL.test(v)).map(([k, v]) => `--${k}:${v}`).join(";");
export const themeCss = (t: Theme) => `.platform-home{${vars(t.light)}}@media(prefers-color-scheme:dark){.platform-home{${vars(t.dark)}}}.platform-home[data-theme="light"]{${vars(t.light)}}.platform-home[data-theme="dark"]{${vars(t.dark)}}`;

export function Header({ site, themeMode, onThemeModeChange }: { site: Site; themeMode: ThemeMode; onThemeModeChange: (mode: ThemeMode) => void }) {
  const links = (l: Link[]) => l.map((n, index) => <Lk key={`${n.href}:${n.label}:${index}`} href={n.href}>{n.label}</Lk>);
  return (
    <header className="bar">
      <a className="skip" href="#main-content">Skip to content</a>
      <Lk className="logo" href="/">{site.name}</Lk>
      <nav aria-label="Main">
        {links(site.nav)}
        {site.audiences && !site.nav.some((item) => item.label === "Solutions") && <details className="dd d"><summary>Solutions</summary><div>{links(site.audiences)}</div></details>}
        {!site.nav.some((item) => item.label === "Resources") && <details className="dd d"><summary>Resources</summary><div>{links(site.resources)}</div></details>}
        <details className="dd m"><summary>Menu</summary><div>{links([...site.nav, ...(site.audiences || []), ...site.resources])}</div></details>
        {site.showTheme !== false && <button type="button" className="theme-toggle" aria-label={`Switch to ${themeMode === "dark" ? "light" : "dark"} theme`} title={`Switch to ${themeMode === "dark" ? "light" : "dark"} theme`} onClick={() => onThemeModeChange(themeMode === "dark" ? "light" : "dark")}>
          <svg className="theme-icon" viewBox="0 0 24 24" aria-hidden="true">
            {themeMode === "dark" ? <path d="M20.2 15.3A8.6 8.6 0 0 1 8.7 3.8 8.7 8.7 0 1 0 20.2 15.3Z" /> : <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>}
          </svg>
          <span className="sr-only">Theme</span>
        </button>}
        {site.signIn && <Lk className="sign-in" href={site.signIn.href}>{site.signIn.label}</Lk>}
        <Lk className="btn" href={site.primary.href}>{site.primary.label}</Lk>
      </nav>
    </header>
  );
}

export function Footer({ site }: { site: Site }) {
  return (
    <footer className="foot2">
      <div><strong className="logo">{site.name}</strong><p>{site.tagline}</p></div>
      {site.footer.map((c) => (
        <nav key={c.title} aria-label={c.title}><h4>{c.title}</h4>{c.links.map((l) => <Lk key={l.href + l.label} href={l.href}>{l.label}</Lk>)}</nav>
      ))}
    </footer>
  );
}

export const SECTIONS: Record<Section, { title: string; intro: string }> = {
  kb: { title: "Knowledge base", intro: "Step-by-step help for your clinic team." },
  docs: { title: "API documentation", intro: "Everything you need to integrate with DHMIS." },
};

export function Index({ section, items }: { section: Section; items: Article[] }) {
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

export function ArticleView({ section, a }: { section: Section; a: Article }) {
  return (
    <article className="wrap narrow">
      <Lk href={`/${section}`}>Back to {SECTIONS[section].title}</Lk>
      <h1>{a.title}</h1>{a.body.map((p) => <p key={p}>{p}</p>)}
      {a.code && <pre><code>{a.code}</code></pre>}
    </article>
  );
}

export const NotFound = () => <section className="wrap narrow"><h1>Page not found</h1><p>That page doesn&apos;t exist.</p></section>;

