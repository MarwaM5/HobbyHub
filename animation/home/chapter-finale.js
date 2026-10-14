/* Always-open book world, with continuous visible-only artifact motion. */
(() => {
  'use strict';
  function mount(section) {
    if (!section || section.dataset.chapterFinale) return null;
    section.dataset.chapterFinale = 'true';
    section.classList.add('hhFinalChapter');
    const scene = section.querySelector('.hhBookScene'),
      viewport = section.querySelector('#hhBookViewport');
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    const configs = [
      { tile: 0, x: 21, y: 34, size: 14, angle: -14 },
      { tile: 17, x: 32, y: 16, size: 14, angle: 10 },
      { tile: 1, x: 71, y: 22, size: 14, angle: 12 },
      { tile: 2, x: 82, y: 46, size: 12, angle: -12 },
      { tile: 18, x: 13, y: 53, size: 11, angle: 18 },
      { tile: 7, x: 54, y: 11, size: 12, angle: -8 },
    ];
    viewport.innerHTML =
      '<div class="hhChapterArtifacts">' +
      configs
        .map(
          (c, i) =>
            `<span class="hhChapterArtifact" data-artifact="${i}" style="width:${c.size}%;--artifact-x:${(c.tile % 6) * 20}%;--artifact-y:${(Math.floor(c.tile / 6) * 100) / 3}%"></span>`,
        )
        .join('') +
      '</div><svg class="hhChapterRibbon" viewBox="0 0 600 480" preserveAspectRatio="none"><path pathLength="1" d="M282 371C95 304 52 228 127 168S426 72 469 138 385 283 303 211"/></svg><div class="hhChapterLights">' +
      Array.from(
        { length: 10 },
        (_, i) =>
          `<i style="--light-x:${17 + i * 7}%;--light-y:${14 + (i % 4) * 13}%;--light-delay:-${i * 0.45}s"></i>`,
      ).join('') +
      '</div>';
    const actors = [...viewport.querySelectorAll('.hhChapterArtifact')];
    let frame = 0,
      previous = 0,
      elapsed = 0,
      visible = false,
      dead = false;
    function paint() {
      const t = elapsed / 1000;
      scene.style.setProperty('--chapter-opening', 1);
      scene.style.setProperty('--chapter-world', 1);
      scene.style.setProperty('--chapter-emerge', 1);
      scene.style.setProperty(
        '--chapter-breath',
        preference.matches ? 1 : 1 + Math.sin(t * 0.75) * 0.007,
      );
      scene.classList.add('hhChapterSettled');
      actors.forEach((actor, i) => {
        const c = configs[i],
          wave = preference.matches ? 0 : Math.sin(t * 0.8 + i);
        actor.style.left = c.x + '%';
        actor.style.top = c.y + wave * 0.85 + '%';
        actor.style.transform = `translate(-50%,-50%) rotate(${c.angle + wave * 1.3}deg)`;
        actor.style.opacity = '1';
      });
    }
    function tick(now) {
      frame = 0;
      if (dead || document.hidden || !visible || preference.matches) {
        previous = 0;
        return;
      }
      elapsed += previous ? Math.min(64, now - previous) : 0;
      paint();
      previous = now;
      frame = requestAnimationFrame(tick);
    }
    function queue() {
      if (!dead && !frame && visible && !document.hidden && !preference.matches)
        frame = requestAnimationFrame(tick);
    }
    let observer;
    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(
        (entries) => {
          visible = entries.some((e) => e.isIntersecting);
          section.classList.toggle('hhChapterPaused', !visible || document.hidden);
          if (!visible) {
            cancelAnimationFrame(frame);
            frame = 0;
            previous = 0;
          } else queue();
        },
        { threshold: 0.08 },
      );
      observer.observe(scene);
    } else {
      visible = true;
      queue();
    }
    function visibility() {
      section.classList.toggle('hhChapterPaused', document.hidden || !visible);
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
      paint();
      queue();
    }
    document.addEventListener('visibilitychange', visibility);
    preference.addEventListener('change', motion);
    paint();
    return {
      destroy() {
        dead = true;
        cancelAnimationFrame(frame);
        observer?.disconnect();
        document.removeEventListener('visibilitychange', visibility);
        preference.removeEventListener('change', motion);
      },
    };
  }
  window.ChapterFinale = { mount };
})();
