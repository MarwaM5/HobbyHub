/* Independent pin-origin motion, so reveal animations cannot replace the paper sway. */
(() => {
  'use strict';
  function mount(section) {
    if (!section || section.dataset.memoryBreeze) return () => {};
    section.dataset.memoryBreeze = 'true';
    section.classList.add('hhLivingMemories');
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    const states = [...section.querySelectorAll('.hhMemoryCard')].map((paper, index) => {
      const angle = parseFloat(paper.style.getPropertyValue('--paper-angle'));
      paper.style.animation = 'none';
      return { paper, index, angle: Number.isFinite(angle) ? angle : 0, visible: false };
    });
    let frame = 0,
      previous = 0,
      elapsed = 0,
      dead = false;
    function paint(force = false) {
      states.forEach(({ paper, index, angle, visible }) => {
        if (!visible && !force) return;
        if (preference.matches) {
          paper.style.transform = `rotate(${angle}deg)`;
          return;
        }
        const wave = Math.sin(elapsed * 0.00115 + index * 1.8),
          cross = Math.cos(elapsed * 0.0009 + index * 1.8);
        paper.style.transform = `perspective(950px) rotate(${angle + wave * 0.85}deg) rotateX(${wave * 5}deg) rotateY(${cross * 1.2}deg) translate3d(0,${wave * 3}px,${wave * 6}px)`;
      });
    }
    function tick(now) {
      frame = 0;
      if (dead || document.hidden || preference.matches) {
        previous = 0;
        return;
      }
      elapsed += previous ? Math.min(64, now - previous) : 0;
      previous = now;
      paint();
      if (states.some((s) => s.visible)) frame = requestAnimationFrame(tick);
      else previous = 0;
    }
    function queue() {
      if (
        !dead &&
        !frame &&
        !document.hidden &&
        !preference.matches &&
        states.some((s) => s.visible)
      )
        frame = requestAnimationFrame(tick);
    }
    let observer;
    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const state = states.find((s) => s.paper === entry.target);
            if (state) state.visible = entry.isIntersecting;
          });
          queue();
        },
        { threshold: 0.04 },
      );
      states.forEach((s) => observer.observe(s.paper));
    } else {
      states.forEach((s) => (s.visible = true));
      queue();
    }
    function visibility() {
      if (document.hidden) {
        cancelAnimationFrame(frame);
        frame = 0;
        previous = 0;
      } else queue();
    }
    function motion() {
      cancelAnimationFrame(frame);
      frame = 0;
      previous = 0;
      paint(true);
      queue();
    }
    document.addEventListener('visibilitychange', visibility);
    preference.addEventListener('change', motion);
    paint(true);
    return () => {
      dead = true;
      cancelAnimationFrame(frame);
      observer?.disconnect();
      document.removeEventListener('visibilitychange', visibility);
      preference.removeEventListener('change', motion);
    };
  }
  window.MemoryBreeze = { mount };
})();
