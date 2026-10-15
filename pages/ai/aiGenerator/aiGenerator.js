/* AI Generator — static demo ideas only; no storage and no live AI calls. */
(function(){
  if(!isLoggedIn()){
    window.location.href=buildUrl("ai");
    return;
  }
  document.body.classList.add("hasUserSession");
  mountSharedUi({userApp:true,active:"aiApp",title:"AI Generator",subtitle:"Turn your hobby into a doable idea."});

  const form=document.getElementById("aiGeneratorForm");
  const hobbySelect=document.getElementById("aiHobby");
  const preview=document.getElementById("aiGenPreviewCanvas");
  const saveButton=document.getElementById("btnSaveIdea");
  const regenerateButton=document.getElementById("btnRegenerateIdea");
  const toast=document.getElementById("aiGenToast");
  let generatedIndex=0;
  let currentIdea=null;
  let currentInputs=null;
  let toastTimeout=null;

  const ideaBank=sharedIdeaBank, genericIdeas=sharedGenericIdeas;

  function showToast(message){
    toast.textContent=message;toast.classList.add("isVisible");
    clearTimeout(toastTimeout);toastTimeout=setTimeout(()=>toast.classList.remove("isVisible"),2600);
  }
  function getSelected(name){return form.querySelector(`input[name="${name}"]:checked`)?.value||""}
  function updateChoiceStyles(){
    form.querySelectorAll('input[type="radio"]').forEach(input=>{
      const label=input.closest("label");
      if(label)label.classList.toggle("isSelected",input.checked);
    });
  }
  function renderHobbies(){
    getCategories().then(groups=>{
      const all=groups.flatMap(group=>group.hobbies.map(hobby=>({...hobby,categoryName:group.name})));
      hobbySelect.innerHTML='<option value="">Choose a hobby</option>'+all.map(hobby=>`<option value="${escapeHtml(hobby.id)}" data-emoji="${escapeHtml(hobby.emoji||"✦")}">${escapeHtml(hobby.name)}</option>`).join("");
      const initial=all.find(h=>h.id==="photography");
      if(initial)hobbySelect.value=initial.id;
    });
  }
  function chooseIdea(hobbyId){
    const options=ideaBank[hobbyId]||genericIdeas;
    const idea=options[generatedIndex%options.length]||genericIdeas[generatedIndex%genericIdeas.length];
    generatedIndex++;
    return idea;
  }
  function renderIdea(idea,inputs){
    const selectedOption=hobbySelect.options[hobbySelect.selectedIndex];
    const hobbyName=selectedOption?.textContent||"Your hobby";
    const tools=inputs.tools||"Everyday materials";
    preview.innerHTML=`
      <div class="aiGenResults">
        <div class="aiGenResultsHead"><span class="aiGenResultsEmoji" aria-hidden="true">${idea.emoji}</span><div><small>YOUR GENERATED IDEA</small><h4>${escapeHtml(idea.title)}</h4><p>${escapeHtml(hobbyName)} · ${escapeHtml(inputs.level)}</p></div></div>
        <p class="aiGenResultsDescription">${escapeHtml(idea.description)}</p>
        <div class="aiGenPlan"><p class="aiGenEyebrow">YOUR LITTLE PLAN</p>
          ${idea.steps.map((step,index)=>`<div class="aiGenIdeaStep"><span>${index+1}</span><div><h5>${escapeHtml(step[0])}</h5><p>${escapeHtml(step[1])}</p></div></div>`).join("")}
        </div>
        <div class="aiGenIdeaMeta"><span>⏱ ${escapeHtml(inputs.time)}</span><span>⌂ ${escapeHtml(idea.place)}</span><span>🧰 ${escapeHtml(tools)}</span></div>
      </div>`;
    saveButton.disabled=false;regenerateButton.disabled=false;
  }
  function generateIdea(){
    if(!hobbySelect.value){hobbySelect.focus();showToast("Choose a hobby first, and your idea will be on its way.");return}
    const inputs={hobby:hobbySelect.value,level:getSelected("level"),time:getSelected("time"),tools:document.getElementById("aiTools").value.trim()};
    currentIdea=chooseIdea(inputs.hobby);
    currentInputs=inputs;
    renderIdea(currentIdea,inputs);
    saveButton.innerHTML="♡ Save idea";
    showToast("Your little idea is ready. Make it your own!");
  }
  form.addEventListener("change",updateChoiceStyles);
  form.addEventListener("submit",event=>{event.preventDefault();generateIdea()});
  regenerateButton.addEventListener("click",()=>{if(!currentIdea)return;generateIdea()});
  saveButton.addEventListener("click",()=>{
    if(!currentIdea || !currentInputs)return;
    const selectedHobby=hobbySelect.options[hobbySelect.selectedIndex];
    const goal={
      id:"goalAi"+Date.now().toString(36),
      hobby:selectedHobby?.textContent||"Hobby",
      title:currentIdea.title,
      description:currentIdea.description,
      emoji:currentIdea.emoji||"🌱",
      progress:0,
      milestones:(currentIdea.steps||[]).map((step,index)=>({
        id:"aiStep"+(index+1),
        text:step[0]+(step[1]?" — "+step[1]:""),
        done:false
      })),
      notes:[]
    };
    if(!goal.milestones.length){
      showToast("Generate an idea with steps before saving it as a goal.");
      return;
    }
    // Pass the demo goal through the next page URL only; no browser storage or backend.
    const query="?u=1&savedGoal="+encodeURIComponent(JSON.stringify(goal));
    window.location.href=buildUrl("myJourney",query);
  });
  renderHobbies();
  updateChoiceStyles();
})();
