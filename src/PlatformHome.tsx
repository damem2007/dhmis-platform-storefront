'use client';

import { useEffect, useState, type ReactNode } from "react";
import { installFormEnhancements } from "./formEnhancements";
import type { Block, Props, PublicPlan, ThemeMode } from "./platformHomeTypes";
import { defaults, publicPlanView } from "./platformHomeContent";
import { Blocks } from "./platformHomeBlocks";
import { SelfOnboarding } from "./platformHomeOnboarding";
import { ArticleView, Footer, Header, Index, NotFound, SECTIONS, themeCss } from "./platformHomeChrome";

const readRoute = () => typeof window === 'undefined' ? [''] : (window.location.hash || "#/").slice(2).split("?")[0].split("/");

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

function orderHomeBlocks(blocks: Block[]) {
  const hero = blocks.find((block) => block.type === "hero");
  const flow = blocks.find((block) => block.type === "steps");
  if (!hero || !flow) return blocks;
  return [hero, flow, ...blocks.filter((block) => block !== hero && block !== flow)];
}

function useLivePricing() {
  const [livePlans, setLivePlans] = useState<Extract<Block, { type: "pricing" }>['plans'] | null>(null);
  const [livePlanRecords, setLivePlanRecords] = useState<PublicPlan[]>([]);
  const [pricingState, setPricingState] = useState<"loading" | "live" | "fallback">("loading");

  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "");
    fetch(base ? `${base}/v1/public/platform/plans` : "/api/public/platform/plans")
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("Plan catalogue unavailable")))
      .then((payload: unknown) => {
        if (!Array.isArray(payload)) { setPricingState("fallback"); return; }
        const records = payload.filter((value): value is PublicPlan => Boolean(value && typeof value === "object" && "code" in value && "name" in value));
        const plans = records.map(publicPlanView);
        if (!plans.length) { setPricingState("fallback"); return; }
        setLivePlanRecords(records);
        setLivePlans(plans);
        setPricingState("live");
      })
      .catch(() => setPricingState("fallback"));
  }, []);

  return { livePlans, livePlanRecords, pricingState };
}

function useThemeMode() {
  const [themeMode, setThemeMode] = useState<ThemeMode>("system");

  useEffect(() => {
    const saved = window.localStorage.getItem("dhmis-platform-home-theme");
    if (saved === "system" || saved === "light" || saved === "dark") setThemeMode(saved);
  }, []);

  const changeThemeMode = (mode: ThemeMode) => {
    setThemeMode(mode);
    window.localStorage.setItem("dhmis-platform-home-theme", mode);
  };

  return { themeMode, changeThemeMode };
}

export default function PlatformHome({ site = defaults.site, theme = defaults.theme, pages = defaults.pages, articles = defaults.articles }: Props) {
  const [s = "", slug] = useRoute();
  const { livePlans, livePlanRecords, pricingState } = useLivePricing();
  const { themeMode, changeThemeMode } = useThemeMode();
  const renderedPages = livePlans
    ? pages.map((page) => ({ ...page, blocks: page.blocks.map((block) => block.type === "pricing" ? { ...block, plans: livePlans, note: `${block.note || ""}${block.note ? " · " : ""}Live pricing from Platform Admin` } : block) }))
    : pages;
  const home = renderedPages.find((page) => page.slug === "home");
  const homeBlocks = orderHomeBlocks(home?.blocks ?? []);
  const page = renderedPages.find((candidate) => candidate.slug === s);
  const items = s === "kb" || s === "docs" ? articles.filter((article) => article.section === s) : [];
  const article = items.find((candidate) => candidate.slug === slug);
  const anchor = !page && s && s !== "kb" && s !== "docs" && home?.blocks.some((block) => block.id === s) ? s : "";

  let view: ReactNode, title = "Home";
  if (s === "signup") {
    view = <SelfOnboarding plans={livePlanRecords} loading={pricingState === "loading"} />;
    title = "Start your free trial";
  } else if (s === "kb" || s === "docs") {
    if (!slug) { view = <Index section={s} items={items} />; title = SECTIONS[s].title; }
    else if (article) { view = <ArticleView section={s} a={article} />; title = article.title; }
    else view = <NotFound />;
  } else if (!s || anchor) view = <Blocks blocks={homeBlocks} />;
  else if (page) { view = <Blocks blocks={page.blocks} />; title = page.title; }
  else view = <NotFound />;

  useEffect(() => {
    document.title = `${title} · ${site.name}`;
    if (anchor) document.getElementById(anchor)?.scrollIntoView();
  }, [title, anchor, site.name]);

  useEffect(() => installFormEnhancements(), []);

  return (
    <div className="platform-home" data-theme={themeMode === "system" ? undefined : themeMode}>
      <style>{themeCss(theme)}</style>
      <Header key={s + (slug ?? "")} site={site} themeMode={themeMode} onThemeModeChange={changeThemeMode} />
      <main id="main-content">{view}</main>
      <Footer site={site} />
    </div>
  );
}
