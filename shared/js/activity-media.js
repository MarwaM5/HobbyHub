/* Image presentation contract shared by mock records and future MVC responses. */
(() => {
  'use strict';
  const fallbackPath = 'animation/assets/artist-room.webp';
  const fallback = () => getRoot() + fallbackPath;
  function resolve(activity) {
    const path = typeof activity?.imageUrl === 'string' ? activity.imageUrl.trim() : '';
    if (!path || /[\u0000-\u001f\\]/.test(path) || path.startsWith('//')) return fallback();
    if (/^https?:\/\//i.test(path)) return path;
    if (/^[a-z][a-z\d+.-]*:/i.test(path)) return fallback();
    return path.startsWith('/') ? path : getRoot() + path;
  }
  function bind(scope) {
    scope.querySelectorAll('.featCardCover').forEach((image) => {
      if (image.dataset.coverBound) return;
      image.dataset.coverBound = 'true';
      image.addEventListener('error', () => {
        if (image.dataset.coverFallback) {
          image.hidden = true;
          return;
        }
        image.dataset.coverFallback = 'true';
        image.src = fallback();
      });
    });
  }
  window.ActivityMedia = { resolve, bind, fallback };
})();
