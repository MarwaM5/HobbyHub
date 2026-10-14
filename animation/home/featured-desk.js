/* Paper and lighting effects work with any activity cover supplied by the data service. */
(() => {
  'use strict';
  function mount(section) {
    if (!section || section.dataset.featuredDesk) return () => {};
    section.dataset.featuredDesk = 'true';
    section.classList.add('hhCreatorDesk');
    const grid = section.querySelector('#featuredGrid');
    const cards = [...grid.querySelectorAll('.featCard')];
    const cleanup = [];
    const atmosphere = document.createElement('span');
    atmosphere.className = 'hhDeskAtmosphere';
    atmosphere.setAttribute('aria-hidden', 'true');
    atmosphere.innerHTML =
      '<span class="hhDeskProp hhDeskBrushes"></span><span class="hhDeskProp hhDeskCup"></span><svg class="hhDeskCoffeeSteam" viewBox="0 0 60 80"><path d="M15 68C0 44 36 40 17 10M38 68C19 39 54 34 37 8"/></svg><span class="hhDeskLight"></span>';
    grid.prepend(atmosphere);
    cards.forEach((card, index) => {
      const type = (card.dataset.activityType || 'class').toLowerCase();
      const style = type === 'event' ? 'ticket' : type === 'training' ? 'notebook' : 'polaroid';
      card.dataset.paper = style;
      card.style.setProperty('--paper-rotation', (index % 2 ? 1.4 : -1.4) + 'deg');
      card.style.setProperty('--paper-arrival', index * 0.04 + 's');
      const image = card.querySelector('.featCardImage');
      const sheen = document.createElement('span');
      sheen.className = 'hhDeskImageSheen';
      sheen.setAttribute('aria-hidden', 'true');
      image.appendChild(sheen);
      const corner = document.createElement('span');
      corner.className = 'hhDeskPaperCorner';
      corner.setAttribute('aria-hidden', 'true');
      card.appendChild(corner);
      if (style === 'notebook') {
        const binding = document.createElement('span');
        binding.className = 'hhDeskBinding';
        binding.setAttribute('aria-hidden', 'true');
        binding.innerHTML =
          '<svg viewBox="0 0 240 24">' +
          Array.from(
            { length: 8 },
            (_, i) => `<path d="M${12 + i * 30} 19v-9c0-11 12-11 12 0v9"/>`,
          ).join('') +
          '</svg>';
        card.appendChild(binding);
      }
      const enter = () => card.classList.add('hhPaperActive');
      const leave = (event) => {
        if (!event.relatedTarget || !card.contains(event.relatedTarget))
          card.classList.remove('hhPaperActive');
      };
      for (const [name, handler] of [
        ['pointerenter', enter],
        ['pointerleave', leave],
        ['focusin', enter],
        ['focusout', leave],
      ]) {
        card.addEventListener(name, handler);
        cleanup.push(() => card.removeEventListener(name, handler));
      }
    });
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.target === section)
              section.classList.toggle('hhDeskVisible', entry.isIntersecting);
            else entry.target.classList.toggle('hhPaperVisible', entry.isIntersecting);
          });
        },
        { threshold: 0.08 },
      );
      observer.observe(section);
      cards.forEach((card) => observer.observe(card));
      cleanup.push(() => observer.disconnect());
    } else {
      section.classList.add('hhDeskVisible');
      cards.forEach((card) => card.classList.add('hhPaperVisible'));
    }
    const visibility = () => section.classList.toggle('hhDeskPaused', document.hidden);
    document.addEventListener('visibilitychange', visibility);
    cleanup.push(() => document.removeEventListener('visibilitychange', visibility));
    visibility();
    return () => cleanup.splice(0).forEach((fn) => fn());
  }
  window.FeaturedDesk = { mount };
})();
