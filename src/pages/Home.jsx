const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useEffect, useMemo, useState } from "react";
import { Activity, Info } from "lucide-react";

import {
  getETParts, getWindowForMinutes, getSeasonForMonth, getDay, isMarketClosed,
  isNfpFriday, buildRightNow, SOURCE_NOTE,
} from "@/lib/ictData";
import ThemeToggle from "@/components/ThemeToggle";
import CorrBadge from "@/components/ict/CorrBadge";
import CollapsibleSection from "@/components/ict/CollapsibleSection";
import SeasonPanel from "@/components/ict/SeasonPanel";
import DayPanel from "@/components/ict/DayPanel";
import TimeWindowPanel from "@/components/ict/TimeWindowPanel";
import RightNowPanel from "@/components/ict/RightNowPanel";
import NewsPanel from "@/components/ict/NewsPanel";
import NewsPlaybook from "@/components/ict/NewsPlaybook";
import WeeklyMap from "@/components/ict/WeeklyMap";
import DailyMap from "@/components/ict/DailyMap";
import SeasonalNotes from "@/components/ict/SeasonalNotes";
import Vocabulary from "@/components/ict/Vocabulary";

export default function Home() {
  const [et, setEt] = useState(() => getETParts());
  const [newsEvents, setNewsEvents] = useState([]);

  // live clock — tick every second
  useEffect(() => {
    const t = setInterval(() => setEt(getETParts()), 1000);
    return () => clearInterval(t);
  }, []);

  // fetch news once on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await db.functions.invoke("getHighImpactNews", {});
        const data = res.data || res;
        if (data && Array.isArray(data.events)) setNewsEvents(data.events);
      } catch (e) {
        /* news is best-effort */
      }
    })();
  }, []);

  const derived = useMemo(() => {
    const window = getWindowForMinutes(et.minutesOfDay);
    const day = getDay(et.weekdayKey);
    const season = getSeasonForMonth(et.month);
    const closed = isMarketClosed(et.weekdayKey, et.minutesOfDay);
    const nfp = isNfpFriday(et.weekdayKey, et.day);
    const guidance = buildRightNow({ etParts: et, window, day, season, newsEvents, isClosed: closed });
    return { window, day, season, closed, nfp, guidance };
  }, [et, newsEvents]);

  const { window, day, season, closed, nfp, guidance } = derived;
  const dateLabel = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York", weekday: "long", month: "long", day: "numeric",
  }).format(new Date());

  return (
    <div className="min-h-screen app-bg">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-border/60 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/15 text-accent">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-heading heading-tight text-base font-bold leading-none sm:text-lg">ICT Right Now</h1>
              <p className="mt-1 text-[11px] text-muted-foreground">A correlation-ranked field guide to the trading day</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${closed ? "border-border bg-muted/50 text-muted-foreground" : "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${closed ? "bg-muted-foreground" : "bg-emerald-500 animate-pulse"}`} />
              {closed ? "Closed" : "Open"}
            </span>
            <div className="hidden text-right sm:block">
              <div className="tnum text-sm font-semibold tabular-nums">{et.clock} <span className="text-muted-foreground">ET</span></div>
              <div className="text-[11px] text-muted-foreground">{dateLabel}</div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        {/* mobile clock */}
        <div className="mb-5 sm:hidden">
          <div className="tnum text-3xl font-bold tabular-nums">{et.clock} <span className="text-base font-medium text-muted-foreground">ET</span></div>
          <div className="text-sm text-muted-foreground">{dateLabel}</div>
        </div>

        {/* Closed banner */}
        {closed && (
          <div className="mb-5 flex items-center gap-3 rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm">
            <Info className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="text-muted-foreground">
              Markets are closed in New York. Futures reopen ~6:00 PM ET Sunday with the week's opening price.
            </span>
          </div>
        )}

        {/* Three dimensions */}
        <div className="grid gap-4 md:grid-cols-3">
          <SeasonPanel season={season} month={et.month} />
          <DayPanel day={day} isNfp={nfp} />
          <TimeWindowPanel window={window} clock={et.clock} weekday={et.weekday} minutesOfDay={et.minutesOfDay} />
        </div>

        {/* Right now */}
        <div className="mt-4">
          <RightNowPanel guidance={guidance} isClosed={closed} />
        </div>

        {/* News */}
        <div className="mt-4">
          <NewsPanel etParts={et} />
        </div>

        {/* USD red-folder playbook */}
        <div className="mt-4">
          <NewsPlaybook events={newsEvents} etParts={et} />
        </div>

        {/* Collapsible reference */}
        <div className="mt-4 space-y-3">
          <CollapsibleSection title="Full weekly map" subtitle="Every day's role in the trading week">
            <WeeklyMap weekdayKey={et.weekdayKey} />
          </CollapsibleSection>
          <CollapsibleSection title="Full daily map" subtitle="Every session window, hour by hour (ET)">
            <DailyMap window={window} />
          </CollapsibleSection>
          <CollapsibleSection title="Seasonal notes" subtitle="The weakest-backed dimension — context only">
            <SeasonalNotes season={season} />
          </CollapsibleSection>
          <CollapsibleSection title="Vocabulary reference" subtitle="Core concepts ranked by how often ICT uses them">
            <Vocabulary />
          </CollapsibleSection>
        </div>

        {/* Source */}
        <div className="mt-6 flex items-start gap-2 rounded-xl border border-border/50 bg-card/40 px-4 py-3 text-[11px] leading-relaxed text-muted-foreground">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>{SOURCE_NOTE}</span>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[10px] text-muted-foreground">
          <CorrBadge corr={{ label: "STRONG", stars: "★★★" }} showStars={true} /> 35%+ ·
          <CorrBadge corr={{ label: "MODERATE", stars: "★★" }} /> 12–35% ·
          <CorrBadge corr={{ label: "NOTED", stars: "★" }} /> 3–12% ·
          <CorrBadge corr={{ label: "RARE", stars: "·" }} /> &lt;3%
        </div>

        {/* Disclaimer */}
        <div className="mt-4 rounded-xl border border-border/50 bg-card/40 px-4 py-3 text-[11px] leading-relaxed text-muted-foreground">
          <p className="font-medium text-foreground/70">No financial advice</p>
          <p className="mt-1">
            ICT Right Now is an educational reference tool that organizes publicly available ICT
            methodology concepts and economic calendar data. Nothing here is financial, investment,
            or trading advice. Always do your own research and consult a licensed professional before
            making any financial decisions. You are solely responsible for your own trades.
          </p>
        </div>
      </main>
    </div>
  );
}