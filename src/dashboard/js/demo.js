// js/demo.js
// OPTIONAL. Generates realistic-looking matches/servers/updates so the
// dashboard is fully explorable without a live backend. Delete this file
// (and its <script> tag + bootstrap call in index.html) once /matches,
// /matches/{id}/history and the Socket.IO server are live — nothing else
// in the codebase depends on it.

const Demo = (() => {
  const TEAMS = [
    ['Liverpool', 'Arsenal'], ['Real Madrid', 'Barcelona'], ['Bayern Munich', 'Dortmund'],
    ['Inter', 'AC Milan'], ['PSG', 'Marseille'], ['Man City', 'Chelsea'],
    ['Ajax', 'Feyenoord'], ['Juventus', 'Napoli'], ['Porto', 'Benfica'],
    ['Celtic', 'Rangers'], ['Boca Juniors', 'River Plate'], ['Flamengo', 'Palmeiras'],
    ['Sevilla', 'Atletico Madrid'], ['Lyon', 'Monaco'], ['Leipzig', 'Leverkusen'],
  ];
  const CATEGORIES = ['Premier League', 'La Liga', 'Bundesliga', 'Serie A', 'Ligue 1', 'Champions League', 'Eredivisie'];
  const BOOKMAKERS = ['bet365', 'pinnacle', 'stake', 'betway', 'unibet', '1xbet', 'williamhill', 'betfair', 'bwin', 'draftkings'];

  function rnd(min, max) { return Math.random() * (max - min) + min; }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function id() { return Math.random().toString(36).slice(2, 10); }

  function genOdds(twoWay) {
    const home = +rnd(1.4, 4.5).toFixed(2);
    const away = +rnd(1.4, 4.5).toFixed(2);
    if (twoWay) return [home, away];
    const draw = +rnd(2.8, 4.2).toFixed(2);
    return [home, draw, away];
  }

  function genMatch(i) {
    const teams = pick(TEAMS);
    const twoWay = Math.random() < 0.15;
    const bookCount = Math.floor(rnd(3, BOOKMAKERS.length + 1));
    const books = [...BOOKMAKERS].sort(() => Math.random() - 0.5).slice(0, bookCount);
    const bookmakers = {}; const links = {};
    books.forEach((b) => { bookmakers[b] = genOdds(twoWay); links[b] = `https://example-${b}.test/match/${i}`; });
    const arb = Math.random() < 0.12 ? +rnd(0.2, 4).toFixed(2) : 0;
    const ev = Math.random() < 0.3 ? +rnd(-3, 12).toFixed(2) : +rnd(-3, 3).toFixed(2);
    const evBook = pick(books);
    const evSelection = Math.random() < 0.33 ? teams[0] : (Math.random() < 0.5 ? 'Draw' : teams[1]);
    return {
      id: `m_${i}_${id()}`,
      teams,
      category: pick(CATEGORIES),
      start_time: Math.floor(Date.now() / 1000) + Math.floor(rnd(-3600, 3600 * 30)),
      bookmakers,
      links,
      best_odds: {},
      arb,
      arb_spread: [+rnd(0, 2).toFixed(1), +rnd(0, 2).toFixed(1), +rnd(0, 2).toFixed(1)],
      ev,
      ev_info: [evBook, evSelection, Math.round(rnd(2, 22))],
      history: Math.random() < 0.6,
    };
  }

  function genServers() {
    return BOOKMAKERS.map((name) => ({
      name,
      online: Math.random() > 0.08,
      last_refresh: Math.floor(Date.now() / 1000) - Math.floor(rnd(0, 90)),
    }));
  }

  function genInitialMatches(count) {
    return Array.from({ length: count }, (_, i) => genMatch(i));
  }

  function genHistory() {
    const points = 24;
    const out = [];
    let h = rnd(1.6, 3.2), d = rnd(2.8, 3.6), a = rnd(1.8, 3.4);
    for (let i = 0; i < points; i++) {
      h = Math.max(1.05, h + rnd(-0.08, 0.08));
      d = Math.max(1.05, d + rnd(-0.06, 0.06));
      a = Math.max(1.05, a + rnd(-0.08, 0.08));
      out.push([+h.toFixed(2), +d.toFixed(2), +a.toFixed(2)]);
    }
    return out;
  }

  // Simulates the `update` socket event on an interval.
  function startLiveSimulation(store, intervalMs = 1800) {
    return setInterval(() => {
      const ids = Array.from(store.state.matches.keys());
      if (!ids.length) return;
      const n = Math.ceil(rnd(1, 6));
      const updated = [];
      for (let k = 0; k < n; k++) {
        const mid = pick(ids);
        const m = store.state.matches.get(mid);
        if (!m) continue;
        const books = Object.keys(m.bookmakers || {});
        if (!books.length) continue;
        const book = pick(books);
        const arr = m.bookmakers[book].slice();
        const idx = Math.floor(rnd(0, arr.length));
        arr[idx] = Math.max(1.01, +(arr[idx] + rnd(-0.12, 0.12)).toFixed(2));
        const patch = { id: mid, bookmakers: { [book]: arr } };
        if (Math.random() < 0.1) patch.arb = +rnd(0, 4.5).toFixed(2);
        if (Math.random() < 0.15) patch.ev = +rnd(-2, 13).toFixed(2);
        updated.push(patch);
      }
      store.applyUpdate({ added: [], updated, removed: [] });
    }, intervalMs);
  }

  function startServerHeartbeat(store, intervalMs = 4000) {
    return setInterval(() => {
      const servers = Array.from(store.state.servers.values()).map((s) => ({
        ...s,
        last_refresh: Math.random() > 0.15 ? Math.floor(Date.now() / 1000) : s.last_refresh,
      }));
      store.applyServersUpdate(servers);
    }, intervalMs);
  }

  return { genInitialMatches, genServers, genHistory, startLiveSimulation, startServerHeartbeat };
})();
