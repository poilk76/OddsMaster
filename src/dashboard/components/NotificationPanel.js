// components/NotificationPanel.js
const NotificationPanel = {
  name: 'NotificationPanel',
  emits: ['close'],
  setup(_, { emit }) {
    const store = Store;
    function clearAll() { store.state.notifications = []; }
    function markAllRead() { store.state.notifications.forEach((n) => { n.read = true; }); }
    function toggleSound() { store.state.notifSoundOn = !store.state.notifSoundOn; }
    return { store, clearAll, markAllRead, toggleSound, timeAgo: NotifyHelpers.timeAgo };
  },
  template: `
  <div class="fixed inset-0 z-40" @click="$emit('close')">
    <div class="absolute right-4 sm:right-6 top-16 w-80 max-w-[92vw] modal-panel max-h-[70vh] flex flex-col" @click.stop>
      <div class="flex items-center justify-between p-3 border-b border-[var(--border-hair)]">
        <span class="font-medium text-sm">Notifications</span>
        <div class="flex items-center gap-1">
          <button class="btn btn-ghost !px-2 !py-1 text-[11px] focus-ring" @click="toggleSound">
            {{ store.state.notifSoundOn ? '🔔 Sound on' : '🔕 Sound off' }}
          </button>
        </div>
      </div>

      <div class="overflow-auto flex-1">
        <div v-if="!store.state.notifications.length" class="p-6 text-center text-xs text-[var(--text-muted)]">
          No notifications yet.
        </div>
        <button v-for="n in store.state.notifications" :key="n.id" @click="n.read = true"
          class="w-full text-left px-3.5 py-2.5 border-b border-[var(--border-hair)] hover:bg-[var(--bg-hover)] focus-ring">
          <div class="flex items-start gap-2">
            <span class="dot mt-1" :class="n.read ? 'bg-[var(--border-mid)]' : 'dot-green'"></span>
            <div class="min-w-0">
              <div class="text-xs text-[var(--text-primary)]">{{ n.text }}</div>
              <div class="text-[10px] text-[var(--text-muted)] font-mono mt-0.5">{{ timeAgo(n.ts) }}</div>
            </div>
          </div>
        </button>
      </div>

      <div class="p-2.5 border-t border-[var(--border-hair)] flex gap-2">
        <button class="btn focus-ring text-xs flex-1" @click="markAllRead">Mark all read</button>
        <button class="btn focus-ring text-xs flex-1" @click="clearAll">Clear all</button>
      </div>
    </div>
  </div>
  `,
};
