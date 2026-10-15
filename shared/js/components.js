/* components.js | أجزاء الواجهة المشتركة (navbar, footer, modal) كدوال بترجع HTML.
   ينربط بعد data و dataService و utils */

function renderLogo(extraClass = "") {
  return `
    <a class="hhLogo ${extraClass}" id="logoLink" href="${buildUrl("home")}" aria-label="HobbyHub home">
      <img class="hhLogoIcon" src="${getRoot()}shared/assets/logo/logo-icon.svg" alt="">
      <span class="hhLogoText">
        <span class="hhLogoName">${siteInfo.name}</span>
        <span class="hhLogoTag">${siteInfo.tagline}</span>
      </span>
    </a>`;
}

// الـ Navbar للزائر. active = اسم الصفحة الحالية لتظليل زرها
function renderNavbar(active = null) {
  const links = [["discover", "Discover"], ["classes", "Classes"], ["groupsIntro", "Groups"], ["journey", "Journey"], ["ai", "AI"]];
  const pills = links.map(([key, label]) => `
        <li class="nav-item">
          <a class="nav-link hhPill ${active === key ? "isActive" : ""}" id="nav${label}" href="${buildUrl(key)}">${label}</a>
        </li>`).join("");
  return `
    <nav class="navbar navbar-expand-lg hhNavbar" aria-label="Main navigation">
      <div class="hhContainer d-flex flex-wrap align-items-center">
        ${renderLogo("navbar-brand")}
        <button class="navbar-toggler ms-auto" type="button" id="btnNavToggle"
                data-bs-toggle="collapse" data-bs-target="#hhNavMenu"
                aria-controls="hhNavMenu" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="hhNavMenu">
          <ul class="navbar-nav hhNavPills mx-lg-auto">${pills}</ul>
          <div class="d-flex hhNavActions">
            <a class="hhBtn hhBtnWhite" id="btnNavLogin" href="${buildUrl("login")}">Log in</a>
            <a class="hhBtn hhBtnPrimary" id="btnNavSignup" href="${buildUrl("signup")}">Sign up</a>
          </div>
        </div>
      </div>
    </nav>`;
}

function renderFooterColumn(title, links) {
  const items = links.map(([label, href, external]) =>
    `<li><a href="${href}" ${external ? 'target="_blank" rel="noopener"' : ""}>${label}</a></li>`).join("");
  return `
    <div class="col-6 col-md-3 col-lg-2">
      <h4 class="hhFooterHeading">${title}</h4>
      <ul class="hhFooterList">${items}</ul>
    </div>`;
}

function renderFooter() {
  return `
    <footer class="hhFooter">
      <div class="hhContainer">
        <div class="row gy-4">
          <div class="col-12 col-lg-4">${renderLogo("hhLogoFooter")}</div>
          ${renderFooterColumn("Explore", [["Discover Hobbies", buildUrl(isLoggedIn() ? "discoveryFlow" : "discover", isLoggedIn() ? "?u=1" : "")], ["Classes &amp; Events", buildUrl(isLoggedIn() ? "classesBrowse" : "classes", isLoggedIn() ? "?u=1" : "")], ["Communities", buildUrl(isLoggedIn() ? "groups" : "groupsIntro", isLoggedIn() ? "?u=1" : "")]])}
          ${renderFooterColumn("About", [["About Us", buildUrl("about")], ["FAQ", buildUrl("home", "#faq")], ["Contact Us", buildUrl("contact")]])}
          ${renderFooterColumn("Legal", [["Privacy Policy", buildUrl("privacy")], ["Terms &amp; Conditions", buildUrl("terms")]])}
          ${renderFooterColumn("Follow Us", [["Instagram", "https://www.instagram.com/", true], ["LinkedIn", "https://www.linkedin.com/", true]])}
        </div>
        <div class="hhFooterBottom">© ${siteInfo.year} HobbyHub — Discover · Learn · Connect · Grow</div>
      </div>
    </footer>`;
}

// الـ Modal: صندوق صغير بيطلع فوق الصفحة (هون: "لازم تعملي حساب")
function renderLoginModal() {
  return `
    <div class="modal fade hhModal" id="loginRequiredModal" tabindex="-1" aria-labelledby="loginRequiredTitle" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-body text-center p-4 p-md-5">
            <div class="hhModalIcon" aria-hidden="true">🌱</div>
            <h2 class="hhModalTitle" id="loginRequiredTitle">Create a free account to continue</h2>
            <p class="hhModalText">You need an account to enroll, join communities and save your progress.</p>
            <a class="hhBtn hhBtnPrimary" id="btnModalSignup" href="${buildUrl("signup")}">Sign up</a>
            <a class="hhBtn hhBtnOutline" id="btnModalLogin" href="${buildUrl("login")}">Log in</a>
            <button type="button" class="hhLinkBtn" id="btnModalLater" data-bs-dismiss="modal">Maybe later</button>
          </div>
        </div>
      </div>
    </div>`;
}

