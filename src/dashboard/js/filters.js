// js/filters.js
// Small pure helpers used by FilterPanel.js. Kept separate from store.js so
// the store stays focused on state + derived data.

const FilterHelpers = (() => {
  function debounce(fn, wait = 200) {
    let t = null;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), wait);
    };
  }

  const SORT_OPTIONS = [
    { value: 'highestEV', label: 'Highest EV' },
    { value: 'highestArb', label: 'Highest arbitrage' },
    { value: 'startAsc', label: 'Start time ↑' },
    { value: 'startDesc', label: 'Start time ↓' },
    { value: 'alphabetical', label: 'Alphabetical' },
    { value: 'oddsSpread', label: 'Odds spread' },
    { value: 'mostBookmakers', label: 'Most bookmakers' },
  ];

  function toDateInputValue(ts) {
    if (!ts) return '';
    const d = new Date(ts * 1000);
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }

  return { debounce, SORT_OPTIONS, toDateInputValue };
})();
