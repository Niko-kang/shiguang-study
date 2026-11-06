import './completion-celebration.css';

let dismiss: (() => void) | undefined;
/** Celebrate successful saves only; remote refreshes never call this. */
export function celebrateCompletion() {
  dismiss?.();
  const layer = document.createElement('div');
  layer.className = 'completion-celebration';
  layer.setAttribute('aria-hidden', 'true');
  document.body.append(layer);
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let frame = 0;
  const lifetime = 4200;
  const timeout = window.setTimeout(cleanup, lifetime);
  function cleanup() {
    window.clearTimeout(timeout);
    window.cancelAnimationFrame(frame);
    layer.remove();
    if (dismiss === cleanup) dismiss = undefined;
  }
  dismiss = cleanup;
  if (reduced) return;

  const canvas = document.createElement('canvas');
  canvas.className = 'completion-celebration-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  layer.prepend(canvas);
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const width = window.innerWidth, height = window.innerHeight;
  const scale = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = width * scale; canvas.height = height * scale;
  ctx.scale(scale, scale);
  const emojis = ['✨', '🌸', '💗', '⭐', '🩵', '🌸', '🎉', '✨', '💛', '🌷'];
  // Integrate velocity and gravity: a quick upward burst slows, then drifts down.
  const count = width < 600 ? 96 : 144;
  const particles = Array.from({length: count}, (_, i) => {
    const left = i % 2 === 0;
    const angle = (left ? -62 : -118) * Math.PI / 180 + (Math.random() - .5) * 1.1;
    const speed = (height * .013 + 5) * (.65 + Math.random() * .65);
    return {x: left ? -12 : width + 12, y: height * .76,
      vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
      size: 14 + Math.random() * 10, emoji: emojis[i % emojis.length],
      angle: (Math.random() - .5) * .5, spin: (Math.random() - .5) * .035,
      phase: Math.random() * Math.PI * 2, delay: i < count / 2 ? Math.random() * 100 : 220 + Math.random() * 180};
  });
  let start = 0, previous = 0;
  function draw(now: number) {
    if (!ctx) return;
    if (!start) { start = now; previous = now; }
    const elapsed = now - start;
    const step = Math.min((now - previous) / 16.667, 2); previous = now;
    ctx.clearRect(0, 0, width, height);
    for (const p of particles) {
      if (elapsed < p.delay) continue;
      p.x += p.vx * step; p.y += p.vy * step;
      p.vx *= Math.pow(.987, step); p.vy += .17 * step;
      p.angle += p.spin * step; p.phase += .09 * step;
      ctx.save();
      ctx.globalAlpha = Math.min(1, Math.max(0, (lifetime - elapsed) / 800));
      ctx.translate(p.x + Math.sin(p.phase) * 3, p.y);
      ctx.rotate(p.angle);
      ctx.font = `${p.size}px "Apple Color Emoji", "Segoe UI Emoji", sans-serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(p.emoji, 0, 0);
      ctx.restore();
    }
    if (elapsed < lifetime) frame = requestAnimationFrame(draw);
  }
  frame = requestAnimationFrame(draw);
}
