const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useEffect, useMemo, useState } from "react";
import { Newspaper, RefreshCw, AlertCircle } from "lucide-react";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function monthNameToNum(name) {
  return MONTH_NAMES.indexOf(name) + 1;
}

function parseNewsDate(dateStr) {
  if (!dateStr) return null;
  const m = dateStr.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (!m) return null;
  return { month: parseInt(m[1], 10), day: parseInt(m[2], 10), year: parseInt(m[3], 10) };
}

function dayHeaderLabel(dateStr) {
  const d = parseNewsDate(dateStr);
  if (!d) return dateStr;
  return new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric" })
    .format(new Date(d.year, d.month - 1, d.day));
}

export default function NewsPanel({ etParts }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fetchedAt, setFetchedAt] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await db.functions.invoke("getHighImpactNews", {});
      const data = res.data || res;
      if (data.error && (!data.events || data.events.length === 0)) {
        setError(data.error);
        setEvents([]);
      } else {
        setEvents(data.events || []);
        setError(data.error || null);
        setFetchedAt(data.fetchedAt);
      }
    } catch (e) {
      setError(e.message || "Failed to load news");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const todayMonthNum = monthNameToNum(etParts?.month);
  const todayDay = etParts?.day;
  const isToday = (dateStr) => {
    const d = parseNewsDate(dateStr);
    if (!d) return false;
    return d.day === todayDay && d.month === todayMonthNum;
  };

  // group events by date, preserving feed order
  const groups = useMemo(() => {
    const map = new Map();
    (events || []).forEach((e) => {
      if (!map.has(e.date)) map.set(e.date, []);
      map.get(e.date).push(e);
    });
    return Array.from(map.entries());
  }, [events]);

  return (
    <div className="rounded-2xl border border-border bg-card/60 p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          <Newspaper className="h-3.5 w-3.5" /> Red-folder news (high impact)
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted/60 disabled:opacity-50"
        >
          <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      <p className="mt-2 text-xs text-muted-foreground">
        Source: ForexFactory · this week only · high-impact events. ICT's rule: let the initial reaction resolve before committing size.
      </p>

      {loading && events.length === 0 && (
        <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
          <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Fetching this week's high-impact calendar…
        </div>
      )}

      {error && events.length === 0 && !loading && (
        <div className="mt-4 flex items-start gap-2 rounded-lg border border-amber-500/25 bg-amber-500/8 px-3 py-2 text-xs text-amber-600 dark:text-amber-400">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>Couldn't reach the live feed ({error}). Tap refresh to try again — ForexFactory limits downloads to 2 / 5 min.</span>
        </div>
      )}

      {events.length > 0 && (
        <div className="mt-4 max-h-96 space-y-3 overflow-y-auto pr-1">
          {groups.map(([date, items]) => {
            const today = isToday(date);
            return (
              <div key={date}>
                <div className="sticky top-0 z-[1] -mx-1 mb-1.5 flex items-center gap-2 bg-card/80 px-1 py-1 backdrop-blur-sm">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{dayHeaderLabel(date)}</span>
                  {today && (
                    <span className="rounded-full bg-accent px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-accent-foreground">
                      Today
                    </span>
                  )}
                  <span className="ml-auto text-[10px] text-muted-foreground">{items.length}</span>
                </div>
                <div className="space-y-1.5">
                  {items.map((e, i) => (
                    <div
                      key={i}
                      className={`flex items-start gap-3 rounded-lg border px-3 py-2 text-sm ${today ? "border-accent/30 bg-accent/5" : "border-border/60 bg-background/30"}`}
                    >
                      <span className="mt-0.5 flex h-6 w-12 shrink-0 items-center justify-center rounded-md bg-red-500/15 text-[9px] font-bold uppercase tracking-wide text-red-500">
                        {e.currency || "—"}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-medium">{e.title}</div>
                        <div className="tnum mt-0.5 text-xs text-muted-foreground">
                          {e.time || "All Day"} ET
                          {e.actual && <span className="ml-2 text-emerald-500">Actual: {e.actual}</span>}
                          {e.forecast && <span className="ml-2">F: {e.forecast}</span>}
                          {e.previous && <span className="ml-2">P: {e.previous}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {fetchedAt && (
        <div className="tnum mt-3 text-[10px] text-muted-foreground">
          Updated {new Date(fetchedAt).toLocaleTimeString()} · {events.length} high-impact events this week
        </div>
      )}
    </div>
  );
}