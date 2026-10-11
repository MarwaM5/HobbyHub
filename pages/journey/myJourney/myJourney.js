/* My Journey: demo goals live in memory only, per the current project brief. */
const journeyGoals = [
  { id:"goalFirstSong", hobby:"Guitar", title:"Play my first full song", emoji:"🎸", progress:68, milestonesDone:3, milestonesTotal:4, accent:"#ed7052", end:"#f6a15a", tint:"#fbe3da" },
  { id:"goalPhotoPortfolio", hobby:"Photography", title:"Build a 10 photo portfolio", emoji:"📸", progress:35, milestonesDone:2, milestonesTotal:6, accent:"#7da477", end:"#a8c59b", tint:"#e6eee2" }
];
function renderJourneyGoals(){
  const grid=document.getElementById("journeyGoalsGrid");
  grid.innerHTML=journeyGoals.map((goal)=>`
    <article class="journeyGoalCard" id="${goal.id}" data-goal-id="${goal.id}" style="--goalAccent:${goal.accent};--goalEnd:${goal.end};--goalTint:${goal.tint};--progress:${goal.progress}%">
      <div class="journeyGoalTop">
        <div class="journeyGoalIcon" aria-hidden="true">${goal.emoji}</div>
        <div class="journeyGoalInfo"><p class="journeyGoalHobby">${escapeHtml(goal.hobby)} journey</p><h3>${escapeHtml(goal.title)}</h3></div>
      </div>
      <div class="journeyGoalProgress">
        <div class="journeyProgressLabels"><span>You're making progress</span><strong>${goal.progress}%</strong></div>
        <div class="journeyProgressTrack" role="progressbar" aria-label="${escapeHtml(goal.title)} progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${goal.progress}"><div class="journeyProgressFill"></div></div>
      </div>
      <div class="journeyGoalFoot"><span class="journeyMilestoneHint">✓ ${goal.milestonesDone} of ${goal.milestonesTotal} milestones complete</span><a class="journeyViewBtn" href="${buildUrl("journeyGoal","?id="+encodeURIComponent(goal.id)+"&u=1")}" data-goal-view="${goal.id}">View goal <span aria-hidden="true">→</span></a></div>
    </article>`).join("");
  document.getElementById("journeyGoalCount").textContent=`${journeyGoals.length} goals`;
}
function initMyJourney(){
  if(!isLoggedIn()){window.location.href=buildUrl("login");return;}
  mountSharedUi({userApp:true,active:"journeyApp",title:"My Journey",subtitle:"Your goals, milestones & notes"});
  applyRoutes(document);
  renderJourneyGoals();
  initReveal();
}
initMyJourney();
