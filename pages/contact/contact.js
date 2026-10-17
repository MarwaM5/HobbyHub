/* Organizer proposals remain in memory until the server is connected. */
document.addEventListener('DOMContentLoaded', () => {
  mountSharedUi({ active: 'contact' });
  const get = (id) => document.getElementById(id),
    form = get('contactForm'),
    host = get('contactActivityFields'),
    feedback = get('contactFeedback');
  const inputs = [...host.querySelectorAll('[data-request-field]')],
    featured = get('requestFeatured'),
    terms = get('requestTerms');
  let coverUrl = null,
    coverData = '',
    coverReady = Promise.resolve();
  const business = () => get('contactTopic').value === 'list-activity';
  const hobby = get('request-hobbyId');
  hobby.innerHTML =
    '<option value="">Choose a hobby</option>' +
    categories
      .map(
        (c) =>
          `<optgroup label="${escapeHtml(c.name)}">${hobbies
            .filter((h) => h.categoryId === c.id)
            .map((h) => `<option value="${escapeHtml(h.id)}">${escapeHtml(h.name)}</option>`)
            .join('')}</optgroup>`,
      )
      .join('');
  enhanceHobbySelect(hobby);
  get('requestTariffs').innerHTML =
    `<p><b>Paid activity:</b> 15% per paid booking, no daily listing fee.</p><p><b>Free activity:</b> ${escapeHtml(HobbyHubService.money(platformSettings.requestPricing.freeListingDailyFils))} per day for listing.</p><p><b>Homepage:</b> add ${escapeHtml(HobbyHubService.money(platformSettings.requestPricing.homepageDailyFils))} per day for the same listing period.</p><small>Prototype demo rates. A day is 24 hours; partial days are prorated by the actual hours, rounded to the nearest fils. Admin confirms the final offer.</small>`;
  function requestValue() {
    const a = Object.fromEntries(
      inputs
        .filter((input) => !input.disabled)
        .map((input) => [input.dataset.requestField, input.value.trim()]),
    );
    a.isFeatured = featured.checked;
    a.acceptedTerms = terms.checked;
    a.sessionDays = [...host.querySelectorAll('[data-session-day]')]
      .filter((input) => input.checked)
      .map((input) => Number(input.dataset.sessionDay));
    if (a.isFeatured) {
      a.featuredStartsAt = a.publishAt;
      a.featuredEndsAt = a.bookingClosesAt;
    }
    return a;
  }
  function message(text, error = false) {
    feedback.textContent = text;
    feedback.hidden = false;
    feedback.classList.toggle('isError', error);
    feedback.setAttribute('role', error ? 'alert' : 'status');
  }
  function errorFor(id, text) {
    const input = get(id);
    input.setCustomValidity(text);
    input.setAttribute('aria-invalid', String(Boolean(text)));
    let error = get(id + 'LiveError');
    if (!error) {
      error = document.createElement('small');
      error.id = id + 'LiveError';
      error.className = 'fieldError';
      error.setAttribute('aria-live', 'polite');
      input.parentElement.appendChild(error);
      input.setAttribute('aria-describedby', error.id);
    }
    error.textContent = text;
  }
  function updateSchedule() {
    const first = get('request-date'),
      last = get('request-endDate');
    last.setCustomValidity('');
    if (first.value) {
      last.min = first.value;
      if (!last.value) last.value = first.value;
    }
    const days = [...host.querySelectorAll('[data-session-day]')];
    if (first.value && !days.some((input) => input.checked)) {
      const d = new Date(first.value + 'T00:00:00Z').getUTCDay();
      days.find((input) => Number(input.dataset.sessionDay) === d)?.click?.();
    }
    const selected = days.filter((input) => input.checked).map((input) => Number(input.dataset.sessionDay));
    get('request-duration').value = '';
    get('request-sessions').value = '';
    get('request-meetingDays').value = '';
    if (!first.value || !last.value || !selected.length) {
      get('requestScheduleHelp').textContent =
        'Choose the first and last dates, then select the session days.';
      return;
    }
    try {
      const s = calculateRequestSchedule(first.value, last.value, selected);
      get('request-duration').value = s.duration;
      get('request-sessions').value = s.sessions;
      get('request-meetingDays').value = s.meetingDays;
      get('requestScheduleHelp').textContent = s.sessions + ' · ' + s.meetingDays;
      errorFor('request-endDate', '');
    } catch (error) {
      get('requestScheduleHelp').textContent = error.message;
      errorFor('request-endDate', error.message);
    }
  }
  function updatePeriod() {
    get('request-bookingClosesAt').setCustomValidity('');
    const first = get('request-date').value,
      startTime = get('request-time').value,
      close = get('request-bookingClosesAt');
    if (first && startTime) {
      close.max = first + 'T' + startTime;
      if (!close.value) close.value = close.max;
    }
    get('request-publishAt').max = close.value || '';
    const raw = get('request-priceJod').value;
    try {
      const amount = HobbyHubService.toFils(raw),
        q = HobbyHubService.split(amount, 15);
      get('requestFeePreview').textContent =
        amount === 0
          ? 'Free for attendees. Your organization pays the publication fee shown below.'
          : `For each ${HobbyHubService.money(amount)} paid booking: HobbyHub ${HobbyHubService.money(q.commissionFils)} · Your share ${HobbyHubService.money(q.payableFils)}. Publication/homepage charges are shown separately.`;
    } catch {
      get('requestFeePreview').textContent =
        'Enter a ticket price, or 0 for a free activity, to see your fees.';
    }
    if (!get('request-publishAt').value || !close.value || !first || !startTime) {
      get('requestPeriod').textContent =
        'Choose the display start and booking deadline. Homepage placement uses the same period.';
      get('requestFeeTotal').textContent = 'Your total display fees will appear here.';
      return;
    }
    try {
      const a = requestValue(),
        q = quoteActivityPublication(a);
      get('requestPeriod').textContent =
        'Display period: ' +
        formatDisplayPeriod(q.publicationHours) +
        (featured.checked ? ' · Same period on the homepage' : '');
      get('requestFeeTotal').innerHTML =
        `<strong>Total display fees: ${escapeHtml(HobbyHubService.money(q.totalFils))}</strong><span>Free-activity listing: ${escapeHtml(HobbyHubService.money(q.listingFeeFils))}</span><span>Homepage placement: ${escapeHtml(HobbyHubService.money(q.featuredFeeFils))}</span><small>Separate from the 15% commission on paid bookings. No booking commission on free registrations.</small>`;
      errorFor('request-bookingClosesAt', '');
    } catch (error) {
      get('requestPeriod').textContent = error.message;
      get('requestFeeTotal').textContent = 'Check your display dates to calculate the total.';
      errorFor('request-bookingClosesAt', error.message);
    }
  }
  function payoutHint() {
    const method = get('payoutMethod').value;
    get('payoutIdentifierLabel').textContent =
      method === 'bank'
        ? 'IBAN *'
        : method === 'cliq'
          ? 'CliQ alias, email or mobile *'
          : 'Wallet mobile number *';
    get('payoutIdentifier').placeholder =
      method === 'bank' ? 'JO…' : method === 'cliq' ? 'Your registered CliQ alias' : '0791234567';
    get('payoutIdentifier').maxLength = method === 'bank' ? 34 : method === 'wallet' ? 14 : 80;
  }
  function update() {
    const active = business();
    host.hidden = !active;
    get('contactBusinessFields').hidden = !active;
    get('contactBusinessName').required = active;
    get('contactPhone').required = active;
    get('contactPhone').disabled = !active;
    get('contactBusinessName').disabled = !active;
    get('contactMessage').required = !active;
    inputs.forEach((input) => (input.disabled = !active));
    featured.disabled = !active;
    terms.disabled = !active;
    get('requestCover').disabled = !active;
    get('requestContactMethod').disabled = !active;
    const online = get('request-delivery').value === 'online',
      zoom = online && get('request-onlineProvider').value === 'zoom';
    for (const [key, show] of [
      ['onlineProvider', online],
      ['location', !online],
      ['zoomUrl', zoom],
      ['zoomMeetingId', zoom],
      ['zoomPasscode', zoom],
    ]) {
      const input = get('request-' + key);
      input.disabled = !active || !show;
      input.closest('.fieldGroup').hidden = !show;
      if (['zoomUrl', 'zoomMeetingId', 'location'].includes(key)) input.required = show;
    }
    get('requestOnlineInfo').hidden = !online;
    get('requestZoomFields').hidden = !zoom;
    get('requestJitsiNote').hidden = zoom;
    const paid =
      active && get('request-priceJod').value.trim() !== '' && Number(get('request-priceJod').value) > 0;
    get('requestPayout').hidden = !paid;
    for (const id of ['payoutName', 'payoutMethod', 'payoutProvider', 'payoutIdentifier']) {
      get(id).disabled = !paid;
      get(id).required = paid;
    }
    host.querySelectorAll('[data-session-day]').forEach((input) => (input.disabled = !active));
    document.querySelector('.contactSubmit').innerHTML = active
      ? 'Submit activity request <span>→</span>'
      : 'Send message <span>→</span>';
    updateSchedule();
    updatePeriod();
    payoutHint();
  }
  // Strip accidental letters and format a pasted +962 number as a local mobile.
  function phone() {
    const input = get('contactPhone');
    let digits = input.value.replace(/\D/g, '');
    if (digits.startsWith('00962')) digits = '0' + digits.slice(5);
    else if (digits.startsWith('962')) digits = '0' + digits.slice(3);
    input.value = digits.slice(0, 10);
    const good = /^07[789]\d{7}$/.test(input.value),
      text = !input.value ? '' : good ? '' : 'Use 10 digits starting with 077, 078 or 079.';
    input.setCustomValidity(text);
    input.setAttribute('aria-invalid', String(Boolean(text)));
    get('phoneError').textContent = text;
  }
  get('contactPhone').addEventListener('input', phone);
  get('contactPhone').addEventListener('blur', phone);
  get('contactPhone').addEventListener('paste', (event) => {
    event.preventDefault();
    get('contactPhone').value = event.clipboardData.getData('text');
    phone();
  });
  for (const id of ['contactName', 'contactEmail', 'contactBusinessName'])
    get(id).addEventListener('blur', () => {
      const value = get(id).value.trim();
      let text = '';
      if (value && id === 'contactEmail' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
        text = 'Enter a valid email, for example name@example.com.';
      else if (value && id !== 'contactEmail' && (value.length < 2 || !/[\p{L}]/u.test(value)))
        text = 'Use a name with at least two characters and letters.';
      errorFor(id, text);
    });
  get('request-seats').addEventListener('keydown', (event) => {
    if (['e', 'E', '+', '-', '.'].includes(event.key)) event.preventDefault();
  });
  get('request-seats').addEventListener('input', () => {
    const input = get('request-seats'),
      n = Number(input.value);
    errorFor(
      input.id,
      input.value && (!Number.isInteger(n) || n < 1 || n > 100000)
        ? 'Choose a whole number of seats from 1 to 100000.'
        : '',
    );
  });
  get('request-priceJod').addEventListener('input', () => {
    try {
      if (get('request-priceJod').value) HobbyHubService.toFils(get('request-priceJod').value);
      errorFor('request-priceJod', '');
    } catch {
      errorFor(
        'request-priceJod',
        'Use 0 for a free activity, or a positive JOD amount with up to 3 decimals.',
      );
    }
  });
  get('request-zoomMeetingId').addEventListener('input', () => {
    const input = get('request-zoomMeetingId');
    input.value = input.value.replace(/\D/g, '').slice(0, 11);
    errorFor(
      input.id,
      input.value && !/^\d{9,11}$/.test(input.value) ? 'Zoom meeting IDs contain 9–11 digits.' : '',
    );
  });
  get('request-zoomUrl').addEventListener('input', () => {
    const input = get('request-zoomUrl');
    let valid = false;
    try {
      const url = new URL(input.value);
      valid = url.protocol === 'https:' && /(^|\.)zoom\.us$|(^|\.)zoom\.com$/.test(url.hostname);
      const id = url.pathname.match(/\/j\/(\d{9,11})(?:\/|$)/);
      if (valid && id) {
        get('request-zoomMeetingId').value = id[1];
        errorFor('request-zoomMeetingId', '');
      }
    } catch {}
    errorFor(input.id, input.value && !valid ? 'Use a valid HTTPS Zoom meeting link.' : '');
  });
  for (const id of ['payoutName', 'payoutProvider'])
    get(id).addEventListener('blur', () => {
      if (!get('requestPayout').hidden)
        errorFor(id, get(id).value.trim().length < 2 ? 'Enter at least two characters.' : '');
    });
  function recipientIdentifier() {
    if (get('requestPayout').hidden) return;
    try {
      validateOrganizerPayout({
        name: 'Account holder',
        method: get('payoutMethod').value,
        provider: 'Provider',
        identifier: get('payoutIdentifier').value,
      });
      errorFor('payoutIdentifier', '');
    } catch (error) {
      errorFor('payoutIdentifier', error.message);
    }
  }
  get('payoutIdentifier').addEventListener('blur', recipientIdentifier);
  get('payoutIdentifier').addEventListener('input', () => {
    const input = get('payoutIdentifier'),
      method = get('payoutMethod').value;
    if (method === 'wallet') {
      let digits = input.value.replace(/\D/g, '');
      if (digits.startsWith('962')) digits = '0' + digits.slice(3);
      input.value = digits.slice(0, 10);
    } else if (method === 'bank')
      input.value = input.value
        .replace(/[^a-zA-Z0-9]/g, '')
        .toUpperCase()
        .slice(0, 34);
    if (input.value) recipientIdentifier();
    else errorFor('payoutIdentifier', '');
  });
  get('payoutMethod').addEventListener('change', () => {
    payoutHint();
    get('payoutIdentifier').value = '';
    errorFor('payoutIdentifier', '');
  });
  get('contactTopic').addEventListener('change', update);
  host.addEventListener('change', update);
  host.addEventListener('input', () => {
    updateSchedule();
    updatePeriod();
  });
  get('request-priceJod').addEventListener('input', update);
  get('contactMessage').addEventListener(
    'input',
    () => (get('messageCount').textContent = get('contactMessage').value.length + ' / 1000'),
  );
  get('requestCover').addEventListener('change', (event) => {
    coverData = '';
    coverReady = Promise.resolve();
    const file = event.target.files?.[0];
    if (coverUrl) URL.revokeObjectURL(coverUrl);
    coverUrl = null;
    get('requestImagePreview').hidden = true;
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) {
      event.target.value = '';
      message('Choose a JPG, PNG or WebP image up to 5 MB.', true);
      return;
    }
    coverUrl = URL.createObjectURL(file);
    coverReady = new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => {
        try {
          const canvas = document.createElement('canvas'),
            scale = Math.min(1, 900 / Math.max(image.width, image.height));
          canvas.width = Math.round(image.width * scale);
          canvas.height = Math.round(image.height * scale);
          canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
          coverData = canvas.toDataURL('image/jpeg', 0.75);
          resolve();
        } catch (error) {
          reject(error);
        }
      };
      image.onerror = () => reject(Error('The image could not be prepared. Choose another image.'));
      image.src = coverUrl;
    });
    coverReady.catch(() => {});
    get('requestImagePreview').src = coverUrl;
    get('requestImagePreview').hidden = false;
  });
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    feedback.hidden = true;
    phone();
    updateSchedule();
    updatePeriod();
    if (!form.reportValidity()) return;
    try {
      await coverReady;
      const values = {
        name: get('contactName').value.trim(),
        email: get('contactEmail').value.trim(),
        topic: get('contactTopic').value,
        message: get('contactMessage').value.trim(),
        businessName: business() ? get('contactBusinessName').value.trim() : '',
        phone: business() ? get('contactPhone').value : '',
        preferredContact: business() ? get('requestContactMethod').value : 'email',
      };
      if (business()) {
        values.activityRequest = validateActivityRequest(requestValue());
        if (!values.message) values.message = values.activityRequest.description;
        const file = get('requestCover').files?.[0];
        if (file) values.coverFile = { name: file.name, type: file.type, size: file.size };
        if (Number(values.activityRequest.priceJod) > 0)
          values.payoutDetails = {
            name: get('payoutName').value.trim(),
            method: get('payoutMethod').value,
            provider: get('payoutProvider').value.trim(),
            identifier: get('payoutIdentifier').value.trim(),
          };
      }
      if (coverData) values.coverImageData = coverData;
      AdminService.submitContact(values);
      if (window.DemoStore && !DemoStore.save())
        throw Error('The local demo could not be saved. Use Live Server and check browser storage space.');
      message(
        business()
          ? 'Your activity request is saved in the local demo inbox. Admin review, your approval and any required fees come before publication. No email or money transfer has been sent.'
          : 'Your message is saved in the admin’s local demo inbox. No email has been sent.',
      );
      form.reset();
      host.querySelectorAll('[aria-invalid]').forEach((input) => input.setCustomValidity(''));
      get('request-hobbyIdSearch').value = '';
      if (coverUrl) URL.revokeObjectURL(coverUrl);
      coverUrl = null;
      coverData = '';
      coverReady = Promise.resolve();
      get('requestImagePreview').hidden = true;
      update();
    } catch (error) {
      message(error.message, true);
    }
  });
  window.addEventListener(
    'pagehide',
    () => {
      if (coverUrl) URL.revokeObjectURL(coverUrl);
    },
    { once: true },
  );
  update();
});
