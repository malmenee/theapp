import { DAILY_RHYTHM, TIME_WINDOWS } from "@/lib/ictData";

export default function DailyMap({ window }) {
  return (
    <div className="space-y-4">
      <div>
        <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Session windows (ET)</div>
        <div className="flex flex-col gap-1.5">
          {TIME_WINDOWS.map((w) => {
            const active = w.id === window.id;
            return (
              <div
                key={w.id}
                className={`flex items-center gap-3 overflow-hidden rounded-lg border px-3 py-2 ${active ? "border-accent/40 bg-accent/8" : "border-border/50 bg-background/20"}`}
              >
                <span className="tnum w-28 shrink-0 text-xs font-medium text-muted-foreground">{w.time}</span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{w.name}</div>
                  <div className="truncate text-xs text-muted-foreground">{w.summary}</div>
                </div>
                {active && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />}
              </div>
            );
          })}
        </div>
      </div>
      <div>
        <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Cheat sheet</div>
        <div className="grid gap-1.5 sm:grid-cols-2">
          {DAILY_RHYTHM.map((d) => (
            <div key={d.time} className="flex items-start gap-2 rounded-lg border border-border/50 bg-background/20 px-3 py-2">
              <span className="tnum shrink-0 text-xs font-semibold text-accent">{d.time}</span>
              <span className="text-xs leading-relaxed text-muted-foreground">{d.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}