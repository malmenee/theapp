import { CalendarDays } from "lucide-react";
import CorrBadge from "./CorrBadge";

export default function SeasonPanel({ season, month }) {
  return (
    <div className="rounded-2xl border border-border bg-card/60 p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          <CalendarDays className="h-3.5 w-3.5" /> Season
        </div>
        <CorrBadge corr={season.corr} />
      </div>
      <div className="mt-3">
        <div className="font-heading heading-tight text-2xl font-semibold">{season.name}</div>
        <div className="text-sm text-muted-foreground">{month}</div>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-foreground/80">{season.note}</p>
      <p className="mt-2 text-xs italic text-muted-foreground">{season.caveat}</p>
    </div>
  );
}