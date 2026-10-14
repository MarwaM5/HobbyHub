(() => {
  'use strict';
  function mount(page, stageId) {
    const scene = document.querySelector('.hhAuthScene'),
      panel = document.querySelector(`.${page}VisualPanel`),
      form = document.getElementById(`${page}Form`);
    if (!scene || !panel || !form || !window.HobbyWorld) return;
    const world = HobbyWorld.create(document.getElementById(stageId), {
      pointerTarget: panel,
      distance: 8,
      fov: 35,
    });
    if (world) {
      const positions =
        page === 'login'
          ? [
              ['camera', -0.8, 0.2, 0.5, 0.5],
              ['book', 0.5, -1.1, 0.3, 0.48],
              ['plant', 1.1, 0.9, -0.4, 0.43],
            ]
          : [
              ['palette', -1, 0.1, 0.3, 0.46],
              ['photo', 0.5, 1.1, -0.4, 0.4],
              ['guitar', 1, -0.8, 0.3, 0.42],
              ['brush', -0.1, -1, -0.2, 0.4],
            ];
      const objects = positions.map(([name, x, y, z, s], i) => {
        const model = HobbyModels.make(name);
        model.scale.setScalar(s);
        world.add(model);
        return { model, x, y, z, s, i, base: model.rotation.clone() };
      });
      world.tick(({ time, pointer, reduced }) => {
        objects.forEach(({ model, x, y, z, s, i, base }) => {
          const start = reduced ? 1 : HobbyWorld.clamp((time - 0.3 - i * 0.13) / 1.25),
            e = 1 - Math.pow(1 - start, 3);
          model.scale.setScalar(s * (0.04 + e * 0.96));
          model.position.set(
            x + pointer.x * 0.08,
            y + (reduced ? 0 : Math.sin(time * 0.55 + i) * 0.045) + (1 - e) * 0.2,
            z
          );
          model.rotation.set(base.x + pointer.y * 0.09, base.y + pointer.x * 0.16, base.z);
        });
        scene.style.setProperty('--room-x', pointer.x * -3 + 'px');
        scene.style.setProperty('--room-y', pointer.y * -2 + 'px');
      });
    }
    document
      .querySelectorAll(`.${page}FieldGroup`)
      .forEach((group, i) => group.style.setProperty('--field-delay', i * 0.08 + 's'));
    const focus = () => scene.classList.add('isFieldFocused'),
      blur = (event) => {
        if (!form.contains(event.relatedTarget)) scene.classList.remove('isFieldFocused');
      };
    form.addEventListener('focusin', focus);
    form.addEventListener('focusout', blur);
    let observer;
    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver((entries) =>
        panel.classList.toggle('hhAuthPaused', !entries[0].isIntersecting)
      );
      observer.observe(panel);
    }
    window.addEventListener('pagehide', function end(e) {
      if (!e.persisted) {
        world?.destroy();
        observer?.disconnect();
        form.removeEventListener('focusin', focus);
        form.removeEventListener('focusout', blur);
        window.removeEventListener('pagehide', end);
      }
    });
  }
  window.HobbyAuth = Object.freeze({ mount });
})();
