/* One next action per organizer request. Internal invoices stay behind this flow. */
window.AdminRequestFlow = (() => {
  const e = (value) => AdminUI.esc(value),
    money = (value) => HobbyHubService.money(value);
  const labels = {
    review: 'Review request',
    reply: 'Waiting for organizer reply',
    changes: 'Changes requested',
    declined: 'Declined',
    payment: 'Verify incoming fees',
    publish: 'Ready to schedule',
    published: 'Scheduled / published',
  };
  function inbox(s) {
    const proposals = s.contactMessages.filter((r) => r.activityRequest),
      messages = s.contactMessages.filter((r) => !r.activityRequest);
    return `<div class="requestIntro"><h2>Activity requests</h2><p>Review → organizer approval → fees received if due → schedule publication.</p></div><div class="requestCards">${proposals.map((r) => `<article class="adminPanel requestCard"><div><span class="adminBadge">${e(labels[requestStage(r)])}</span><h3>${e(r.activityRequest.title)}</h3><p>${e(r.businessName)} · ${e(r.email)}</p></div><button class="adminBtn" data-guided-request="${e(r.id)}">${requestStage(r) === 'published' ? 'View activity' : 'Continue request'} →</button></article>`).join('') || '<p>No activity requests yet.</p>'}</div><details class="adminPanel"><summary>General messages (${messages.length})</summary>${messages.map((r) => `<article class="adminModerationPost"><strong>${e(r.name)} · ${e(r.email)}</strong><p>${e(r.message)}</p></article>`).join('')}</details>`;
  }
  function bind(host, s, refresh) {
    host
      .querySelectorAll('[data-guided-request]')
      .forEach((b) => b.addEventListener('click', () => open(b.dataset.guidedRequest, refresh)));
  }
  function organizer(r) {
    let org = organizers.find(
      (o) => o.id === r.organizerId || o.email.toLowerCase() === r.email.toLowerCase(),
    );
    if (!org)
      org = AdminService.save('organizers', {
        name: r.businessName || r.name,
        email: r.email,
        phone: r.phone,
        sourceContactId: r.id,
        payoutRecipient: r.payoutDetails,
      });
    if (r.payoutDetails && !org.payoutRecipient)
      org = AdminService.save('organizers', { id: org.id, payoutRecipient: r.payoutDetails });
    r.organizerId = org.id;
    return org;
  }
  function open(id, refresh) {
    const r = contactMessages.find((r) => r.id === id);
    if (!r?.activityRequest) return;
    r.status = 'read';
    window.DemoStore?.save();
    const a = activities.find((a) => a.sourceContactId === id) || r.activityRequest,
      stage = requestStage(r),
      offer = r.agreement;
    const steps = ['review', 'reply', 'payment', 'publish', 'published'],
      index = steps.indexOf(stage),
      quote = offer || quoteActivityPublication(a);
    const receipt = r.publicationReceipt
      ? `<details class="adminPanel"><summary>Publication receipt & internal invoice</summary><p>Received: ${money(r.publicationReceipt.amountFils)} · ${e(r.publicationReceipt.receivedOn)}</p><p>Reference: ${e(r.publicationReceipt.reference)}</p><p>Internal invoice: ${e(invoices.find((i) => i.sourceRequestId === id)?.number || 'Created when publication is approved')}</p></details>`
      : '';
    const detail = `<details class="adminPanel"><summary>Activity & organizer details</summary><p>${e(r.name)} · ${e(r.email)} · ${e(r.phone)} · Preferred: ${e(r.preferredContact || 'email')}</p><p>${e(a.description)}</p><p>${e(a.date)} → ${e(a.endDate)} · ${e(a.time)}–${e(a.endTime)} · ${e(a.meetingDays)}</p><p>${e(a.delivery)} · ${e(a.location || a.onlineProvider || '')}</p><p>Organizer receiving details: ${r.payoutDetails ? e([r.payoutDetails.name, r.payoutDetails.method, r.payoutDetails.provider, r.payoutDetails.identifier].join(' · ')) : 'Not provided / not required for free activity.'}</p></details>`;
    let action = '';
    if (['review', 'changes', 'declined'].includes(stage))
      action = `<h3>1. Review the proposal</h3><p>Check the dates, activity and organizer details. Preparing an offer does not publish the activity.</p><button class="adminBtn" id="wfPrepare">Review & prepare final offer</button><button class="adminBtn secondary" id="wfEdit">Edit activity details</button>`;
    if (stage === 'reply')
      action = `<h3>2. Confirm with the organizer</h3><p>Send this offer manually to <strong>${e(r.preferredContact === 'email' || !r.preferredContact ? r.email : r.phone)}</strong>. Then record the actual reply.</p><textarea id="wfOffer" readonly rows="9" style="width:100%">${e(organizerQuoteText(r))}</textarea><button class="adminBtn secondary" id="wfCopy">Copy offer</button><details><summary>HobbyHub receiving account for this offer</summary><p>Enter your actual receiving details. No card credentials or passwords.</p><div class="adminFormGrid"><div class="adminField"><label for="wfHolder">Account holder</label><input id="wfHolder" value="${e(platformSettings.receivingAccount.holder)}"></div><div class="adminField"><label for="wfMethod">Method</label><select id="wfMethod"><option value="cliq">CliQ</option><option value="wallet">Wallet</option><option value="bank">Bank</option></select></div><div class="adminField"><label for="wfProvider">Provider</label><input id="wfProvider" value="${e(platformSettings.receivingAccount.provider)}"></div><div class="adminField"><label for="wfIdentifier">Receiving alias / mobile / IBAN</label><input id="wfIdentifier" value="${e(platformSettings.receivingAccount.identifier)}"></div></div><button class="adminBtn secondary" id="wfAccount">Update account & offer</button></details><div class="adminFormGrid"><div class="adminField"><label for="wfReply">Organizer reply</label><select id="wfReply"><option value="accepted">Accepted</option><option value="changesRequested">Requested changes</option><option value="declined">Declined</option></select></div><div class="adminField"><label for="wfChannel">Received through</label><select id="wfChannel"><option value="email">Email</option><option value="whatsapp">WhatsApp</option><option value="phone">Phone</option></select></div><div class="adminField adminFull"><label for="wfReference">Dated reply / conversation reference</label><input id="wfReference" maxlength="300"></div></div><label class="adminWorkflowCheck"><input id="wfConfirmed" type="checkbox"> I received this response from the organizer.</label><button class="adminBtn" id="wfSaveReply">Record organizer reply →</button>`;
    if (stage === 'payment')
      action = `<h3>3. Verify publication fees received</h3><p>Organizer approval is recorded. Verify the transfer in HobbyHub’s receiving account before continuing.</p><p><strong>Expected: ${money(offer.totalFils)}</strong></p><div class="adminFormGrid"><div class="adminField"><label for="wfAmount">Amount received (JOD)</label><input id="wfAmount" type="number" min="0" step=".001" value="${offer.totalFils / 1000}"></div><div class="adminField"><label for="wfDate">Received on</label><input id="wfDate" type="date" max="${new Date(demoNow()).toISOString().slice(0, 10)}"></div><div class="adminField adminFull"><label for="wfPaymentRef">Transfer reference</label><input id="wfPaymentRef" maxlength="100"></div></div><label class="adminWorkflowCheck"><input id="wfFunds" type="checkbox"> I checked HobbyHub’s bank or wallet account and confirmed this amount was received.</label><button class="adminBtn" id="wfReceipt">Record receipt & continue →</button>`;
    if (stage === 'publish')
      action = `<h3>4. Schedule publication</h3><p>The organizer approved. ${offer.totalFils ? 'Publication fees are recorded as received.' : 'No fixed publication fees are due.'}</p><p>Display: ${e(offer.publishAt)} → ${e(offer.bookingClosesAt)} (Amman time).</p><button class="adminBtn" id="wfPublish">Approve & schedule publication →</button>`;
    if (stage === 'published')
      action = `<h3>Activity approved</h3><p>It appears only within the agreed display/booking period. Enrolled users retain their bookings afterward.</p><a class="adminBtn" href="${buildUrl('activityDetails', '?u=1&id=' + encodeURIComponent(r.activityId))}">View activity →</a><a class="adminBtn secondary" href="${buildUrl('adminPayments')}">View bookings & settlements</a>`;
    const box = AdminUI.dialog(
      'Activity request — ' + a.title,
      `<ol class="requestProgress">${['Review', 'Organizer reply', 'Fees received', 'Schedule', 'Published'].map((label, i) => `<li class="${i <= index ? 'complete' : ''}">${i + 1}. ${label}</li>`).join('')}</ol><section class="adminPanel requestCurrent"><span class="adminBadge">${e(labels[stage])}</span><p>Free-activity listing: ${money(quote.listingFeeFils)} · Homepage: ${money(quote.featuredFeeFils)} · Total: <strong>${money(quote.totalFils)}</strong></p>${action}</section>${detail}${receipt}<p id="wfError" class="adminFormError" role="alert" hidden></p>`,
    );
    box.addEventListener('close', () => refresh(), { once: true });
    const get = (id) => box.querySelector('#' + id);
    function run(fn) {
      try {
        fn();
        window.DemoStore?.save();
        box.close();
        refresh();
        open(id, refresh);
      } catch (error) {
        get('wfError').textContent = error.message;
        get('wfError').hidden = false;
      }
    }
    get('wfPrepare')?.addEventListener('click', () =>
      run(() => {
        organizer(r);
        prepareOrganizerQuote(id);
      }),
    );
    get('wfEdit')?.addEventListener('click', () => {
      try {
        organizer(r);
        const prefill = requestActivityPrefill(id);
        box.close();
        AdminManager.editor(
          'activities',
          prefill.existingId || null,
          () => {
            window.DemoStore?.save();
            refresh();
            open(id, refresh);
          },
          prefill,
        );
      } catch (error) {
        get('wfError').textContent = error.message;
        get('wfError').hidden = false;
      }
    });
    get('wfCopy')?.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(organizerQuoteText(r));
        AdminUI.toast('Offer copied. Send it using the agreed contact method.');
      } catch {
        get('wfOffer').focus();
        get('wfOffer').select();
      }
    });
    get('wfAccount')?.addEventListener('click', () =>
      run(() => {
        const valid = validateOrganizerPayout({
          name: get('wfHolder').value,
          method: get('wfMethod').value,
          provider: get('wfProvider').value,
          identifier: get('wfIdentifier').value,
        });
        Object.assign(platformSettings.receivingAccount, {
          holder: valid.name,
          method: valid.method,
          provider: valid.provider,
          identifier: valid.identifier,
        });
        prepareOrganizerQuote(id);
      }),
    );
    get('wfSaveReply')?.addEventListener('click', () =>
      run(() =>
        recordOrganizerDecision(id, {
          decision: get('wfReply').value,
          channel: get('wfChannel').value,
          reference: get('wfReference').value,
          confirmed: get('wfConfirmed').checked,
        }),
      ),
    );
    get('wfReceipt')?.addEventListener('click', () =>
      run(() =>
        recordPublicationReceipt(id, {
          amountJod: get('wfAmount').value,
          receivedOn: get('wfDate').value,
          reference: get('wfPaymentRef').value,
          confirmed: get('wfFunds').checked,
        }),
      ),
    );
    get('wfPublish')?.addEventListener('click', () =>
      run(() => {
        organizer(r);
        const prefill = requestActivityPrefill(id);
        const draft = prefill.existingId ? activities.find((a) => a.id === prefill.existingId) : prefill;
        AdminService.save('activities', { ...draft, status: 'published' });
      }),
    );
  }
  return { inbox, bind, open };
})();