function showLoginModal() {
  const modalElement = document.getElementById("loginRequiredModal");
  if (modalElement) bootstrap.Modal.getOrCreateInstance(modalElement).show();
}

// أي عنصر عليه data-requires-login: الزائر (مش مسجل) بنفتحله الصندوق بدل ما ينفذ الفعل
document.addEventListener("click", (event) => {
  const gatedElement = event.target.closest("[data-requires-login]");
  if (gatedElement && !isLoggedIn()) {
    event.preventDefault();
    showLoginModal();
  }
});

// الشريط الجانبي الخاص بصفحات المستخدم المسجل دخوله.
function renderUserSidebar(active = "dashboard") {
  const items = [
    ["dashboard", "Dashboard", "▦", "dashboard"],
    ["discover", "Hobby Discovery", "✦", "discoveryFlow"],
    ["classesBrowse", "Classes | Events | Trainings", "▤", "classesBrowse"],
    ["groups", "Communities", "♧", "groups"],
    ["journeyApp", "My Journey", "↗", "journeyApp"],
    ["aiApp", "AI Generator", "✧", "aiApp"]
  ];
  const links = items.map(([key, label, icon, route]) => `
    <a class="hhUserNavLink ${active === key ? "isActive" : ""}" id="userNav${key}" href="${buildUrl(route, "?u=1")}" ${active === key ? 'aria-current="page"' : ""}>
      <span class="hhUserNavIcon" aria-hidden="true">${icon}</span><span>${label}</span>
    </a>`).join("");
  return `
    <aside class="hhUserSidebar" id="hhUserSidebar" aria-label="User navigation">
      <div class="hhUserSidebarBrand">${renderLogo("hhUserLogo")}</div>
      <nav class="hhUserNav">${links}</nav>
      <div class="hhUserAccount">
        <p class="hhUserAccountLabel">ACCOUNT</p>
        <a class="hhUserNavLink ${active === "profile" ? "isActive" : ""}" id="userNavProfile" href="${buildUrl("profile", "?u=1")}" ${active === "profile" ? 'aria-current="page"' : ""}><span class="hhUserNavIcon" aria-hidden="true">○</span><span>Profile</span></a>
        <a class="hhUserNavLink" id="userNavLogout" href="${buildUrl("home")}"><span class="hhUserNavIcon" aria-hidden="true">↪</span><span>Log out</span></a>
      </div>
    </aside>`;
}

function renderUserHeader(options = {}) {
  const links = [["discover", "Discover", "discoveryFlow"], ["classesBrowse", "Classes", "classesBrowse"], ["groups", "Groups", "groups"], ["journeyApp", "Journey", "journeyApp"], ["aiApp", "AI", "aiApp"]];
  return `
    <header class="hhUserHeader">
      <div class="hhUserPageHeading"><h1>${options.title || "Dashboard"}</h1><p>${options.subtitle || "Your HobbyHub overview"}</p></div>
      <nav class="hhUserTopNav" aria-label="Quick navigation">${links.map(([key, label, route]) => `<a class="hhPill ${options.active === key ? "isActive" : ""}" id="userTop${key}" href="${buildUrl(route, "?u=1")}">${label}</a>`).join("")}</nav>
      <a class="hhUserAvatar" href="${buildUrl("profile", "?u=1")}" aria-label="User profile">${escapeHtml((currentUser.name || "M").charAt(0).toUpperCase())}</a>
    </header>`;
}

function renderUserFooter() {
  return renderFooter();
}

// بتركّب الأجزاء المشتركة بأماكنها. صفحات الزوار بتحتفظ بالـ navbar العام.
function mountSharedUi(options = {}) {
  if (options.adminApp) {
    if (typeof mountAdminUi !== "function") throw new Error("Admin shell is not loaded.");
    return mountAdminUi(options);
  }
  const navbarSlot = document.getElementById("hhNavbar");
  const footerSlot = document.getElementById("hhFooter");
  const modalsSlot = document.getElementById("hhModals");
  if (options.userApp) {
    const sidebarSlot = document.getElementById("hhUserSidebarSlot");
    const headerSlot = document.getElementById("hhUserHeaderSlot");
    if (sidebarSlot) sidebarSlot.innerHTML = renderUserSidebar(options.active || "dashboard");
    if (headerSlot) headerSlot.innerHTML = renderUserHeader(options);
    if (footerSlot) footerSlot.innerHTML = renderUserFooter();
    if (navbarSlot) navbarSlot.innerHTML = "";
  } else {
    if (navbarSlot) navbarSlot.innerHTML = renderNavbar(options.active || null);
    if (footerSlot) footerSlot.innerHTML = renderFooter();
  }
  if (modalsSlot) modalsSlot.innerHTML = renderLoginModal();
  applyRoutes(document);
  if (typeof applyWebsiteContent === "function") applyWebsiteContent();
}
