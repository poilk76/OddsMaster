// components/HistoryModal.js
const HistoryModal = {
  name: 'HistoryModal',
  props: {
    match: { type: Object, default: null },
  },
  emits: ['close'],
  setup(props, { emit }) {
    const { ref, reactive, watch, nextTick, onMounted, onUnmounted } = Vue;
    const store = Store;
    const loading = ref(false);
    const error = ref('');
    const canvasEl = ref(null);
    const activeSeries = ref(['home', 'draw', 'away']); // 'All' by default
    const seriesData = reactive({ home: [], draw: [], away: [] });

    function setMode(mode) {
      if (mode === 'all') activeSeries.value = ['home', 'draw', 'away'];
      else activeSeries.value = [mode];
      redraw();
    }

    function redraw() {
      nextTick(() => Charts.drawLineChart(canvasEl.value, seriesData, activeSeries.value));
    }

    async function load(id) {
      error.value = '';
      seriesData.home = []; seriesData.draw = []; seriesData.away = [];
      if (store.state.historyCache[id]) {
        applyHistory(store.state.historyCache[id]);
        return;
      }
      loading.value = true;
      try {
        const data = await Api.getMatchHistory(id);
        store.state.historyCache[id] = data;
        applyHistory(data);
      } catch (e) {
        error.value = 'Could not load history.';
      } finally {
        loading.value = false;
      }
    }

    function applyHistory(data) {
      seriesData.home = data.map((r) => r[0]);
      seriesData.draw = data.map((r) => r[1]);
      seriesData.away = data.map((r) => r[2]);
      redraw();
    }

    watch(() => props.match && props.match.id, (id) => { if (id) load(id); });

    function onResize() { redraw(); }
    onMounted(() => window.addEventListener('resize', onResize));
    onUnmounted(() => window.removeEventListener('resize', onResize));

    function fmtLastUpdate() {
      if (!props.match) return '';
      return new Date(props.match.start_time * 1000).toLocaleString();
    }

    function close() { emit('close'); }
    function onKeydown(e) { if (e.key === 'Escape') close(); }

    return { loading, error, canvasEl, activeSeries, setMode, close, onKeydown, fmtLastUpdate };
  },
  template: `
  <div v-if="match" class="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop" @click.self="close" @keydown="onKeydown">
    <div class="modal-panel w-full max-w-2xl max-h-[85vh] overflow-auto" role="dialog" aria-modal="true" :aria-label="'History for ' + match.teams.join(' vs ')">
      <div class="flex items-start justify-between p-4 border-b border-[var(--border-hair)]">
        <div>
          <div class="font-display font-semibold text-base">{{ match.teams.join(' vs ') }}</div>
          <div class="text-xs text-[var(--text-muted)] font-mono mt-0.5">Last update: {{ fmtLastUpdate() }}</div>
        </div>
        <button class="btn btn-ghost focus-ring" @click="close" aria-label="Close history">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        </button>
      </div>

      <div class="p-4">
        <div class="flex flex-wrap gap-2 mb-3 text-xs">
          <span class="chip">1: {{ match.bookmakers && Object.values(match.bookmakers)[0] ? Object.values(match.bookmakers)[0][0] : '—' }}</span>
          <span class="chip">X: {{ match.bookmakers && Object.values(match.bookmakers)[0] ? Object.values(match.bookmakers)[0][1] : '—' }}</span>
          <span class="chip">2: {{ match.bookmakers && Object.values(match.bookmakers)[0] ? Object.values(match.bookmakers)[0][2] : '—' }}</span>
        </div>

        <div v-if="loading" class="flex items-center justify-center h-40">
          <svg class="animate-spin" width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M21 12a9 9 0 1 1-3-6.7" stroke="var(--brand)" stroke-width="2.5" stroke-linecap="round"/></svg>
        </div>
        <div v-else-if="error" class="text-sm text-[var(--negative)] py-6 text-center">{{ error }}</div>
        <template v-else>
          <canvas ref="canvasEl" class="w-full" style="height:220px;"></canvas>

          <div class="flex gap-2 mt-3">
            <button class="btn focus-ring text-xs" :class="activeSeries.length===1 && activeSeries[0]==='home' ? 'btn-primary' : ''" @click="setMode('home')">Home</button>
            <button class="btn focus-ring text-xs" :class="activeSeries.length===1 && activeSeries[0]==='draw' ? 'btn-primary' : ''" @click="setMode('draw')">Draw</button>
            <button class="btn focus-ring text-xs" :class="activeSeries.length===1 && activeSeries[0]==='away' ? 'btn-primary' : ''" @click="setMode('away')">Away</button>
            <button class="btn focus-ring text-xs" :class="activeSeries.length===3 ? 'btn-primary' : ''" @click="setMode('all')">All</button>
          </div>

          <div class="flex gap-4 mt-3 text-xs text-[var(--text-muted)]">
            <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full" style="background:#21c55d"></span>Home</span>
            <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full" style="background:#f5a623"></span>Draw</span>
            <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full" style="background:#f0466b"></span>Away</span>
          </div>
        </template>
      </div>
    </div>
  </div>
  `,
};
