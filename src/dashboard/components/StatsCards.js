// components/StatsCards.js
const StatsCards = {
  name: 'StatsCards',
  setup() {
    const store = Store;
    const cards = Vue.computed(() => ([
      { label: 'Matches', value: store.stats.value.totalMatches, accent: 'var(--brand)' },
      { label: 'Arbitrages', value: store.stats.value.totalArbitrages, accent: 'var(--arb-violet)' },
      { label: 'EV > 5%', value: store.stats.value.evOver5, accent: 'var(--ev-amber)' },
      { label: 'Online books', value: store.stats.value.onlineBookmakers, accent: 'var(--positive)' },
      { label: 'Active filters', value: store.stats.value.activeFilters, accent: 'var(--text-secondary)' },
    ]));
    return { cards };
  },
  template: `
  <section aria-label="Statistics" class="grid gap-2.5" style="grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));">
    <div v-for="c in cards" :key="c.label" class="card px-4 py-3 relative overflow-hidden">
      <div class="absolute left-0 top-0 bottom-0 w-[3px]" :style="{ background: c.accent }"></div>
      <div class="text-[11px] uppercase tracking-wide text-[var(--text-muted)] font-medium pl-1.5">{{ c.label }}</div>
      <div class="font-mono text-2xl font-semibold mt-0.5 pl-1.5">{{ c.value.toLocaleString() }}</div>
    </div>
  </section>
  `,
};
