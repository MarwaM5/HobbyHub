/* journeyIntro.js | Public Journey introduction page */
function initJourneyIntro() {
  mountSharedUi({ active: "journey" });
  applyRoutes(document);
  initReveal();
}
initJourneyIntro();
