/* My Journey: demo goals live in memory only, per the current project brief. */
const journeyGoals = sharedJourneyGoals.map(goal=>({...goal}));
function readTransientGoal(){
  const params=new URLSearchParams(window.location.search);
  const raw=params.get("savedGoal");
  if(!raw)return null;
  try{
    const goal=JSON.parse(raw);
    if(!goal || !goal.id || !goal.title || !Array.isArray(goal.milestones))return null;
    goal.progress=goal.milestones.length?Math.round(goal.milestones.filter(m=>m.done).length/goal.milestones.length*100):0;
    goal.milestonesDone=goal.milestones.filter(m=>m.done).length;
    goal.milestonesTotal=goal.milestones.length;
    goal.accent="#ed7052";goal.end="#f6a15a";goal.tint="#fbe3da";
    return goal;
  }catch(error){return null;}
}
const receivedJourneyGoal=readTransientGoal();
function renderJourneyGoals(){
  const grid=document.getElementById("journeyGoalsGrid");
  const savedGoal=receivedJourneyGoal;
  const goals=savedGoal?[...journeyGoals.filter(goal=>goal.id!==savedGoal.id),savedGoal]:journeyGoals;
  grid.innerHTML=goals.map((goal)=>{
    const detailPayload=savedGoal&&goal.id===savedGoal.id
      ? "&goalData="+encodeURIComponent(JSON.stringify(savedGoal))
      : "";
    return `
    <article class="journeyGoalCard" id="${escapeHtml(goal.id)}" data-goal-id="${escapeHtml(goal.id)}" style="--goalAccent:${goal.accent};--goalEnd:${goal.end};--goalTint:${goal.tint};--progress:${goal.progress}%">
      <div class="journeyGoalTop">
        <div class="journeyGoalIcon" aria-hidden="true">${escapeHtml(goal.emoji||"🌱")}</div>
        <div class="journeyGoalInfo"><p class="journeyGoalHobby">${escapeHtml(goal.hobby)} journey${goal.plannedMinutes?" · "+escapeHtml(goal.plannedMinutes)+" min / session":""}</p><h3>${escapeHtml(goal.title)}</h3></div>
      </div>
      <div class="journeyGoalProgress">
        <div class="journeyProgressLabels"><span>You're making progress</span><strong>${goal.progress}%</strong></div>
        <div class="journeyProgressTrack" role="progressbar" aria-label="${escapeHtml(goal.title)} progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${goal.progress}"><div class="journeyProgressFill"></div></div>
      </div>
      <div class="journeyGoalFoot"><span class="journeyMilestoneHint">✓ ${goal.milestonesDone} of ${goal.milestonesTotal} milestones complete</span><a class="journeyViewBtn" href="${buildUrl("journeyGoal","?id="+encodeURIComponent(goal.id)+"&u=1"+detailPayload)}">View goal <span aria-hidden="true">→</span></a></div>
    </article>`;
  }).join("");
  document.getElementById("journeyGoalCount").textContent=`${goals.length} goals`;
}
function initMyJourney(){
  if(!isLoggedIn()){window.location.href=buildUrl("login");return;}
  mountSharedUi({userApp:true,active:"journeyApp",title:"My Journey",subtitle:"Your goals, milestones & notes"});
  applyRoutes(document);
  renderJourneyGoals();
  const params=new URLSearchParams(window.location.search);
  if(params.has("savedGoal"))window.history.replaceState({},document.title,window.location.pathname+"?u=1");
  initReveal();
}
initMyJourney();
