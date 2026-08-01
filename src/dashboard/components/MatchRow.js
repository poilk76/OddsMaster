// components/MatchRow.js
const MatchRow = {
  name: 'MatchRow',
  props: {
    match: { type: Object, required: true },
    expanded: { type: Boolean, default: false },
    layout: { type: String, default: 'table' }, // 'table' | 'card'
  },
  emits: ['toggle-expand', 'open-history'],
  setup(props) {
    const { computed, ref } = Vue;
    const store = Store;
    const selected = ref(null);
    const activeTooltip = ref(null); // 'ev' | 'arb' | null

    const marketLabels = computed(() => {
      const width = Math.max(...Object.values(props.match.bookmakers || {}).map((a) => (a || []).length), 0);
      if (width === 2) return ['1', '2'];
      return ['1', 'X', '2'];
    });

    const bestOdds = computed(() => store.bestOddsFor(props.match));
    const spreadVal = computed(() => store.oddsSpreadFor(props.match));
    const spreadPct = computed(() => Math.min(100, Math.round(spreadVal.value * 40)));

    const evSourceKey = computed(() => {
      const info = props.match.ev_info;
      if (!info || !info.length) return null;
      const [book, selection] = info;
      const teams = props.match.teams || [];
      let idx = -1;
      if (selection === teams[0]) idx = 0;
      else if (/^(draw|x)$/i.test(selection || '')) idx = 1;
      else if (selection === teams[1] || selection === teams[teams.length - 1]) idx = (marketLabels.value.length - 1);
      if (idx === -1) return null;
      return `${book}:${idx}`;
    });

    function flashClass(book, idx) {
      const dir = store.state.flashes.get(store.flashKey(props.match.id, book, idx));
      if (!dir) return '';
      return dir === 'up' ? 'flash-up' : 'flash-down';
    }

    function pillClass(book, idx, val) {
      const cls = [];
      if (bestOdds.value[idx] && bestOdds.value[idx].bookmaker === book) cls.push('odd-best');
      if (evSourceKey.value === `${book}:${idx}`) cls.push('odd-ev');
      if (selected.value === book) cls.push('odd-selected');
      cls.push(flashClass(book, idx));
      return cls.join(' ');
    }

    function clickOdd(book) {
      selected.value = selected.value === book ? null : book;
      const link = (props.match.links || {})[book];
      if (link) window.open(link, '_blank', 'noopener');
    }

    function fmtTime(ts) {
      const d = new Date(ts * 1000);
      return d.toLocaleString([], { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' });
    }

    const bookmakerEntries = computed(() => Object.entries(props.match.bookmakers || {}));

    return {
      store, selected, activeTooltip, marketLabels, bestOdds, spreadVal, spreadPct,
      evSourceKey, pillClass, clickOdd, fmtTime, bookmakerEntries,
    };
  },
  template: `
  <!-- ============ DESKTOP / TABLET TABLE ROW ============ -->
  <tr v-if="layout === 'table'" class="mm-row align-top">
    <td class="cell px-3 py-2.5 max-w-[220px]">
      <button class="text-left focus-ring rounded w-full" @click="$emit('toggle-expand')">
        <div class="text-[13px] font-medium truncate">{{ match.teams.join(' vs ') }}</div>
        <div class="text-[11px] text-[var(--text-muted)] font-mono mt-0.5">{{ fmtTime(match.start_time) }}</div>
      </button>
    </td>
    <td class="cell px-3 py-2.5 text-[12px] text-[var(--text-secondary)] whitespace-nowrap">{{ match.category || '—' }}</td>
    <td class="cell px-3 py-2.5">
      <div class="flex flex-wrap gap-1.5 max-w-[260px]">
        <button v-for="[book, arr] in bookmakerEntries.slice(0,3)" :key="book" class="odd-pill focus-ring"
          :class="pillClass(book, 0, arr[0])" @click="clickOdd(book)" :title="book">
          <span class="opacity-60 mr-1 text-[10px]">{{ book.slice(0,3).toUpperCase() }}</span>{{ (arr[0] ?? '—').toFixed ? arr[0].toFixed(2) : arr[0] }}
        </button>
        <span v-if="bookmakerEntries.length > 3" class="text-[11px] text-[var(--text-muted)] self-center">+{{ bookmakerEntries.length - 3 }}</span>
      </div>
      <div class="spread-track w-24 mt-1.5">
        <div class="spread-fill" :style="{ width: spreadPct + '%' }"></div>
      </div>
    </td>
    <td class="cell px-3 py-2.5 relative">
      <button class="font-mono text-sm font-semibold focus-ring rounded"
        :class="match.ev >= 5 ? 'text-[var(--ev-amber)]' : 'text-[var(--text-secondary)]'"
        @mouseenter="activeTooltip = 'ev'" @mouseleave="activeTooltip = null"
        @focus="activeTooltip = 'ev'" @blur="activeTooltip = null">
        {{ match.ev > 0 ? '+' : '' }}{{ (match.ev ?? 0).toFixed(1) }}%
      </button>
      <div v-if="activeTooltip === 'ev' && match.ev_info" class="absolute z-30 top-full left-0 mt-1 w-44 card p-2.5 text-xs shadow-xl">
        <div class="text-[var(--text-muted)]">Source</div>
        <div class="font-medium capitalize mb-1.5">{{ match.ev_info[0] }}</div>
        <div class="text-[var(--text-muted)]">Selection</div>
        <div class="font-medium mb-1.5">{{ match.ev_info[1] }}</div>
        <div class="text-[var(--text-muted)]">Kelly</div>
        <div class="font-medium">{{ match.ev_info[2] }}%</div>
      </div>
    </td>
    <td class="cell px-3 py-2.5 relative">
      <button class="font-mono text-sm font-semibold focus-ring rounded"
        :class="match.arb > 0 ? 'text-[var(--arb-violet)]' : 'text-[var(--text-secondary)]'"
        @mouseenter="activeTooltip = 'arb'" @mouseleave="activeTooltip = null"
        @focus="activeTooltip = 'arb'" @blur="activeTooltip = null">
        {{ match.arb > 0 ? '+' : '' }}{{ (match.arb ?? 0).toFixed(1) }}%
      </button>
      <div v-if="activeTooltip === 'arb' && match.arb_spread" class="absolute z-30 top-full left-0 mt-1 w-40 card p-2.5 text-xs shadow-xl">
        <div class="flex justify-between mb-1"><span class="text-[var(--text-muted)]">Home</span><span class="font-mono">{{ match.arb_spread[0] }}%</span></div>
        <div class="flex justify-between mb-1"><span class="text-[var(--text-muted)]">Draw</span><span class="font-mono">{{ match.arb_spread[1] }}%</span></div>
        <div class="flex justify-between"><span class="text-[var(--text-muted)]">Away</span><span class="font-mono">{{ match.arb_spread[2] }}%</span></div>
      </div>
    </td>
    <td class="cell px-3 py-2.5 text-[11px] text-[var(--text-muted)] font-mono">
      {{ Object.keys(match.bookmakers || {}).length }} books
    </td>
    <td class="cell px-3 py-2.5">
      <div class="flex items-center gap-2">
        <button v-if="match.history" class="btn btn-ghost !px-2 !py-1 text-[11px] focus-ring" @click="$emit('open-history')">History</button>
        <button class="btn btn-ghost !px-2 !py-1 text-[11px] focus-ring" @click="$emit('toggle-expand')" :aria-expanded="expanded">
          {{ expanded ? 'Collapse' : 'Expand' }}
        </button>
      </div>
    </td>
  </tr>

  <tr v-if="layout === 'table' && expanded" class="bg-[var(--bg-elevated)] border-b border-[var(--border-hair)]">
    <td colspan="7" class="px-4 py-3">
      <div class="text-[11px] uppercase tracking-wide text-[var(--text-muted)] mb-2">All bookmakers</div>
      <div class="grid gap-2" style="grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));">
        <div v-for="[book, arr] in bookmakerEntries" :key="book" class="flex items-center justify-between text-xs bg-[var(--bg-surface)] border border-[var(--border-hair)] rounded-md px-2.5 py-1.5">
          <span class="capitalize text-[var(--text-secondary)]">{{ book }}</span>
          <span class="font-mono">{{ arr.map(v => v.toFixed ? v.toFixed(2) : v).join(' | ') }}</span>
        </div>
      </div>
    </td>
  </tr>

  <!-- ============ MOBILE CARD ============ -->
  <div v-else class="card p-3.5 mb-2.5">
    <div class="flex items-start justify-between gap-2">
      <div class="min-w-0">
        <div class="text-[13px] font-medium truncate">{{ match.teams.join(' vs ') }}</div>
        <div class="text-[11px] text-[var(--text-muted)] font-mono mt-0.5">{{ match.category || '—' }} • {{ fmtTime(match.start_time) }}</div>
      </div>
      <div class="text-right shrink-0">
        <div class="font-mono text-sm font-semibold" :class="match.ev >= 5 ? 'text-[var(--ev-amber)]' : 'text-[var(--text-secondary)]'">EV {{ match.ev > 0 ? '+' : '' }}{{ (match.ev ?? 0).toFixed(1) }}%</div>
        <div class="font-mono text-xs" :class="match.arb > 0 ? 'text-[var(--arb-violet)]' : 'text-[var(--text-muted)]'">Arb {{ match.arb > 0 ? '+' : '' }}{{ (match.arb ?? 0).toFixed(1) }}%</div>
      </div>
    </div>

    <div class="flex flex-wrap gap-1.5 mt-2.5">
      <button v-for="[book, arr] in bookmakerEntries" :key="book" class="odd-pill focus-ring" :class="pillClass(book, 0, arr[0])" @click="clickOdd(book)">
        <span class="opacity-60 mr-1 text-[10px]">{{ book.slice(0,3).toUpperCase() }}</span>{{ arr[0] }}
      </button>
    </div>

    <div class="spread-track w-full mt-2.5">
      <div class="spread-fill" :style="{ width: spreadPct + '%' }"></div>
    </div>

    <div class="flex items-center gap-2 mt-3">
      <button v-if="match.history" class="btn btn-ghost !px-2 !py-1 text-[11px] flex-1 focus-ring" @click="$emit('open-history')">History</button>
      <button class="btn btn-ghost !px-2 !py-1 text-[11px] flex-1 focus-ring" @click="$emit('toggle-expand')">{{ expanded ? 'Collapse' : 'Expand' }}</button>
    </div>

    <div v-if="expanded" class="mt-3 pt-3 border-t border-[var(--border-hair)] space-y-2">
      <div v-for="[book, arr] in bookmakerEntries" :key="book" class="flex justify-between text-xs">
        <span class="capitalize text-[var(--text-secondary)]">{{ book }}</span>
        <span class="font-mono">{{ arr.join(' | ') }}</span>
      </div>
    </div>
  </div>
  `,
};
