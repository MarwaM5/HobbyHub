/* The shared WebGL stage: spring-smoothed input, lighting, visibility and GPU cleanup. */
(() => {
  'use strict';
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const clamp = (v) => Math.max(0, Math.min(1, v));
  function create(host, options = {}) {
    if (!host || !window.THREE || !window.HobbyModels) return null;
    const T = THREE,
      cleanups = [],
      resources = new Set();
    let renderer;
    try {
      renderer = new T.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'default' });
    } catch (error) {
      host.classList.add('hhWorldUnavailable');
      return null;
    }
    renderer.setClearColor(0, 0);
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, innerWidth < 768 ? 1.25 : 1.7));
    renderer.outputColorSpace = T.SRGBColorSpace;
    renderer.toneMapping = T.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    renderer.domElement.setAttribute('aria-hidden', 'true');
    renderer.domElement.setAttribute('role', 'presentation');
    host.appendChild(renderer.domElement);
    host.classList.add('hhWorldReady');
    const scene = new T.Scene(),
      camera = new T.PerspectiveCamera(options.fov || 38, 1, 0.1, 70);
    camera.position.set(0, 0, options.distance || 10);
    scene.add(new T.HemisphereLight(0xfff5de, 0xa6977e, 3));
    const key = new T.DirectionalLight(0xffead0, 3.8);
    key.position.set(-4, 6, 6);
    scene.add(key);
    const rim = new T.DirectionalLight(0xffc178, 3.1);
    rim.position.set(5, 2, -3);
    scene.add(rim);
    const fill = new T.DirectionalLight(0xffffff, 1.6);
    fill.position.set(0, -2, 6);
    scene.add(fill);
    const glow = new T.PointLight(0xffbf70, 18, 12, 2);
    glow.position.set(1, 0.4, -2);
    scene.add(glow);
    // A locally constructed reflection environment gives metal and glaze real highlights.
    const environment = new T.Scene();
    for (const [color, x, y, z, sx, sy, sz] of [
      [0xfff8f1, 0, 5, 0, 10, 0.1, 10],
      [0xffcb83, 5, 0, 0, 0.1, 8, 8],
      [0xffffff, -5, 1, 0, 0.1, 5, 8],
      [0xab8664, 0, -5, 0, 10, 0.1, 10],
    ]) {
      const panel = new T.Mesh(new T.BoxGeometry(sx, sy, sz), new T.MeshBasicMaterial({ color }));
      panel.position.set(x, y, z);
      environment.add(panel);
    }
    const pmrem = new T.PMREMGenerator(renderer),
      env = pmrem.fromScene(environment, 0.07);
    scene.environment = env.texture;
    pmrem.dispose();
    environment.traverse((o) => {
      o.geometry?.dispose();
      o.material?.dispose();
    });
    let frame = 0,
      last = 0,
      elapsed = 0,
      visible = true,
      destroyed = false,
      progress = 0,
      targetProgress = 0;
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 },
      tickers = [];
    const listen = (target, name, fn, opts) => {
      target.addEventListener(name, fn, opts);
      cleanups.push(() => target.removeEventListener(name, fn, opts));
    };
    const api = {
      scene,
      camera,
      renderer,
      pointer,
      get reduced() {
        return preference.matches;
      },
      get progress() {
        return progress;
      },
      add(object) {
        scene.add(object);
        object.traverse((o) => {
          if (o.geometry) resources.add(o.geometry);
          const list = Array.isArray(o.material) ? o.material : [o.material];
          for (const mat of list) {
            if (mat && ![...HobbyModels.materials.values()].includes(mat)) resources.add(mat);
          }
        });
        return object;
      },
      tick(fn) {
        tickers.push(fn);
      },
      setProgress(v) {
        targetProgress = clamp(v);
        if (preference.matches) {
          progress = targetProgress;
          draw(0);
        } else request();
      },
      listen,
      destroy() {
        if (destroyed) return;
        destroyed = true;
        cancelAnimationFrame(frame);
        cleanups.splice(0).forEach((fn) => fn());
        resources.forEach((r) => r.dispose());
        env.dispose();
        renderer.dispose();
        renderer.domElement.remove();
      },
    };
    function draw(dt) {
      const smooth = 1 - Math.exp(-dt * 7);
      pointer.x = preference.matches ? 0 : T.MathUtils.lerp(pointer.x, pointer.tx, smooth);
      pointer.y = preference.matches ? 0 : T.MathUtils.lerp(pointer.y, pointer.ty, smooth);
      progress = preference.matches
        ? targetProgress
        : T.MathUtils.lerp(progress, targetProgress, smooth);
      elapsed += dt;
      tickers.forEach((fn) =>
        fn({
          time: preference.matches ? 0 : elapsed,
          dt,
          pointer,
          progress,
          reduced: preference.matches,
        })
      );
      renderer.render(scene, camera);
    }
    function loop(now) {
      frame = 0;
      if (destroyed || document.hidden || !visible) return;
      const dt = last ? Math.min((now - last) / 1000, 0.04) : 0.016;
      last = now;
      draw(dt);
      if (!preference.matches) request();
    }
    function request() {
      if (!frame && !destroyed && visible && !document.hidden) frame = requestAnimationFrame(loop);
    }
    function resize() {
      const w = host.clientWidth,
        h = host.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      last = 0;
      request();
    }
    const root = options.pointerTarget || host.parentElement;
    listen(
      root,
      'pointermove',
      (event) => {
        if (preference.matches || event.pointerType === 'touch') return;
        const r = root.getBoundingClientRect();
        pointer.tx = ((event.clientX - r.left) / r.width) * 2 - 1;
        pointer.ty = ((event.clientY - r.top) / r.height) * 2 - 1;
        request();
      },
      { passive: true }
    );
    listen(root, 'pointerleave', () => {
      pointer.tx = pointer.ty = 0;
    });
    if ('ResizeObserver' in window) {
      const ro = new ResizeObserver(resize);
      ro.observe(host);
      cleanups.push(() => ro.disconnect());
    } else listen(window, 'resize', resize, { passive: true });
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(
        (entries) => {
          visible = entries[0].isIntersecting;
          last = 0;
          if (visible) request();
          else {
            cancelAnimationFrame(frame);
            frame = 0;
          }
        },
        { rootMargin: '100px' }
      );
      io.observe(host);
      cleanups.push(() => io.disconnect());
    }
    listen(document, 'visibilitychange', () => {
      last = 0;
      if (document.hidden) {
        cancelAnimationFrame(frame);
        frame = 0;
      } else request();
    });
    listen(preference, 'change', () => {
      pointer.tx = pointer.ty = 0;
      last = 0;
      request();
    });
    listen(window, 'pagehide', (event) => {
      if (!event.persisted) api.destroy();
    });
    listen(renderer.domElement, 'webglcontextlost', (event) => {
      event.preventDefault();
      cancelAnimationFrame(frame);
      frame = 0;
      host.classList.add('hhWorldUnavailable');
    });
    listen(renderer.domElement, 'webglcontextrestored', () => {
      host.classList.remove('hhWorldUnavailable');
      request();
    });
    resize();
    return api;
  }
  function watch(items, fn) {
    if (!('IntersectionObserver' in window)) {
      items.forEach(fn);
      return () => {};
    }
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            fn(e.target);
            observer.unobserve(e.target);
          }
        }),
      { threshold: 0.12 }
    );
    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }
  function tilt(items, range = 7) {
    const cleanups = [];
    const fine = matchMedia('(pointer:fine) and (hover:hover)');
    items.forEach((item) => {
      let raf = 0,
        point;
      const reset = () => {
        cancelAnimationFrame(raf);
        raf = 0;
        item.style.setProperty('--tilt-x', '0deg');
        item.style.setProperty('--tilt-y', '0deg');
      };
      const move = (e) => {
        if (preference.matches || !fine.matches) return;
        point = e;
        if (raf) return;
        raf = requestAnimationFrame(() => {
          raf = 0;
          const r = item.getBoundingClientRect();
          item.style.setProperty(
            '--tilt-x',
            `${-((point.clientY - r.top) / r.height - 0.5) * range}deg`
          );
          item.style.setProperty(
            '--tilt-y',
            `${((point.clientX - r.left) / r.width - 0.5) * range}deg`
          );
        });
      };
      item.addEventListener('pointermove', move, { passive: true });
      item.addEventListener('pointerleave', reset);
      preference.addEventListener('change', reset);
      fine.addEventListener('change', reset);
      cleanups.push(() => {
        reset();
        item.removeEventListener('pointermove', move);
        item.removeEventListener('pointerleave', reset);
        preference.removeEventListener('change', reset);
        fine.removeEventListener('change', reset);
      });
    });
    return () => cleanups.forEach((fn) => fn());
  }
  window.HobbyWorld = Object.freeze({ create, watch, tilt, clamp, preference });
})();
