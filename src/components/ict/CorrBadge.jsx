import { CORRELATION } from "@/lib/ictData";

const STYLES = {
  STRONG: "bg-emerald-500/12 text-emerald-500 border-emerald-500/25",
  MODERATE: "bg-amber-500/12 text-amber-500 border-amber-500/25",
  NOTED: "bg-sky-500/12 text-sky-500 border-sky-500/25",
  RARE: "bg-zinc-500/12 text-zinc-400 border-zinc-500/25",
};

export default function CorrBadge({ corr, showStars = true }) {
  const c = corr || CORRELATION.NOTED;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${STYLES[c.label] || STYLES.NOTED}`}>
      {showStars && <span className="tracking-tight">{c.stars}</span>}
      {c.label}
    </span>
  );
}