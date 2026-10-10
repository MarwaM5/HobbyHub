/* Discovery Flow landing page: use the same authenticated shell as the dashboard. */
(function initDiscoveryFlow(){
  if (!isLoggedIn()) {
    window.location.replace(buildUrl("login"));
    return;
  }
  mountSharedUi({userApp:true, active:"discover", title:"Hobby Discovery", subtitle:"Your personal hobby matches"});
  const quizUrl = buildUrl("quiz", "?u=1");
  document.querySelectorAll('a[href="quiz/quiz.html"]').forEach(a => a.href = quizUrl);
  initReveal();
})();
