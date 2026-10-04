import { WEEKLY_RHYTHM } from "@/lib/ictData";

export default function WeeklyMap({ weekdayKey }) {
  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {WEEKLY_RHYTHM.map((d) => {
        const active = d.day.toLowerCase().startsWith(weekdayKey.slice(0, 3));
        return (
          <div
            key={d.day}
            className={`rounded-xl border p-3 ${active ? "border-accent/40 bg-accent/8" : "border-border/60 bg-background/30"}`}
          >
            <div className="flex items-center gap-2">
              <span className="font-heading heading-tight text-sm font-bold">{d.day}</span>
              {active && <span className="h-1.5 w-1.5 rounded-full bg-accent" />}
            </div>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{d.text}</p>
          </div>
        );
      })}
    </div>
  );
}