/* utils.js | دوال مساعدة صغيرة لكل الصفحات. ينربط بعد data و dataService وقبل components */

// أسماء الصفحات ومساراتها من جذر المشروع. لو غيّرنا مسار صفحة بنغيّره من هون بس
const routes = {
  adminDashboard: "admin/dashboard/dashboard.html",
  adminUsers: "admin/users/users.html",
  adminCatalog: "admin/catalog/catalog.html",
  adminActivities: "admin/activities/activities.html",
  adminCommunities: "admin/communities/communities.html",
  adminPayments: "admin/payments/payments.html",
  adminSettings: "admin/settings/settings.html",
  dashboard: "pages/dashboard/dashboard.html",
  profile: "pages/profile/profile.html",
  classesBrowse: "pages/classes/classesBrowse/classesBrowse.html",
  activityDetails: "pages/classes/classesDetails/classesDetails.html",
  checkout: "pages/classes/checkout/checkout.html",
  liveSession: "pages/liveSession/liveSession.html",
  journeyApp: "pages/journey/myJourney/myJourney.html",
  aiApp: "pages/ai/aiGenerator/aiGenerator.html",
  home: "pages/home/home.html",
  discover: "pages/hobbyDiscovery/hobbyDiscovery.html",
  discoveryFlow: "pages/hobbyDiscovery/discoveryFlow/discoveryFlow.html",
  quiz: "pages/hobbyDiscovery/discoveryFlow/quiz/quiz.html",
  classes: "pages/classes/classesIntro/classesIntro.html",
  classesIntro: "pages/classes/classesIntro/classesIntro.html",
  groups: "pages/communities/communitiesBrowse/communitiesBrowse.html",
  communitiesBrowse: "pages/communities/communitiesBrowse/communitiesBrowse.html",
  communityFeed: "pages/community/communityFeed/communityFeed.html",
  groupsIntro: "pages/communities/introCommunities/introCommunities.html",
  journey: "pages/journey/introJourney/journeyIntro.html",
  journeyIntro: "pages/journey/introJourney/journeyIntro.html",
  myJourney: "pages/journey/myJourney/myJourney.html",
  journeyGoal: "pages/journey/journeyGoal/journeyGoal.html",
  journeyNewGoal: "pages/journey/journeyNewGoal/journeyNewGoal.html",
  ai: "pages/ai/introAI/aiIntro.html",
  aiGenerator: "pages/ai/aiGenerator/aiGenerator.html",
  category: "pages/category/category.html",
  activity: "pages/classes/classesDetails/classesDetails.html",
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
  const target=getRoot() + routes[routeKey] + query;
  return withProfilePreview(target);
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

/* Frontend-only state handoff. URL values are previews, never proof of payment or authorization. */
const profilePreview = (() => {
 const saved=new Set(['guitar','photography','pottery']);
 const booked=new Set();
 try {
  const raw=new URLSearchParams(window.location.search).get('preview');
  if(raw && raw.length<6000){const state=JSON.parse(raw);
   if(Array.isArray(state.h)) { saved.clear(); state.h.slice(0,100).filter(id=>hobbies.some(h=>h.id===id)).forEach(id=>saved.add(id)); }
   if(Array.isArray(state.e))state.e.slice(0,100).filter(id=>activities.some(a=>a.id===id&&a.status==='published')).forEach(id=>booked.add(id));
  }
 }catch{}
 // Only reconstruct the frontend enrollment view; do not create financial records from URL input.
 for(const id of booked)if(!hasActivityEnrollment(id))enrollments.push({id:'preview-'+id,userId:currentUser.id,activityId:id,status:'confirmed',previewOnly:true});
 return {saved,booked};
})();
function withProfilePreview(target){
 const hashIndex=target.indexOf('#'),hash=hashIndex<0?'':target.slice(hashIndex),base=hashIndex<0?target:target.slice(0,hashIndex);
 const split=base.indexOf('?'),path=split<0?base:base.slice(0,split),params=new URLSearchParams(split<0?'':base.slice(split+1));
 if(params.get('u')!=='1' || path.includes('/admin/'))return target;
 const e=enrollments.filter(row=>row.userId===currentUser.id&&row.status==='confirmed').map(row=>row.activityId);
 params.set('preview',JSON.stringify({h:[...profilePreview.saved],e:[...new Set(e)]}));
 return path+'?'+params.toString()+hash;
}
// Refresh links at activation because navigation may have rendered before Save/Enroll.
document.addEventListener('click',event=>{
 const link=event.target.closest?.('a[href]');if(!link)return;
 const href=link.getAttribute('href');
 if(!href||/^(?:[a-z]+:|\/\/)/i.test(href))return;
 link.setAttribute('href',withProfilePreview(href));
},true);
