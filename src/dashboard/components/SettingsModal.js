// components/SettingsModal.js
const SettingsModal = {
  name: 'SettingsModal',
  props: { visible: { type: Boolean, default: false } },
  emits: ['close'],
  setup() {
    const store = Store;
    const timezones = ['UTC', 'Europe/Warsaw', 'Europe/London', 'America/New_York', 'America/Los_Angeles', 'Asia/Tokyo'];
    function saveDefaults() {
      store.state.settingsDefaultFilters = JSON.parse(JSON.stringify(store.state.filters));
      store.pushNotification('Default filters saved');
    }
    return { store, timezones, saveDefaults };
  },
  template: `
  <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop" @click.self="$emit('close')">
    <div class="modal-panel w-full max-w-md" role="dialog" aria-modal="true" aria-label="Settings">
      <div class="flex items-center justify-between p-4 border-b border-[var(--border-hair)]">
        <span class="font-display font-semibold">Settings</span>
        <button class="btn btn-ghost focus-ring" @click="$emit('close')" aria-label="Close settings">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        </button>
      </div>

      <div class="p-4 space-y-4 text-sm">
        <div class="flex items-center justify-between">
          <span>Compact mode</span>
          <input type="checkbox" v-model="store.state.settings.compactMode" class="accent-[var(--brand)] w-4 h-4" />
        </div>
        <div class="flex items-center justify-between">
          <span>Animations</span>
          <input type="checkbox" v-model="store.state.settings.animationsOn" class="accent-[var(--brand)] w-4 h-4" />
        </div>
        <div class="flex items-center justify-between">
          <span>Notification sound</span>
          <input type="checkbox" v-model="store.state.settings.notifSound" class="accent-[var(--brand)] w-4 h-4" />
        </div>
        <div class="flex items-center justify-between">
          <span>Refresh shortcut (R)</span>
          <input type="checkbox" v-model="store.state.settings.refreshShortcut" class="accent-[var(--brand)] w-4 h-4" />
        </div>
        <div class="flex items-center justify-between gap-3">
          <span class="shrink-0">Timezone</span>
          <select v-model="store.state.settings.timezone" class="input focus-ring w-44">
            <option v-for="tz in timezones" :key="tz" :value="tz">{{ tz }}</option>
          </select>
        </div>
        <div class="flex items-center justify-between gap-3">
          <span class="shrink-0">Odds format</span>
          <select v-model="store.state.settings.oddsFormat" class="input focus-ring w-44">
            <option value="decimal">Decimal</option>
            <option value="fractional">Fractional</option>
            <option value="american">American</option>
          </select>
        </div>

        <div class="pt-2 border-t border-[var(--border-hair)]">
          <button class="btn focus-ring w-full" @click="saveDefaults">Save current filters as default</button>
        </div>
      </div>
    </div>
  </div>
  `,
};
