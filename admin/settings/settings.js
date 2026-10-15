document.addEventListener('DOMContentLoaded', () => {
  const u = AdminUI,
    e = u.esc,
    m = AdminManager;
  const defaults = {
    primary: '#ED7052',
    secondary: '#F6A15A',
    background: '#FFF8F1',
    text: '#332E2A',
    success: '#7DA477',
    warning: '#E0A63A',
    error: '#C8503E',
    info: '#5B8FA8',
  };
  const vars = {
    primary: '--hhPrimary',
    secondary: '--hhSecondary',
    background: '--hhBg',
    text: '--hhText',
    success: '--hhSuccess',
    warning: '--hhWarning',
    error: '--hhError',
    info: '--hhInfo',
  };
  const theme = (s) =>
    u.panel(
      'Theme & colors',
      `<form id="themeForm" class="adminSettingsForm"><div class="adminTokenGrid">${Object.entries(
        s.settings.theme,
      )
        .map(
          ([key, value]) =>
            `<div class="adminToken"><label for="theme-${key}"><strong>${e(u.pretty(key))}</strong><code>${e(value)}</code></label><input id="theme-${key}" type="color" name="${key}" value="${value}"><button type="button" class="adminBtn link" data-reset-color="${key}">Reset</button></div>`,
        )
        .join(
          '',
        )}</div><h2>Category tints</h2><div class="adminTokenGrid">${s.categories.map((c) => `<div class="adminToken"><label for="tint-${c.id}">${e(c.name)}</label><input type="color" id="tint-${c.id}" name="tint-${c.id}" value="${s.settings.categoryTints[c.id] || '#FBE3DA'}"></div>`).join('')}</div><div class="adminField"><label for="defaultCommission">Default booking commission (%)</label><input id="defaultCommission" name="defaultCommission" type="number" min="0" max="100" step=".01" value="${s.settings.defaultCommissionPercent}" required></div><h2>Advertising packages</h2>${s.settings.adPackages.map((p) => `<div class="adminToolbar"><strong>${e(p.name)}</strong><div class="adminField"><label for="package-price-${p.id}">Price (JOD)</label><input id="package-price-${p.id}" name="package-price-${p.id}" type="number" min="0" step=".001" value="${p.priceFils / 1000}" required></div><div class="adminField"><label for="package-days-${p.id}">Duration (days)</label><input id="package-days-${p.id}" name="package-days-${p.id}" type="number" min="1" step="1" value="${p.durationDays}" required></div></div>`).join('')}<div class="adminFormActions"><button type="submit" class="adminBtn">Save changes</button><a class="adminBtn secondary" href="${buildUrl('adminDashboard')}">Back to Dashboard</a></div><p id="themeError" role="alert" class="adminFormError" hidden></p></form>`,
    );
  const content = (s) =>
    u.panel(
      'Website content',
      `<form id="contentForm" class="adminSettingsForm"><div class="adminField"><label for="contentBlock">Page / section</label><select id="contentBlock">${Object.values(
        s.content.blocks || {},
      )
        .map((b) => `<option value="${e(b.id)}">${e(u.pretty(b.page) + ' · ' + b.title)}</option>`)
        .join(
          '',
        )}</select></div><div class="adminField"><label for="contentBody">Content</label><textarea id="contentBody" rows="5" required></textarea></div><div class="adminField"><label for="contentImage">Image reference (supported image sections)</label><input id="contentImage"></div><div class="adminContentPreview" id="contentPreview"></div><button class="adminBtn" type="submit">Save content</button></form>`,
    ) +
    u.panel(
      'Featured activities',
      `<form id="featuredForm" class="adminSettingsForm">${s.activities
        .filter((a) => a.status === 'published')
        .map(
          (a) =>
            `<label><input type="checkbox" name="${a.id}" ${a.isFeatured ? 'checked' : ''}> ${e(a.title)}</label>`,
        )
        .join('')}<button type="submit" class="adminBtn">Save featured selection</button></form>`,
    ) +
    u.panel(
      'Frequently Asked Questions',
      `<button type="button" class="adminBtn" data-edit-faq="">＋ Add FAQ</button>${s.faqs.map((f) => `<div class="adminModerationPost"><strong>${e(f.question)}</strong><p>${e(f.answer)}</p><button type="button" class="adminBtn link" data-edit-faq="${f.id}">Edit</button><button type="button" class="adminBtn link" data-delete-faq="${f.id}">Delete</button></div>`).join('')}`,
    ) +
    u.panel(
      'Idea templates',
      `<div class="adminField"><label for="ideaTemplate">Template</label><select id="ideaTemplate">${s.ideaTemplates.map((i) => `<option value="${e(i.id)}">${e(i.title)}</option>`).join('')}</select></div><button class="adminBtn secondary" id="editIdeaTemplate">Edit template</button>`,
    );
  const renderContent = content;
  function bind(host, s, refresh) {
    m.bind(host, s, refresh);
    host.querySelector('#contactSettingsForm')?.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (!event.target.reportValidity()) return;
      await saveContactInformation({
        email: host.querySelector('#siteContactEmail').value.trim(),
        phone: host.querySelector('#siteContactPhone').value.trim(),
      });
      u.toast('Contact information saved.');
    });
    host.querySelectorAll('[data-reset-color]').forEach((b) =>
      b.addEventListener('click', () => {
        host.querySelector('#theme-' + b.dataset.resetColor).value = defaults[b.dataset.resetColor];
      }),
    );
    host.querySelector('#themeForm')?.addEventListener('submit', async (event) => {
      event.preventDefault();
      const form = event.target;
      if (!form.reportValidity()) return;
      try {
        const values = Object.fromEntries(Object.keys(defaults).map((k) => [k, form.elements[k].value]));
        const commission = Number(form.elements.defaultCommission.value);
        HobbyHubService.split(1000, commission);
        const packages = s.settings.adPackages.map((p) => ({
          ...p,
          priceFils: HobbyHubService.toFils(form.elements['package-price-' + p.id].value),
          durationDays: Number(form.elements['package-days-' + p.id].value),
        }));
        await savePlatformConfig({
          theme: values,
          defaultCommissionPercent: commission,
          categoryTints: Object.fromEntries(
            s.categories.map((c) => [c.id, form.elements['tint-' + c.id].value]),
          ),
          adPackages: packages,
        });
        for (const [key, value] of Object.entries(values)) document.body.style.setProperty(vars[key], value);
        refresh();
        u.toast('Settings saved.');
      } catch (error) {
        const node = host.querySelector('#themeError');
        node.textContent = error.message;
        node.hidden = false;
      }
    });
    const cf = host.querySelector('#contentForm');
    if (cf) {
      const select = host.querySelector('#contentBlock'),
        body = host.querySelector('#contentBody'),
        image = host.querySelector('#contentImage'),
        preview = host.querySelector('#contentPreview');
      const load = () => {
        const b = s.content.blocks[select.value];
        body.value = b.body;
        image.value = b.imageUrl || '';
        image.disabled = !b.imageUrl;
        preview.textContent = b.body;
      };
      load();
      select.addEventListener('change', load);
      body.addEventListener('input', () => {
        preview.textContent = body.value;
      });
      cf.addEventListener('submit', async (event) => {
        event.preventDefault();
        try {
          await saveWebsiteBlock(select.value, body.value, image.value);
          u.toast('Content saved.');
        } catch (error) {
          u.toast(error.message);
        }
      });
    }
    host.querySelector('#featuredForm')?.addEventListener('submit', async (event) => {
      event.preventDefault();
      await saveFeaturedSelection(
        s.activities
          .filter((a) => a.status === 'published' && event.target.elements[a.id].checked)
          .map((a) => a.id),
      );
      u.toast('Featured selection saved.');
    });
    host.querySelectorAll('[data-edit-faq]').forEach((button) =>
      button.addEventListener('click', () => {
        const old = s.faqs.find((f) => f.id === button.dataset.editFaq);
        const dialog = u.dialog(
          old ? 'Edit FAQ' : 'Add FAQ',
          `<form id="faqForm" class="adminSettingsForm"><div class="adminField"><label for="faqQuestion">Question</label><input id="faqQuestion" value="${e(old?.question || '')}" required></div><div class="adminField"><label for="faqAnswer">Answer</label><textarea id="faqAnswer" required>${e(old?.answer || '')}</textarea></div><button class="adminBtn">Save FAQ</button></form>`,
        );
        dialog.querySelector('#faqForm').addEventListener('submit', async (event) => {
          event.preventDefault();
          try {
            await saveFaq({
              id: old?.id,
              question: dialog.querySelector('#faqQuestion').value,
              answer: dialog.querySelector('#faqAnswer').value,
            });
            dialog.close();
            refresh();
          } catch (error) {
            u.toast(error.message);
          }
        });
      }),
    );
    host.querySelectorAll('[data-delete-faq]').forEach((button) =>
      button.addEventListener('click', () =>
        u.dialog('Delete FAQ?', '<p>Remove this question from the website?</p>', async () => {
          await removeFaq(button.dataset.deleteFaq);
          refresh();
        }),
      ),
    );
    host.querySelector('#editIdeaTemplate')?.addEventListener('click', () => {
      const idea = s.ideaTemplates.find((i) => i.id === host.querySelector('#ideaTemplate').value);
      const dialog = u.dialog(
        'Edit idea template',
        `<form id="ideaForm" class="adminSettingsForm"><div class="adminField"><label for="ideaTitle">Title</label><input id="ideaTitle" value="${e(idea.title)}" required></div><div class="adminField"><label for="ideaDescription">Description</label><textarea id="ideaDescription" required>${e(idea.description)}</textarea></div><div class="adminField"><label for="ideaSteps">Steps (one title | instruction per line)</label><textarea id="ideaSteps" rows="6" required>${e(idea.steps.map((x) => x.join(' | ')).join('\n'))}</textarea></div><button class="adminBtn">Save template</button></form>`,
      );
      dialog.querySelector('#ideaForm').addEventListener('submit', async (event) => {
        event.preventDefault();
        try {
          await saveIdeaTemplate(idea.id, {
            title: dialog.querySelector('#ideaTitle').value,
            description: dialog.querySelector('#ideaDescription').value,
            steps: dialog
              .querySelector('#ideaSteps')
              .value.split('\n')
              .filter(Boolean)
              .map((line) => line.split('|').map((x) => x.trim())),
          });
          dialog.close();
          refresh();
        } catch (error) {
          u.toast(error.message);
        }
      });
    });
  }
  u.start({
    page: 'settings',
    bind,
    tabs: [
      { label: 'Theme & colors', render: theme },
      {
        label: 'Website content',
        render: (s) =>
          renderContent(s) +
          u.panel(
            'Contact information',
            `<form id="contactSettingsForm" class="adminSettingsForm"><div class="adminField"><label for="siteContactEmail">Email</label><input id="siteContactEmail" type="email" value="${e(s.content.contact.email)}" required></div><div class="adminField"><label for="siteContactPhone">Phone</label><input id="siteContactPhone" value="${e(s.content.contact.phone)}" required></div><button class="adminBtn">Save contact information</button></form>`,
          ),
      },
    ],
  });
});
