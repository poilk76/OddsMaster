// js/store.js
// Single reactive store shared by every component. Matches live in a
// Vue-reactive Map so socket "update" events patch only the affected
// entries — never a full array replace + rerender.

const Store = (() => {
  const { reactive, computed, ref } = Vue;

  const state = reactive({
    matches: reactive(new Map()),      // id -> match object
    order: [],                          // insertion-stable id order (kept in sync)
    servers: reactive(new Map()),       // name -> {name, online, last_refresh}
    connection: 'reconnecting',         // connected | reconnecting | offline
    loadingInitial: true,

    search: '',
    filters: {
      category: '',
      sources: [],           // multi-select bookmaker names
      startDate: '',
      endDate: '',
      minEV: '',
      minArb: '',
      minOdd: '',
      oddsSpread: '',
      historyOnly: false,
      arbitrageOnly: false,
      liveOnly: false,
      twoWayOnly: false,
      threeWayOnly: false,
    },
    sort: 'highestEV',

    notifications: [],       // {id, text, ts, read}
    notifSoundOn: true,

    settings: {
      compactMode: false,
      animationsOn: true,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
      notifSound: true,
      refreshShortcut: true,
      oddsFormat: 'decimal',
    },

    historyCache: {},        // id -> history array
    flashes: reactive(new Map()), // `${id}:${bookmaker}:${idx}` -> 'up'|'down'
  });

  // ---------------------------------------------------------------- helpers
  function bestOddsFor(match) {
    // Returns array [bestHome, bestDraw?, bestAway] aligned to the widest
    // odds array among bookmakers, each entry {value, bookmaker}.
    const books = Object.entries(match.bookmakers || {});
    let width = 0;
    books.forEach(([, arr]) => { width = Math.max(width, (arr || []).length); });
    const best = new Array(width).fill(null);
    books.forEach(([name, arr]) => {
      (arr || []).forEach((val, idx) => {
        if (val == null) return;
        if (!best[idx] || val > best[idx].value) best[idx] = { value: val, bookmaker: name };
      });
    });
    return best;
  }

  function oddsSpreadFor(match) {
    const books = Object.values(match.bookmakers || {});
    if (!books.length) return 0;
    let min = Infinity, max = -Infinity;
    books.forEach((arr) => (arr || []).forEach((v) => {
      if (v == null) return;
      min = Math.min(min, v); max = Math.max(max, v);
    }));
    if (!isFinite(min) || !isFinite(max)) return 0;
    return +(max - min).toFixed(3);
  }

  function isTwoWay(match) {
    const widths = Object.values(match.bookmakers || {}).map((a) => (a || []).length);
    return widths.length > 0 && widths.every((w) => w === 2);
  }
  function isThreeWay(match) {
    const widths = Object.values(match.bookmakers || {}).map((a) => (a || []).length);
    return widths.length > 0 && widths.every((w) => w === 3);
  }

  function flashKey(id, bookmaker, idx) { return `${id}:${bookmaker}:${idx}`; }

  function triggerFlash(id, bookmaker, idx, dir) {
    const key = flashKey(id, bookmaker, idx);
    state.flashes.set(key, dir);
    setTimeout(() => { state.flashes.delete(key); }, 520);
  }

  function pushNotification(text) {
    state.notifications.unshift({ id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, text, ts: Date.now(), read: false });
    if (state.notifications.length > 200) state.notifications.length = 200;
    if (state.notifSoundOn && state.settings.notifSound) playDing();
  }

  let audioCtx = null;
  function playDing() {
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      const o = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      o.type = 'sine'; o.frequency.value = 880;
      g.gain.setValueAtTime(0.06, audioCtx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.25);
      o.connect(g).connect(audioCtx.destination);
      o.start(); o.stop(audioCtx.currentTime + 0.25);
    } catch (e) { /* audio not available */ }
  }

  // ---------------------------------------------------------------- mutations
  function setInitialMatches(list) {
    state.matches.clear();
    state.order = [];
    list.forEach((m) => {
      state.matches.set(m.id, m);
      state.order.push(m.id);
    });
    state.loadingInitial = false;
  }

  function applyUpdate({ added = [], updated = [], removed = [] } = {}) {
    added.forEach((m) => {
      if (!state.matches.has(m.id)) state.order.push(m.id);
      state.matches.set(m.id, m);
    });

    updated.forEach((patch) => {
      const existing = state.matches.get(patch.id);
      if (!existing) {
        // Unknown id arrived as an update — treat as an add.
        state.matches.set(patch.id, patch);
        state.order.push(patch.id);
        return;
      }
      // Diff bookmaker odds to drive flash animations before assigning.
      if (patch.bookmakers) {
        Object.entries(patch.bookmakers).forEach(([book, arr]) => {
          const prevArr = (existing.bookmakers || {})[book];
          (arr || []).forEach((val, idx) => {
            const prevVal = prevArr ? prevArr[idx] : undefined;
            if (prevVal != null && val != null && val !== prevVal) {
              triggerFlash(existing.id, book, idx, val > prevVal ? 'up' : 'down');
            }
          });
        });
      }
      const prevArb = existing.arb, prevEv = existing.ev;
      Object.assign(existing, patch);

      if (patch.arb != null && prevArb != null && patch.arb > prevArb && patch.arb >= 1) {
        pushNotification(`${matchLabel(existing)} arb +${patch.arb.toFixed(1)}%`);
      }
      if (patch.ev != null && prevEv != null && patch.ev > prevEv && patch.ev >= 5) {
        pushNotification(`${matchLabel(existing)} EV +${patch.ev.toFixed(1)}%`);
      }
    });

    removed.forEach((item) => {
      state.matches.delete(item.id);
      const i = state.order.indexOf(item.id);
      if (i !== -1) state.order.splice(i, 1);
    });
  }

  function matchLabel(m) {
    return (m.teams && m.teams[0]) ? m.teams[0] : 'Match';
  }

  function applyServersUpdate(list) {
    const seen = new Set();
    list.forEach((s) => {
      state.servers.set(s.name, s);
      seen.add(s.name);
    });
    // Drop servers no longer present in the payload.
    Array.from(state.servers.keys()).forEach((k) => { if (!seen.has(k)) state.servers.delete(k); });
  }

  function resetFilters() {
    state.filters.category = '';
    state.filters.sources = [];
    state.filters.startDate = '';
    state.filters.endDate = '';
    state.filters.minEV = '';
    state.filters.minArb = '';
    state.filters.minOdd = '';
    state.filters.oddsSpread = '';
    state.filters.historyOnly = false;
    state.filters.arbitrageOnly = false;
    state.filters.liveOnly = false;
    state.filters.twoWayOnly = false;
    state.filters.threeWayOnly = false;
    state.search = '';
  }

  // ---------------------------------------------------------------- computed
  const activeFilterCount = computed(() => {
    const f = state.filters;
    let n = 0;
    if (f.category) n++;
    if (f.sources.length) n++;
    if (f.startDate) n++;
    if (f.endDate) n++;
    if (f.minEV !== '') n++;
    if (f.minArb !== '') n++;
    if (f.minOdd !== '') n++;
    if (f.oddsSpread !== '') n++;
    if (f.historyOnly) n++;
    if (f.arbitrageOnly) n++;
    if (f.liveOnly) n++;
    if (f.twoWayOnly) n++;
    if (f.threeWayOnly) n++;
    if (state.search.trim()) n++;
    return n;
  });

  const filteredMatches = computed(() => {
    const f = state.filters;
    const q = state.search.trim().toLowerCase();
    const now = Date.now() / 1000;
    let list = state.order.map((id) => state.matches.get(id)).filter(Boolean);

    if (q) {
      list = list.filter((m) => (m.teams || []).join(' ').toLowerCase().includes(q));
    }
    if (f.category) list = list.filter((m) => (m.category || '').toLowerCase() === f.category.toLowerCase());
    if (f.sources.length) list = list.filter((m) => f.sources.some((s) => (m.bookmakers || {})[s]));
    if (f.startDate) { const t = new Date(f.startDate).getTime() / 1000; list = list.filter((m) => m.start_time >= t); }
    if (f.endDate) { const t = new Date(f.endDate).getTime() / 1000; list = list.filter((m) => m.start_time <= t); }
    if (f.minEV !== '') list = list.filter((m) => (m.ev || 0) >= Number(f.minEV));
    if (f.minArb !== '') list = list.filter((m) => (m.arb || 0) >= Number(f.minArb));
    if (f.minOdd !== '') {
      const min = Number(f.minOdd);
      list = list.filter((m) => Object.values(m.bookmakers || {}).some((arr) => (arr || []).some((v) => v >= min)));
    }
    if (f.oddsSpread !== '') list = list.filter((m) => oddsSpreadFor(m) >= Number(f.oddsSpread));
    if (f.historyOnly) list = list.filter((m) => !!m.history);
    if (f.arbitrageOnly) list = list.filter((m) => (m.arb || 0) > 0);
    if (f.liveOnly) list = list.filter((m) => m.start_time <= now);
    if (f.twoWayOnly) list = list.filter(isTwoWay);
    if (f.threeWayOnly) list = list.filter(isThreeWay);

    return list;
  });

  const sortedMatches = computed(() => {
    const list = filteredMatches.value.slice();
    switch (state.sort) {
      case 'highestEV': return list.sort((a, b) => (b.ev || 0) - (a.ev || 0));
      case 'highestArb': return list.sort((a, b) => (b.arb || 0) - (a.arb || 0));
      case 'startAsc': return list.sort((a, b) => a.start_time - b.start_time);
      case 'startDesc': return list.sort((a, b) => b.start_time - a.start_time);
      case 'alphabetical': return list.sort((a, b) => matchLabel(a).localeCompare(matchLabel(b)));
      case 'oddsSpread': return list.sort((a, b) => oddsSpreadFor(b) - oddsSpreadFor(a));
      case 'mostBookmakers': return list.sort((a, b) => Object.keys(b.bookmakers || {}).length - Object.keys(a.bookmakers || {}).length);
      default: return list;
    }
  });

  const stats = computed(() => {
    const all = state.order.map((id) => state.matches.get(id)).filter(Boolean);
    return {
      totalMatches: all.length,
      totalArbitrages: all.filter((m) => (m.arb || 0) > 0).length,
      evOver5: all.filter((m) => (m.ev || 0) > 5).length,
      onlineBookmakers: Array.from(state.servers.values()).filter((s) => s.online).length,
      activeFilters: activeFilterCount.value,
    };
  });

  const allSourceNames = computed(() => {
    const set = new Set();
    state.order.forEach((id) => {
      const m = state.matches.get(id);
      if (m) Object.keys(m.bookmakers || {}).forEach((k) => set.add(k));
    });
    return Array.from(set).sort();
  });

  const allCategories = computed(() => {
    const set = new Set();
    state.order.forEach((id) => {
      const m = state.matches.get(id);
      if (m && m.category) set.add(m.category);
    });
    return Array.from(set).sort();
  });

  const unreadCount = computed(() => state.notifications.filter((n) => !n.read).length);

  return {
    state, bestOddsFor, oddsSpreadFor, isTwoWay, isThreeWay, flashKey, matchLabel,
    setInitialMatches, applyUpdate, applyServersUpdate, resetFilters, pushNotification,
    filteredMatches, sortedMatches, stats, allSourceNames, allCategories, activeFilterCount, unreadCount,
  };
})();
