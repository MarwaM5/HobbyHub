/* hobbyDiscovery.js | Shared navigation/footer are mounted here; page-specific behavior stays small. */
function initHobbyDiscovery() {
  mountSharedUi({ active: "discover" }); // Highlights Discover in the shared public navbar.
  applyRoutes(document);                 // Resolves quiz, login and signup links from utils.js.
  initReveal();                          // Reuses the project's shared scroll-reveal behavior.
}
initHobbyDiscovery();
