import { useState } from "react";
import { Crosshair, AlertTriangle, CalendarClock, Sparkles, Check } from "lucide-react";
import CorrBadge from "./CorrBadge";

export default function RightNowPanel({ guidance, isClosed }) {
  const [done, setDone] = useState(() => new Set());
  const toggle = (item) =>
    setDone((s) => {
      const n = new Set(s);
      if (n.has(item)) n.delete(item);
      else n.add(item);
      return n;
    });

  return (
    <div className={`relative overflow-hidden rounded-2xl border p-6 sm:p-8 ${isClosed ? "border-border bg-card/40" : "border-accent/30 bg-gradient-to-br from-accent/8 via-card/60 to-card/60"}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/15 text-accent">
            <Crosshair className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">What to do right now</div>
            <h2 className="font-heading heading-tight text-lg font-semibold sm:text-xl">{guidance.title}</h2>
          </div>
        </div>
        {!isClosed && <CorrBadge corr={guidance.corr} />}
      </div>

      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-foreground/85 sm:text-base">{guidance.summary}</p>

      {guidance.dayContext && (
        <div className="mt-4 flex items-start gap-2 text-xs text-muted-foreground">
          <CalendarClock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
          <span>{guidance.dayContext}</span>
        </div>
      )}

      {guidance.seasonLine && (
        <div className="mt-2 flex items-start gap-2 text-xs text-muted-foreground">
          <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
          <span>{guidance.seasonLine}</span>
        </div>
      )}

      {guidance.warnings && guidance.warnings.length > 0 && (
        <div className="mt-4 space-y-2">
          {guidance.warnings.map((w, i) => (
            <div key={i} className="flex items-start gap-2 rounded-lg border border-amber-500/25 bg-amber-500/8 px-3 py-2 text-xs text-amber-600 dark:text-amber-400">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span><span className="font-semibold">{w.kind}:</span> {w.text}</span>
            </div>
          ))}
        </div>
      )}

      <div className="mt-5">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Checklist <span className="ml-1 font-normal normal-case text-muted-foreground/70">tap to tick off</span>
        </div>
        <ul className="space-y-2">
          {guidance.checklist.map((item, i) => {
            const checked = done.has(item);
            return (
              <li
                key={i}
                onClick={() => toggle(item)}
                className={`flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2.5 text-sm leading-relaxed transition-colors ${checked ? "border-accent/30 bg-accent/5" : "border-border/60 bg-background/40 hover:bg-background/70"}`}
              >
                <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-[11px] font-bold tnum transition-colors ${checked ? "bg-accent text-accent-foreground" : "bg-accent/15 text-accent"}`}>
                  {checked ? <Check className="h-3 w-3" /> : i + 1}
                </span>
                <span className={`text-foreground/90 ${checked ? "line-through opacity-50" : ""}`}>{item}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}