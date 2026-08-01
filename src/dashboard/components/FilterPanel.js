// components/FilterPanel.js
const FilterPanel = {
  name: 'FilterPanel',
  setup() {
    const { reactive, ref, watch } = Vue;
    const store = Store;

    const draft = reactive(JSON.parse(JSON.stringify(store.state.filters)));
    const expanded = ref(true);

    function apply() {
      Object.assign(store.state.filters, JSON.parse(JSON.stringify(draft)));
    }
    function reset() {
      store.resetFilters();
      Object.assign(draft, JSON.parse(JSON.stringify(store.state.filters)));
    }
    function toggleSource(name) {
      const i = draft.sources.indexOf(name);
      if (i === -1) draft.sources.push(name); else draft.sources.splice(i, 1);
    }

    return {
      store, draft, expanded, apply, reset, toggleSource,
      sortOptions: FilterHelpers.SORT_OPTIONS,
    };
  },
  template: `
  <section class="card p-3.5" aria-label="Filters and sorting">
    <div class="flex items-center justify-between mb-3">
      <button class="flex items-center gap-2 text-sm font-medium focus-ring rounded" @click="expanded = !expanded" :aria-expanded="expanded">
        <svg :style="{ transform: expanded ? 'rotate(90deg)' : 'rotate(0)' }" class="transition-transform" width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
        Filters &amp; sorting
        <span v-if="store.activeFilterCount.value" class="chip chip-active">{{ store.activeFilterCount.value }} active</span>
      </button>

      <div class="flex items-center gap-2">
        <label class="text-xs text-[var(--text-muted)] hidden sm:inline">Sort</label>
        <select v-model="store.state.sort" class="input focus-ring text-xs py-1.5">
          <option v-for="o in sortOptions" :key="o.value" :value="o.value">{{ o.label }}</option>
        </select>
      </div>
    </div>

    <div v-show="expanded" class="grid gap-3" style="grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));">
      <div>
        <label class="block text-[11px] text-[var(--text-muted)] mb-1">Category</label>
        <select v-model="draft.category" class="input focus-ring w-full">
          <option value="">All categories</option>
          <option v-for="c in store.allCategories.value" :key="c" :value="c">{{ c }}</option>
        </select>
      </div>

      <div>
        <label class="block text-[11px] text-[var(--text-muted)] mb-1">Start date</label>
        <input type="date" v-model="draft.startDate" class="input focus-ring w-full" />
      </div>
      <div>
        <label class="block text-[11px] text-[var(--text-muted)] mb-1">End date</label>
        <input type="date" v-model="draft.endDate" class="input focus-ring w-full" />
      </div>

      <div>
        <label class="block text-[11px] text-[var(--text-muted)] mb-1">Min EV %</label>
        <input type="number" step="0.1" v-model="draft.minEV" placeholder="e.g. 5" class="input focus-ring w-full" />
      </div>
      <div>
        <label class="block text-[11px] text-[var(--text-muted)] mb-1">Min arbitrage %</label>
        <input type="number" step="0.1" v-model="draft.minArb" placeholder="e.g. 2" class="input focus-ring w-full" />
      </div>
      <div>
        <label class="block text-[11px] text-[var(--text-muted)] mb-1">Min odd</label>
        <input type="number" step="0.01" v-model="draft.minOdd" placeholder="e.g. 1.50" class="input focus-ring w-full" />
      </div>
      <div>
        <label class="block text-[11px] text-[var(--text-muted)] mb-1">Odds spread ≥</label>
        <input type="number" step="0.01" v-model="draft.oddsSpread" placeholder="e.g. 0.30" class="input focus-ring w-full" />
      </div>
    </div>

    <div class="mt-3">
      <label class="block text-[11px] text-[var(--text-muted)] mb-1.5">Sources</label>
      <div class="flex flex-wrap gap-1.5">
        <button v-for="s in store.allSourceNames.value" :key="s" class="chip focus-ring capitalize"
          :class="draft.sources.includes(s) ? 'chip-active' : ''" @click="toggleSource(s)">{{ s }}</button>
        <span v-if="!store.allSourceNames.value.length" class="text-xs text-[var(--text-muted)]">No sources yet</span>
      </div>
    </div>

    <div class="mt-3 flex flex-wrap gap-x-5 gap-y-2">
      <label class="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] cursor-pointer">
        <input type="checkbox" v-model="draft.historyOnly" class="accent-[var(--brand)]" /> History only
      </label>
      <label class="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] cursor-pointer">
        <input type="checkbox" v-model="draft.arbitrageOnly" class="accent-[var(--brand)]" /> Arbitrage only
      </label>
      <label class="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] cursor-pointer">
        <input type="checkbox" v-model="draft.liveOnly" class="accent-[var(--brand)]" /> Live only
      </label>
      <label class="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] cursor-pointer">
        <input type="checkbox" v-model="draft.twoWayOnly" class="accent-[var(--brand)]" /> Two-way only
      </label>
      <label class="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] cursor-pointer">
        <input type="checkbox" v-model="draft.threeWayOnly" class="accent-[var(--brand)]" /> Three-way only
      </label>
    </div>

    <div class="mt-3.5 flex gap-2">
      <button class="btn btn-primary focus-ring" @click="apply">Apply filters</button>
      <button class="btn focus-ring" @click="reset">Reset filters</button>
    </div>
  </section>
  `,
};
