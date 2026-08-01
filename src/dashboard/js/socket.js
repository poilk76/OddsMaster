// js/socket.js
// Socket.IO wiring. Event names/payload shapes are fixed by the backend
// contract (servers_update, update) — do not rename or reshape them here.

const SocketBridge = (() => {
  let socket = null;
  const listeners = {
    state: new Set(),        // 'connected' | 'reconnecting' | 'offline'
    servers_update: new Set(),
    update: new Set(),
  };

  function emit(kind, payload) {
    listeners[kind].forEach((fn) => {
      try { fn(payload); } catch (e) { console.error(`[socket] listener error (${kind})`, e); }
    });
  }

  function connect(url) {
    // If Socket.IO client isn't loaded (e.g. no backend configured for this
    // static preview), fall back to demo mode so the UI is still explorable.
    if (typeof io === 'undefined') {
      console.warn('[socket] Socket.IO client not found — running in demo mode.');
      emit('state', 'offline');
      return null;
    }

    socket = io(url || undefined, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 800,
      reconnectionDelayMax: 5000,
    });

    socket.on('connect', () => emit('state', 'connected'));
    socket.on('disconnect', () => emit('state', 'reconnecting'));
    socket.on('reconnect_attempt', () => emit('state', 'reconnecting'));
    socket.on('reconnect_failed', () => emit('state', 'offline'));
    socket.on('connect_error', () => emit('state', 'reconnecting'));

    socket.on('servers_update', (payload) => emit('servers_update', payload));
    socket.on('update', (payload) => emit('update', payload));

    return socket;
  }

  function on(kind, fn) {
    if (!listeners[kind]) return () => {};
    listeners[kind].add(fn);
    return () => listeners[kind].delete(fn);
  }

  function isConnected() {
    return !!(socket && socket.connected);
  }

  return { connect, on, isConnected, emitInternal: emit };
})();
