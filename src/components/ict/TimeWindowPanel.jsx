import { Clock, ArrowRight } from "lucide-react";
import CorrBadge from "./CorrBadge";
import { TIME_WINDOWS } from "@/lib/ictData";

export default function TimeWindowPanel({ window, clock, weekday, minutesOfDay }) {
  const activeIndex = TIME_WINDOWS.findIndex((w) => w.id === window.id);
  const next = TIME_WINDOWS[(activeIndex + 1) % TIME_WINDOWS.length];
  const nowPct = Math.min(100, Math.max(0, ((minutesOfDay || 0) / 1440) * 100));

  // minutes until the next window begins
  let minsUntil = next.start - (minutesOfDay || 0);
  if (minsUntil < 0) minsUntil += 1440; // wraps past midnight
  const hrs = Math.floor(minsUntil / 60);
  const mins = Math.round(minsUntil % 60);
  const untilLabel = minsUntil <= 0
    ? "starting now"
    : hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;

  return (
    <div className="rounded-2xl border border-border bg-card/60 p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          <Clock className="h-3.5 w-3.5" /> Time of day
        </div>
        <CorrBadge corr={window.corr} />
      </div>
      <div className="mt-3">
        <div className="font-heading heading-tight text-xl font-semibold leading-tight">{window.name}</div>
        <div className="tnum mt-0.5 text-sm text-muted-foreground">
          {window.time} ET · {weekday} {clock}
        </div>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-foreground/80">{window.summary}</p>

      {/* 24h timeline with now marker */}
      <div className="mt-4">
        <div className="relative h-1.5 w-full rounded-full bg-muted">
          <div
            className="absolute top-0 h-full rounded-full bg-accent/40"
            style={{ left: `${(window.start / 1440) * 100}%`, width: `${((window.end - window.start) / 1440) * 100}%` }}
          />
          <div
            className="absolute top-1/2 h-3 w-0.5 -translate-y-1/2 rounded-full bg-foreground"
            style={{ left: `${nowPct}%` }}
          />
        </div>
        <div className="mt-1.5 flex justify-between text-[9px] text-muted-foreground">
          <span>12a</span><span>6a</span><span>12p</span><span>6p</span><span>12a</span>
        </div>
      </div>

      {/* Next window */}
      <div className="mt-3 flex items-center gap-2 overflow-hidden rounded-lg border border-border/50 bg-background/30 px-3 py-2 text-xs">
        <ArrowRight className="h-3 w-3 shrink-0 text-muted-foreground" />
        <span className="shrink-0 text-muted-foreground">Next</span>
        <span className="min-w-0 flex-1 truncate font-medium">{next.name}</span>
        <span className="tnum shrink-0 text-muted-foreground">{next.time} · in {untilLabel}</span>
      </div>
    </div>
  );
}