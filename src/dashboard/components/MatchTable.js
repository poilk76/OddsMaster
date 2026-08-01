// components/MatchTable.js
// Virtual scrolling: only the rows intersecting the viewport (+ overscan)
// are ever mounted, regardless of whether 50 or 50,000 matches are loaded.

const MatchTable = {
  name: 'MatchTable',
  components: { MatchRow },
  emits: ['open-history'],
  setup(_, { emit }) {
    const { ref, computed, onMounted, onUnmounted, nextTick } = Vue;
    const store = Store;

    const ROW_H = 56;         // estimated collapsed row height (px)
    const OVERSCAN = 10;
    const scrollEl = ref(null);
    const scrollTop = ref(0);
    const viewportH = ref(600);
    const expandedIds = ref(new Set());

    const list = computed(() => store.sortedMatches.value);
    const total = computed(() => list.value.length);

    const visibleStart = computed(() => Math.max(0, Math.floor(scrollTop.value / ROW_H) - OVERSCAN));
    const visibleCount = computed(() => Math.ceil(viewportH.value / ROW_H) + OVERSCAN * 2);
    const visibleEnd = computed(() => Math.min(total.value, visibleStart.value + visibleCount.value));

    const visibleRows = computed(() => list.value.slice(visibleStart.value, visibleEnd.value));
    const topPad = computed(() => visibleStart.value * ROW_H);
    const bottomPad = computed(() => Math.max(0, (total.value - visibleEnd.value) * ROW_H));

    function onScroll() {
      if (!scrollEl.value) return;
      scrollTop.value = scrollEl.value.scrollTop;
    }

    let ro = null;
    onMounted(() => {
      if (scrollEl.value) {
        viewportH.value = scrollEl.value.clientHeight || 600;
        ro = new ResizeObserver(() => { viewportH.value = scrollEl.value.clientHeight || 600; });
        ro.observe(scrollEl.value);
      }
    });
    onUnmounted(() => { if (ro) ro.disconnect(); });

    function toggleExpand(id) {
      const s = expandedIds.value;
      if (s.has(id)) s.delete(id); else s.add(id);
      // force reactivity for plain Set
      expandedIds.value = new Set(s);
    }

    return {
      store, scrollEl, onScroll, list, total, visibleRows, topPad, bottomPad,
      expandedIds, toggleExpand,
      openHistory: (m) => emit('open-history', m),
    };
  },
  template: `
  <section class="card overflow-hidden" aria-label="Matches">
    <div v-if="store.state.loadingInitial" class="p-4 space-y-2">
      <div v-for="i in 8" :key="i" class="skeleton h-12 w-full"></div>
    </div>

    <template v-else>
      <div v-if="!total" class="p-10 text-center text-sm text-[var(--text-muted)]">
        {{ store.activeFilterCount.value ? 'No matches found.' : 'No matches found.' }}
      </div>

      <template v-else>
        <!-- DESKTOP / TABLET TABLE -->
        <div class="desktop-table">
          <div ref="scrollEl" @scroll="onScroll" class="overflow-auto" style="max-height: 68vh;">
            <table class="w-full border-collapse text-sm" role="table">
              <thead class="sticky top-0 z-10 bg-[var(--bg-surface)]">
                <tr class="mm-table-header border-b border-[var(--border-hair)]">
                  <th class="text-left px-3 py-2.5 font-medium">Match</th>
                  <th class="text-left px-3 py-2.5 font-medium">Category</th>
                  <th class="text-left px-3 py-2.5 font-medium">Odds</th>
                  <th class="text-left px-3 py-2.5 font-medium">EV</th>
                  <th class="text-left px-3 py-2.5 font-medium">Arb</th>
                  <th class="text-left px-3 py-2.5 font-medium">Sources</th>
                  <th class="text-left px-3 py-2.5 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="topPad" :style="{ height: topPad + 'px' }" aria-hidden="true"><td colspan="7"></td></tr>
                <MatchRow v-for="m in visibleRows" :key="m.id" :match="m" layout="table"
                  :expanded="expandedIds.has(m.id)"
                  @toggle-expand="toggleExpand(m.id)"
                  @open-history="openHistory(m)" />
                <tr v-if="bottomPad" :style="{ height: bottomPad + 'px' }" aria-hidden="true"><td colspan="7"></td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- MOBILE CARDS -->
        <div class="mobile-cards flex-col p-3 overflow-auto" style="max-height: 72vh;">
          <MatchRow v-for="m in list.slice(0, 100)" :key="m.id" :match="m" layout="card"
            :expanded="expandedIds.has(m.id)"
            @toggle-expand="toggleExpand(m.id)"
            @open-history="openHistory(m)" />
          <div v-if="list.length > 100" class="text-center text-xs text-[var(--text-muted)] py-2">
            Showing first 100 of {{ list.length }} — refine filters to narrow down.
          </div>
        </div>

        <div class="px-3.5 py-2 border-t border-[var(--border-hair)] text-[11px] text-[var(--text-muted)] font-mono">
          {{ total.toLocaleString() }} matches · rendering {{ visibleRows.length }} rows
        </div>
      </template>
    </template>
  </section>
  `,
};
