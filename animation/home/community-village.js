/* Community scenery and memory motion; preserve every existing link and caption. */
(() => {
  'use strict';
  function mount(village, memories) {
    if (!village || village.dataset.villageReady) return () => {};
    village.dataset.villageReady = 'true';
    village.classList.add('hhCommunityVillage');
    const grid = village.querySelector('.hhIslandGrid');
    const cards = [...grid.querySelectorAll('.hhIslandCard')];
    const svg = village.querySelector('.hhIslandBridges');
    const cleanups = [];
    let frame = 0,
      dead = false,
      selected = -1;
    function listen(node, type, fn) {
      node.addEventListener(type, fn);
      cleanups.push(() => node.removeEventListener(type, fn));
    }
    function lightPaths(index) {
      selected = index;
      svg.querySelectorAll('.hhVillageBridgeLight').forEach((path) => {
        path.classList.toggle(
          'hhVillageLit',
          +path.dataset.from === index || +path.dataset.to === index,
        );
      });
    }
    const additions = [
      '<span class="hhVillageWindow hhVillageArtWindow"></span><span class="hhVillagePaintLight"></span>',
      '<span class="hhVillageWindow hhVillageMusicWindow"></span><span class="hhVillageNote hhVillageNoteOne">♪</span><span class="hhVillageNote hhVillageNoteTwo">♫</span>',
      '<span class="hhVillageWindow hhVillageGardenWindow"></span><span class="hhVillagePlant"></span>',
      '<span class="hhVillageWindow hhVillageReadingWindow"></span><span class="hhVillageReadingLight"></span>',
    ];
    cards.forEach((card, index) => {
      card.dataset.villageHome = index;
      card.style.setProperty('--village-phase', -index * 1.7 + 's');
      const scene = document.createElement('span');
      scene.className = 'hhVillageHome';
      scene.setAttribute('aria-hidden', 'true');
      const art = card.querySelector('.hhDiorama');
      if (art) {
        art.remove();
        scene.appendChild(art);
      }
      const details = document.createElement('span');
      details.className = 'hhVillageDetails';
      details.innerHTML = additions[index] || '';
      scene.appendChild(details);
      card.prepend(scene);
      const enter = () => {
        card.classList.add('hhVillageSelected');
        lightPaths(index);
      };
      const leave = (event) => {
        if (event.relatedTarget && card.contains(event.relatedTarget)) return;
        card.classList.remove('hhVillageSelected');
        if (selected === index) lightPaths(-1);
      };
      listen(card, 'pointerenter', enter);
      listen(card, 'pointerleave', leave);
      listen(card, 'focusin', enter);
      listen(card, 'focusout', leave);
    });
    function draw() {
      frame = 0;
      if (dead) return;
      const bounds = village.querySelector('.hhIslandEnvironment').getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;
      const order = innerWidth > 1000 ? [0, 1, 2, 3] : [0, 1, 3, 2];
      const points = cards.map((card) => {
        const r = card.querySelector('.hhVillageHome').getBoundingClientRect();
        return { x: r.left - bounds.left + r.width * 0.5, y: r.top - bounds.top + r.height * 0.69 };
      });
      svg.setAttribute('viewBox', `0 0 ${bounds.width} ${bounds.height}`);
      svg.innerHTML = order
        .slice(1)
        .map((to, i) => {
          const from = order[i],
            a = points[from],
            b = points[to];
          const arch = Math.min(45, Math.abs(b.x - a.x) * 0.14);
          const d = `M${a.x} ${a.y}C${a.x + (b.x - a.x) * 0.35} ${a.y - arch},${a.x + (b.x - a.x) * 0.65} ${b.y - arch},${b.x} ${b.y}`;
          return `<path class="hhVillageBridgeRail" d="${d}"/><path class="hhVillageBridgePlanks" d="${d}"/><path class="hhVillageBridgeLight" data-from="${from}" data-to="${to}" d="${d}"/>`;
        })
        .join('');
      lightPaths(selected);
    }
    function queue() {
      if (!dead && !frame) frame = requestAnimationFrame(draw);
    }
    const papers = memories ? [...memories.querySelectorAll('.hhMemoryCard')] : [];
    memories?.classList.add('hhLivingMemories');
    papers.forEach((paper, index) => paper.style.setProperty('--memory-phase', -index * 2.1 + 's'));
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.target === village) {
              village.classList.toggle('hhVillageVisible', entry.isIntersecting);
              if (entry.isIntersecting) queue();
            } else if (papers.includes(entry.target))
              entry.target.classList.toggle('hhMemoryMoving', entry.isIntersecting);
            else entry.target.classList.toggle('hhHomeVisible', entry.isIntersecting);
          });
        },
        { threshold: 0.08 },
      );
      observer.observe(village);
      cards.forEach((card) => observer.observe(card));
      papers.forEach((paper) => observer.observe(paper));
      cleanups.push(() => observer.disconnect());
    } else {
      village.classList.add('hhVillageVisible');
      cards.forEach((card) => card.classList.add('hhHomeVisible'));
      papers.forEach((paper) => paper.classList.add('hhMemoryMoving'));
    }
    if ('ResizeObserver' in window) {
      const observer = new ResizeObserver(queue);
      observer.observe(grid);
      cleanups.push(() => observer.disconnect());
    }
    listen(window, 'resize', queue);
    const visibility = () => {
      village.classList.toggle('hhVillagePaused', document.hidden);
      memories?.classList.toggle('hhVillagePaused', document.hidden);
    };
    listen(document, 'visibilitychange', visibility);
    visibility();
    queue();
    return () => {
      dead = true;
      cancelAnimationFrame(frame);
      cleanups.splice(0).forEach((fn) => fn());
    };
  }
  window.CommunityVillage = { mount };
})();
