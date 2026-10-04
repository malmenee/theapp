const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

// Returns this week's high-impact ("red folder") economic events.
// Source: the open ForexFactory calendar mirror at nfs.faireconomy.media
// (same data, no auth). That mirror rate-limits by IP, so we cache results in
// the NewsCache entity: one successful fetch per CACHE_TTL_MIN minutes serves
// later calls, and a 429 degrades gracefully to the last good cache.
//
// Note: Babypips' calendar was tried but its server (Cloudflare) returns 403 to
// the platform's worker IPs, so it can't be used as a source from here.

const FEEDS = [
  'https://nfs.faireconomy.media/ff_calendar_thisweek.json',
];
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes (longer TTL -> fewer 429s)

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const svc = db.asServiceRole;

    // 1. Try the cache first.
    let cached = null;
    try {
      const latest = await svc.entities.NewsCache.list('-fetchedAt', 1);
      if (latest && latest.length) cached = latest[0];
    } catch (e) { /* ignore cache read errors */ }

    const now = Date.now();
    const cachedAge = cached && cached.fetchedAt ? now - new Date(cached.fetchedAt).getTime() : Infinity;

    if (cached && cachedAge < CACHE_TTL_MS) {
      return Response.json({
        events: safeParse(cached.events, []),
        count: cached.count || 0,
        source: cached.source || 'ForexFactory (cached)',
        fetchedAt: cached.fetchedAt,
        cached: true,
        error: null,
      });
    }

    // 2. Fetch a fresh copy.
    let events = [];
    let fetchError = null;
    for (const url of FEEDS) {
      try {
        const res = await fetch(url, {
          headers: { 'User-Agent': 'ICT-Right-Now/1.0', Accept: 'application/json' },
        });
        if (!res.ok) { fetchError = `${url} responded ${res.status}`; continue; }
        const data = await res.json();
        if (!Array.isArray(data)) { fetchError = `${url} unexpected shape`; continue; }
        events = data
          .filter((e) => isHighImpact(e))
          .map((e) => {
            const et = toETStrings(e.date);
            return {
              title: e.title || '',
              country: '',
              currency: e.country || '', // the feed's "country" field is the currency code
              date: et.date,
              time: et.time,
              impact: 'High',
              forecast: e.forecast || '',
              previous: e.previous || '',
              actual: e.actual || '',
            };
          })
          .filter((e) => e.date);
        fetchError = null;
        break;
      } catch (e) {
        fetchError = e.message || 'fetch failed';
      }
    }

    // 3. On success, persist to cache and return.
    if (!fetchError) {
      const fetchedAt = new Date().toISOString();
      try {
        // keep only one cache row: wipe old, then create
        await svc.entities.NewsCache.deleteMany({});
        await svc.entities.NewsCache.create({
          events: JSON.stringify(events),
          count: events.length,
          fetchedAt,
          source: 'ForexFactory (faireconomy.media mirror)',
        });
      } catch (e) { /* cache write is best-effort */ }

      return Response.json({
        events,
        count: events.length,
        source: 'ForexFactory (faireconomy.media mirror)',
        fetchedAt,
        cached: false,
        error: null,
      });
    }

    // 4. On failure, fall back to stale cache if we have one.
    if (cached) {
      return Response.json({
        events: safeParse(cached.events, []),
        count: cached.count || 0,
        source: cached.source || 'ForexFactory (cached)',
        fetchedAt: cached.fetchedAt,
        cached: true,
        stale: true,
        error: fetchError,
      });
    }

    return Response.json({
      events: [],
      count: 0,
      source: 'ForexFactory (faireconomy.media mirror)',
      fetchedAt: new Date().toISOString(),
      error: fetchError || 'unknown error',
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

function isHighImpact(e) {
  const imp = e && e.impact;
  if (!imp) return false;
  return String(imp).trim().toLowerCase() === 'high';
}

function safeParse(s, fallback) {
  try { return JSON.parse(s) || fallback; } catch (e) { return fallback; }
}

function toETStrings(iso) {
  if (!iso) return { date: '', time: '' };
  const d = new Date(iso);
  if (isNaN(d.getTime())) return { date: '', time: '' };
  const dp = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    month: '2-digit', day: '2-digit', year: 'numeric',
  }).formatToParts(d);
  const get = (t) => (dp.find((p) => p.type === t) || {}).value || '';
  const date = `${get('month')}-${get('day')}-${get('year')}`;
  const time = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    hour: 'numeric', minute: '2-digit', hour12: true,
  }).format(d).toLowerCase();
  return { date, time };
}