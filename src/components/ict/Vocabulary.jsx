import { VOCABULARY } from "@/lib/ictData";

export default function Vocabulary() {
  return (
    <div className="grid gap-1.5 sm:grid-cols-2">
      {VOCABULARY.map((v) => (
        <div key={v.term} className="flex items-start gap-3 rounded-lg border border-border/50 bg-background/20 px-3 py-2">
          <span className="tnum flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-accent/15 text-xs font-bold text-accent">
            {v.rank}
          </span>
          <div>
            <div className="text-sm font-medium">{v.term}</div>
            <div className="text-xs leading-relaxed text-muted-foreground">{v.note}</div>
          </div>
        </div>
      ))}
    </div>
  );
}