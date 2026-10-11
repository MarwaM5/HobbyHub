/* One feed per hobby. Posts and joins are demo state held in memory only. */
(function(){
 const loggedIn=isLoggedIn();document.body.classList.toggle("hasUserSession",loggedIn);
 if(!loggedIn){const shell=document.querySelector(".hhUserApp"),main=document.querySelector(".hhUserMain");if(shell)shell.classList.remove("hhUserApp");if(main)main.classList.remove("hhUserMain");document.getElementById("hhUserSidebarSlot")?.remove();document.getElementById("hhUserHeaderSlot")?.remove();}
 const params=new URLSearchParams(location.search),hobbyId=params.get("id")||"photography",hobby=hobbies.find(h=>h.id===hobbyId)||hobbies.find(h=>h.id==="photography"),category=categories.find(c=>c.id===hobby.categoryId)||categories[0];
 mountSharedUi({userApp:loggedIn,active:"groups",title:hobby.name,subtitle:"Community feed"});
 const palette={pink:["#ed7052","#fbe3da"],orange:["#e69a4b","#fce9d9"],green:["#7da477","#e6eee2"]},colors=palette[category.tint]||palette.pink;
 const memberCounts={photography:450,pottery:300,guitar:450,drawing:249,calligraphy:186,crochet:214,tatreez:137,accessoriesHandicrafts:96,oud:174,singing:231,piano:208,dabke:192,modernDance:143,hiking:388,camping:256,snorkeling:112,windsurfing:84,cycling:273,football:512,running:341,swimming:296,tennis:166,padel:207,cooking:325,bakingDesserts:278,homeGardening:148,coffeeBrewing:219,chess:302,tawleh:188,reading:407,groupBoardGames:224};
 let joined=new Set(loggedIn?["photography","guitar"]:[]);if(loggedIn&&params.get("joined")==="1")joined.add(hobby.id);const postsByHobby={photography:[{id:"p1",author:"Lina A.",initial:"L",time:"2h ago",type:"Question",text:"What’s one small thing that helped you get sharper photos when you first started? I’m practicing with natural light and would love to hear your tips.",replies:8,likes:12},{id:"p2",author:"Omar K.",initial:"O",time:"5h ago",type:"Tip",text:"Try taking the same photo from three different angles before changing your settings. It helped me notice how much composition changes the feeling of a picture.",replies:4,likes:17},{id:"p3",author:"Maya R.",initial:"M",time:"Yesterday",type:"Win",text:"Finally made a little photo series around my neighbourhood. Nothing fancy, but I’m proud that I kept going for a whole week. 📷",replies:6,likes:21}],guitar:[{id:"g1",author:"Yazan H.",initial:"Y",time:"1h ago",type:"Question",text:"How do you practice switching between chords without stopping the rhythm? My fingers know the shapes, but the transitions are still slow.",replies:9,likes:7},{id:"g2",author:"Nour S.",initial:"N",time:"4h ago",type:"Tip",text:"Start much slower than you think you need to. Change chords for one minute without strumming, then add a gentle downstroke.",replies:5,likes:14},{id:"g3",author:"Salma T.",initial:"S",time:"Yesterday",type:"Win",text:"Played my first full verse today without stopping. Tiny win, but it feels huge! 🎸",replies:3,likes:19}],drawing:[{id:"d1",author:"Rana M.",initial:"R",time:"3h ago",type:"Question",text:"What do you like to sketch when you only have ten minutes? I want a few easy prompts to build a daily habit.",replies:5,likes:11},{id:"d2",author:"Fadi A.",initial:"F",time:"Yesterday",type:"Tip",text:"Try drawing one everyday object using only five lines first. It makes you focus on the overall shape instead of tiny details.",replies:2,likes:8}]};
 const posts=(postsByHobby[hobby.id]||[{id:"s1",author:"Dana R.",initial:"D",time:"2h ago",type:"Question",text:`What’s one tip you wish you had known when you started ${hobby.name.toLowerCase()}? I’d love to learn from everyone here.`,replies:4,likes:9},{id:"s2",author:"Kareem A.",initial:"K",time:"Yesterday",type:"Tip",text:`Keep it simple and enjoy the process. A little practice with ${hobby.name.toLowerCase()} is better than waiting for the perfect time or perfect tools.`,replies:2,likes:13}]).map(p=>({...p,liked:false}));
 document.title=`${hobby.name} Community — HobbyHub`;document.getElementById("feedHobbyIcon").textContent=hobby.emoji||category.emoji;document.getElementById("feedCategory").textContent=`${category.name.toUpperCase()} COMMUNITY`;document.getElementById("feedCommunityTitle").textContent=`${hobby.name} Community`;document.getElementById("feedCommunityDescription").textContent=`A place to share what you’re learning, ask questions, and celebrate the little wins in ${hobby.name.toLowerCase()}.`;document.getElementById("feedMemberCount").textContent=`♡ ${memberCounts[hobby.id]||120} members`;document.getElementById("feedAboutText").textContent=`Share your questions, tips, and small wins with people who enjoy ${hobby.name.toLowerCase()} just as much as you do.`;
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
 function renderPosts(){list.innerHTML=posts.map((p,i)=>`<article class="communityPost" style="--post-accent:${colors[0]};--post-tint:${colors[1]};animation-delay:${i*55}ms"><div class="communityPostHead"><span class="postAvatar">${escapeHtml(p.initial)}</span><div class="postAuthor"><strong>${escapeHtml(p.author)}</strong><small>${escapeHtml(p.time)}</small></div><span class="postType">${escapeHtml(p.type)}</span></div><p>${escapeHtml(p.text)}</p><div class="communityPostFoot"><span class="postReplyCount"><span>↩</span>${p.replies} replies</span><button type="button" class="postLikeButton ${p.liked?'isLiked':''}" data-like-post="${escapeHtml(p.id)}" aria-pressed="${p.liked}">♡ ${p.likes} <span>Helpful</span></button></div></article>`).join("");document.getElementById("feedPostCount").textContent=`${posts.length} ${posts.length===1?'post':'posts'}`;document.getElementById("communityFeedEmpty").hidden=!!posts.length;}
 joinButton.addEventListener("click",()=>{if(!loggedIn){showLoginModal();return}if(joined.has(hobby.id))joined.delete(hobby.id);else joined.add(hobby.id);renderJoin()});
 form.addEventListener("submit",e=>{e.preventDefault();if(!loggedIn){showLoginModal();return}const text=postText.value.trim();if(!text)return;if(!joined.has(hobby.id)){showCommunityNotice("Join this community before sharing a post.");return}posts.unshift({id:`userPost${Date.now()}`,author:currentUser.name||"You",initial:(currentUser.name||"M").charAt(0).toUpperCase(),time:"Just now",type:"Question",text,replies:0,likes:0,liked:false});postText.value="";renderPosts()});
 list.addEventListener("click",e=>{const button=e.target.closest("[data-like-post]");if(!button)return;if(!loggedIn){showLoginModal();return}const post=posts.find(p=>p.id===button.dataset.likePost);if(!post)return;post.liked=!post.liked;post.likes=Math.max(0,post.likes+(post.liked?1:-1));renderPosts()});
 if(!loggedIn){const note=document.createElement("p");note.className="feedGuestNote";note.textContent="You’re welcome to look around. Join this community or post when you’re ready to create a free account.";form.before(note);postText.addEventListener("focus",()=>showLoginModal());}
 renderJoin();renderPosts();
})();
