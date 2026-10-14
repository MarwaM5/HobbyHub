(() => {
  'use strict';
  function init() {
    const hero = document.getElementById('hero');
    if (!hero || hero.dataset.worldReady || !window.HobbyWorld) return;
    hero.dataset.worldReady = 'true';
    const cleanup = [];
    const categoryCells = {
      creative: [0, 0],
      musicDance: [50, 0],
      outdoorAdventure: [100, 0],
      sportsFitness: [0, 100],
      foodHome: [50, 100],
      gamesMind: [100, 100],
    };
    const hobbyCells = {
      drawing: [0, 0],
      photography: [0, 0],
      pottery: [0, 0],
      guitar: [50, 0],
      hiking: [100, 0],
      homeGardening: [50, 100],
      reading: [100, 100],
    };
    const setCell = (node, cell) => {
      node.style.setProperty('--diorama-x', cell[0] + '%');
      node.style.setProperty('--diorama-y', cell[1] + '%');
    };
    document.querySelectorAll('#categoryGrid .catCard').forEach((card) => {
      card.querySelector('.catCardEmoji')?.remove();
      const art = document.createElement('span');
      art.className = 'hhDiorama';
      art.setAttribute('aria-hidden', 'true');
      card.prepend(art);
      setCell(card, categoryCells[card.dataset.categoryId] || [0, 0]);
    });
    cleanup.push(window.TrailStory?.mount(document.getElementById('howItWorks')) || (() => {}));
    cleanup.push(window.FeaturedDesk?.mount(document.getElementById('featured')) || (() => {}));
    const islandGrid = document.getElementById('hhIslandGrid');
    islandGrid.innerHTML = ['drawing', 'guitar', 'homeGardening', 'reading']
      .map((id, index) => {
        const hobby = hobbies.find((item) => item.id === id);
        if (!hobby) return '';
        const cell = hobbyCells[id];
        return `<a class="hhIslandCard" href="${buildUrl('communityFeed', '?id=' + encodeURIComponent(id) + (isLoggedIn() ? '&u=1' : ''))}" style="--diorama-x:${cell[0]}%;--diorama-y:${cell[1]}%;--island-offset:${index % 2 ? 17 : 0}px;--card-delay:${index * 0.13}s"><span class="hhDiorama" aria-hidden="true"></span><span class="hhIslandLabel"><strong>${escapeHtml(hobby.name)} Community</strong><small>Explore this little world <span aria-hidden="true">↗</span></small></span></a>`;
      })
      .join('');
    document
      .querySelectorAll('.hhMemoryCard')
      .forEach((card, index) => card.style.setProperty('--card-delay', index * 0.12 + 's'));
    cleanup.push(window.CommunityVillage?.mount(document.getElementById('hobbyIslands'), document.getElementById('creativeMemories')) || (() => {}));
    cleanup.push(
      HobbyWorld.watch(
        [...document.querySelectorAll('.hhStepDiorama,.hhIslandCard,.hhMemoryCard')],
        (node) => node.classList.add('isAwake')
      )
    );
    cleanup.push(window.CategoryWorld?.mount(document.getElementById('explore')) || (() => {}));
    const dust = hero.querySelector('.hhAtmosphericDust');
    dust.innerHTML = Array.from(
      { length: 22 },
      (_, i) =>
        `<i style="--x:${45 + ((i * 17) % 54)}%;--y:${(i * 23) % 90}%;--size:${2 + (i % 3)}px;--duration:${5 + (i % 5)}s;--delay:-${i % 8}s"></i>`
    ).join('');
    const world = window.LivingHero?.mount(hero);
    const finale = window.ChapterFinale?.mount(document.getElementById('nextChapter'));
    cleanup.push(() => finale?.destroy());
    cleanup.push(window.MemoryBreeze?.mount(document.getElementById('creativeMemories')) || (() => {}));
    const journey = hero.closest('.hhWorldJourney'),
      how = document.getElementById('howItWorks'),
      islands = document.getElementById('hobbyIslands');
    let scrollFrame = 0;
    const update = () => {
      scrollFrame = 0;
      const j = journey.getBoundingClientRect(),
        h = hero.getBoundingClientRect(),
        trail = how.getBoundingClientRect(),
        archipelago = islands.getBoundingClientRect();
      const reduced = HobbyWorld.preference.matches;
      const pinned = innerWidth >= 1100 && !reduced;
      const p = reduced
        ? 0
        : HobbyWorld.clamp(
            pinned
              ? (parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--navH')) -
                  j.top) /
                  Math.max(1, j.height - h.height)
              : -h.top / h.height
          );
      world?.setProgress(p);
      const sectionProgress = (r) =>
        HobbyWorld.clamp((innerHeight * 0.9 - r.top) / (innerHeight * 0.65 + r.height * 0.12));
      how.style.setProperty('--trail', reduced ? 1 : sectionProgress(trail));
      islands.style.setProperty('--bridges', reduced ? 1 : sectionProgress(archipelago));
    };
    const queue = () => {
      if (!scrollFrame) scrollFrame = requestAnimationFrame(update);
    };
    window.addEventListener('scroll', queue, { passive: true });
    window.addEventListener('resize', queue, { passive: true });
    HobbyWorld.preference.addEventListener('change', queue);
    queue();
    cleanup.push(() => {
      cancelAnimationFrame(scrollFrame);
      window.removeEventListener('scroll', queue);
      window.removeEventListener('resize', queue);
      HobbyWorld.preference.removeEventListener('change', queue);
    });
    // Keep ambient DOM effects asleep when their illustrated scenes are outside the viewport.
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) =>
          entries.forEach((e) => e.target.classList.toggle('hhScenePaused', !e.isIntersecting)),
        { rootMargin: '60px' }
      );
      document
        .querySelectorAll('.hero,.hhArchipelago,.hhMagicalChapter')
        .forEach((n) => observer.observe(n));
      cleanup.push(() => observer.disconnect());
    }
    const aura = document.createElement('span');
    aura.className = 'hhCursorAura';
    aura.setAttribute('aria-hidden', 'true');
    document.body.appendChild(aura);
    let cursorFrame = 0,
      cursorPoint;
    const cursor = (e) => {
      if (HobbyWorld.preference.matches || !matchMedia('(pointer:fine)').matches) return;
      cursorPoint = e;
      if (cursorFrame) return;
      cursorFrame = requestAnimationFrame(() => {
        cursorFrame = 0;
        aura.style.transform = `translate3d(${cursorPoint.clientX}px,${cursorPoint.clientY}px,0)`;
        aura.style.opacity = '1';
      });
    };
    const hide = () => {
      aura.style.opacity = '0';
    };
    document.addEventListener('pointermove', cursor, { passive: true });
    document.addEventListener('pointerleave', hide);
    HobbyWorld.preference.addEventListener('change', hide);
    cleanup.push(() => {
      cancelAnimationFrame(cursorFrame);
      document.removeEventListener('pointermove', cursor);
      document.removeEventListener('pointerleave', hide);
      HobbyWorld.preference.removeEventListener('change', hide);
      aura.remove();
    });
    window.addEventListener('pagehide', function end(event) {
      if (!event.persisted) {
        cleanup.splice(0).forEach((fn) => fn());
        world?.destroy();
        window.removeEventListener('pagehide', end);
      }
    });
  }
  document.addEventListener('hh:home-ready', init, { once: true });
  if (document.getElementById('categoryGrid')?.children.length) init();
})();
