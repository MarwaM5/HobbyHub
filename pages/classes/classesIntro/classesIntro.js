
/* classesIntro.js | Classes introduction page */

function initClassesIntro() {
  // Mount the shared navbar, footer and modal.
  mountSharedUi({ active: "classes" });

  // Resolve links that use data-route.
  applyRoutes(document);

  // Reuse the same gradual reveal animation as Hobby Discovery.
  initReveal();
}

// Initialize the page.
initClassesIntro();
