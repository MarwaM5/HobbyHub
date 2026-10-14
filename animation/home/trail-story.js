/* Decorative journey only: preserve the original step anchors, copy and routes. */
(() => {
  'use strict';
  const clamp = (v) => Math.max(0, Math.min(1, v));
  const ease = (v) => {
    const p = clamp(v);
    return p * p * (3 - 2 * p);
  };
  function mount(section) {
    if (!section || section.dataset.trailStory) return () => {};
    section.dataset.trailStory = 'true';
    const cards = [...section.querySelectorAll('.stepCard')];
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    const scenes = [
      '<span class="hhTrailArt"></span><span class="hhDiscoveryHalo"></span><span class="hhDiscoveryLens"><i></i></span><span class="hhDiscoveryFind">Photography</span>',
      '<span class="hhTrailArt"></span><svg class="hhLearningPainting" viewBox="0 0 100 100"><path pathLength="1" d="M12 76L35 40L53 62L68 32L90 76M12 80Q50 70 90 80"/><circle pathLength="1" cx="30" cy="25" r="9"/></svg><span class="hhLearningBrush"></span><span class="hhLearningGlow"></span>',
      '<span class="hhGatherWorld"></span><svg class="hhGatherBridges" viewBox="0 0 300 200"><path pathLength="1" d="M86 124Q114 91 165 88"/><path pathLength="1" d="M178 92Q207 106 229 136"/><path pathLength="1" d="M91 134Q153 163 226 145"/><g class="hhGatherNodes"><circle cx="86" cy="124" r="2.5"/><circle cx="172" cy="90" r="2.5"/><circle cx="229" cy="140" r="2.5"/></g></svg><span class="hhConnectionLight">✦</span>',
      '<span class="hhGrowthSeed"></span><span class="hhGrowthTree"></span><span class="hhGrowthLight"></span><span class="hhGrowthMoment">A little practice. A little growth.</span>',
    ];
    const states = cards.map((card, index) => {
      const stage = document.createElement('span');
      stage.className = 'hhTrailStage';
      stage.dataset.chapter = index;
      stage.setAttribute('aria-hidden', 'true');
      stage.innerHTML = scenes[index];
      card.prepend(stage);
      return { card, stage, index, visible: false, elapsed: 0, started: false, complete: false };
    });
    let frame = 0,
      previous = 0,
      dead = false;
    function paint(state, time) {
      const { stage, index } = state;
      const p = preference.matches ? 1 : clamp(time / 3200);
      stage.style.setProperty('--chapter-progress', p);
      stage.style.setProperty('--chapter-ease', ease(p));
      if (index === 0) {
        const target = p < 0.38 ? 0 : p < 0.7 ? 1 : 2;
        const positions = [
          [26, 31],
          [68, 28],
          [77, 57],
        ];
        const [x, y] = positions[target];
        stage.style.setProperty('--lens-x', x + '%');
        stage.style.setProperty('--lens-y', y + '%');
        stage.querySelector('.hhDiscoveryFind').textContent = ['Photography', 'Music', 'Painting'][
          target
        ];
      }
      if (index === 1) {
        stage.style.setProperty('--paint', ease((p - 0.12) / 0.7));
        stage.style.setProperty('--brush-x', 55 + Math.sin(p * Math.PI * 3) * 9 + '%');
        stage.style.setProperty('--brush-y', 23 + p * 25 + '%');
        stage.style.setProperty('--brush-angle', -28 + Math.sin(p * 8) * 12 + 'deg');
      }
      if (index === 2) stage.style.setProperty('--bridge', ease((p - 0.35) / 0.6));
      if (index === 3) {
        stage.style.setProperty('--tree', ease((p - 0.12) / 0.78));
        stage.style.setProperty('--seed', 1 - ease((p - 0.12) / 0.25));
      }
      state.card.classList.toggle('hhTrailPlaying', p > 0 && p < 1);
      state.card.classList.toggle('hhTrailFinished', p >= 1);
      state.complete = p >= 1;
    }
    function tick(now) {
      frame = 0;
      if (dead || document.hidden) {
        previous = 0;
        return;
      }
      const delta = previous ? Math.min(64, now - previous) : 0;
      previous = now;
      let busy = false;
      states.forEach((state) => {
        if (!state.visible || state.complete) return;
        state.elapsed += delta;
        // Every visible chapter begins immediately, without a stagger.
        state.started = true;
        paint(state, state.elapsed);
        busy = true;
      });
      if (busy) frame = requestAnimationFrame(tick);
      else previous = 0;
    }
    function queue() {
      if (
        !frame &&
        !dead &&
        !document.hidden &&
        !preference.matches &&
        states.some((s) => s.visible && !s.complete)
      )
        frame = requestAnimationFrame(tick);
    }
    states.forEach((s) => paint(s, preference.matches ? 3200 : 0));
    let observer;
    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const state = states.find((s) => s.card === entry.target);
            if (state) state.visible = entry.isIntersecting;
          });
          queue();
        },
        { threshold: 0.2 },
      );
      states.forEach((s) => observer.observe(s.card));
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
      if (preference.matches) states.forEach((s) => paint(s, 3200));
      else queue();
    }
    document.addEventListener('visibilitychange', visibility);
    preference.addEventListener('change', motion);
    return () => {
      dead = true;
      cancelAnimationFrame(frame);
      observer?.disconnect();
      document.removeEventListener('visibilitychange', visibility);
      preference.removeEventListener('change', motion);
    };
  }
  window.TrailStory = { mount };
})();
