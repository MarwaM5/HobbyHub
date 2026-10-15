/* home.js | سكريبت صفحة الهوم فقط.
   كل دالة إلها شغلة وحدة: بتجيب بيانات من dataService وبتعرضها بالصفحة. */

async function renderCategories() {
  const categoryList = await getCategories();
  document.getElementById("categoryGrid").innerHTML = categoryList.map((category, index) => {
    const hobbyPreview = category.hobbies.slice(0, 3).map((hobby) => escapeHtml(hobby.name)).join(" • ");  // أول 3 هوايات
    return `
      <div class="col-12 col-md-6 col-lg-4 reveal" style="--delay:${index * 70}ms">
        <a class="catCard tint${capitalize(category.tint)}" id="${category.id}Card" data-category-id="${category.id}"
           href="${buildUrl("category", "?c=" + category.id)}">
          <span class="catCardEmoji" aria-hidden="true">${category.emoji}</span>
          <span class="catCardTop"><span class="catCardDot"></span><h3 class="catCardName">${escapeHtml(category.name)}</h3></span>
          <span class="catCardHobbies">${hobbyPreview}</span>
          <span class="catCardLink">Explore category <span class="catCardArrow">→</span></span>
        </a>
      </div>`;
  }).join("");
}

async function renderSteps() {
  const stepList = await getHowSteps();
  document.getElementById("stepsGrid").innerHTML = stepList.map((step, index) => `
      <div class="col-12 col-sm-6 col-lg-3 reveal" style="--delay:${index * 90}ms">
        <a class="stepCard hhCard hhCardHover" id="${step.id}Card" href="${buildUrl(step.route)}">
          <span class="stepCardNum">${step.num}</span>
          <h3 class="stepCardTitle">${escapeHtml(step.title)}</h3>
          <p class="stepCardText">${escapeHtml(step.text)}</p>
          <span class="stepCardArrow" aria-hidden="true">→</span>
        </a>
      </div>`).join("");
}

async function renderFeatured() {
  const activityList = await getFeaturedActivities();
  document.getElementById("featuredGrid").innerHTML = activityList.map((activity, index) => `
      <div class="col-12 col-md-6 col-lg-4 reveal" style="--delay:${index * 90}ms">
        <a class="featCard hhCard hhCardHover" id="${activity.id}Card" data-activity-id="${activity.id}" data-activity-type="${escapeHtml(String(activity.type || "Class").toLowerCase())}"
           href="${buildUrl("activity", "?id=" + activity.id)}">
          <span class="featCardImage" aria-hidden="true"><img class="featCardCover" src="${escapeHtml(ActivityMedia.resolve(activity))}" alt="" width="1536" height="1024" loading="lazy" decoding="async"></span>
          <span class="featCardTitle">${escapeHtml(activity.title)}</span>
          <span class="featCardRow">
            <span class="featCardMeta">${escapeHtml(activity.type)} · ${formatPrice(activity.priceJod)}</span>
            <span class="featCardView">View</span>
          </span>
        </a>
      </div>`).join("");
  ActivityMedia.bind(document.getElementById("featuredGrid"));
}

// Bootstrap accordion: سؤال واحد مفتوح بكل مرة، والأول مفتوح من البداية
async function renderFaq() {
  const faqList = await getFaqs();
  document.getElementById("faqAccordion").innerHTML = faqList.map((faq, index) => {
    const isOpen = index === 0;
    return `
      <div class="accordion-item">
        <h3 class="accordion-header">
          <button class="accordion-button ${isOpen ? "" : "collapsed"}" type="button" id="${faq.id}Button"
                  data-bs-toggle="collapse" data-bs-target="#${faq.id}Answer"
                  aria-expanded="${isOpen}" aria-controls="${faq.id}Answer">${escapeHtml(faq.question)}</button>
        </h3>
        <div id="${faq.id}Answer" class="accordion-collapse collapse ${isOpen ? "show" : ""}" data-bs-parent="#faqAccordion">
          <div class="accordion-body">${escapeHtml(faq.answer)}</div>
        </div>
      </div>`;
  }).join("");
}

// تشغيل الصفحة: أول شي الأجزاء المشتركة، وبعدين المحتوى، وأخيراً الحركات والروابط
async function initHome() {
  mountSharedUi({ active: null });                                  // الهوم ما إلها زر نشط بالـ navbar
  await Promise.all([renderCategories(), renderSteps(), renderFeatured(), renderFaq()]);
  applyRoutes(document);                                            // روابط data-route (زر الكويز مثلاً)
  // Guests must sign in before opening the internal discovery quiz.
  document.querySelectorAll('[data-route="quiz"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const destination = isLoggedIn()
        ? buildUrl("quiz", "?u=1")
        : buildUrl("login");
      window.location.href = destination;
    });
  });
  initReveal();                                                     // حركة الظهور عند النزول
  document.dispatchEvent(new Event("hh:home-ready")); // Decorate the completed page without changing its data flow.
}

initHome();

/* Approved active campaigns only; no empty advertising placeholders. */
document.addEventListener('DOMContentLoaded',async()=>{
 for(const placement of ['home-banner','home-premium','home-featured']){
  const campaigns=await getVisibleCampaigns(placement);if(!campaigns.length)continue;
  const section=document.createElement('section');section.className='hhContainer hhSponsoredSection';section.setAttribute('aria-label','Sponsored');
  section.innerHTML=campaigns.map(c=>`<a class="hhSponsoredCard" href="${escapeHtml(c.destinationUrl)}" target="_blank" rel="noopener noreferrer"><img src="${escapeHtml(ActivityMedia.resolve({imageUrl:c.imageUrl}))}" alt="${escapeHtml(c.name)}"><span><small>Sponsored</small><strong>${escapeHtml(c.name)}</strong></span></a>`).join('');
  const target=document.getElementById('featuredGrid')?.closest('section');if(target)target.before(section);
 }
});
