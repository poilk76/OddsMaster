// components/ServerStatus.js
const ServerStatus = {
  name: 'ServerStatus',
  setup() {
    const { computed, ref, onMounted, onUnmounted } = Vue;
    const store = Store;
    const now = ref(Date.now() / 1000);
    let timer = null;
    onMounted(() => { timer = setInterval(() => { now.value = Date.now() / 1000; }, 1000); });
    onUnmounted(() => clearInterval(timer));

    const servers = computed(() => Array.from(store.state.servers.values()).sort((a, b) => a.name.localeCompare(b.name)));

    function ageSeconds(s) { return Math.max(0, Math.floor(now.value - s.last_refresh)); }
    function ageLabel(s) {
      const a = ageSeconds(s);
      if (a < 60) return `Updated ${a}s ago`;
      if (a < 3600) return `Updated ${Math.floor(a / 60)}m ago`;
      return `Updated ${Math.floor(a / 3600)}h ago`;
    }
    function dotClass(s) {
      if (!s.online) return 'dot-red';
      const a = ageSeconds(s);
      if (a <= 10) return 'dot-green';
      if (a <= 60) return 'dot-yellow';
      return 'dot-red';
    }

    return { store, servers, ageLabel, dotClass };
  },
  template: `
  <section aria-label="Bookmaker server status">
    <div v-if="!servers.length" class="card px-4 py-4 text-sm text-[var(--text-muted)]">
      No bookmakers connected.
    </div>
    <div v-else class="grid gap-2.5" style="grid-template-columns: repeat(auto-fill, minmax(168px, 1fr));">
      <div v-for="s in servers" :key="s.name" class="card px-3.5 py-2.5">
        <div class="flex items-center justify-between">
          <span class="text-[13px] font-medium capitalize truncate">{{ s.name }}</span>
          <span class="dot" :class="dotClass(s)"></span>
        </div>
        <div class="text-[11px] text-[var(--text-muted)] mt-1 font-mono">{{ ageLabel(s) }}</div>
      </div>
    </div>
  </section>
  `,
};
