import { ShieldAlert } from "lucide-react";
import { NEWS_PLAYBOOK, matchNewsPlaybook } from "@/lib/ictData";
import CorrBadge from "./CorrBadge";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function parseDate(s) {
  const m = (s || "").match(/^(\d{2})-(\d{2})-(\d{4})$/);
  return m ? { month: +m[1], day: +m[2], year: +m[3] } : null;
}

export default function NewsPlaybook({ events, etParts }) {
  const todayMonth = etParts ? MONTH_NAMES.indexOf(etParts.month) + 1 : 0;
  const todayDay = etParts?.day;
  const isToday = (dateStr) => {
    const d = parseDate(dateStr);
    return !!d && d.day === todayDay && d.month === todayMonth;
  };

  const usdEvents = (events || []).filter((e) => (e.currency || "").toUpperCase() === "USD");
  const matchesByKey = {};
  usdEvents.forEach((e) => {
    const pb = matchNewsPlaybook(e);
    if (pb) (matchesByKey[pb.key] ||= []).push(e);
  });

  return (
    <div className="rounded-2xl border border-border bg-card/60 p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          <ShieldAlert className="h-3.5 w-3.5" /> USD red-folder playbook
        </div>
        <span className="text-[10px] text-muted-foreground">ICT handling, per release</span>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        How ICT approaches each USD high-impact release. General rule: don't hold through the print — let the initial (often fake) reaction resolve, then trade the draw on liquidity.
      </p>

      <div className="mt-4 space-y-2.5">
        {NEWS_PLAYBOOK.map((pb) => {
          const matched = matchesByKey[pb.key] || [];
          const todayHit = matched.some((e) => isToday(e.date));
          return (
            <div
              key={pb.key}
              className={`rounded-xl border p-4 ${todayHit ? "border-accent/40 bg-accent/8" : matched.length ? "border-accent/25 bg-accent/5" : "border-border/50 bg-background/20"}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-heading heading-tight text-sm font-bold">{pb.title}</div>
                  <div className="tnum mt-0.5 text-xs text-muted-foreground">{pb.time}</div>
                </div>
                <CorrBadge corr={pb.corr} />
              </div>
              <p className="mt-2 text-xs leading-relaxed text-foreground/80">{pb.summary}</p>

              {matched.length > 0 && (
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  {matched.map((e, i) => (
                    <span
                      key={i}
                      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] ${isToday(e.date) ? "border-accent bg-accent font-semibold text-accent-foreground" : "border-border bg-background/40 text-muted-foreground"}`}
                    >
                      {e.date} {e.time || "All Day"}
                      {isToday(e.date) && " · Today"}
                    </span>
                  ))}
                </div>
              )}

              <ul className="mt-3 space-y-1.5">
                {pb.checklist.map((c, i) => (
                  <li key={i} className="flex gap-2 text-xs leading-relaxed text-muted-foreground">
                    <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-accent" />
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}