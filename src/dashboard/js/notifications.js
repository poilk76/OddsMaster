// js/notifications.js
// Presentation helpers for the notifications panel.

const NotifyHelpers = (() => {
  function timeAgo(ts) {
    const diff = Math.max(0, Date.now() - ts) / 1000;
    if (diff < 5) return 'just now';
    if (diff < 60) return `${Math.floor(diff)}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  }

  return { timeAgo };
})();
