/* Create Goal demo flow. No persistence: the project is frontend-only. */
let newGoalMilestoneCount=0;
const goalSuggestions={Guitar:"Play my first full song",Photography:"Build a 10 photo portfolio",Drawing:"Complete a 7-day sketch challenge",Pottery:"Create my first finished pottery piece",Cooking:"Cook five new recipes",Calligraphy:"Create a hand-lettered quote"};
function addNewGoalMilestone(value=""){
 const container=document.getElementById("newGoalMilestones");newGoalMilestoneCount+=1;const row=document.createElement("div");row.className="ngMilestoneRow";row.dataset.milestoneRow="true";
 row.innerHTML=`<span class="ngMilestoneNumber">${container.children.length+1}</span><input type="text" maxlength="100" aria-label="Milestone ${container.children.length+1}" placeholder="e.g. Practice for 15 minutes" value="${escapeHtml(value)}" required><button type="button" class="ngRemoveMilestone" aria-label="Remove milestone">×</button>`;
 row.querySelector("button").addEventListener("click",()=>{row.remove();renumberNewGoalMilestones();});container.appendChild(row);renumberNewGoalMilestones();
}
function renumberNewGoalMilestones(){document.querySelectorAll(".ngMilestoneRow").forEach((row,index)=>{row.querySelector(".ngMilestoneNumber").textContent=index+1;row.querySelector("input").setAttribute("aria-label","Milestone "+(index+1));});}
function showNewGoalToast(message){const toast=document.getElementById("newGoalToast");toast.textContent=message;toast.hidden=false;}
function initJourneyNewGoal(){
 if(!isLoggedIn()){window.location.href=buildUrl("login");return;}
 mountSharedUi({userApp:true,active:"journeyApp",title:"Create New Goal",subtitle:"Make your idea grow"});applyRoutes(document);
 addNewGoalMilestone();addNewGoalMilestone();addNewGoalMilestone();
 document.getElementById("btnAddMilestone").addEventListener("click",()=>addNewGoalMilestone());
 document.getElementById("btnSuggestGoal").addEventListener("click",()=>{const hobby=document.getElementById("goalHobby").value;const suggestion=document.getElementById("goalSuggestion");if(!hobby){suggestion.textContent="Choose a hobby first and we’ll suggest a goal for it.";suggestion.hidden=false;return;}const title=goalSuggestions[hobby]||"Build a small skill step by step";suggestion.innerHTML=`<b>Suggested goal:</b> ${escapeHtml(title)} <button type="button" class="ngUseSuggestion" style="margin-left:.5rem;border:0;background:transparent;color:#a94b34;font-weight:800;text-decoration:underline">Use this</button>`;suggestion.hidden=false;suggestion.querySelector("button").addEventListener("click",()=>{document.getElementById("goalTitleInput").value=title;});});
 document.getElementById("newGoalForm").addEventListener("submit",event=>{event.preventDefault();const hobby=document.getElementById("goalHobby").value;const title=document.getElementById("goalTitleInput").value.trim();const milestones=[...document.querySelectorAll(".ngMilestoneRow input")].map(input=>input.value.trim());const time=document.getElementById("weeklyTime").value;
 if(!hobby||!title||!time||milestones.length===0||milestones.some(item=>!item)){showNewGoalToast("Please complete the hobby, goal, weekly time, and each milestone.");return;}
 showNewGoalToast("Your goal is ready in this demo! Goal creation will connect to My Journey when the in-memory goal flow is completed. Nothing is saved after leaving this page.");
 });
}
initJourneyNewGoal();
