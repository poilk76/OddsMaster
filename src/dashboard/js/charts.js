// js/charts.js
// Minimal dependency-free canvas line chart for odds history. Only HTML5
// Canvas is used — no charting library, matching the allowed tech stack.

const Charts = (() => {
  const SERIES_COLORS = {
    home: '#21c55d',
    draw: '#f5a623',
    away: '#f0466b',
  };

  /**
   * Draws one or more series on a canvas.
   * @param {HTMLCanvasElement} canvas
   * @param {{home:number[], draw:number[], away:number[]}} series
   * @param {string[]} visible keys to render, e.g. ['home','draw','away']
   */
  function drawLineChart(canvas, series, visible) {
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const w = Math.max(rect.width, 200);
    const h = Math.max(rect.height, 120);
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const pad = { top: 12, right: 12, bottom: 20, left: 36 };
    const plotW = w - pad.left - pad.right;
    const plotH = h - pad.top - pad.bottom;

    const activeKeys = visible.filter((k) => series[k] && series[k].length);
    if (!activeKeys.length) return;

    let min = Infinity, max = -Infinity;
    activeKeys.forEach((k) => series[k].forEach((v) => { min = Math.min(min, v); max = Math.max(max, v); }));
    if (min === max) { min -= 0.5; max += 0.5; }
    const pv = (max - min) * 0.08;
    min -= pv; max += pv;

    // gridlines
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    const rows = 4;
    ctx.fillStyle = 'rgba(154,167,184,0.7)';
    ctx.font = '10px JetBrains Mono, monospace';
    for (let i = 0; i <= rows; i++) {
      const y = pad.top + (plotH / rows) * i;
      ctx.beginPath();
      ctx.moveTo(pad.left, y);
      ctx.lineTo(w - pad.right, y);
      ctx.stroke();
      const val = max - ((max - min) / rows) * i;
      ctx.fillText(val.toFixed(2), 2, y + 3);
    }

    const maxLen = Math.max(...activeKeys.map((k) => series[k].length));
    const xFor = (i) => pad.left + (maxLen <= 1 ? 0 : (plotW * i) / (maxLen - 1));
    const yFor = (v) => pad.top + plotH - ((v - min) / (max - min)) * plotH;

    activeKeys.forEach((key) => {
      const data = series[key];
      ctx.strokeStyle = SERIES_COLORS[key] || '#4c8dff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      data.forEach((v, i) => {
        const x = xFor(i), y = yFor(v);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      });
      ctx.stroke();

      // last point marker
      const lastI = data.length - 1;
      ctx.fillStyle = SERIES_COLORS[key] || '#4c8dff';
      ctx.beginPath();
      ctx.arc(xFor(lastI), yFor(data[lastI]), 3, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  return { drawLineChart, SERIES_COLORS };
})();
