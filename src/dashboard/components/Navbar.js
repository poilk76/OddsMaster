// components/Navbar.js
const Navbar = {
  name: 'Navbar',
  emits: ['refresh', 'toggle-notifications', 'toggle-settings'],
  setup(_, { emit }) {
    const { computed, ref } = Vue;
    const store = Store;
    const refreshing = ref(false);

    const connLabel = computed(() => ({
      connected: 'Connected',
      reconnecting: 'Reconnecting',
      offline: 'Offline',
    }[store.state.connection]));

    const connDot = computed(() => ({
      connected: 'dot-green',
      reconnecting: 'dot-yellow dot-pulse',
      offline: 'dot-red',
    }[store.state.connection]));

    async function doRefresh() {
      refreshing.value = true;
      emit('refresh');
      setTimeout(() => { refreshing.value = false; }, 600);
    }

    return { store, refreshing, connLabel, connDot, doRefresh, unread: store.unreadCount };
  },
  template: `
  <header class="glass-nav sticky top-0 z-40">
    <div class="brand-hairline"></div>
    <div class="max-w-[1600px] mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">

      <div class="flex items-center gap-2 shrink-0">
        <div class="w-8 h-8 rounded-lg bg-[var(--brand)] flex items-center justify-center">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3 17L9 11L13 15L21 6" stroke="#06101f" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </div>
        <span class="font-display font-semibold text-[15px] tracking-tight hidden sm:inline">OddsMaster</span>
      </div>

      <div class="flex-1 max-w-md">
        <div class="relative">
          <svg class="absolute left-2.5 top-1/2 -translate-y-1/2 opacity-50" width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2"/><path d="M21 21l-4.3-4.3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
          <input v-model="store.state.search" type="text" placeholder="Search teams…"
            class="input focus-ring w-full pl-8" aria-label="Search matches" />
        </div>
      </div>

      <div class="flex items-center gap-2 ml-auto">
        <button class="btn focus-ring" @click="doRefresh" :disabled="refreshing" aria-label="Refresh matches">
          <svg :class="refreshing ? 'animate-spin' : ''" width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M21 12a9 9 0 1 1-3-6.7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M21 3v6h-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          <span class="hidden md:inline">Refresh</span>
        </button>

        <div class="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-[var(--border-mid)] text-xs text-[var(--text-secondary)]">
          <span class="dot" :class="connDot"></span>{{ connLabel }}
        </div>

        <button class="btn btn-ghost relative focus-ring" @click="$emit('toggle-notifications')" aria-label="Notifications">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M6 8a6 6 0 1 1 12 0c0 4 1.5 5.5 1.5 5.5H4.5S6 12 6 8Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M10 19a2 2 0 0 0 4 0" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
          <span v-if="unread" class="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-[var(--negative)] text-[9px] leading-4 text-white text-center font-semibold">{{ unread > 9 ? '9+' : unread }}</span>
        </button>

        <button class="btn btn-ghost focus-ring" @click="$emit('toggle-settings')" aria-label="Settings">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1Z" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
      </div>
    </div>

    <div v-if="store.state.connection === 'reconnecting'" class="reconnect-banner text-center text-xs py-1.5 font-medium">
      Reconnecting…
    </div>
  </header>
  `,
};
