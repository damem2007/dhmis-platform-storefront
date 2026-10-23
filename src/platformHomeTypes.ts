export type Link = { label: string; href: string };
export type Item = { title: string; text: string; href?: string };
export type Base = { id?: string; note?: string; more?: Link };
export type St = "h" | "w" | "t" | "p";
export type Block = Base & (
  | { type: "hero"; title: string; accent?: string; text: string; cta: Link; secondary?: Link; micro?: string; chart?: boolean; glance?: { n: number; pre?: string; label: string }[] }
  | { type: "stats"; title: string; items: { n: number; suf?: string; label: string }[] }
  | { type: "quotes"; title: string; items: { text: string; by: string; sample?: boolean }[] }
  | { type: "audiences"; title: string; intro?: string; items: { label: string; title: string; text: string; href?: string }[] }
  | { type: "platform"; title: string; intro?: string; items: { title: string; text: string; tone: "mint" | "ink" | "coral" | "paper" }[] }
  | { type: "features"; title: string; items: Item[] }
  | { type: "steps"; title: string; items: { title: string; text: string; status: St }[] }
  | { type: "compare"; title: string; cols: string[]; rows: string[][] }
  | { type: "roi"; title: string; assumption: number }
  | { type: "pricing"; title: string; plans: { name: string; price: string; per: string; text: string; locations: string; features: string[]; cta: Link; featured?: boolean }[] }
  | { type: "faq"; title: string; items: { q: string; a: string }[] }
  | { type: "resources"; title: string; items: { title: string; links: Link[]; more: Link }[] }
  | { type: "text"; title: string; paragraphs: string[] }
  | { type: "code"; title: string; text: string; code: string }
  | { type: "cta"; title: string; text: string; cta: Link; secondary?: Link }
  | { type: "contact"; title: string; text: string }
);
export type Page = { slug: string; title: string; description: string; blocks: Block[] };
export type Section = "kb" | "docs";
export type Article = { slug: string; section: Section; category: string; title: string; summary: string; body: string[]; code?: string };
export type Site = { name: string; tagline: string; nav: Link[]; audiences?: Link[]; resources: Link[]; primary: Link; signIn?: Link; showTheme?: boolean; footer: { title: string; links: Link[] }[] };
export type Theme = { light: Record<string, string>; dark: Record<string, string> };
export type ThemeMode = "system" | "light" | "dark";
export type PublicPlan = {
  code: string; name: string; description: string; price_cents: number; currency: string; interval: string; trial_days: number; max_locations: number | null; features: string[];
  entitlements?: { key: string; name: string; enabled: boolean; value: number | null; unlimited: boolean; public_label?: string }[]; active: boolean;
};
export type Props = { site?: Site; theme?: Theme; pages?: Page[]; articles?: Article[] };
