/* utils.js | دوال مساعدة صغيرة لكل الصفحات. ينربط بعد data و dataService وقبل components */

// أسماء الصفحات ومساراتها من جذر المشروع. لو غيّرنا مسار صفحة بنغيّره من هون بس
const routes = {
  dashboard: "pages/dashboard/dashboard.html",
  classesBrowse: "pages/classes/classesBrowse/classesBrowse.html",
  journeyApp: "pages/journey/introJourney/journeyIntro.html",
  aiApp: "pages/ai/introAI/aiIntro.html",
  home: "pages/home/home.html",
  discover: "pages/hobbyDiscovery/hobbyDiscovery.html",
  discoveryFlow: "pages/hobbyDiscovery/discoveryFlow/discoveryFlow.html",
  quiz: "pages/hobbyDiscovery/discoveryFlow/quiz/quiz.html",
  classes: "pages/classes/classesIntro/classesIntro.html",
  groups: "pages/communities/introCommunities/introCommunities.html",
  journey: "pages/journey/introJourney/journeyIntro.html",
  ai: "pages/ai/introAI/aiIntro.html",
  category: "pages/category/category.html",
  activity: "pages/activity/activity.html",
  login: "pages/login/login.html",
  signup: "pages/signup/signup.html",
  about: "pages/about/about.html",
  contact: "pages/contact/contact.html",
  privacy: "pages/privacy/privacy.html",
  terms: "pages/terms/terms.html"
};

// كل صفحة بتحدد مكانها بـ <body data-root="../../"> (المسافة لجذر المشروع)
function getRoot() {
  return document.body.dataset.root || "./";
}

// رابط صفحة كامل. مثال: buildUrl("category", "?c=creative")
function buildUrl(routeKey, query = "") {
  return getRoot() + routes[routeKey] + query;
}

// بيحمي النص من رموز HTML (& < >) قبل ما نحطه بالصفحة
function escapeHtml(text) {
  const map = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
  return String(text).replace(/[&<>"']/g, (char) => map[char]);
}

// بيعبي href لأي رابط عليه data-route. مثال: <a data-route="classes">
function applyRoutes(scope = document) {
  scope.querySelectorAll("a[data-route]").forEach((link) => {
    link.href = buildUrl(link.dataset.route, link.dataset.query || "");
  });
}

// حالة "مسجل دخول" بالديمو = وجود ?u=1 بالرابط (بدون أي تخزين)
function isLoggedIn() {
  return new URLSearchParams(window.location.search).get("u") === "1";
}

// أول حرف كبير: capitalize("pink") ← "Pink"
function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function formatPrice(priceJod) {
  return priceJod === 0 ? "Free" : priceJod + " JOD";
}

// بيخلي العناصر اللي عليها .reveal تظهر بحركة لما ننزل ونوصلها
function initReveal() {
  const items = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {                  // متصفح قديم: بنظهرها مباشرة
    items.forEach((item) => item.classList.add("isVisible"));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;                      // لسا مش ظاهر
      entry.target.classList.add("isVisible");                // بيشغّل الحركة
      observer.unobserve(entry.target);                       // مرة وحدة بس
    });
  }, { threshold: 0.12 });
  items.forEach((item) => observer.observe(item));
}
