/* Decorative category map. All original anchors, names and data remain in place. */
(() => {
  'use strict';
  function mount(section) {
    if (!section || section.dataset.categoryWorld) return () => {};
    const grid = section.querySelector('#categoryGrid');
    const cards = [...grid.querySelectorAll('.catCard')];
    if (!cards.length) return () => {};
    section.dataset.categoryWorld = 'true';
    section.classList.add('hhCategoryWorld');
    const cleanup = [];
    let frame = 0,
      dead = false;
    const atmosphere = document.createElement('span');
    atmosphere.className = 'hhCategoryAtmosphere';
    atmosphere.setAttribute('aria-hidden', 'true');
    atmosphere.innerHTML =
      '<span class="hhCategoryCloud hhCategoryCloudOne"></span><span class="hhCategoryCloud hhCategoryCloudTwo"></span><svg class="hhCategoryRoutes" viewBox="0 0 1180 740"><defs><linearGradient id="hhCategoryRouteGold"><stop stop-color="#F6A15A"/><stop offset=".5" stop-color="#ED7052"/><stop offset="1" stop-color="#F6A15A"/></linearGradient></defs><path class="hhCategoryRouteSoft"/><path class="hhCategoryRouteLine" pathLength="1"/></svg>';
    grid.prepend(atmosphere);
    const sprites = {
      creative:
        '<span class="hhCategoryActor hhCategoryBrush"></span><svg class="hhCategoryPaint" viewBox="0 0 100 60"><path pathLength="1" d="M8 38Q23 13 44 33T88 20"/></svg>',
      musicDance:
        '<span class="hhCategoryActor hhCategoryGuitar"></span><span class="hhCategoryNote hhCategoryNoteOne">♪</span><span class="hhCategoryNote hhCategoryNoteTwo">♫</span>',
      outdoorAdventure:
        '<span class="hhCategoryActor hhCategoryCompass"></span><span class="hhCategoryCompassHalo"></span>',
      sportsFitness:
        '<span class="hhCategoryActor hhCategoryBall"><svg viewBox="0 0 100 100"><defs><radialGradient id="hhCategoryBallLight" cx="30%" cy="25%"><stop stop-color="#fff"/><stop offset=".72" stop-color="#FFF8F1"/><stop offset="1" stop-color="#9d6b4b"/></radialGradient></defs><circle cx="50" cy="50" r="46" fill="url(#hhCategoryBallLight)"/><g fill="#0F172A"><path d="M50 29L70 43L62 65H38L30 43Z"/><path d="M17 20L30 13L35 25L24 37L9 33Z"/><path d="M76 11L90 24L89 39L77 33L68 21Z"/><path d="M10 64L26 61L33 77L22 89L11 80Z"/><path d="M71 72L90 63L94 77L83 90L70 88Z"/></g><circle cx="50" cy="50" r="46" fill="none" stroke="#9d6b4b" stroke-opacity=".2"/></svg></span><span class="hhCategoryBallShadow"></span>',
      foodHome:
        '<span class="hhCategoryActor hhCategoryCoffee"></span><svg class="hhCategorySteam" viewBox="0 0 80 90"><path d="M23 76C3 52 43 48 23 18M44 76C24 50 64 45 44 12M64 76C44 48 79 45 62 23"/></svg>',
      gamesMind:
        '<span class="hhCategoryActor hhCategoryChess"></span><span class="hhCategoryChessOrbit"></span>',
    };
    function listen(node, event, handler) {
      node.addEventListener(event, handler);
      cleanup.push(() => node.removeEventListener(event, handler));
    }
    cards.forEach((card, index) => {
      const id = card.dataset.categoryId;
      card.parentElement.dataset.worldIndex = index;
      card.style.setProperty('--world-phase', -index * 1.3 + 's');
      card.style.setProperty('--world-entry-delay', index * 0.055 + 's');
      const scene = document.createElement('span');
      scene.className = 'hhCategoryScene';
      scene.setAttribute('aria-hidden', 'true');
      const art = card.querySelector('.hhDiorama');
      if (art) {
        art.remove();
        scene.appendChild(art);
      }
      const details = document.createElement('span');
      details.className = 'hhCategoryDetails';
      details.innerHTML = '<span class="hhCategoryIslandGlow"></span>' + (sprites[id] || '');
      scene.appendChild(details);
      card.prepend(scene);
      const enter = () => card.classList.add('isCategoryActive');
      const leave = (event) => {
        if (!event.relatedTarget || !card.contains(event.relatedTarget))
          card.classList.remove('isCategoryActive');
      };
      listen(card, 'pointerenter', enter);
      listen(card, 'pointerleave', leave);
      listen(card, 'focusin', enter);
      listen(card, 'focusout', leave);
    });
    function drawRoutes() {
      frame = 0;
      if (dead) return;
      const bounds = grid.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;
      const order = innerWidth >= 1100 ? [0, 1, 2, 5, 4, 3] : [0, 1, 2, 3, 4, 5];
      const points = order.map((i) => {
        const r = cards[i].querySelector('.hhCategoryScene').getBoundingClientRect();
        return { x: r.left - bounds.left + r.width * 0.5, y: r.top - bounds.top + r.height * 0.78 };
      });
      let path = `M${points[0].x} ${points[0].y}`;
      for (let i = 1; i < points.length; i++) {
        const a = points[i - 1],
          b = points[i];
        const horizontal = innerWidth >= 1100 && Math.abs(b.x - a.x) > 80;
        const bend = horizontal ? Math.min(90, Math.abs(b.x - a.x) * 0.22) : 0;
        path += ` C${a.x + (b.x - a.x) * 0.4} ${a.y + bend},${a.x + (b.x - a.x) * 0.6} ${b.y + bend},${b.x} ${b.y}`;
      }
      atmosphere
        .querySelector('svg')
        .setAttribute('viewBox', `0 0 ${bounds.width} ${bounds.height}`);
      atmosphere.querySelectorAll('path').forEach((p) => p.setAttribute('d', path));
    }
    function queue() {
      if (!dead && !frame) frame = requestAnimationFrame(drawRoutes);
    }
    function wake(card) {
      // Ambient actors stay alive while visible; CSS pauses them offscreen/when hidden.
      card.classList.add('isCategoryVisible', 'hhActorAwake');
    }
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.target === grid) {
              section.classList.toggle('isWorldVisible', entry.isIntersecting);
              if (entry.isIntersecting) queue();
            } else {
              entry.target.classList.toggle('isCategoryVisible', entry.isIntersecting);
              if (entry.isIntersecting) wake(entry.target);
            }
          });
        },
        { threshold: 0.08 },
      );
      observer.observe(grid);
      cards.forEach((card) => observer.observe(card));
      cleanup.push(() => observer.disconnect());
    } else {
      section.classList.add('isWorldVisible');
      cards.forEach(wake);
    }
    if ('ResizeObserver' in window) {
      const observer = new ResizeObserver(queue);
      observer.observe(grid);
      cleanup.push(() => observer.disconnect());
    }
    listen(window, 'resize', queue);
    const visibility = () => section.classList.toggle('hhCategoryPaused', document.hidden);
    listen(document, 'visibilitychange', visibility);
    visibility();
    queue();
    return () => {
      dead = true;
      cancelAnimationFrame(frame);
      cleanup.splice(0).forEach((fn) => fn());
    };
  }
  window.CategoryWorld = { mount };
})();
