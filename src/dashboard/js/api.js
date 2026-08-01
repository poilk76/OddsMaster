// js/api.js
// Thin REST wrapper. Endpoint shapes are fixed by the backend contract —
// do not change paths, params, or response handling here.

const Api = (() => {
  // Change this if the backend is served from a different origin.
  const BASE_URL = '';

  function qs(params) {
    const usp = new URLSearchParams();
    Object.entries(params || {}).forEach(([k, v]) => {
      if (v === undefined || v === null || v === '' ) return;
      if (Array.isArray(v)) {
        if (v.length) usp.set(k, v.join(','));
      } else {
        usp.set(k, v);
      }
    });
    const s = usp.toString();
    return s ? `?${s}` : '';
  }

  /**
   * GET /matches
   * @param {{category?:string, sources?:string[], from?:number, to?:number}} params
   */
  async function getMatches(params = {}) {
    const url = `${BASE_URL}/matches${qs(params)}`;
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`GET /matches failed: ${res.status}`);
      return await res.json();
    } catch (e) {
      if (typeof Demo !== 'undefined') {
        console.warn('[api] /matches unreachable — serving demo data.');
        return Demo.genInitialMatches(600);
      }
      throw e;
    }
  }

  /**
   * GET /matches/{id}/history
   * @param {string} id
   */
  async function getMatchHistory(id) {
    const url = `${BASE_URL}/matches/${encodeURIComponent(id)}/history`;
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`GET /matches/${id}/history failed: ${res.status}`);
      return await res.json();
    } catch (e) {
      if (typeof Demo !== 'undefined') {
        console.warn(`[api] /matches/${id}/history unreachable — serving demo data.`);
        return Demo.genHistory();
      }
      throw e;
    }
  }

  return { getMatches, getMatchHistory };
})();
