/* Temporary adapter: remove this script/include to return to in-memory fixtures. */
(() => {
  'use strict';
  const key = 'hobbyhub-demo-v1';
  const arrays = {
    users,
    categories,
    hobbies,
    activities,
    organizers,
    communities,
    memberships,
    communityPosts,
    enrollments,
    simulatedPayments,
    payouts,
    serviceFees,
    advertisingCampaigns,
    invoices,
    contactMessages,
    hobbyQuizQuestions,
    faqs,
    platformActivityLog,
    sharedJourneyGoals,
  };
  const objects = { platformSettings, websiteContent };
  let override = null,
    available = true,
    resetting = false;
  function restore() {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return;
      const state = JSON.parse(raw);
      if (state.version !== 1 || !state.arrays || !state.objects) return;
      for (const [name, list] of Object.entries(arrays))
        if (Array.isArray(state.arrays[name])) list.splice(0, list.length, ...state.arrays[name]);
      for (const [name, value] of Object.entries(objects))
        if (state.objects[name] && typeof state.objects[name] === 'object')
          Object.assign(value, state.objects[name]);
      override = Number.isFinite(state.clock) ? state.clock : null;
    } catch {
      available = false;
    }
  }
  function save() {
    if (resetting) return true;
    try {
      localStorage.setItem(key, JSON.stringify({ version: 1, arrays, objects, clock: override }));
      return true;
    } catch {
      available = false;
      return false;
    }
  }
  window.addEventListener('storage', (event) => {
    if (event.key === key && !resetting) {
      if (event.newValue === null) {
        resetting = true;
        location.reload();
        return;
      }
      restore();
      document.dispatchEvent(new Event('hh:demo-data-updated'));
    }
  });
  restore();
  window.DemoStore = {
    save,
    now: () => override ?? Date.now(),
    get clock() {
      return override;
    },
    get available() {
      return available;
    },
    setClock(value) {
      override = value ? activityDateTime(value) : null;
      save();
    },
    reset() {
      resetting = true;
      localStorage.removeItem(key);
      location.reload();
    },
  };
  for (const event of ['click', 'submit', 'change'])
    document.addEventListener(event, () => Promise.resolve().then(save), true);
  window.addEventListener('pagehide', save);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) save();
  });
})();
