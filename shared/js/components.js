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

/* Accessible, searchable replacement for hobby selects. The original select remains the form control. */
function enhanceHobbySelect(select){
 if(!select||select.dataset.searchReady)return;
 select.dataset.searchReady='true';
 const items=[...select.querySelectorAll('option')].filter(o=>o.getAttribute('value')!==''&&o.value!=='' && o.textContent.trim()).map(o=>({value:o.value||o.getAttribute('value')||o.textContent,label:o.textContent.trim(),group:o.parentElement?.tagName?.toLowerCase()==='optgroup'?o.parentElement.getAttribute('label'):categories.find(c=>hobbies.some(h=>(h.id===(o.value||o.getAttribute('value'))||h.name===o.textContent.trim())&&h.categoryId===c.id))?.name||'Hobbies'}));
 const wrap=document.createElement('div');wrap.className='hhHobbyPicker';
 select.parentElement.insertBefore(wrap,select);wrap.appendChild(select);select.classList.add('hhHobbyOriginal');select.tabIndex=-1;
 const input=document.createElement('input');input.type='text';input.className='hhHobbySearch';input.id=select.id+'Search';input.placeholder='Search or choose a hobby…';input.autocomplete='off';input.setAttribute('role','combobox');input.setAttribute('aria-required',String(select.required||select.hasAttribute('required')));input.setAttribute('aria-autocomplete','list');input.setAttribute('aria-expanded','false');input.setAttribute('aria-controls',select.id+'Options');input.setAttribute('aria-label','Search and choose a hobby');
 const list=document.createElement('div');list.id=select.id+'Options';list.className='hhHobbyOptions';list.setAttribute('role','listbox');list.hidden=true;
 wrap.appendChild(input);wrap.appendChild(list);
 const label=document.querySelector('label[for="'+select.id+'"]');if(label)label.setAttribute('for',input.id);
 let visible=[],active=-1;
 function selected(){input.value=items.find(item=>item.value===select.value)?.label||'';}
 function close(){list.hidden=true;input.setAttribute('aria-expanded','false');input.removeAttribute('aria-activedescendant');active=-1;}
 function mark(index){active=index;const rows=list.querySelectorAll('[role="option"]');rows.forEach((row,i)=>{row.classList.toggle('isHighlighted',i===active);if(i===active){input.setAttribute('aria-activedescendant',row.id);row.scrollIntoView?.({block:'nearest'});}});}
 function choose(index){const item=visible[index];if(!item)return;select.value=item.value;selected();select.dispatchEvent(new Event('change',{bubbles:true}));close();input.focus();}
 function show(query=''){
  visible=items.filter(item=>(item.label+' '+item.group).toLowerCase().includes(query.trim().toLowerCase()));active=-1;let group='';
  list.innerHTML=visible.length?visible.map((item,index)=>{const heading=group===item.group?'':`<div class="hhHobbyGroup" role="presentation">${escapeHtml(item.group)}</div>`;group=item.group;return heading+`<div class="hhHobbyOption" role="option" id="${select.id}-option-${index}" aria-selected="${item.value===select.value}" data-picker-index="${index}">${escapeHtml(item.label)}<span aria-hidden="true">${item.value===select.value?'✓':''}</span></div>`;}).join(''):'<p class="hhHobbyNoResults" role="status">No hobbies found. Try another name or category.</p>';
  list.hidden=false;input.setAttribute('aria-expanded','true');input.removeAttribute('aria-activedescendant');
  list.querySelectorAll('[data-picker-index]').forEach(row=>row.addEventListener('pointerdown',event=>{event.preventDefault();choose(Number(row.dataset.pickerIndex));}));
 }
 input.addEventListener('focus',()=>show());input.addEventListener('click',()=>{if(list.hidden)show();});input.addEventListener('input',()=>show(input.value));
 input.addEventListener('keydown',event=>{
  if(event.key==='ArrowDown'||event.key==='ArrowUp'){event.preventDefault();if(list.hidden)show();if(visible.length)mark((active+(event.key==='ArrowDown'?1:-1)+visible.length)%visible.length);}
  if(event.key==='Enter'&&!list.hidden){event.preventDefault();if(active>=0)choose(active);else if(visible.length===1)choose(0);}
  if(event.key==='Escape'){event.preventDefault();selected();close();}
 });
 input.addEventListener('blur',()=>{selected();close();});select.addEventListener('change',selected);select.addEventListener('invalid',()=>input.focus());selected();
}

/* Shared session-length choice: one meaning on AI and manual goals. */
function mountSessionDuration(host,id,initial=30){
 const preset=[15,30,60].includes(initial)?String(initial):'custom';
 host.innerHTML=`<fieldset class="hhSessionDuration"><legend>Time for one session</legend><div class="hhDurationChoices">${[[15,'15 min'],[30,'30 min'],[60,'1 hour'],['custom','Your time']].map(([value,label])=>`<label><input type="radio" name="${id}" value="${value}" ${String(value)===preset?'checked':''}><span>${label}</span></label>`).join('')}</div><div class="hhDurationCustom" id="${id}Custom" ${preset==='custom'?'':'hidden'}><label for="${id}Minutes">Your session length, in minutes</label><input id="${id}Minutes" type="number" min="5" max="480" step="1" inputmode="numeric" placeholder="e.g. 45" ${preset==='custom'?`value="${initial}" required`:''} aria-describedby="${id}Help ${id}Error"></div><p id="${id}Help" class="hhDurationHint">A session, not a deadline for your whole goal. Custom time: 5–480 minutes.</p><p id="${id}Error" class="hhDurationError" role="alert" hidden></p></fieldset>`;
 const radios=[...host.querySelectorAll('input[type="radio"]')],custom=host.querySelector('#'+id+'Custom'),input=host.querySelector('#'+id+'Minutes'),error=host.querySelector('#'+id+'Error');
 function choice(){return radios.find(r=>r.checked)?.value||preset;}
 radios.forEach(r=>r.addEventListener('change',()=>{custom.hidden=choice()!=='custom';input.required=!custom.hidden;input.disabled=custom.hidden;error.hidden=true;if(!custom.hidden)input.focus();}));
 input.disabled=preset!=='custom';
 input.addEventListener('input',()=>{error.hidden=true;input.setCustomValidity('');});
 return {read(){const raw=choice()==='custom'?input.value:choice();const n=Number(raw);if(!String(raw).trim()||!Number.isInteger(n)||n<5||n>480){error.textContent='Enter a whole number from 5 to 480 minutes.';error.hidden=false;input.focus();return null;}return n;}};
}
