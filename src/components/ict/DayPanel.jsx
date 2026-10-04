import { CalendarRange } from "lucide-react";
import CorrBadge from "./CorrBadge";

export default function DayPanel({ day, isNfp }) {
  return (
    <div className="rounded-2xl border border-border bg-card/60 p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          <CalendarRange className="h-3.5 w-3.5" /> Day of week
        </div>
        <CorrBadge corr={day.corr} />
      </div>
      <div className="mt-3">
        <div className="font-heading heading-tight text-2xl font-semibold">{day.name}</div>
        <div className="text-sm text-muted-foreground">
          {day.mentions} mentions {isNfp && <span className="ml-1 text-amber-500">· NFP Friday</span>}
        </div>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-foreground/80">{day.role}</p>
      <ul className="mt-3 space-y-1.5">
        {day.lookFor.map((l, i) => (
          <li key={i} className="flex gap-2 text-xs leading-relaxed text-muted-foreground">
            <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-accent" />
            {l}
          </li>
        ))}
      </ul>
    </div>
  );
}