/* Goal detail interactions. All demo state resets on refresh; no browser storage. */
const journeyGoalDetails={
 goalFirstSong:{hobby:"Guitar",title:"Play my first full song",description:"Build confidence through small, repeatable practice steps.",progress:68,milestones:[{id:"chords",text:"Learn 5 chords",done:true},{id:"transitions",text:"Practice chord transitions",done:true},{id:"intro",text:"Learn the song intro",done:true},{id:"fullSong",text:"Play the full song",done:false}],notes:["Practiced 30 minutes today."]},
 goalPhotoPortfolio:{hobby:"Photography",title:"Build a 10 photo portfolio",description:"Collect your favorite shots and learn to tell a story through your photos.",progress:35,milestones:[{id:"light",text:"Practice natural lighting",done:true},{id:"composition",text:"Try 3 composition techniques",done:true},{id:"portraits",text:"Take 3 portrait photos",done:false},{id:"outdoor",text:"Take 3 outdoor photos",done:false},{id:"edit",text:"Edit your favorite shots",done:false},{id:"portfolio",text:"Choose the final 10 photos",done:false}],notes:["Tried golden-hour photos this week."]}
};
let activeJourneyGoal;
function renderGoalDetail(){
 const params=new URLSearchParams(location.search);activeJourneyGoal=journeyGoalDetails[params.get("id")]||journeyGoalDetails.goalFirstSong;
 document.getElementById("goalHobbyEyebrow").textContent=activeJourneyGoal.hobby.toUpperCase()+" · YOUR PERSONAL GOAL";
 document.getElementById("goalTitle").textContent=activeJourneyGoal.title;document.getElementById("goalDescription").textContent=activeJourneyGoal.description;
 renderGoalMilestones();renderGoalNotes();
}
function updateGoalProgress(){
 const done=activeJourneyGoal.milestones.filter(m=>m.done).length;const total=activeJourneyGoal.milestones.length;const progress=Math.round(done/total*100);
 document.getElementById("goalProgressValue").textContent=progress+"%";document.getElementById("goalProgressCircle").style.setProperty("--goal-progress",progress);
 document.getElementById("goalMilestoneCount").textContent=done+" of "+total;
}
function renderGoalMilestones(){
 document.getElementById("goalMilestones").innerHTML=activeJourneyGoal.milestones.map(m=>`<label class="jdMilestone ${m.done?"isDone":""}" for="milestone-${m.id}"><input id="milestone-${m.id}" type="checkbox" data-milestone-id="${m.id}" ${m.done?"checked":""}><span>${escapeHtml(m.text)}</span></label>`).join("");
 updateGoalProgress();
 document.getElementById("goalMilestones").querySelectorAll("input").forEach(input=>input.addEventListener("change",()=>{const milestone=activeJourneyGoal.milestones.find(m=>m.id===input.dataset.milestoneId);milestone.done=input.checked;input.closest(".jdMilestone").classList.toggle("isDone",milestone.done);updateGoalProgress();}));
}
function renderGoalNotes(){
 const notes=document.getElementById("goalNotes");notes.innerHTML=activeJourneyGoal.notes.length?activeJourneyGoal.notes.map(note=>`<article class="jdNote"><p>${escapeHtml(note)}</p><time>Just now · Demo note</time></article>`).join(""):'<p class="jdEmptyNote">Your practice notes will appear here.</p>';
}
function initJourneyGoal(){
 if(!isLoggedIn()){window.location.href=buildUrl("login");return;}
 mountSharedUi({userApp:true,active:"journeyApp",title:"Goal Details",subtitle:"Celebrate every milestone"});
 applyRoutes(document);renderGoalDetail();
 document.getElementById("goalNoteForm").addEventListener("submit",event=>{event.preventDefault();const input=document.getElementById("goalNoteInput");const note=input.value.trim();if(!note)return;activeJourneyGoal.notes.unshift(note);input.value="";renderGoalNotes();});
}
initJourneyGoal();
