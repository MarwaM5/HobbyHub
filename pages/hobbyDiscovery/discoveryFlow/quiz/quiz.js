/* Authenticated discovery controller. Answers stay in memory; saved IDs use the existing profile handoff. */
(() => {
  'use strict';
  function mount(app, config = HobbyDiscoveryService.forCatalog(hobbies)) {
    const answers = {};
    let step = -1;
    const escape = (value) =>
      String(value ?? '').replace(
        /[&<>"']/g,
        (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
      );
    const interests = config.questions.filter((q) => q.role === 'interest');
    const contexts = config.questions.filter((q) => q.role === 'context');
    const pages = [];
    for (let i = 0; i < interests.length; i += 2) pages.push(interests.slice(i, i + 2));
    contexts.forEach((q) => pages.push([q]));
    app.tabIndex = -1;
    function focus() {
      app.focus({ preventScroll: true });
      app.scrollIntoView({ block: 'start', behavior: 'auto' });
    }
    function actions() {
      return `<section class="quizNextBlock"><div><p class="dfEyebrow">YOUR NEXT STEP</p><h2>Try something that interests you.</h2><p>Check the level, schedule and price before booking a class.</p></div><a class="hhBtn hhBtnPrimary" href="${escape(buildUrl('classesBrowse', '?u=1'))}">Explore classes →</a><a class="quizBack" href="${escape(buildUrl('profile', '?u=1'))}">View my profile →</a></section>`;
    }
    function renderStart() {
      app.innerHTML = `<section class="quizPanel"><p class="dfEyebrow">START WITH CURIOSITY</p><h1>Find a hobby worth trying.</h1><p>You do not need experience. Imagine you have suitable tools and guidance, then tell us what you would enjoy.</p><ol class="quizStages"><li><strong>Your interests</strong><span>${interests.length} short prompts, two at a time.</span></li><li><strong>Your preferences</strong><span>${contexts.length} questions about making a start.</span></li></ol><p>You can go back and change an answer. There is no time limit.</p><button class="quizNext" id="quizStart">Start discovery →</button></section>`;
      document.getElementById('quizStart').onclick = () => {
        step = 0;
        renderQuestion();
        focus();
      };
    }
    function question(q) {
      const selected = Array.isArray(answers[q.id]) ? answers[q.id] : [answers[q.id]];
      return `<fieldset class="discoveryQuestion"><legend>${escape(q.prompt)}</legend>${q.help ? `<p>${escape(q.help)}</p>` : ''}<p class="discoveryHint">${q.type === 'multi' ? 'Choose any that apply. Choose an undecided answer on its own.' : 'Choose one answer.'}</p><div class="discoveryOptions ${q.type === 'rating' ? 'discoveryRatings' : ''}">${q.options.map((o) => `<label class="discoveryChoice"><input type="${q.type === 'multi' ? 'checkbox' : 'radio'}" name="${escape(q.id)}" value="${escape(o.id)}" ${selected.includes(o.id) ? 'checked' : ''}><span>${escape(o.label)}</span></label>`).join('')}</div></fieldset>`;
    }
    function renderQuestion() {
      const batch = pages[step];
      const stage = pages.filter((p) => p[0].role === batch[0].role);
      const progress = Math.round((step / pages.length) * 100);
      app.innerHTML = `<div class="quizTopline"><span>${batch[0].role === 'interest' ? 'YOUR INTERESTS' : 'YOUR PREFERENCES'} · ${stage.indexOf(batch) + 1} OF ${stage.length}</span><span>${progress}% complete</span></div><div class="quizProgress" role="progressbar" aria-label="Discovery progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${progress}"><div class="quizProgressFill" style="width:${progress}%"></div></div><section class="quizPanel"><h1>${batch[0].role === 'interest' ? 'What would you enjoy trying?' : 'Make it work for you.'}</h1><p>${batch[0].role === 'interest' ? 'You do not need any experience.' : 'Tell us about a possible first try.'}</p><form id="discoveryForm" novalidate>${batch.map(question).join('')}<p id="discoveryError" role="alert" hidden></p><div class="quizActions"><button type="button" class="quizBack" id="quizBack">← Back</button><button class="quizNext" type="submit">${step === pages.length - 1 ? 'See suggestions →' : 'Continue →'}</button></div></form></section>`;
      app.querySelectorAll('input').forEach((input) =>
        input.addEventListener('change', () => {
          const q = config.questions.find((q) => q.id === input.name);
          if (q.type !== 'multi') answers[q.id] = input.value;
          else {
            let values = Array.isArray(answers[q.id]) ? [...answers[q.id]] : [];
            values = input.checked
              ? (q.exclusiveOptionIds || []).includes(input.value)
                ? [input.value]
                : values.filter((v) => !(q.exclusiveOptionIds || []).includes(v)).concat(input.value)
              : values.filter((v) => v !== input.value);
            if (values.length) answers[q.id] = values;
            else delete answers[q.id];
            app.querySelectorAll('input').forEach((n) => {
              if (n.name === q.id) n.checked = values.includes(n.value);
            });
          }
          document.getElementById('discoveryError').hidden = true;
        }),
      );
      document.getElementById('quizBack').onclick = () => {
        step--;
        step < 0 ? renderStart() : renderQuestion();
        focus();
      };
      document.getElementById('discoveryForm').onsubmit = (event) => {
        event.preventDefault();
        const missing = batch.find((q) => q.required && answers[q.id] === undefined);
        if (missing) {
          const error = document.getElementById('discoveryError');
          error.textContent = 'Please answer each prompt. You can choose “Not sure yet”.';
          error.hidden = false;
          app.querySelector(`[name="${missing.id}"]`).focus();
          return;
        }
        HHDiscoveryEngine.validateAnswers(config, answers);
        if (step === pages.length - 1) renderResults();
        else {
          step++;
          renderQuestion();
        }
        focus();
      };
    }
    const list = (rows) =>
      rows.length ? `<ul>${rows.map((r) => `<li>${escape(r.text || r)}</li>`).join('')}</ul>` : '';
    function renderResults() {
      const output = HHDiscoveryEngine.rank(config, answers);
      app.innerHTML = `<div class="quizResultsHead"><p class="dfEyebrow">MADE FOR YOUR KIND OF FUN</p><h1>Your hobby suggestions</h1><p>Up to three ideas based on your answers. Save any you want to explore.</p></div>${output.evidence === 'tentative-interest' && output.results.length ? '<p class="discoveryNotice">You chose “Might enjoy it” for these interests. These are ideas to explore, rather than strong preferences.</p>' : ''}${output.tied ? '<p class="discoveryNotice">Your answers support some hobbies equally. The first card is not necessarily a better fit than the next.</p>' : ''}${output.budgetNote ? `<p class="discoveryNotice">${escape(output.budgetNote)}</p>` : ''}<div class="quizResultGrid">${output.results
        .map((row) => {
          const h = config.hobbies.find((h) => h.id === row.hobbyId);
          const category = categories.find((c) => c.id === h.categoryId);
          return `<article class="quizMatchCard discoveryResult" data-hobby-id="${escape(h.id)}"><div class="quizMatchEmoji" aria-hidden="true">${escape(h.emoji)}</div><h2>${escape(h.displayName || h.name)}</h2><span class="quizCategory">${escape(category?.name || 'Hobby')}</span><p>${escape(h.definition)}</p><h3>Why this suggestion?</h3><p>${escape(row.reason)}</p>${row.supportReasons.length ? `<p>You also showed interest in:</p>${list(row.supportReasons)}` : ''}${list(row.matches)}${row.conflicts.length ? `<aside class="discoveryNotice"><strong>Does this fit your start?</strong>${list(row.conflicts)}</aside>` : ''}${output.budget === 'zero' ? `<aside class="discoveryNotice"><strong>Before a no-spend first try</strong><p>Check whether you already have access to the equipment, place and any other people needed: ${escape(h.needs)}</p></aside>` : ''}${list(row.notes)}<details><summary>A possible first step</summary><p>${escape(h.starter)}</p><p><strong>What you may need:</strong> ${escape(h.needs)}</p></details><button type="button" class="quizSave ${profilePreview.saved.has(h.id) ? 'isSaved' : ''}" aria-pressed="${profilePreview.saved.has(h.id)}" data-save-hobby="${escape(h.id)}">${profilePreview.saved.has(h.id) ? '✓ Saved' : '♡ Save hobby'}</button></article>`;
        })
        .join(
          '',
        )}</div>${!output.results.length ? `<section class="quizPanel"><h2>${output.status === 'insufficient' ? 'We need a little more information.' : 'No clear interests yet.'}</h2><p>Review your answers or explore the hobby catalog. We will not suggest hobbies you rejected just to fill three cards.</p></section>` : ''}<p class="discoveryHint">Suggestions help you choose a first experience; they are not a personality test or a guarantee.</p><p id="quizToast" role="status" hidden></p><div class="quizActions"><button class="quizBack" id="quizReview">Review my answers</button><button class="quizBack" id="quizRestart">Start again</button><a class="quizNext" href="${escape(buildUrl('discoveryFlow', '?u=1'))}">Back to discovery</a></div>${actions()}`;
      app.querySelectorAll('[data-save-hobby]').forEach(
        (button) =>
          (button.onclick = () => {
            const id = button.dataset.saveHobby;
            if (profilePreview.saved.has(id)) profilePreview.saved.delete(id);
            else profilePreview.saved.add(id);
            const saved = profilePreview.saved.has(id);
            button.classList.toggle('isSaved', saved);
            button.setAttribute('aria-pressed', String(saved));
            button.textContent = saved ? '✓ Saved' : '♡ Save hobby';
            const notice = document.getElementById('quizToast');
            notice.hidden = false;
            notice.textContent = saved
              ? 'Hobby saved. Open your profile to see it.'
              : 'Hobby removed from your saved hobbies.';
          }),
      );
      document.getElementById('quizReview').onclick = () => {
        step = 0;
        renderQuestion();
        focus();
      };
      document.getElementById('quizRestart').onclick = () => {
        Object.keys(answers).forEach((key) => delete answers[key]);
        step = -1;
        renderStart();
        focus();
      };
    }
    try {
      HHDiscoveryEngine.check(config);
      renderStart();
    } catch {
      app.innerHTML =
        '<section class="quizPanel"><h1>Discovery is temporarily unavailable.</h1><p>Please return to discovery and try again.</p></section>';
    }
  }
  window.HobbyDiscoveryQuiz = Object.freeze({ mount });
  const app = document.getElementById('quizApp');
  if (app) {
    if (!isLoggedIn()) {
      window.location.replace(buildUrl('login'));
      return;
    }
    mountSharedUi({
      userApp: true,
      active: 'discover',
      title: 'Hobby Discovery',
      subtitle: 'Find a hobby worth trying',
    });
    mount(app);
  }
})();
