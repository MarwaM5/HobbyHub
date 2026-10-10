/* Dashboard page: renders mock data through dataService. No browser storage is used. */
function dashboardGreetingWord() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

async function renderDashboardNextSteps() {
  const items = await getDashboardNextSteps();
  document.getElementById("dashboardNextSteps").innerHTML = items.map((item) => `
    <article class="hhNextStepCard hhTint-${item.tint}" id="${item.id}" data-dashboard-card-id="${item.id}">
      <div class="hhNextStepCardTop"><span class="hhNextStepCardIcon" aria-hidden="true">${item.icon}</span><span class="hhCardArrow" aria-hidden="true">↗</span></div>
      <h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.description)}</p>
      <a class="hhTextAction" id="${item.id}Action" href="${buildUrl(item.route === "discover" ? "discoveryFlow" : item.route, "?u=1")}">${escapeHtml(item.action)} <span aria-hidden="true">→</span></a>
    </article>`).join("");
}

async function renderDashboardRecentActivity() {
  const items = await getDashboardRecentActivity();
  document.getElementById("dashboardRecentActivity").innerHTML = items.map((item) => `
    <article class="hhRecentItem" id="${item.id}" data-activity-id="${item.id}">
      <span class="hhRecentIcon hhTint-${item.tint}" aria-hidden="true">${item.icon}</span>
      <div class="hhRecentCopy"><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.detail)}</p></div>
      <time>${escapeHtml(item.time)}</time>
    </article>`).join("");
}

async function initDashboard() {
  if (!isLoggedIn()) {
    window.location.href = buildUrl("login");
    return;
  }
  mountSharedUi({ userApp: true, active: "dashboard", title: "Dashboard", subtitle: "Your HobbyHub overview" });
  const user = await getCurrentUser();
  document.getElementById("dashboardGreeting").innerHTML = `${dashboardGreetingWord()}, <span id="dashboardUserName">${escapeHtml(user.name)}</span> <span aria-hidden="true">👋</span>`;
  await Promise.all([renderDashboardNextSteps(), renderDashboardRecentActivity()]);
}

initDashboard();
