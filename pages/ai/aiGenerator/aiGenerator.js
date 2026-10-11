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

  const ideaBank={
    photography:[
      {title:"One theme, five photos",description:"Pick a simple theme — shadows, circles, or your favourite colour — and capture five different photos around you.",steps:[["Choose your theme","Look around and pick one colour, shape or detail to focus on."],["Find five different angles","Try close-up, far away, above, below and a surprising angle."],["Pick your favourite","Choose the photo that tells the clearest little story."]],emoji:"📷",place:"At home or outside"},
      {title:"A tiny story in 3 shots",description:"Tell a mini story using just three photos: a beginning, a small detail and an ending.",steps:[["Pick a simple subject","Use a cup, a plant, a book or something on your desk."],["Capture three moments","Show the subject, a close-up detail and the final scene."],["Put them in order","Arrange the photos so someone else can follow the story."]],emoji:"📸",place:"Anywhere with light"}
    ],
    drawing:[{title:"Draw your everyday favourite",description:"Choose one object nearby and sketch it using only basic shapes before adding a few details.",steps:[["Choose one object","A mug, a shoe or a plant is perfect."],["Break it into shapes","Lightly sketch circles, rectangles and simple lines."],["Add three details","Focus on the details that make your object recognisable."]],emoji:"✏️",place:"A cosy desk"},
    ],
    guitar:[{title:"Make a 3-chord mini song",description:"Choose three chords you already know and build a short, steady pattern you can repeat.",steps:[["Choose three familiar chords","Use the chords you can switch between most comfortably."],["Find a gentle rhythm","Start with four slow down-strums per chord."],["Play the loop three times","Keep going without stopping, even if one change is imperfect."]],emoji:"🎸",place:"A quiet corner"},
    ],
    calligraphy:[{title:"Lettering with a little twist",description:"Write one word that makes you happy, then explore three different lettering styles for it.",steps:[["Choose your word","Pick something short like joy, bloom or hope."],["Try three styles","Change the size, spacing or shape of the letters."],["Circle your favourite","Add a small underline or decorative flourish."]],emoji:"🖋️",place:"Paper and a pen"},
    ],
    pottery:[{title:"Shape study: three tiny forms",description:"Sketch three small pottery forms you like and notice how their silhouettes change.",steps:[["Find a reference","Look at a cup, bowl or vase you already have."],["Draw three silhouettes","Try tall and narrow, low and wide, and softly rounded."],["Choose one detail","Add a handle, a rim or a simple pattern."]],emoji:"🏺",place:"At your table"},
    ],
    crochet:[{title:"A colour-and-stitch sampler",description:"Use leftover yarn to practise a small set of stitches and compare how the textures look.",steps:[["Choose two colours","Use whatever yarn you already have."],["Make a few practice rows","Repeat a stitch slowly and keep the tension relaxed."],["Notice the texture","Compare the rows and pick one to practise next time."]],emoji:"🧶",place:"A comfy seat"}]
  };
  const genericIdeas=[
    {title:"A 20-minute beginner challenge",description:"Turn what you already know into one small practice session, with a clear beginning and a tiny finish line.",steps:[["Choose one small focus","Pick a single skill or detail instead of trying to do everything."],["Practise in short rounds","Spend a few minutes experimenting without worrying about perfection."],["Notice one thing you learned","Write down what felt easy or what you want to try next."]],emoji:"🌱",place:"Where you feel comfortable"},
    {title:"Make something inspired by today",description:"Use a colour, sound, object or moment from your day as the starting point for a small creative activity.",steps:[["Notice one thing","Pick something that caught your attention today."],["Try three variations","Change the colour, shape, rhythm or approach each time."],["Keep the one you like","Save your favourite version as a starting point for next time."]],emoji:"✨",place:"With what you have"}
  ];

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
