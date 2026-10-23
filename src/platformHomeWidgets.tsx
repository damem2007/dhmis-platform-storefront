import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { St } from "./platformHomeTypes";

// ---------- Tooth shapes ----------
export const ROOT = "M-8-18Q-9-36-3-50Q0-54 3-50Q9-36 8-18Z";
export const PATH = {
  i: "M-12-18Q-14 10-9 22Q0 28 9 22Q14 10 12-18Z",
  c: "M-14-18Q-16 8 0 31Q16 8 14-18Z",
  p: "M-17-18Q-19 10-10 23Q0 27 10 23Q19 10 17-18Z",
  m: "M-25-18Q-28 12-17 24Q-9 29 0 22Q9 29 17 24Q28 12 25-18Z",
} as const;

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

export function Chart({ currency = "$" }: { currency?: string }) {
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
        </div>
          <div id="chips" role="group" aria-label="Filter teeth by status">
            {(Object.keys(INFO) as St[]).map((k) => (
              <button key={k} aria-pressed={f === k} onClick={() => setF(f === k ? "" : k)}><i data-s={k} />{INFO[k][0]} <b>{cnt[k]}</b></button>
            ))}
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

export function Roi({ assumption = 0.4, currency = "$" }: { assumption?: number; currency?: string }) {
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

export function Counter({ n, suf = "", pre = "" }: { n: number; suf?: string; pre?: string }) {
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

