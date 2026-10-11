/* Classes & Events listing — renders from shared mock data. */
(function(){
 const loggedIn=isLoggedIn();document.body.classList.toggle("hasUserSession",loggedIn);
 if(!loggedIn){const shell=document.querySelector(".hhUserApp"),main=document.querySelector(".hhUserMain");if(shell)shell.classList.remove("hhUserApp");if(main)main.classList.remove("hhUserMain");const side=document.getElementById("hhUserSidebarSlot"),head=document.getElementById("hhUserHeaderSlot");if(side)side.remove();if(head)head.remove();}
 mountSharedUi({userApp:loggedIn,active:loggedIn?"classesBrowse":"classes",title:"Classes & Events",subtitle:"Browse classes, events & training"});
 const grid=document.getElementById("activityGrid"), search=document.getElementById("activitySearch"), filters=document.getElementById("categoryFilters");
 let selected="all";
 let initialHobby=new URLSearchParams(location.search).get("hobby");
 const published=activities.filter(a=>(a.status||"published")==="published"&&(loggedIn||a.isFeatured===true));
 const cats=categories;
 function card(a){
  const hobby=hobbies.find(h=>h.id===a.hobbyId), cat=cats.find(c=>c.id===(a.categoryId||(hobby&&hobby.categoryId)));
  const spots=Math.max(0,Number(a.seats||0));
  return `<article class="cbCard reveal" data-activity-id="${escapeHtml(a.id)}">
   <div class="cbCardVisual ${cat?'tint-'+cat.tint:''}"><span class="cbActivityIcon">${escapeHtml(a.emoji||(hobby&&hobby.emoji)||'✦')}</span><span class="cbType">${escapeHtml(a.type||'Class')}</span>${a.delivery==="Online (Zoom)"?'<span class="cbOnline">● Online</span>':''}<span class="cbVisualOrb" aria-hidden="true"></span></div>
   <div class="cbCardBody"><div class="cbMetaLine"><span>${escapeHtml(cat?cat.name:'Hobby')}</span><span class="cbLevel">${escapeHtml(a.level||'All levels')}</span></div><h4>${escapeHtml(a.title)}</h4><p class="cbOrganizer">${escapeHtml(a.organizer||'HobbyHub partner')}</p><div class="cbCardFacts"><span>◷ ${escapeHtml(a.duration||a.sessions||'Flexible')}</span><span class="cbSpots">● ${spots} spots left</span></div><div class="cbCardBottom"><strong class="${Number(a.priceJod||0)===0?'isFree':''}">${formatPrice(Number(a.priceJod||0))}</strong><a class="hhBtn hhBtnOutline cbView" href="${buildUrl('activityDetails','?id='+encodeURIComponent(a.id)+(loggedIn?'&u=1':''))}" data-activity-id="${escapeHtml(a.id)}">View <span aria-hidden="true">↗</span></a></div></div>
  </article>`;
 }
 function render(){
  const q=search.value.trim().toLowerCase();
  const list=published.filter(a=>{const h=hobbies.find(x=>x.id===a.hobbyId),cat=categories.find(c=>c.id===(a.categoryId||(h&&h.categoryId)));return ((selected==="all"||cat&&cat.id===selected)&&(!initialHobby||a.hobbyId===initialHobby))&&[a.title,a.organizer,a.type,a.description,h&&h.name,cat&&cat.name].some(v=>String(v||"").toLowerCase().includes(q));});
  grid.innerHTML=list.map(card).join("");document.getElementById("resultsCount").textContent=`${list.length} ${list.length===1?'experience':'experiences'}`;document.getElementById("resultsTitle").textContent=selected==="all"?"Explore all experiences":(cats.find(c=>c.id===selected)?.name||"Explore experiences");document.getElementById("activityEmpty").hidden=!!list.length;initReveal();
 }
 function renderFilters(){filters.innerHTML=[{id:"all",name:"All",emoji:"✦"},...cats].map(c=>`<button class="cbFilter ${selected===c.id?'isActive':''}" type="button" data-category="${c.id}" aria-pressed="${selected===c.id}">${c.name}</button>`).join("");}
 filters.addEventListener("click",e=>{const b=e.target.closest("[data-category]");if(!b)return;selected=b.dataset.category;initialHobby=null;renderFilters();render();});
 search.addEventListener("input",render);document.getElementById("clearFilters").addEventListener("click",()=>{selected="all";search.value="";renderFilters();render();});
 // Allow direct links from quiz results to pre-filter by hobby.
 const params=new URLSearchParams(location.search), hobbyId=params.get("hobby");if(hobbyId){const h=hobbies.find(x=>x.id===hobbyId);if(h)selected=h.categoryId;}
 renderFilters();render();
})();