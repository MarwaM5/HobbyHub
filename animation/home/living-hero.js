/* Cinematic cutout composition: dimensional rendered artwork, not low-detail mesh substitutes. */
(() => {
  'use strict';
  const clamp = (n) => Math.max(0, Math.min(1, n));
  const ease = (n) => 1 - Math.pow(1 - clamp(n), 3);
  function mount(hero) {
    const stage = hero.querySelector('.hhLivingUniverse');
    if (!stage) return null;
    const preference = HobbyWorld.preference;
    const canvas = stage.querySelector('.hhLivingVortex');
    const ctx = canvas.getContext('2d');
    const backdrop = hero.querySelector('.hhPortalBackdrop');
    const sprites = [];
    const cleanups = [];
    let elapsed = 0,
      last = 0,
      frame = 0,
      lastPaint = -1,
      visible = true,
      destroyed = false;
    let progress = 0,
      targetProgress = 0,
      width = 1,
      height = 1;
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    let portal = { x: 1, y: 1, w: 1, h: 1 };
    // Each tile is a separately rendered hobby prop, selected from the project's hobby vocabulary.
    const placements = [
      [0, 48, 32, 148, -12],
      [1, 73, 27, 166, 16],
      [2, 55, 70, 136, -16],
      [4, 67, 82, 140, -8],
      [5, 87, 15, 86, 13],
      [6, 95, 41, 94, -9],
      [7, 45, 82, 102, -16],
      [8, 85, 57, 98, 12],
      [9, 63, 10, 80, -11],
      [12, 51, 13, 72, -8],
      [13, 95, 81, 79, 8],
      [15, 60, 89, 88, 9],
      [16, 44, 54, 96, -16],
      [17, 12, 13, 79, -9],
      [18, 29, 87, 77, 15],
      [23, 80, 88, 78, -14],
    ];
    const kinds = { 0: 'camera', 1: 'guitar', 4: 'book' };
    const mobile = innerWidth < 768;
    const selected = placements.slice(0, mobile ? 10 : placements.length);
    selected.forEach((placement, i) => addSprite(placement, i, false));
    // The small scroll wave introduces distinct props instead of repeating the first wave.
    const scrollProps = [
      [10, 91, 85, 65, 7],
      [11, 97, 22, 65, 12],
      [19, 35, 11, 64, -8],
      [22, 25, 88, 61, -10],
    ];
    scrollProps
      .slice(0, mobile ? 2 : scrollProps.length)
      .forEach((p, i) => addSprite(p, i + selected.length, true));
    function addSprite([tile, x, y, size, angle], index, secondary) {
      const node = document.createElement('span');
      node.className = 'hhLivingArtifact';
      node.dataset.kind = kinds[tile] || 'hobby';
      const art = document.createElement('span');
      art.className = 'hhLivingArtifactArt';
      art.style.backgroundPosition = `${(tile % 6) * 20}% ${(Math.floor(tile / 6) * 100) / 3}%`;
      node.appendChild(art);
      stage.querySelector('.hhArtifactField').appendChild(node);
      sprites.push({ node, art, x, y, size, angle, index, tile, secondary });
    }
    function listen(target, name, fn, options) {
      target.addEventListener(name, fn, options);
      cleanups.push(() => target.removeEventListener(name, fn, options));
    }
    function layout() {
      const h = hero.getBoundingClientRect(),
        r = backdrop.getBoundingClientRect();
      width = h.width;
      height = h.height;
      const s = Math.max(r.width / 1672, r.height / 941);
      const ox = (r.width - s * 1672) * (innerWidth < 1100 ? 0.75 : 0.69);
      const oy = (r.height - s * 941) * 0.5;
      portal = {
        // Measured inner stone opening in the unchanged 1672 × 941 backplate.
        x: r.left - h.left + ox + 1250 * s,
        y: r.top - h.top + oy + 372 * s,
        w: 264 * s,
        h: 470 * s,
      };
      stage.style.setProperty('--live-portal-x', portal.x + 'px');
      stage.style.setProperty('--live-portal-y', portal.y + 'px');
      stage.style.setProperty('--live-portal-w', portal.w + 'px');
      stage.style.setProperty('--live-portal-h', portal.h + 'px');
      const dpr = Math.min(devicePixelRatio || 1, 1.5);
      canvas.width = Math.max(1, Math.round(portal.w * dpr));
      canvas.height = Math.max(1, Math.round(portal.h * dpr));
      lastPaint = -1;
      request();
    }
    function vortex(time, energy) {
      if (!ctx) return;
      const w = canvas.width,
        h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      ctx.save();
      ctx.translate(w / 2, h / 2);
      ctx.scale(w / 2, h / 2);
      const core = ctx.createRadialGradient(0, 0, 0.01, 0, 0, 1);
      core.addColorStop(0, 'rgba(255,255,238,.64)');
      core.addColorStop(0.24, 'rgba(255,232,184,.26)');
      core.addColorStop(0.7, 'rgba(237,112,82,.12)');
      core.addColorStop(1, 'rgba(246,161,90,0)');
      ctx.fillStyle = core;
      ctx.fillRect(-1, -1, 2, 2);
      for (let arm = 0; arm < 4; arm++) {
        for (let layer = 0; layer < 2; layer++) {
          ctx.beginPath();
          for (let i = 0; i <= 100; i++) {
            const r = 0.025 + (i / 100) * 0.94;
            const a =
              (arm * Math.PI) / 2 +
              r * (7 + energy * 2) -
              time * (0.38 + energy * 0.55) +
              layer * 0.04;
            const x = Math.cos(a) * r,
              y = Math.sin(a) * r;
            i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
          }
          ctx.strokeStyle = layer
            ? 'rgba(255,250,221,.55)'
            : arm % 2
              ? 'rgba(246,161,90,.52)'
              : 'rgba(255,181,161,.45)';
          ctx.lineWidth = layer ? 0.012 : 0.037;
          ctx.stroke();
        }
      }
      for (let i = 0; i < 16; i++) {
        const r = 0.15 + ((i * 0.173 + time * 0.045) % 0.8);
        const a = i * 2.399 - time * 0.35;
        ctx.beginPath();
        ctx.arc(Math.cos(a) * r, Math.sin(a) * r, 0.006 + (i % 3) * 0.002, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,251,220,.8)';
        ctx.fill();
      }
      ctx.restore();
    }
    function draw(dt) {
      const reduced = preference.matches;
      const smoothing = 1 - Math.exp(-dt * 6);
      if (!reduced) elapsed += dt;
      progress = reduced ? 0 : progress + (targetProgress - progress) * smoothing;
      pointer.x = reduced ? 0 : pointer.x + (pointer.tx - pointer.x) * smoothing;
      pointer.y = reduced ? 0 : pointer.y + (pointer.ty - pointer.y) * smoothing;
      const t = reduced ? 6 : elapsed;
      const open = reduced || progress > 0.08 ? 1 : ease((t - 0.6) / 1.25);
      stage.style.setProperty('--door-open', open);
      stage.style.setProperty('--portal-breathe', 1 + (reduced ? 0 : Math.sin(t * 0.65) * 0.012));
      stage.style.setProperty(
        '--portal-glow',
        reduced ? 0.75 : 0.56 + Math.sin(t * 0.9) * 0.09 + progress * 0.12
      );
      stage.style.setProperty(
        '--opening-flare',
        reduced ? 0 : Math.sin(Math.PI * clamp((t - 0.55) / 2)) * 0.5
      );
      const storm = Math.sin(progress * Math.PI);
      sprites.forEach(({ node, art, x, y, size, angle, index, tile, secondary }) => {
        const birth = reduced || progress > 0.1 ? 1 : ease((t - 1.05 - index * 0.042) / 1.25);
        const scaled = size * Math.max(0.66, Math.min(width / 1440, 1.25));
        const restX = mobile ? width * (0.12 + (index % 4) * 0.25) : (width * x) / 100;
        const restY = mobile
          ? height * (0.54 + Math.floor((index % 12) / 4) * 0.16)
          : (height * y) / 100;
        const phase = index * 2.399 + progress * Math.PI * (index % 2 ? -2.3 : 2.3);
        const radius = portal.w * (0.5 + progress * 1.5);
        const orbitX = portal.x + Math.cos(phase) * radius;
        const orbitY = portal.y + Math.sin(phase) * radius * 0.7;
        const arc = Math.sin(birth * Math.PI);
        let px = portal.x + (restX - portal.x) * birth + arc * (index % 2 ? 80 : -100);
        let py = portal.y + (restY - portal.y) * birth - arc * (70 + (index % 4) * 20);
        px +=
          (orbitX - restX) * storm * 0.45 +
          (index % 2 ? 1 : -1) * progress * progress * width * 0.13;
        py += (orbitY - restY) * storm * 0.45 + progress * progress * height * 0.16;
        const bob = reduced
          ? 0
          : Math.sin(t * (0.38 + (index % 3) * 0.04) + index) * (3 + (index % 3));
        const z = reduced ? 0 : arc * 160 + storm * (80 + (index % 4) * 30);
        const rotation =
          angle +
          (reduced ? 0 : Math.sin(t * 0.38 + index)) +
          (1 - birth) * (index % 2 ? 90 : -90) +
          storm * (index % 2 ? 18 : -18);
        node.style.width = node.style.height = scaled + 'px';
        node.style.opacity = secondary ? clamp((progress - 0.08) * 4) : clamp(birth * 4);
        node.style.transform = `translate3d(${px - scaled / 2 + pointer.x * 5}px,${py - scaled / 2 + bob - pointer.y * 4}px,${z}px) rotateZ(${rotation}deg) rotateY(${pointer.x * 5}deg) scale(${0.08 + birth * 0.92})`;
        art.style.setProperty(
          '--artifact-pulse',
          tile === 3 && !reduced ? 1 + Math.sin(t * 0.9) * 0.018 : 1
        );
        art.style.setProperty('--lens-angle', (reduced ? 0 : t * 7.5) + 'deg');
        art.style.setProperty(
          '--string-vibration',
          (!reduced && tile === 1 ? Math.sin(t * 4) * 0.35 : 0) + 'px'
        );
      });
      if (reduced || t - lastPaint > 0.033) {
        vortex(reduced ? 0 : t, reduced ? 0 : progress);
        lastPaint = t;
      }
      hero.style.setProperty('--landscape-x', pointer.x * -3 + 'px');
      hero.style.setProperty('--landscape-y', pointer.y * -2 + 'px');
    }
    function loop(now) {
      frame = 0;
      if (destroyed || !visible || document.hidden) return;
      const dt = last ? Math.min((now - last) / 1000, 0.04) : 0.016;
      last = now;
      draw(dt);
      if (!preference.matches) request();
    }
    function request() {
      if (!frame && !destroyed && visible && !document.hidden) frame = requestAnimationFrame(loop);
    }
    listen(
      hero,
      'pointermove',
      (e) => {
        if (preference.matches || e.pointerType === 'touch') return;
        const r = hero.getBoundingClientRect();
        pointer.tx = ((e.clientX - r.left) / r.width) * 2 - 1;
        pointer.ty = ((e.clientY - r.top) / r.height) * 2 - 1;
      },
      { passive: true }
    );
    listen(hero, 'pointerleave', () => {
      pointer.tx = pointer.ty = 0;
    });
    listen(window, 'resize', layout, { passive: true });
    listen(preference, 'change', () => {
      elapsed = Math.max(elapsed, 4);
      last = 0;
      request();
    });
    listen(document, 'visibilitychange', () => {
      last = 0;
      if (document.hidden) {
        cancelAnimationFrame(frame);
        frame = 0;
      } else request();
    });
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        visible = entries[0].isIntersecting;
        last = 0;
        if (visible) request();
        else {
          cancelAnimationFrame(frame);
          frame = 0;
        }
      });
      io.observe(hero);
      cleanups.push(() => io.disconnect());
    }
    layout();
    return {
      setProgress(value) {
        targetProgress = clamp(value);
        request();
      },
      destroy() {
        destroyed = true;
        cancelAnimationFrame(frame);
        cleanups.forEach((fn) => fn());
        sprites.forEach(({ node }) => node.remove());
      },
    };
  }
  window.LivingHero = Object.freeze({ mount });
})();
