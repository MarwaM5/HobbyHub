
/* Quiz flow: question content comes from shared/js/data.js; all state is in memory only. */
(function(){
  if (!isLoggedIn()) { window.location.replace(buildUrl("login")); return; }
  mountSharedUi({userApp:true, active:"discover", title:"Hobby Discovery", subtitle:"Find hobbies that fit you"});
  const app=document.getElementById("quizApp");
  const questions=Array.isArray(hobbyQuizQuestions)?hobbyQuizQuestions:[];
  const answers={}; let current=0;
  function renderQuestion(){
    const q=questions[current]; if(!q){renderResults();return;}
    const selected=answers[q.id];
    const progress=Math.round((current/questions.length)*100);
    app.innerHTML=`<div class="quizTopline"><span>QUESTION ${current+1} OF ${questions.length}</span><span>${progress}% complete</span></div>
      <div class="quizProgress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${progress}"><div class="quizProgressFill" style="width:${progress}%"></div></div>
      <section class="quizPanel" key="${q.id}"><p class="dfEyebrow">LET’S GET TO KNOW YOU</p><h1>A few questions. Better recommendations.</h1><p class="quizIntro">${q.question}</p>
      <div class="quizOptions" role="group" aria-label="${q.question}">${q.options.map((o,i)=>`<button type="button" class="quizOption" data-option="${o.id}" aria-pressed="${selected===o.id}"><span class="quizOptionMark">${selected===o.id?"✓":String.fromCharCode(65+i)}</span><span>${o.label}</span></button>`).join("")}</div>
      <div class="quizTip">✦ Tip: there are no wrong answers — this is about your preferences.</div>
      <div class="quizActions"><button class="quizBack" id="quizBack" ${current===0?"disabled":""}>← Back</button><button class="quizNext" id="quizNext" ${selected===undefined?"disabled":""}>${current===questions.length-1?"See my matches":"Next →"}</button></div></section>`;
    app.querySelectorAll("[data-option]").forEach(btn=>btn.addEventListener("click",()=>{answers[q.id]=btn.dataset.option;renderQuestion();}));
    document.getElementById("quizBack").addEventListener("click",()=>{if(current>0){current--;renderQuestion();}});
    document.getElementById("quizNext").addEventListener("click",()=>{if(!answers[q.id])return;if(current<questions.length-1){current++;renderQuestion();}else renderResults();});
  }
  function getResults(){ return HobbyMatching.rank(hobbies,questions,answers); }
  function renderResults(){
    const results=getResults();
    app.innerHTML=`<div class="quizResultsHead"><div class="quizResultIcon">✦</div><p class="dfEyebrow">MADE FOR YOUR KIND OF FUN</p><h1>Your hobby matches</h1><p class="quizIntro">Here are a few ideas based on the preferences you shared.</p></div>
      <div class="quizResultGrid">${results.map((h,i)=>{const cat=(categories||[]).find(c=>c.id===h.categoryId)||{name:"Hobby",emoji:"✦"};return `<article class="quizMatchCard" data-hobby-id="${h.id}"><div class="quizMatchEmoji" aria-hidden="true">${h.emoji||cat.emoji||"✦"}</div><h2>${h.name}</h2><span class="quizCategory">${cat.name}</span><p class="quizTags">${(h.tags||[]).map(tag=>`<span class="quizTag">${tag}</span>`).join("")}</p><div class="quizMatchPercent">${h.match}% <small>match</small></div><div class="quizMatchBar"><span data-width="${h.match}%"></span></div><button class="quizSave ${profilePreview.saved.has(h.id)?"isSaved":""}" data-save-hobby="${h.id}">${profilePreview.saved.has(h.id)?"✓ Saved":"♡ Save hobby"}</button></article>`;}).join("")}</div>
      <section class="quizNextBlock"><div><p class="dfEyebrow">NEXT</p><h2>Keep the inspiration going.</h2><p>Explore a class, join a community, or build a goal around a hobby.</p></div><a class="hhBtn hhBtnPrimary hhBtnLg" href="${buildUrl("classesBrowse", "?u=1")}">Explore classes →</a></section>
      <p class="quizEmptyAccount">Your matches are based on your answers. Saving is a front-end demo and won’t persist after refresh.</p><div class="quizToast" id="quizToast" role="status" hidden></div>
      <div class="quizActions"><button class="quizBack" id="quizRestart">Retake quiz</button><a class="quizNext" href="${buildUrl("discoveryFlow", "?u=1")}">Back to discovery</a></div>`;
    requestAnimationFrame(()=>app.querySelectorAll(".quizMatchBar span").forEach(el=>el.style.width=el.dataset.width));
    app.querySelectorAll("[data-save-hobby]").forEach(btn=>btn.addEventListener("click",()=>{
      if(typeof isLoggedIn==="function"&&!isLoggedIn()){
        if(typeof showLoginRequiredModal==="function")showLoginRequiredModal();
        else {const toast=document.getElementById("quizToast");toast.hidden=false;toast.textContent="Please log in to save a hobby.";}
        return;
      }
      const saved=btn.classList.toggle("isSaved");
      if(saved)profilePreview.saved.add(btn.dataset.saveHobby);else profilePreview.saved.delete(btn.dataset.saveHobby);btn.innerHTML=saved?"✓ Saved":"♡ Save hobby";
      const toast=document.getElementById("quizToast");toast.hidden=false;toast.textContent=saved?"Hobby marked as saved for this demo session. It won’t persist after refresh.":"Hobby removed from this demo session’s saved items.";
    }));
    document.getElementById("quizRestart").addEventListener("click",()=>{Object.keys(answers).forEach(k=>delete answers[k]);current=0;renderQuestion();});
  }
  if(!questions.length){app.innerHTML='<section class="quizPanel"><h1>Quiz questions are not available yet.</h1><p>Please check shared/js/data.js.</p></section>';}else renderQuestion();
})();
