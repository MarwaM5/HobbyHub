/* Discovery administration: validated drafts, stable IDs and memory-only changes. */
(() => {
  'use strict';
  const ui = AdminUI,
    e = ui.esc,
    repository = HobbyDiscoveryService;
  const field = (name, label, value = '', type = 'text') =>
    `<div class="adminField"><label for="discovery-${e(name)}">${e(label)}</label>${type === 'textarea' ? `<textarea id="discovery-${e(name)}" name="${e(name)}" required maxlength="1200">${e(value)}</textarea>` : `<input id="discovery-${e(name)}" name="${e(name)}" value="${e(value)}" required maxlength="180">`}</div>`;
  const select = (name, label, options, value) =>
    `<div class="adminField"><label for="discovery-${e(name)}">${e(label)}</label><select id="discovery-${e(name)}" name="${e(name)}">${options.map(([id, text]) => `<option value="${e(id)}" ${id === value ? 'selected' : ''}>${e(text)}</option>`).join('')}</select></div>`;
  function formDialog(title, body, save, refresh) {
    const dialog = ui.dialog(
      title,
      `<form id="discoveryEditorForm" class="adminForm">${body}<p id="discoveryEditorError" role="alert" hidden></p><button class="adminBtn" type="submit">Save changes</button></form>`,
    );
    const form = dialog.querySelector('form');
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      try {
        await save(new FormData(form));
        dialog.close();
        refresh();
        ui.toast('Updated for this page. Changes reset when you reload.');
      } catch (error) {
        const node = dialog.querySelector('#discoveryEditorError');
        node.textContent = error.message;
        node.hidden = false;
      }
    });
  }
  function render() {
    const c = repository.snapshot();
    return ui.panel(
      'Discovery questions',
      `<p><strong>Interest questions</strong> ask what someone might enjoy and are linked to hobbies. <strong>Starting preferences</strong> ask about time, budget, place, company and competition to explain a practical first try.</p><p>Linked hobbies are suggestions this question can support, not guaranteed results. The other answers still matter. Use ↑ and ↓ to change interest-question order. Linked questions must be reassigned before deletion.</p><p class="adminMuted">Frontend preview: edits stay on this page and reset on reload. Cross-page publishing will use the backend.</p><div class="adminToolbar"><button class="adminBtn" data-discovery-add>Add interest question</button><button class="adminBtn secondary" data-discovery-preview>Preview quiz</button></div><div class="adminTableWrap"><table class="adminTable"><thead><tr><th>Order</th><th>Question</th><th>Purpose</th><th>Linked hobbies</th><th>Actions</th></tr></thead><tbody>${c.questions
        .map(
          (q, i) =>
            `<tr><td>${i + 1}</td><td class="adminWrap">${e(q.prompt)}</td><td>${q.role === 'interest' ? 'Interest' : 'Starting preferences'}</td><td>${
              q.role === 'interest'
                ? c.hobbies
                    .filter((h) => h.recommendation.anchor === q.id)
                    .map((h) => e(h.displayName || h.name))
                    .join(', ') || (c.hobbies.some(h => h.recommendation.support.includes(q.id)) ? 'Supports related interests' : 'Not linked — edit or delete')
                : 'Used with all hobbies'
            }</td><td><button class="adminBtn secondary" data-discovery-edit="${e(q.id)}">Edit</button>${q.role === 'interest' ? `<button class="adminBtn secondary" data-discovery-move="${e(q.id)}" data-direction="-1" aria-label="Move question up">↑</button><button class="adminBtn secondary" data-discovery-move="${e(q.id)}" data-direction="1" aria-label="Move question down">↓</button><button class="adminBtn secondary" data-discovery-delete="${e(q.id)}">Delete</button>` : ''}</td></tr>`,
        )
        .join('')}</tbody></table></div>`,
    );
  }
  function editQuestion(id, refresh) {
    const c = repository.snapshot(),
      old = c.questions.find((q) => q.id === id);
    const interest = !old || old.role === 'interest';
    const q = old || {
      id: 'interest-' + Date.now(),
      type: 'rating',
      role: 'interest',
      required: true,
      options: structuredClone(c.questions.find((q) => q.role === 'interest').options),
    };
    const links = interest
      ? `<fieldset><legend>Hobbies this question recommends</legend><p>Each selected hobby will use this as its main interest question. Do not link unrelated hobbies.</p>${c.hobbies.map((h) => `<label class="discoveryAdminCheck"><input type="checkbox" name="linked" value="${e(h.id)}" ${h.recommendation.anchor === q.id ? 'checked' : ''}> ${e(h.displayName || h.name)}</label>`).join('')}</fieldset>`
      : '<p>Answer IDs and practical meanings stay fixed so the matching rules remain correct.</p>';
    formDialog(
      old ? 'Edit discovery question' : 'Add interest question',
      field('prompt', 'Question text', q.prompt, 'textarea') +
        q.options.map((o) => field('option-' + o.id, 'Answer: ' + o.label, o.label)).join('') +
        links,
      (data) => {
        q.prompt = String(data.get('prompt')).trim();
        q.options.forEach((o) => {
          o.label = String(data.get('option-' + o.id)).trim();
        });
        if (new Set(q.options.map((o) => o.label.toLowerCase())).size !== q.options.length)
          throw Error('Use different labels for the answers.');
        if (!old)
          c.questions.splice(
            c.questions.findIndex((item) => item.role === 'context'),
            0,
            q,
          );
        if (interest) {
          const selected = data.getAll('linked');
          if (!selected.length) throw Error('Link at least one hobby to this interest question.');
          const unassigned = c.hobbies.find(
            (h) => h.recommendation.anchor === q.id && !selected.includes(h.id),
          );
          if (unassigned)
            throw Error(
              'First assign ' +
                (unassigned.displayName || unassigned.name) +
                ' to another question in its hobby editor.',
            );
          c.hobbies
            .filter((h) => selected.includes(h.id))
            .forEach((h) => {
              h.recommendation.anchor = q.id;
              h.recommendation.support = h.recommendation.support.filter((id) => id !== q.id);
            });
          rebuildGroups(c);
        }
        repository.replace(c);
      },
      refresh,
    );
  }
  function rebuildGroups(c) {
    c.groups = c.questions
      .filter((q) => q.role === 'interest')
      .map((q) => ({
        id: 'group-' + q.id,
        label: q.prompt,
        anchor: q.id,
        hobbyIds: c.hobbies.filter((h) => h.recommendation.anchor === q.id).map((h) => h.id),
        followupId: null,
      }))
      .filter((g) => g.hobbyIds.length);
  }
  function editHobby(id, refresh) {
    const c = repository.snapshot(),
      row = hobbies.find((h) => h.id === id),
      old = c.hobbies.find((h) => h.id === id);
    const h = old || {
      definition: row?.description || '',
      starter: '',
      needs: '',
      recommendation: {
        anchor: c.questions.find((q) => q.role === 'interest').id,
        support: [],
        homeStartPossible: false,
        patterns: [],
        sharedPractice: false,
        competitiveGame: false,
        extendedFirstExperience: false,
      },
    };
    const p = h.recommendation;
    const checks = [
      ['homeStartPossible', 'A first try is possible at home'],
      ['sharedPractice', 'The proposed activity needs other participants'],
      ['competitiveGame', 'The game itself is competitive'],
      ['extendedFirstExperience', 'The proposed first session usually needs more than 30 minutes'],
    ];
    formDialog(
      row ? 'Edit hobby and discovery details' : 'Add hobby',
      field('name', 'Hobby name', old?.displayName || row?.name || '') +
        select(
          'categoryId',
          'Category',
          categories.map((x) => [x.id, x.name]),
          row?.categoryId || categories[0]?.id,
        ) +
        field('emoji', 'Icon / emoji', row?.emoji || '✦') +
        field('definition', 'What is this hobby?', h.definition, 'textarea') +
        field('starter', 'A possible first step', h.starter, 'textarea') +
        field('needs', 'Tools, materials or access needed', h.needs, 'textarea') +
        select(
          'anchor',
          'Main interest question',
          c.questions.filter((q) => q.role === 'interest').map((q) => [q.id, q.prompt]),
          p.anchor,
        ) +
        `<fieldset><legend>Possible practice schedule</legend>${[
          ['regular', 'Short regular practice'],
          ['occasional', 'An occasional longer session'],
          ['trip', 'A planned outing'],
        ]
          .map(
            ([key, label]) =>
              `<label class="discoveryAdminCheck"><input type="checkbox" name="patterns" value="${key}" ${p.patterns.includes(key) ? 'checked' : ''}> ${label}</label>`,
          )
          .join(
            '',
          )}</fieldset><details class="discoveryAdvanced"><summary>Extra related interests (optional)</summary><p>For example, an interest in nature can support hiking. Leave unrelated interests unchecked. These answers cannot recommend a hobby when its main interest was rejected.</p>${c.questions.filter(q => q.role === 'interest').map(q => `<label class="discoveryAdminCheck"><input type="checkbox" name="support" value="${e(q.id)}" ${p.support.includes(q.id) ? 'checked' : ''}> ${e(q.prompt)}</label>`).join('')}</details><fieldset><legend>How someone could try this hobby</legend>${checks.map(([key, label]) => `<label class="discoveryAdminCheck"><input type="checkbox" name="${key}" ${p[key] ? 'checked' : ''}> ${label}</label>`).join('')}</fieldset>`,
      async (data) => {
        const patterns = data.getAll('patterns');
        if (!patterns.length) throw Error('Choose at least one possible practice schedule.');
        const hobbyId = row?.id || 'hobby-' + Date.now();
        const name = String(data.get('name')).trim();
        if (hobbies.some((item) => item.id !== row?.id && item.name.toLowerCase() === name.toLowerCase()))
          throw Error('A hobby with this name already exists.');
        const profile = {
          ...p,
          anchor: data.get('anchor'),
          patterns,
          support: data.getAll('support').filter((id) => id !== data.get('anchor')),
        };
        checks.forEach(([key]) => {
          profile[key] = data.has(key);
        });
        const value = {
          id: hobbyId,
          name,
          displayName: name,
          categoryId: data.get('categoryId'),
          emoji: data.get('emoji'),
          definition: String(data.get('definition')).trim(),
          starter: String(data.get('starter')).trim(),
          needs: String(data.get('needs')).trim(),
          recommendation: profile,
        };
        if (['name', 'definition', 'starter', 'needs'].some(key => !String(value[key] || '').trim()))
          throw Error('Enter a hobby name, description, first step and required tools or access.');
        if (old) Object.assign(old, value);
        else c.hobbies.push(value);
        rebuildGroups(c);
        HHDiscoveryEngine.check(c);
        const saved = await AdminService.save('hobbies', {
          ...row,
          ...(row ? { id: row.id } : {}),
          name,
          categoryId: value.categoryId,
          emoji: value.emoji,
          description: value.definition,
        });
        if (!row) {
          value.id = saved.id;
          c.hobbies[c.hobbies.length - 1].id = saved.id;
          rebuildGroups(c);
        }
        repository.replace(c);
      },
      refresh,
    );
  }
  function hobbyDetails(row) {
    const c = repository.snapshot(), h = c.hobbies.find(h => h.id === row.id);
    if (!h) return { Hobby: row.name, Category: categories.find(c => c.id === row.categoryId)?.name || 'Not assigned', Discovery: 'Open Edit to add its description and question mapping.' };
    const p = h.recommendation;
    const schedule = { regular: 'Short regular practice', occasional: 'An occasional longer session', trip: 'A planned outing' };
    return {
      Hobby: h.displayName || h.name,
      Category: categories.find(c => c.id === h.categoryId)?.name || 'Not assigned',
      'What it is': h.definition,
      'A possible first step': h.starter,
      'Equipment, place or access needed': h.needs,
      'Main interest question': c.questions.find(q => q.id === p.anchor)?.prompt,
      'Other related interests': p.support.map(id => c.questions.find(q => q.id === id)?.prompt).join(' / ') || 'None',
      'Possible schedule': p.patterns.map(id => schedule[id]).join(' / '),
      'A first try at home': p.homeStartPossible ? 'Possible with suitable space and equipment' : 'The proposed first try needs an outside location',
      Participation: p.sharedPractice ? 'Needs other participants' : 'Can have an individual starting route',
      Competition: p.competitiveGame ? 'The game is competitive' : 'Can be explored without a competitive match',
      'First-session time': p.extendedFirstExperience ? 'Allow more than 30 minutes and check the actual session' : 'Check the actual lesson or activity duration'
    };
  }
  function bind(host, refresh) {
    host.querySelector('[data-discovery-preview]')?.addEventListener('click', () => {
      const dialog = ui.dialog(
        'Preview Hobby Discovery',
        '<section id="adminDiscoveryPreview" class="quizShell"></section>',
      );
      HobbyDiscoveryQuiz.mount(
        dialog.querySelector('#adminDiscoveryPreview'),
        repository.forCatalog(hobbies),
      );
    });
    host.querySelector('[data-discovery-add]')?.addEventListener('click', () => editQuestion(null, refresh));
    host
      .querySelectorAll('[data-discovery-edit]')
      .forEach((b) => (b.onclick = () => editQuestion(b.dataset.discoveryEdit, refresh)));
    host.querySelectorAll('[data-discovery-delete]').forEach(
      (b) =>
        (b.onclick = () => {
          const c = repository.snapshot(),
            id = b.dataset.discoveryDelete;
          if (
            c.hobbies.some((h) => h.recommendation.anchor === id || h.recommendation.support.includes(id))
          ) {
            ui.toast('This question is linked to hobbies. Reassign those hobbies before deleting it.');
            return;
          }
          ui.dialog('Delete this question?', '<p>This removes an unlinked interest question.</p>', () => {
            c.questions = c.questions.filter((q) => q.id !== id);
            rebuildGroups(c);
            repository.replace(c);
            refresh();
          });
        }),
    );
    host.querySelectorAll('[data-discovery-move]').forEach(
      (b) =>
        (b.onclick = () => {
          const c = repository.snapshot(),
            i = c.questions.findIndex((q) => q.id === b.dataset.discoveryMove),
            j = i + Number(b.dataset.direction);
          if (j < 0 || j >= c.questions.length || c.questions[j].role !== 'interest') return;
          [c.questions[i], c.questions[j]] = [c.questions[j], c.questions[i]];
          repository.replace(c);
          refresh();
        }),
    );
  }
  window.DiscoveryEditor = Object.freeze({ render, bind, editHobby, hobbyDetails });
})();
