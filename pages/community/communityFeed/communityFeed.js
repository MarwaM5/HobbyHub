/* One feed per hobby. Posts and joins are demo state held in memory only. */
(function(){
 const loggedIn=isLoggedIn();document.body.classList.toggle("hasUserSession",loggedIn);
 if(!loggedIn){const shell=document.querySelector(".hhUserApp"),main=document.querySelector(".hhUserMain");if(shell)shell.classList.remove("hhUserApp");if(main)main.classList.remove("hhUserMain");document.getElementById("hhUserSidebarSlot")?.remove();document.getElementById("hhUserHeaderSlot")?.remove();}
 const params=new URLSearchParams(location.search),hobbyId=params.get("id")||"photography",hobby=hobbies.find(h=>h.id===hobbyId)||hobbies.find(h=>h.id==="photography"),category=categories.find(c=>c.id===hobby.categoryId)||categories[0];
 mountSharedUi({userApp:loggedIn,active:"groups",title:hobby.name,subtitle:"Community feed"});
 const palette={pink:["#ed7052","#fbe3da"],orange:["#e69a4b","#fce9d9"],green:["#7da477","#e6eee2"]},colors=palette[category.tint]||palette.pink;
 const joined=new Set(memberships.filter(m=>m.userId===currentUser.id).map(m=>communities.find(c=>c.id===m.communityId)?.hobbyId));
 const community=communities.find(c=>c.hobbyId===hobby.id&&c.status==='active');
 if(!community){const main=document.querySelector('main');if(main)main.innerHTML='<section class="lsNotFound"><h2>Community unavailable</h2><p>This community is not currently active.</p></section>';return;}
 if(loggedIn&&params.get('joined')==='1'&&!joined.has(hobby.id)){joined.add(hobby.id);memberships.push({id:'member-'+Date.now(),userId:currentUser.id,communityId:community.id,joinedAt:new Date().toISOString()});}
 const posts=communityPosts.filter(p=>p.communityId===community?.id&&p.status==='visible').map(p=>{const author=users.find(u=>u.id===p.userId);return {...p,author:author?.name||'Member',initial:(author?.name||'M')[0],time:p.createdAt.slice(0,10),liked:false};});
 const memberCounts=Object.fromEntries(communities.map(c=>[c.hobbyId,memberships.filter(m=>m.communityId===c.id).length]));
 document.title=`${hobby.name} Community — HobbyHub`;document.getElementById("feedHobbyIcon").textContent=hobby.emoji||category.emoji;document.getElementById("feedCategory").textContent=`${category.name.toUpperCase()} COMMUNITY`;document.getElementById("feedCommunityTitle").textContent=`${hobby.name} Community`;document.getElementById("feedCommunityDescription").textContent=`A place to share what you’re learning, ask questions, and celebrate the little wins in ${hobby.name.toLowerCase()}.`;document.getElementById("feedMemberCount").textContent=`♡ ${memberCounts[hobby.id]||0} members`;document.getElementById("feedAboutText").textContent=`Share your questions, tips, and small wins with people who enjoy ${hobby.name.toLowerCase()} just as much as you do.`;
 document.getElementById("backToCommunities").href=buildUrl("communitiesBrowse",loggedIn?"?u=1":"");document.getElementById("relatedClassesLink").href=buildUrl("classesBrowse","?hobby="+encodeURIComponent(hobby.id)+(loggedIn?"&u=1":""));document.getElementById("relatedJourneyLink").href=buildUrl("journeyApp",loggedIn?"?u=1":"");
 const joinButton=document.getElementById("feedJoinButton"),form=document.getElementById("communityPostForm"),postText=document.getElementById("communityPostText"),list=document.getElementById("communityPostList");
 function showCommunityNotice(message){
  let overlay=document.getElementById("communityNoticeOverlay");
  if(!overlay){
   overlay=document.createElement("div");
   overlay.id="communityNoticeOverlay";
   overlay.className="communityNoticeOverlay";
   overlay.innerHTML=`<section class="communityNoticeDialog" role="alertdialog" aria-modal="true" aria-labelledby="communityNoticeTitle" aria-describedby="communityNoticeText">
    <button type="button" class="communityNoticeClose" aria-label="Close notice">&times;</button>
    <div class="communityNoticeIcon" aria-hidden="true">✳</div>
    <p class="feedEyebrow">ONE LITTLE STEP</p>
    <h3 id="communityNoticeTitle">Join the conversation</h3>
    <p class="communityNoticeText" id="communityNoticeText"></p>
    <button type="button" class="hhBtn hhBtnPrimary communityNoticeOkay">Got it</button>
   </section>`;
   document.body.appendChild(overlay);
   const closeNotice=()=>{overlay.classList.remove("isVisible");document.removeEventListener("keydown",onNoticeKeydown);};
   const onNoticeKeydown=(event)=>{if(event.key==="Escape")closeNotice();};
   overlay.querySelector(".communityNoticeClose").addEventListener("click",closeNotice);
   overlay.querySelector(".communityNoticeOkay").addEventListener("click",closeNotice);
   overlay.addEventListener("click",event=>{if(event.target===overlay)closeNotice();});
   overlay._closeNotice=closeNotice;
   overlay._onNoticeKeydown=onNoticeKeydown;
  }
  overlay.querySelector("#communityNoticeText").textContent=message;
  overlay.classList.add("isVisible");
  document.addEventListener("keydown",overlay._onNoticeKeydown);
 }
 function renderJoin(){const isJoined=joined.has(hobby.id);joinButton.classList.toggle("isJoined",isJoined);joinButton.innerHTML=isJoined?'Joined <span>✓</span>':'Join community <span>＋</span>';joinButton.setAttribute("aria-pressed",String(isJoined));}
 function renderPosts(){list.innerHTML=posts.map((p,i)=>`<article class="communityPost" style="--post-accent:${colors[0]};--post-tint:${colors[1]};animation-delay:${i*55}ms"><div class="communityPostHead"><span class="postAvatar">${escapeHtml(p.initial)}</span><div class="postAuthor"><strong>${escapeHtml(p.author)}</strong><small>${escapeHtml(p.time)}</small></div></div><p>${escapeHtml(p.text)}</p><div class="communityPostFoot"><span class="postReplyCount"><span>↩</span>${p.replies} replies</span><button type="button" class="postLikeButton ${p.liked?'isLiked':''}" data-like-post="${escapeHtml(p.id)}" aria-pressed="${p.liked}">♡ ${p.likes} <span>Helpful</span></button></div></article>`).join("");document.getElementById("feedPostCount").textContent=`${posts.length} ${posts.length===1?'post':'posts'}`;document.getElementById("communityFeedEmpty").hidden=!!posts.length;}
 joinButton.addEventListener("click",()=>{if(!loggedIn){showLoginModal();return}if(joined.has(hobby.id)){joined.delete(hobby.id);const i=memberships.findIndex(m=>m.userId===currentUser.id&&m.communityId===community?.id);if(i>=0)memberships.splice(i,1);}else if(community){joined.add(hobby.id);memberships.push({id:"member-"+Date.now(),userId:currentUser.id,communityId:community.id,joinedAt:new Date().toISOString()});}renderJoin()});
 form.addEventListener("submit",e=>{e.preventDefault();if(!loggedIn){showLoginModal();return}const text=postText.value.trim();if(!text)return;if(!joined.has(hobby.id)){showCommunityNotice("Join this community before sharing a post.");return}posts.unshift({id:`userPost${Date.now()}`,author:currentUser.name||"You",initial:(currentUser.name||"M").charAt(0).toUpperCase(),time:"Just now",type:"Question",text,replies:0,likes:0,liked:false});communityPosts.unshift({id:posts[0].id,communityId:community.id,userId:currentUser.id,text,createdAt:new Date().toISOString(),status:"visible",likes:0,replies:0});postText.value="";renderPosts()});
 list.addEventListener("click",e=>{const button=e.target.closest("[data-like-post]");if(!button)return;if(!loggedIn){showLoginModal();return}const post=posts.find(p=>p.id===button.dataset.likePost);if(!post)return;post.liked=!post.liked;post.likes=Math.max(0,post.likes+(post.liked?1:-1));renderPosts()});
 if(!loggedIn){const note=document.createElement("p");note.className="feedGuestNote";note.textContent="You’re welcome to look around. Join this community or post when you’re ready to create a free account.";form.before(note);postText.addEventListener("focus",()=>showLoginModal());}
 renderJoin();renderPosts();
})();
