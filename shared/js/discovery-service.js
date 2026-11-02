/* In-memory discovery repository. No local/session storage, cookies or network calls. */
(() => {
  'use strict';
  const copy = (value) => JSON.parse(JSON.stringify(value));
  let state = copy(window.HobbyDiscoveryData);
  HHDiscoveryEngine.check(state);
  function snapshot() {
    return copy(state);
  }
  function replace(candidate) {
    const next = copy(candidate);
    HHDiscoveryEngine.check(next);
    for (const hobby of next.hobbies) {
      if (['definition', 'starter', 'needs'].some((key) => !String(hobby[key] || '').trim()))
        throw Error('Every hobby needs a description, a first step and its required tools or access.');
    }
    state = next;
    document.dispatchEvent(new Event('hh:discovery-updated'));
    return snapshot();
  }
  function forCatalog(rows) {
    const config = snapshot();
    config.hobbies = config.hobbies
      .filter((h) => rows.some((row) => row.id === h.id && row.status !== 'archived'))
      .map((h) => {
        const row = rows.find((row) => row.id === h.id);
        return { ...h, emoji: row.emoji || h.emoji, categoryId: row.categoryId };
      });
    const ids = new Set(config.hobbies.map((h) => h.id));
    config.groups = config.groups
      .map((g) => ({ ...g, hobbyIds: g.hobbyIds.filter((id) => ids.has(id)) }))
      .filter((g) => g.hobbyIds.length);
    // Unlinked editorial drafts must not become questions with no effect on results.
    const usedQuestions = new Set(config.hobbies.flatMap(h => [h.recommendation.anchor, ...h.recommendation.support]));
    config.questions = config.questions.filter(q => q.role !== 'interest' || usedQuestions.has(q.id));
    return config;
  }
  window.HobbyDiscoveryService = Object.freeze({ snapshot, replace, forCatalog });
})();
