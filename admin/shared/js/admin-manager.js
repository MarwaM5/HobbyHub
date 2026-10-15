/* Reusable management forms and commands; page controllers configure the visible modules. */
(() => {
  'use strict';
  const ui = AdminUI,
    e = ui.esc,
    money = HobbyHubService.money;
  const names = {
    users: 'user',
    categories: 'category',
    hobbies: 'hobby',
    questions: 'question',
    activities: 'activity',
    organizers: 'organizer',
    communities: 'community',
    campaigns: 'campaign',
    invoices: 'invoice',
  };
  const source = (s, kind) =>
    s[{ questions: 'questions', contacts: 'contactMessages', fees: 'serviceFees' }[kind] || kind] || [];
  const choice = (name, label, options, required = true) => ({
    name,
    label,
    type: 'select',
    options,
    required,
  });
  const text = (name, label, type = 'text', required = true, extra = {}) => ({
    name,
    label,
    type,
    required,
    ...extra,
  });
  const opts = (rows) => rows.map((r) => [r.id, r.name || r.title || r.number]);
  const selectFields = (s, kind) => {
    switch (kind) {
      case 'users':
        return [text('name', 'Full name'), text('email', 'Email address', 'email')];
      case 'categories':
        return [
          text('name', 'Category name'),
          text('emoji', 'Icon / emoji'),
          choice('tint', 'Tint family', [
            ['pink', 'Peach'],
            ['orange', 'Orange'],
            ['green', 'Green'],
          ]),
        ];
      case 'hobbies':
        return [
          text('name', 'Hobby name'),
          choice('categoryId', 'Category', opts(s.categories)),
          text('description', 'Short description', 'textarea'),
          text('emoji', 'Icon / emoji'),
          ...s.questions
            .filter((q, i, all) => all.findIndex((x) => x.dimension === q.dimension) === i)
            .map((q) =>
              choice(
                'profile.' + q.dimension,
                ui.pretty(q.dimension),
                q.options.map((o) => [o.value, o.label]),
              ),
            ),
        ];
      case 'questions':
        return [
          text('question', 'Question text', 'textarea'),
          choice(
            'dimension',
            'Matching dimension',
            [
              'environment',
              'social',
              'activityType',
              'time',
              'cost',
              'energy',
              'competitive',
              'purpose',
              'equipment',
              'learning',
              'learningCurve',
              'weekend',
            ].map((x) => [x, ui.pretty(x)]),
          ),
        ];
      case 'organizers':
        return [
          text('name', 'Business name'),
          text('email', 'Contact email', 'email'),
          text('phone', 'Jordanian phone number', 'tel'),
          text('payoutAccountHolder', 'Payout account holder (optional)', 'text', false),
          choice(
            'payoutMethod',
            'Preferred payout method',
            [
              ['bank', 'Bank transfer'],
              ['wallet', 'Mobile wallet'],
              ['cliq', 'CliQ'],
            ],
            false,
          ),
          text('payoutProvider', 'Receiving bank / wallet provider', 'text', false),
          text('payoutIdentifier', 'IBAN, wallet number or CliQ alias', 'text', false),
          text('notes', 'Notes', 'textarea', false),
        ];
      case 'activities':
        return [
          text('title', 'Title'),
          choice('type', 'Type', [
            ['Class', 'Class'],
            ['Event', 'Event'],
            ['Training', 'Training'],
          ]),
          choice('categoryId', 'Category', opts(s.categories)),
          choice('hobbyId', 'Hobby', opts(s.hobbies)),
          choice('organizerId', 'Organizer', opts(s.organizers)),
          text('date', 'Date', 'date'),
          text('time', 'Time', 'time'),
          text('duration', 'Duration / sessions'),
          text('seats', 'Seats', 'number', true, { min: 1, step: 1 }),
          text('priceJod', 'Price (JOD, 0 = free)', 'number', true, { min: 0, step: '.001' }),
          text('commissionPercent', 'Commission % (blank = default)', 'number', false, {
            min: 0,
            max: 100,
            step: '.01',
          }),
          choice('delivery', 'Delivery', [
            ['inperson', 'In person'],
            ['online', 'Online'],
          ]),
          choice(
            'onlineProvider',
            'Online provider',
            [
              ['jitsi', 'Jitsi Meet'],
              ['zoom', 'Zoom'],
            ],
            false,
          ),
          text('location', 'Venue / address', 'text', false),
          text('zoomUrl', 'Zoom link', 'url', false),
          text('zoomMeetingId', 'Zoom meeting ID', 'text', false),
          text('zoomPasscode', 'Zoom passcode', 'text', false),
          text('jitsiRoomName', 'Jitsi room name', 'text', false),
          text('jitsiPasscode', 'Jitsi passcode', 'text', false),
          text('imageUrl', 'Cover image reference', 'text', false),
          text('isFeatured', 'Show in Home → Featured', 'checkbox', false),
          text('listingFeeJod', 'Listing fee charged to organizer (JOD)', 'number', false, {
            min: 0,
            step: '.001',
          }),
          text('featuredFeeJod', 'Featured-placement fee (JOD)', 'number', false, { min: 0, step: '.001' }),
          text('description', 'Description', 'textarea'),
          text('whatYouLearn', 'What you will learn', 'textarea', false),
        ];
      case 'communities':
        return [
          text('name', 'Community name'),
          choice('hobbyId', 'Hobby', opts(s.hobbies)),
          text('description', 'Description', 'textarea'),
        ];
      case 'campaigns':
        return [
          text('name', 'Campaign name'),
          choice('organizerId', 'Advertiser / organizer', opts(s.organizers)),
          choice('type', 'Package', [
            ['featured', 'Featured Activity'],
            ['banner', 'Homepage Banner'],
            ['premium', 'Premium Placement'],
          ]),
          choice('placement', 'Placement', [
            ['home-featured', 'Featured section'],
            ['home-banner', 'Homepage banner'],
            ['home-premium', 'Premium placement'],
          ]),
          text('imageUrl', 'Creative image reference'),
          text('destinationUrl', 'Destination URL', 'url'),
          text('startsOn', 'Start date', 'date'),
          text('endsOn', 'End date', 'date'),
          text('agreedFeeJod', 'Agreed fee (JOD)', 'number', true, { min: 0, step: '.001' }),
          choice('invoiceId', 'Invoice', opts(s.invoices), false),
          text('approved', 'Approved for display', 'checkbox', false),
          choice(
            'status',
            'Status',
            ['draft', 'pending', 'scheduled', 'active', 'ended', 'cancelled'].map((x) => [x, ui.pretty(x)]),
          ),
        ];
      case 'invoices':
        return [
          text('number', 'Invoice number'),
          choice('organizerId', 'Billed party', opts(s.organizers)),
          text('issuedOn', 'Invoice date', 'date'),
          text('dueOn', 'Due date', 'date'),
          choice('serviceType', 'Service type', [
            ['listing', 'Activity listing / publication'],
            ['featured', 'Featured placement'],
            ['advertising', 'Advertising'],
            ['other', 'Other service'],
          ]),
          text('description', 'Service description', 'textarea'),
          choice('activityId', 'Linked activity', opts(s.activities), false),
          choice('campaignId', 'Linked campaign', opts(s.campaigns), false),
          text('amountJod', 'Amount (JOD)', 'number', true, { min: '.001', step: '.001' }),
          text('paymentNotes', 'Payment notes', 'textarea', false),
        ];
      default:
        return [];
    }
  };
  function action(label, command, kind, id, extra = '') {
    return `<button type="button" class="adminBtn ${command === 'add' ? '' : 'link'}" data-command="${command}" data-kind="${kind}" data-key="${e(id || '')}" ${extra}>${e(label)}</button>`;
  }
  function actions(kind, row) {
    let out = action('Edit', 'edit', kind, row.id);
    if (kind === 'users')
      return (
        out +
        action(
          row.status === 'active' ? 'Suspend' : 'Reactivate',
          'status',
          kind,
          row.id,
          `data-next="${row.status === 'active' ? 'suspended' : 'active'}"`,
        )
      );
    if (kind === 'activities')
      out += action(
        row.status === 'published' ? 'Archive' : 'Publish',
        'status',
        kind,
        row.id,
        `data-next="${row.status === 'published' ? 'archived' : 'published'}"`,
      );
    if (kind === 'communities')
      out +=
        action(
          row.status === 'active' ? 'Archive' : 'Activate',
          'status',
          kind,
          row.id,
          `data-next="${row.status === 'active' ? 'archived' : 'active'}"`,
        ) + action('Moderate', 'moderate', kind, row.id);
    if (kind === 'campaigns' && !row.invoiceId)
      out += action('Create invoice', 'invoiceCampaign', kind, row.id);
    if (kind === 'questions')
      out +=
        action('↑', 'up', kind, row.id, 'aria-label="Move question up"') +
        action('↓', 'down', kind, row.id, 'aria-label="Move question down"');
    if (kind === 'invoices')
      return (
        (row.status === 'draft' ? out + action('Issue', 'issue', kind, row.id) : '') +
        (['issued', 'overdue'].includes(row.status)
          ? action('Record payment', 'invoicePaid', kind, row.id)
          : '') +
        (!['paid', 'cancelled'].includes(row.status) ? action('Cancel', 'cancelInvoice', kind, row.id) : '')
      );
    return out + action('Delete', 'delete', kind, row.id);
  }
  function managed(kind, title, rows, columns, options = {}) {
    return ui.panel(
      title,
      `<div class="adminSectionActions">${names[kind] ? action('＋ Add ' + names[kind], 'add', kind) : ''}</div>` +
        ui.table(
          rows,
          [
            ...columns,
            { label: 'Actions', render: (row) => `<div class="adminRowActions">${actions(kind, row)}</div>` },
          ],
          {
            status: rows.some((r) => r.status),
            label: title.toLowerCase(),
            title: title + ' details',
            ...options,
          },
        ),
    );
  }
  function editor(kind, key, refresh, prefill = {}) {
    const s = HobbyHubService.snapshot(),
      old = source(s, kind).find((r) => r.id === key);
    const value = { ...prefill, ...(old || {}) };
    if (kind === 'activities') {
      value.date = value.date ? new Date(value.date).toLocaleDateString('en-CA') : '';
      if (value.date.includes('/')) {
        const date = new Date(old.date);
        value.date = [
          date.getFullYear(),
          String(date.getMonth() + 1).padStart(2, '0'),
          String(date.getDate()).padStart(2, '0'),
        ].join('-');
      }
      if (value.time && !/^\d{2}:\d{2}$/.test(value.time)) {
        const d = new Date('2000-01-01 ' + value.time);
        value.time = String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
      }
      value.delivery = String(value.delivery).startsWith('Online') ? 'online' : 'inperson';
      value.featuredFeeJod = (value.featuredFeeFils || 0) / 1000;
      value.listingFeeJod = (value.listingFeeFils || 0) / 1000;
      value.seats ??= 12;
      value.priceJod ??= 0;
    }
    if (kind === 'campaigns') value.agreedFeeJod = (value.agreedFeeFils || 0) / 1000;
    if (kind === 'invoices') {
      const fee = s.serviceFees.find((f) => old?.feeIds?.includes(f.id) || f.id === value.sourceFeeId);
      value.serviceType = fee?.type || value.serviceType || 'other';
      value.description = fee?.description || value.description || '';
      value.activityId = fee?.activityId || value.activityId || '';
      value.campaignId = fee?.campaignId || value.campaignId || '';
      value.amountJod = (old?.amountFils || fee?.amountFils || value.amountFils || 0) / 1000;
      value.organizerId ||= fee?.organizerId;
      value.number ||=
        'HH-' + new Date().getFullYear() + '-' + String(s.invoices.length + 1).padStart(3, '0');
      value.issuedOn ||= new Date().toISOString().slice(0, 10);
    }
    if (kind === 'organizers' && value.payoutRecipient) {
      value.payoutAccountHolder = value.payoutRecipient.name;
      value.payoutMethod = value.payoutRecipient.method;
      value.payoutProvider = value.payoutRecipient.provider;
      value.payoutIdentifier = value.payoutRecipient.identifier;
    }
    const fields = selectFields(s, kind);
    function current(field) {
      return field.name.startsWith('profile.')
        ? (value.quizProfile?.[field.name.slice(8)] ?? 0)
        : (value[field.name] ?? '');
    }
    const fieldHtml = (field) => {
      const v = current(field),
        identifier = 'editor-' + field.name.replaceAll('.', '-');
      const constraints = field.type === 'tel' ? 'maxlength="25" pattern="[+0-9 ()-]{9,25}" title="Jordanian number: 0791234567 or +962791234567"' : ['text', 'email', 'url', 'textarea'].includes(field.type) ? `maxlength="${field.type === 'textarea' ? 3000 : 300}"` : '';
      const attrs = `${constraints} id="${identifier}" name="${field.name}" ${field.required ? 'required' : ''} ${field.min !== undefined ? `min="${field.min}"` : ''} ${field.max !== undefined ? `max="${field.max}"` : ''} ${field.step ? `step="${field.step}"` : ''}`;
      let control =
        field.type === 'select'
          ? `<select ${attrs}>${field.required ? '' : '<option value="">None</option>'}${field.options.map(([key, label]) => `<option value="${e(key)}" ${String(key) === String(v) ? 'selected' : ''}>${e(label)}</option>`).join('')}</select>`
          : field.type === 'textarea'
            ? `<textarea ${attrs} rows="3">${e(v)}</textarea>`
            : `<input ${attrs} type="${field.type}" ${field.type === 'checkbox' ? (v ? 'checked' : '') : `value="${e(v)}"`}>`;
      return `<div class="adminField ${field.type === 'textarea' ? 'adminFull' : ''}" data-field="${field.name}"><label for="${identifier}">${e(field.label)} <small class="adminMuted">${field.required ? "(required)" : "(optional)"}</small></label>${control}</div>`;
    };
    const questionOptions =
      kind === 'questions'
        ? `<fieldset class="adminFull"><legend>Answer options and mappings</legend><div id="editorOptions"></div><button type="button" class="adminBtn secondary" id="editorAddOption">＋ Add option</button></fieldset><p class="adminMuted adminFull">Order in quiz: ${old ? s.questions.findIndex((q) => q.id === old.id) + 1 : s.questions.length + 1} of ${old ? s.questions.length : s.questions.length + 1}</p>`
        : '';
    const imagePreview = ['activities', 'campaigns'].includes(kind)
      ? '<div class="adminFull"><label for="editorPreviewFile">Preview a local image</label><input id="editorPreviewFile" type="file" accept="image/*"><img id="editorImagePreview" class="adminImagePreview" alt="Cover preview" hidden></div>'
      : '';
    const dialog = ui.dialog(
      (old ? 'Edit ' : 'Add ') + (names[kind] || kind),
      `<form id="adminEditorForm"><div class="adminFormGrid">${fields.map(fieldHtml).join('')}${questionOptions}${imagePreview}<p class="adminFormError adminFull" id="editorError" role="alert" hidden></p><div class="adminFormActions adminFull"><button class="adminBtn" type="submit">${kind === 'activities' ? 'Save draft' : kind === 'invoices' ? 'Save draft' : 'Save changes'}</button>${kind === 'activities' ? '<button type="submit" class="adminBtn secondary" value="publish" id="editorPublish">Publish</button>' : ''}</div></div></form>`,
    );
    const form = dialog.querySelector('#adminEditorForm');
    let previewUrl = null;
    let options = cloneOptions(
      old?.options || [
        { label: '', value: 0 },
        { label: '', value: 1 },
      ],
    );
    function cloneOptions(items) {
      return items.map((o) => ({ ...o }));
    }
    function drawOptions() {
      const host = dialog.querySelector('#editorOptions');
      if (!host) return;
      host.innerHTML = options
        .map(
          (o, i) =>
            `<div class="adminOptionRow"><label>Option ${i + 1}<input data-option-label="${i}" value="${e(o.label)}" required></label><label>Maps to<input type="number" min="0" step="1" data-option-value="${i}" value="${o.value}" required></label><button type="button" class="adminBtn secondary" data-remove-option="${i}" aria-label="Remove option ${i + 1}">×</button></div>`,
        )
        .join('');
      host.querySelectorAll('[data-option-label]').forEach((input) =>
        input.addEventListener('input', () => {
          options[Number(input.dataset.optionLabel)].label = input.value;
        }),
      );
      host.querySelectorAll('[data-option-value]').forEach((input) =>
        input.addEventListener('input', () => {
          options[Number(input.dataset.optionValue)].value = Number(input.value);
        }),
      );
      host.querySelectorAll('[data-remove-option]').forEach((button) =>
        button.addEventListener('click', () => {
          options.splice(Number(button.dataset.removeOption), 1);
          drawOptions();
        }),
      );
    }
    if (kind === 'questions') {
      drawOptions();
      dialog.querySelector('#editorAddOption').addEventListener('click', () => {
        options.push({ label: '', value: Math.max(-1, ...options.map((o) => o.value)) + 1 });
        drawOptions();
      });
    }
    function delivery() {
      if (kind !== 'activities') return;
      const online = form.elements.delivery.value === 'online',
        zoom = form.elements.onlineProvider.value === 'zoom';
      for (const field of [
        'onlineProvider',
        'zoomUrl',
        'zoomMeetingId',
        'zoomPasscode',
        'jitsiRoomName',
        'jitsiPasscode',
        'location',
      ]) {
        const show =
          field === 'location'
            ? !online
            : field === 'onlineProvider'
              ? online
              : field.startsWith('zoom')
                ? online && zoom
                : online && !zoom;
        dialog.querySelector(`[data-field="${field}"]`).hidden = !show;
        form.elements[field].disabled = !show;
      }
    }
    if (kind === 'activities') {
      form.elements.delivery.addEventListener('change', delivery);
      form.elements.onlineProvider.addEventListener('change', delivery);
      delivery();
    }
    function preview() {
      const img = dialog.querySelector('#editorImagePreview');
      if (!img) return;
      const ref = form.elements.imageUrl.value.trim();
      if (!ref) {
        img.hidden = true;
        return;
      }
      if (/^(https?:\/\/|\/|[\w.-])/i.test(ref) && !/^javascript:/i.test(ref)) {
        img.src = /^https?:|^\//.test(ref) ? ref : getRoot() + ref;
        img.hidden = false;
      }
    }
    if (form.elements.imageUrl) {
      form.elements.imageUrl.addEventListener('change', preview);
      preview();
      dialog.querySelector('#editorPreviewFile').addEventListener('change', (event) => {
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        const file = event.target.files[0];
        if (!file) return;
        previewUrl = URL.createObjectURL(file);
        const img = dialog.querySelector('#editorImagePreview');
        img.src = previewUrl;
        img.hidden = false;
      });
      dialog.addEventListener(
        'close',
        () => {
          if (previewUrl) URL.revokeObjectURL(previewUrl);
        },
        { once: true },
      );
    }
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const input = old ? { id: old.id } : {};
      if (prefill.sourceFeeId) input.sourceFeeId = prefill.sourceFeeId;
      if (prefill.sourceContactId) input.sourceContactId = prefill.sourceContactId;
      for (const field of fields) {
        const control = form.elements[field.name];
        if (control.disabled) continue;
        const v = field.type === 'checkbox' ? control.checked : control.value.trim();
        if (field.name.startsWith('profile.')) {
          input.quizProfile ??= {};
          input.quizProfile[field.name.slice(8)] = Number(v);
        } else input[field.name] = v;
      }
      if (kind === 'organizers' && (input.payoutAccountHolder || input.payoutIdentifier)) {
        input.payoutRecipient = {
          name: input.payoutAccountHolder || '',
          method: input.payoutMethod || 'bank',
          provider: input.payoutProvider || '',
          identifier: input.payoutIdentifier || '',
          checkedWithOrganizer: false,
        };
      }
      if (kind === 'questions') input.options = options;
      if (kind === 'activities') {
        input.status = event.submitter?.id === 'editorPublish' ? 'published' : 'draft';
        input.featuredFeeFils = HobbyHubService.toFils(input.featuredFeeJod || 0);
        input.listingFeeFils = HobbyHubService.toFils(input.listingFeeJod || 0);
        delete input.listingFeeJod;
        delete input.featuredFeeJod;
      }
      if (kind === 'campaigns') {
        input.agreedFeeFils = HobbyHubService.toFils(input.agreedFeeJod);
        delete input.agreedFeeJod;
      }
      if (kind === 'invoices') {
        input.amountFils = HobbyHubService.toFils(input.amountJod);
        delete input.amountJod;
      }
      try {
        await AdminService.save(kind, input);
        dialog.close();
        refresh();
        ui.toast('Changes saved.');
      } catch (error) {
        const node = dialog.querySelector('#editorError');
        node.textContent = error.message;
        node.hidden = false;
      }
    });
  }
  function bind(host, s, refresh) {
    host.querySelectorAll('[data-command]').forEach((button) =>
      button.addEventListener('click', () => {
        const { command, kind, key, next } = button.dataset;
        if (command === 'payoutPaid' || command === 'payoutReceipt')
          return AdminSettlement.open(key, refresh);
        if (command === 'invoicePaid') return AdminSettlement.recordInvoice(key, refresh);
        if (command === 'feePaid') {
          const fee = s.serviceFees.find((f) => f.id === key);
          if (fee?.invoiceId) return AdminSettlement.recordInvoice(fee.invoiceId, refresh);
          ui.toast('Create an invoice for this charge first.');
          return;
        }
        if (command === 'requestOrganizer') {
          const request = s.contactMessages.find((x) => x.id === key);
          if (!request) return;
          const existing = s.organizers.find(
            (o) => o.id === request.organizerId || o.email.toLowerCase() === request.email.toLowerCase(),
          );
          if (existing) return ui.detail('Organizer', existing);
          return editor('organizers', null, refresh, {
            name: request.businessName || request.name,
            email: request.email,
            phone: request.phone || '',
            notes: request.message,
            sourceContactId: request.id,
          });
        }
        if (command === 'invoiceCampaign') {
          const campaign = s.campaigns.find((c) => c.id === key);
          if (!campaign) return;
          return editor('invoices', null, refresh, {
            organizerId: campaign.organizerId,
            campaignId: campaign.id,
            serviceType: 'advertising',
            description: 'Advertising — ' + campaign.name,
            amountFils: campaign.agreedFeeFils,
          });
        }
        if (command === 'invoiceFee') return editor('invoices', null, refresh, { sourceFeeId: key });
        const run = async (fn) => {
          try {
            await fn();
            refresh();
            ui.toast('Updated successfully.');
          } catch (error) {
            ui.toast(error.message);
          }
        };
        if (['add', 'edit'].includes(command)) return editor(kind, command === 'edit' ? key : null, refresh);
        if (command === 'delete')
          return ui.dialog(
            'Delete ' + (names[kind] || 'record') + '?',
            `<p>This action removes the item. Related records may prevent deletion.</p>`,
            () => run(() => AdminService.remove(kind, key)),
          );
        if (command === 'status')
          return ui.dialog(ui.pretty(next) + '?', `<p>Change this record to ${e(ui.pretty(next))}?</p>`, () =>
            run(() => AdminService.status(kind, key, next)),
          );
        if (command === 'up' || command === 'down')
          return run(() => AdminService.reorderQuestion(key, command === 'up' ? -1 : 1));
        if (command === 'moderate') return moderation(key, refresh);
        if (command === 'hide' || command === 'restorePost')
          return run(() => AdminService.status('posts', key, command === 'hide' ? 'hidden' : 'visible'));
        if (command === 'read' || command === 'archiveMessage' || command === 'restoreMessage')
          return run(() =>
            AdminService.status(
              'contacts',
              key,
              command === 'read' ? 'read' : command === 'archiveMessage' ? 'archived' : 'new',
            ),
          );
        if (['issue', 'cancelInvoice'].includes(command))
          return ui.dialog(
            command === 'issue' ? 'Finalize invoice?' : 'Cancel invoice?',
            `<p>${command === 'issue' ? 'Confirm the agreed service, billed organizer and amount before finalizing this invoice.' : 'Cancel this unpaid invoice and its linked charge?'}</p>`,
            () => run(() => AdminService.invoiceAction(key, command === 'issue' ? 'issue' : 'cancel')),
          );
      }),
    );
  }
  function moderation(key, refresh) {
    const s = HobbyHubService.snapshot(),
      community = s.communities.find((c) => c.id === key);
    const posts = s.posts.filter((p) => p.communityId === key);
    const dialog = ui.dialog(
      community?.name || 'Community posts',
      posts.length
        ? posts
            .map(
              (p) =>
                `<article class="adminModerationPost"><p><strong>${e(s.users.find((u) => u.id === p.userId)?.name || 'Member')}</strong> ${ui.badge(p.status)}</p><p>${e(p.text)}</p>${action(p.status === 'visible' ? 'Hide post' : 'Restore post', p.status === 'visible' ? 'hide' : 'restorePost', 'posts', p.id)}</article>`,
            )
            .join('')
        : '<p>No posts in this community.</p>',
    );
    bind(dialog, s, () => {
      dialog.close();
      refresh();
      moderation(key, refresh);
    });
  }
  window.AdminManager = Object.freeze({ managed, action, actions, editor, bind, source, money });
})();
