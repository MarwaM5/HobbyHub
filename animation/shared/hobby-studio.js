/* Decorative studio reactions only. Existing form validation/submission remains the authority. */
(() => {
  'use strict';
  function mount(page) {
    const form = document.getElementById(page + 'Form'),
      scene = document.querySelector('.hhAuthScene'),
      panel = document.querySelector('.' + page + 'VisualPanel');
    if (!form || !scene || !panel || scene.dataset.studioReady) return;
    scene.dataset.studioReady = 'true';
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    const cat = scene.querySelector('.hhStudioCat'),
      poses = [...cat.querySelectorAll('.hhStudioCatPose')],
      speech = scene.querySelector('.hhStudioSpeech'),
      sparks = [...scene.querySelectorAll('.hhStudioRuleSpark')];
    const fields = [...form.querySelectorAll('input')];
    // Real drawn poses for stretch, wave, gaze and sleep.
    const actorFrames = Array.from({ length: 12 }, (_, index) => {
      const node = document.createElement('span');
      node.className = 'hhStudioMotionFrame';
      node.dataset.motionFrame = String(index);
      node.style.setProperty('--motion-x', ((index % 4) / 3) * 100 + '%');
      node.style.setProperty(
        '--motion-y',
        (Math.floor(index / 4) / 2) * 100 + '%',
      );
      cat.querySelector('.hhStudioCatBody').appendChild(node);
      return node;
    });
    let privacyTimer = 0,
      privacyRaising = false;
    let motionTimer = 0,
      motionIndex = null,
      sequence = [],
      sequenceIndex = 0,
      motionMode = '',
      lastMessage = '',
      speechTimer = 0;
    function showMotion(index, travel = 0, facing = 1) {
      motionIndex = index;
      cat.style.setProperty('--cat-travel', travel + 'px');
      cat.style.setProperty('--cat-facing', facing);
      scene.dataset.catAction = motionMode;
      queue();
    }
    function stopMotion() {
      clearTimeout(motionTimer);
      motionTimer = 0;
      sequence = [];
      motionIndex = null;
      motionMode = '';
      scene.dataset.catAction = '';
      cat.style.setProperty('--cat-travel', '0px');
      cat.style.setProperty('--cat-facing', '1');
    }
    function advanceMotion() {
      if (dead || document.hidden || !visible || preference.matches || active)
        return;
      const step = sequence[sequenceIndex++];
      if (!step) {
        motionIndex = null;
        motionMode = '';
        queue();
        scheduleRest();
        return;
      }
      showMotion(step.pose, step.x || 0, step.facing || 1);
      motionTimer = setTimeout(advanceMotion, step.duration);
    }
    function playMotion(steps, mode) {
      stopMotion();
      motionMode = mode;
      sequence = steps;
      sequenceIndex = 0;
      advanceMotion();
    }
    function scheduleRest() {
      if (dead || document.hidden || !visible || preference.matches || active)
        return;
      clearTimeout(motionTimer);
      motionTimer = setTimeout(() => {
        stopMotion();
        motionMode = 'sleep';
        showMotion(7);
      }, 9000);
    }
    function greet() {
      if (preference.matches) return;
      playMotion(
        [
          { pose: 0, duration: 400 },
          { pose: 1, duration: 550 },
          { pose: 2, duration: 1000 },
          { pose: 1, duration: 450 },
          { pose: 3, duration: 1100 },
          { pose: 8, duration: 1300 },
        ],
        'welcome',
      );
    }
    const touched = new Set();
    let previousFeedback = '',
      reactionTimer = 0;
    let active = null,
      visible = true,
      dead = false,
      frame = 0,
      blink = false,
      blinkTimer = 0,
      wakeTimer = 0;
    const cleanups = [];
    function listen(node, type, fn) {
      node.addEventListener(type, fn);
      cleanups.push(() => node.removeEventListener(type, fn));
    }
    function findField(target) {
      if (fields.includes(target)) return target;
      const toggle =
        target?.closest?.('[data-toggle-password]') ||
        target?.closest?.('#btnTogglePassword');
      if (toggle)
        return document.getElementById(
          toggle.getAttribute('data-toggle-password') || page + 'Password',
        );
      return null;
    }
    function update() {
      frame = 0;
      if (dead) return;
      const password =
        active &&
        (active.id === page + 'Password' ||
          active.id === page + 'ConfirmPassword');
      const errors = form.querySelectorAll('[aria-invalid="true"]').length;
      const ruleNodes = [...form.querySelectorAll('.signupPasswordRules li')];
      const rules = ruleNodes.filter((node) =>
        node.classList.contains('isMet'),
      ).length;
      const notice = document.getElementById(
        page === 'login' ? 'loginNotice' : 'signupAlert',
      );
      const complete =
        notice && !notice.hidden && !notice.classList.contains('isError');
      const confirm = document.getElementById(page + 'ConfirmPassword');
      const confirmation =
        confirm && touched.has(confirm) && confirm.getAttribute('aria-invalid');
      const publicValid =
        active &&
        touched.has(active) &&
        active.id === page + 'Email' &&
        active.getAttribute('aria-invalid') === 'false';
      const feedback =
        confirmation === 'true'
          ? 'mismatch'
          : confirmation === 'false' && rules === 4
            ? 'matched'
            : publicValid
              ? 'focused'
              : '';
      scene.dataset.studioFeedback = feedback;
      if (feedback !== previousFeedback) {
        previousFeedback = feedback;
        scene.classList.remove('hhStudioCelebrate', 'hhStudioNudge');
        clearTimeout(reactionTimer);
        if (feedback && !preference.matches) {
          // Restart a one-shot gesture only when the validation outcome changes.
          void cat.offsetWidth;
          scene.classList.add(
            feedback === 'mismatch' ? 'hhStudioNudge' : 'hhStudioCelebrate',
          );
          reactionTimer = setTimeout(() => {
            scene.classList.remove('hhStudioCelebrate', 'hhStudioNudge');
          }, 1200);
        }
      }
      let state = 'awake',
        pose = 0,
        message =
          page === 'login'
            ? 'Your creative corner missed you.'
            : 'A new little adventure awaits.';
      if (password) {
        state = active.type === 'password' ? 'private' : 'peek';
        pose = state === 'private' ? 1 : 2;
        message =
          state === 'private'
            ? 'Your secret is safe with me.'
            : 'Just a tiny peek…';
        if (feedback === 'mismatch')
          message = 'Oops, those two secrets don’t match yet.';
        if (feedback === 'matched')
          message = 'Perfect match! A little happy dance for you.';
      } else if (errors) {
        state = 'concern';
        pose = 3;
        message = 'A little fix, then onward.';
      } else if (complete || rules === 4 || publicValid) {
        state = 'happy';
        pose = 4;
        message = 'Looking good, curious human!';
      } else if (active) {
        state = 'curious';
        message =
          active.id === page + 'Name'
            ? 'Nice to meet you, creative soul.'
            : 'I’m paying attention. Promise.';
      }
      if (blink && pose === 0) pose = 5;
      scene.dataset.studioState = state;
      scene.dataset.catAction = active ? '' : motionMode;
      const gaze =
        active &&
        (active.id === page + 'Email' || active.id === page + 'Name') &&
        !errors &&
        !publicValid;
      const actorPose =
        password && active.type === 'password' && privacyRaising
          ? 9
          : motionIndex !== null && !active
            ? motionIndex
            : gaze
              ? 4
              : null;
      poses.forEach((node, index) =>
        node.classList.toggle(
          'hhCatShown',
          actorPose === null && index === pose,
        ),
      );
      actorFrames.forEach((node, index) =>
        node.classList.toggle('hhMotionShown', index === actorPose),
      );
      if (!active && motionIndex === 7)
        message = 'A tiny nap. I’ll wake when you need me.';
      if (!active && motionMode === 'welcome')
        message = 'Oh, hello! Make yourself at home.';
      if (message !== lastMessage) {
        lastMessage = message;
        speech.textContent = message;
        speech.classList.remove('hhSpeechChanged');
        void speech.offsetWidth;
        clearTimeout(speechTimer);
        if (!preference.matches && visible && !document.hidden) {
          speech.classList.add('hhSpeechChanged');
          speechTimer = setTimeout(
            () => speech.classList.remove('hhSpeechChanged'),
            850,
          );
        }
      }
      scene.classList.toggle('isFieldFocused', Boolean(active));
      scene.classList.toggle('hhStudioMistake', Boolean(errors));
      scene.classList.toggle('hhStudioWriting', Boolean(active));
      scene.classList.toggle('hhStudioCameraFocus', Boolean(active));
      const isPublicField =
        active && (active.id === page + 'Email' || active.id === page + 'Name');
      // The animation never reads or displays password content.
      const look = isPublicField
        ? Math.min(active.value.length, 36) / 36 - 0.5
        : 0;
      scene.style.setProperty(
        '--studio-look',
        preference.matches
          ? '0deg'
          : isPublicField
            ? -5 + look * 9 + 'deg'
            : '0deg',
      );
      scene.style.setProperty(
        '--camera-look',
        preference.matches ? '0deg' : look * -22 + 'deg',
      );
      sparks.forEach((spark, index) =>
        spark.classList.toggle(
          'hhRuleUnlocked',
          Boolean(ruleNodes[index]?.classList.contains('isMet')),
        ),
      );
    }
    function queue() {
      if (!dead && !frame) frame = requestAnimationFrame(update);
    }
    function stopBlink() {
      clearTimeout(blinkTimer);
      clearTimeout(wakeTimer);
      blinkTimer = 0;
      wakeTimer = 0;
      blink = false;
    }
    function scheduleBlink() {
      if (dead || document.hidden || !visible || preference.matches) return;
      clearTimeout(blinkTimer);
      blinkTimer = setTimeout(() => {
        if (dead || document.hidden || !visible) return;
        blink = true;
        queue();
        wakeTimer = setTimeout(() => {
          blink = false;
          queue();
          scheduleBlink();
        }, 150);
      }, 5400);
    }
    listen(form, 'focusin', (event) => {
      active = findField(event.target);
      if (active) stopMotion();
      clearTimeout(privacyTimer);
      privacyRaising = Boolean(
        active && active.type === 'password' && !preference.matches,
      );
      if (privacyRaising)
        privacyTimer = setTimeout(() => {
          privacyRaising = false;
          queue();
        }, 450);
      queue();
    });
    listen(form, 'focusout', (event) => {
      if (!form.contains(event.relatedTarget)) {
        active = null;
        scheduleRest();
        queue();
      }
    });
    listen(form, 'input', (event) => {
      if (fields.includes(event.target)) touched.add(event.target);
      // Presence only: matching remains entirely in the original validator.
      if (event.target.id === page + 'ConfirmPassword' && !event.target.value)
        touched.delete(event.target);
      queue();
    });
    listen(form, 'change', queue);
    listen(form, 'submit', queue);
    listen(form, 'click', (event) => {
      const input = findField(event.target);
      if (input) {
        active = input;
        stopMotion();
      }
      queue();
    });
    let mutation, intersection;
    if ('MutationObserver' in window) {
      mutation = new MutationObserver(queue);
      mutation.observe(form, {
        subtree: true,
        childList: true,
        characterData: true,
        attributes: true,
        attributeFilter: ['aria-invalid', 'type', 'class', 'hidden'],
      });
      cleanups.push(() => mutation.disconnect());
    }
    if ('IntersectionObserver' in window) {
      intersection = new IntersectionObserver(
        (entries) => {
          const wasVisible = visible;
          visible = entries.some((entry) => entry.isIntersecting);
          panel.classList.toggle('hhStudioPaused', !visible || document.hidden);
          stopBlink();
          if (!visible) stopMotion();
          if (visible) {
            scheduleBlink();
            if (!wasVisible) scheduleRest();
          }
          queue();
        },
        { threshold: 0.05 },
      );
      intersection.observe(panel);
      cleanups.push(() => intersection.disconnect());
    }
    function visibility() {
      panel.classList.toggle('hhStudioPaused', document.hidden || !visible);
      stopBlink();
      clearTimeout(reactionTimer);
      clearTimeout(speechTimer);
      clearTimeout(privacyTimer);
      privacyRaising = false;
      stopMotion();
      if (!document.hidden && visible) {
        scheduleBlink();
        scheduleRest();
      }
      queue();
    }
    listen(document, 'visibilitychange', visibility);
    preference.addEventListener('change', visibility);
    cleanups.push(() => preference.removeEventListener('change', visibility));
    // Meet the visitor immediately; no introduction delays the form.
    update();
    if (!intersection) scheduleBlink();
    greet();
    function end(event) {
      if (event.persisted) return;
      dead = true;
      cancelAnimationFrame(frame);
      stopBlink();
      clearTimeout(reactionTimer);
      clearTimeout(speechTimer);
      clearTimeout(privacyTimer);
      privacyRaising = false;
      stopMotion();
      cleanups.splice(0).forEach((fn) => fn());
      window.removeEventListener('pagehide', end);
    }
    window.addEventListener('pagehide', end);
  }
  window.HobbyStudio = Object.freeze({ mount });
})();
