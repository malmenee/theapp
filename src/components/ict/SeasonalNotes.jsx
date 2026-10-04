import { SEASONS } from "@/lib/ictData";
import CorrBadge from "./CorrBadge";

export default function SeasonalNotes({ season }) {
  return (
    <div className="space-y-2">
      <p className="text-xs italic text-muted-foreground">
        The season dimension is the weakest-backed of the three — the 639-transcript archive has little month-by-month commentary for index futures. Notes below are context, not trade signals.
      </p>
      {SEASONS.map((s) => {
        const active = s.key === season.key;
        return (
          <div
            key={s.key}
            className={`rounded-xl border p-4 ${active ? "border-accent/40 bg-accent/8" : "border-border/50 bg-background/20"}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="font-heading heading-tight text-sm font-bold">{s.name}</span>
                <span className="ml-2 text-xs text-muted-foreground">{s.months.join(", ")}</span>
              </div>
              <CorrBadge corr={s.corr} />
            </div>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{s.note}</p>
          </div>
        );
      })}
    </div>
  );
}