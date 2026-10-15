(function(){
 const loggedIn=isLoggedIn();document.body.classList.toggle("hasUserSession",loggedIn);
 if(!loggedIn){const shell=document.querySelector(".hhUserApp"),main=document.querySelector(".hhUserMain");if(shell)shell.classList.remove("hhUserApp");if(main)main.classList.remove("hhUserMain");const side=document.getElementById("hhUserSidebarSlot"),head=document.getElementById("hhUserHeaderSlot");if(side)side.remove();if(head)head.remove();}
 mountSharedUi({userApp:loggedIn,active:loggedIn?"classesBrowse":"classes",title:"Classes & Events",subtitle:"Explore an experience that fits you"});
 const pageParams=new URLSearchParams(location.search), id=pageParams.get("id"), alreadyEnrolled=hasActivityEnrollment(id), activity=activities.find(a=>a.id===id&&(a.status||"published")==="published"&&(loggedIn||a.isFeatured===true)), host=document.getElementById("activityDetails");
 if(!activity){host.innerHTML=`<section class="adNotFound"><span>🌱</span><h2>We couldn't find this experience</h2><p>It may have been removed or is no longer available.</p><a class="hhBtn hhBtnPrimary" href="${buildUrl('classesBrowse',loggedIn?'?u=1':'')}">Browse classes & events</a></section>`;return;}
 const hobby=hobbies.find(h=>h.id===activity.hobbyId),category=categories.find(c=>c.id===(activity.categoryId||(hobby&&hobby.categoryId))),free=Number(activity.priceJod||0)===0,online=String(activity.delivery||"").toLowerCase().startsWith("online");
 const price=free?'Free':`JOD ${Number(activity.priceJod).toFixed(2)}`;
 host.innerHTML=`<a class="adBack" href="${buildUrl('classesBrowse',loggedIn?'?u=1':'')}">← Back to Classes &amp; Events</a>
 <section class="adHero"><div class="adHeroArt ${category?'tint-'+category.tint:''}"><span class="adBigEmoji">${escapeHtml(activity.emoji||'✦')}</span><span class="adOrb"></span><span class="adArtCaption">${escapeHtml(activity.type)}</span></div>
 <div class="adMainInfo"><div class="adBadges"><span class="adType">${escapeHtml(activity.type)}</span><span class="adDelivery">${online?escapeHtml(activity.delivery):'⌂ In person'}</span>${free?'<span class="adFree">Free experience</span>':''}</div><p class="adEyebrow">YOUR NEXT EXPERIENCE</p><h2>${escapeHtml(activity.title)}</h2><p class="adOrganizer">Hosted by <strong>${escapeHtml(activity.organizer||'HobbyHub partner')}</strong></p>
 <p class="adTaxonomy">Category: ${escapeHtml(category?category.name:'Activities')} <span>•</span> Hobby: ${escapeHtml(hobby?hobby.name:'Various')} <span>•</span> Level: ${escapeHtml(activity.level||'All levels')}</p>
 <div class="adMetaGrid"><div><span>Date &amp; time</span><strong>${escapeHtml(activity.date||'Date to be announced')} · ${escapeHtml(activity.time||'Time to be announced')}</strong></div><div><span>Duration</span><strong>${escapeHtml(activity.sessions||activity.duration||'Details provided by host')}</strong></div><div><span>Spots available</span><strong class="adAvailable">${Number(activity.seats||0)} spots left</strong></div></div>
 <div class="adDescription"><h3>About this experience</h3><p>${escapeHtml(activity.description||'A welcoming experience to explore your interests and build new skills.')}</p><h3>What you will learn</h3><p>${escapeHtml(activity.whatYouLearn||'Explore the activity, practice at your own pace, and build confidence.')}</p></div>
 </div><aside class="adPriceCard"><p>Price</p><div class="adPrice ${free?'isFree':''}">${price}</div><small>${free?'No payment needed to enroll.':'Secure checkout for paid activities.'}</small><button class="hhBtn hhBtnPrimary adEnroll" id="btnEnroll">${alreadyEnrolled&&online?'Continue to Live Session':alreadyEnrolled?'✓ Enrolled':free?'Enroll for free':'Enroll now'} <span>→</span></button><p class="adCardNote">${online?'Your online session will be available after enrollment.':'Your experience details will be available after enrollment.'}</p></aside></section>
 <div class="adInfoNote"><span>✦</span><p>${online?'Open your online session after enrolling.':'Bring your curiosity — all listed details are provided by the activity host.'}</p></div>`;
 let isEnrolled=alreadyEnrolled;
 document.getElementById('btnEnroll').addEventListener('click',()=>{
  if(!loggedIn){showLoginModal();return;}
  const btn=document.getElementById('btnEnroll');
  if(isEnrolled){
   if(online){location.href=buildUrl('liveSession','?id='+encodeURIComponent(activity.id)+'&u=1');}
   return;
  }
  if(free){
   try { enrollInActivity(activity.id); } catch(error) { document.querySelector('.adCardNote').textContent=error.message; return; }
   isEnrolled=true;
   const note=document.querySelector('.adCardNote');
   note.textContent=online?'You’re enrolled! Your online session is ready to open.':'You’re enrolled! Your enrollment is confirmed.';
   note.classList.add('adSuccessNote');
   history.replaceState({},'',buildUrl('activityDetails','?id='+encodeURIComponent(activity.id)+'&u=1&enrolled=1'));
   if(online){btn.disabled=false;btn.innerHTML='Continue to Live Session <span>→</span>';}
   else {btn.innerHTML='✓ Enrolled <span>✓</span>';btn.disabled=true;}
   return;
  }
  location.href=buildUrl('checkout','?id='+encodeURIComponent(activity.id)+'&u=1');
 });
})();