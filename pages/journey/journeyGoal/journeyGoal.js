/* Goal detail interactions. All demo state resets on refresh; no browser storage. */
const journeyGoalDetails=JSON.parse(JSON.stringify(sharedJourneyDetails));
let activeJourneyGoal;
function getGoalFromQuery(){
 const params=new URLSearchParams(location.search);
 const raw=params.get("goalData");
 if(!raw)return null;
 try{
  const goal=JSON.parse(raw);
  if(!goal||!goal.id||!goal.title||!Array.isArray(goal.milestones))return null;
  goal.notes=Array.isArray(goal.notes)?goal.notes:[];
  goal.milestones=goal.milestones.map((m,index)=>({id:m.id||("milestone"+index),text:m.text||m.title||"Practice step",done:Boolean(m.done)}));
  return goal;
 }catch(error){return null;}
}
function syncGoalBackLink(){
 const back=document.getElementById("btnJourneyBack");
 if(!back||!activeJourneyGoal)return;
 const isGenerated=activeJourneyGoal.id&&String(activeJourneyGoal.id).startsWith("goalAi");
 if(isGenerated){
  back.href=buildUrl("myJourney","?u=1&savedGoal="+encodeURIComponent(JSON.stringify(activeJourneyGoal)));
 }else{
  back.href=buildUrl("myJourney","?u=1");
 }
}
function renderGoalDetail(){
 const params=new URLSearchParams(location.search);
 activeJourneyGoal=getGoalFromQuery()||journeyGoalDetails[params.get("id")]||journeyGoalDetails.goalFirstSong;
 document.getElementById("goalHobbyEyebrow").textContent=activeJourneyGoal.hobby.toUpperCase()+" · YOUR PERSONAL GOAL";
 document.getElementById("goalTitle").textContent=activeJourneyGoal.title;document.getElementById("goalDescription").textContent=activeJourneyGoal.description;
 renderGoalMilestones();renderGoalNotes();syncGoalBackLink();
}
function updateGoalProgress(){
 const done=activeJourneyGoal.milestones.filter(m=>m.done).length;const total=activeJourneyGoal.milestones.length;const progress=Math.round(done/total*100);
 document.getElementById("goalProgressValue").textContent=progress+"%";document.getElementById("goalProgressCircle").style.setProperty("--goal-progress",progress);
 document.getElementById("goalMilestoneCount").textContent=done+" of "+total;
}
function renderGoalMilestones(){
 document.getElementById("goalMilestones").innerHTML=activeJourneyGoal.milestones.map(m=>`<label class="jdMilestone ${m.done?"isDone":""}" for="milestone-${m.id}"><input id="milestone-${m.id}" type="checkbox" data-milestone-id="${m.id}" ${m.done?"checked":""}><span>${escapeHtml(m.text)}</span></label>`).join("");
 updateGoalProgress();
 document.getElementById("goalMilestones").querySelectorAll("input").forEach(input=>input.addEventListener("change",()=>{const milestone=activeJourneyGoal.milestones.find(m=>m.id===input.dataset.milestoneId);milestone.done=input.checked;input.closest(".jdMilestone").classList.toggle("isDone",milestone.done);updateGoalProgress();syncGoalBackLink();}));
}
function renderGoalNotes(){
 const notes=document.getElementById("goalNotes");notes.innerHTML=activeJourneyGoal.notes.length?activeJourneyGoal.notes.map(note=>`<article class="jdNote"><p>${escapeHtml(note)}</p><time>Just now · Demo note</time></article>`).join(""):'<p class="jdEmptyNote">Your practice notes will appear here.</p>';
}
function initJourneyGoal(){
 if(!isLoggedIn()){window.location.href=buildUrl("login");return;}
 mountSharedUi({userApp:true,active:"journeyApp",title:"Goal Details",subtitle:"Celebrate every milestone"});
 applyRoutes(document);renderGoalDetail();
 const params=new URLSearchParams(window.location.search);
 if(params.has("goalData"))window.history.replaceState({},document.title,window.location.pathname+"?u=1");
 document.getElementById("goalNoteForm").addEventListener("submit",event=>{event.preventDefault();const input=document.getElementById("goalNoteInput");const note=input.value.trim();if(!note)return;activeJourneyGoal.notes.unshift(note);input.value="";renderGoalNotes();syncGoalBackLink();});
}
initJourneyGoal();
