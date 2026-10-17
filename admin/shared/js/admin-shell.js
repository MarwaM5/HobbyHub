/* Admin-only composition; loaded after the existing shared components. */
(() => {
  'use strict';
  const sections = [
    ['dashboard', 'Dashboard', 'Your platform at a glance', 'adminDashboard'],
    ['users', 'Users', 'People, accounts and platform access', 'adminUsers'],
    ['catalog', 'Hobbies & Quiz', 'Manage the hobby catalog and discovery questions', 'adminCatalog'],
    [
      'activities',
      'Activities & Organizers',
      'Activity details, schedules and organizers',
      'adminActivities',
    ],
    ['communities', 'Communities', 'Hobby spaces and community moderation', 'adminCommunities'],
    [
      'payments',
      'Bookings & Money',
      'Student payments, incoming display fees and organizer proceeds',
      'adminPayments',
    ],
    ['settings', 'Settings', 'Platform theme and supported website content', 'adminSettings'],
  ];
  const esc = (value) => escapeHtml(value ?? '—');
  let toastTimer = 0,
    viewCounter = 0,
    tableCounter = 0;
  const views = new Map();
  const pretty = (value) =>
    String(value)
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/[_-]/g, ' ')
      .replace(/^./, (letter) => letter.toUpperCase());
  function badge(status) {
    const tone = ['active', 'published', 'paid', 'confirmed', 'visible', 'paidOut', 'matched'].includes(
      status,
    )
      ? 'success'
      : ['suspended', 'hidden', 'cancelled', 'archived'].includes(status)
        ? 'error'
        : 'warning';
    return `<span class="adminBadge" data-tone="${tone}">${esc(pretty(status))}</span>`;
  }
  function dialog(title, content, confirm) {
    const node = document.createElement('dialog');
    node.className = 'adminDialog';
    node.setAttribute('aria-labelledby', 'adminDialogTitle');
    node.innerHTML = `<div class="adminDialogHead"><h2 id="adminDialogTitle">${esc(title)}</h2><button type="button" class="adminBtn secondary" data-close aria-label="Close dialog">×</button></div><div class="adminDialogBody">${content}</div><div class="adminDialogFoot"><button type="button" class="adminBtn secondary" data-close>${confirm ? 'Cancel' : 'Close'}</button>${confirm ? '<button type="button" class="adminBtn" data-confirm>Confirm</button>' : ''}</div>`;
    const previous = document.activeElement;
    document.body.appendChild(node);
    node
      .querySelectorAll('[data-close]')
      .forEach((button) => button.addEventListener('click', () => node.close()));
    if (confirm)
      node.querySelector('[data-confirm]').addEventListener('click', () => {
        node.close();
        confirm();
      });
    node.addEventListener(
      'close',
      () => {
        node.remove();
        previous?.focus();
      },
      { once: true },
    );
    node.addEventListener('click', (event) => {
      if (event.target === node) node.close();
    });
    node.showModal();
    return node;
  }
  function detail(title, record) {
    const valueText = (value) =>
      value === null || value === undefined
        ? '—'
        : Array.isArray(value)
          ? value
              .map((item) => (typeof item === 'object' ? Object.values(item).join(' · ') : item))
              .join('\n')
          : typeof value === 'object'
            ? Object.entries(value)
                .map(([key, item]) => pretty(key) + ': ' + item)
                .join('\n')
            : typeof value === 'boolean'
              ? value
                ? 'Yes'
                : 'No'
              : String(value);
    dialog(
      title,
      `<dl>${Object.entries(record)
        .map(([key, value]) => `<dt>${esc(pretty(key))}</dt><dd>${esc(valueText(value))}</dd>`)
        .join('')}</dl>`,
    );
  }
  function toast(message) {
    const activeDialog = document.querySelector('.adminDialog[open]');
    if (activeDialog) {
      let feedback = activeDialog.querySelector('.adminDialogFeedback');
      if (!feedback) {
        feedback = document.createElement('p');
        feedback.className = 'adminDialogFeedback adminFormError';
        feedback.setAttribute('role', 'alert');
        activeDialog.querySelector('.adminDialogBody').appendChild(feedback);
      }
      feedback.textContent = message;
      return;
    }
    const node = document.getElementById('adminToast');
    if (!node) return;
    node.textContent = message;
    node.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      node.hidden = true;
    }, 4500);
  }
  function mount(options) {
    const section = sections.find((item) => item[0] === options.active) || sections[0];
    document.body.classList.add('hhAdmin');
    document.getElementById('adminSidebarSlot').innerHTML =
      `<aside class="adminSidebar" id="adminSidebar" aria-label="Admin navigation"><div class="adminBrand">${renderLogo('adminLogo')}</div><nav class="adminNav">${sections
        .slice(0, 6)
        .map(
          ([key, label, , route]) =>
            `<a href="${buildUrl(route)}" class="${key === section[0] ? 'isActive' : ''}" ${key === section[0] ? 'aria-current="page"' : ''}><span class="adminNavDot" aria-hidden="true"></span>${esc(label)}</a>`,
        )
        .join(
          '',
        )}</nav><div class="adminAccount"><p>ACCOUNT</p><a href="${buildUrl('adminSettings')}" class="${section[0] === 'settings' ? 'isActive' : ''}" ${section[0] === 'settings' ? 'aria-current="page"' : ''}><span class="adminNavDot" aria-hidden="true"></span>Settings</a><a href="${buildUrl('login')}"><span aria-hidden="true">↪</span>Log out</a></div></aside>`;
    document.getElementById('adminHeaderSlot').innerHTML =
      `<header class="adminHeader"><button class="adminMenu" id="adminMenuToggle" aria-label="Toggle admin navigation" aria-controls="adminSidebar" aria-expanded="false">☰</button><div><h1>${esc(section[1])}</h1><p>${esc(section[2])}</p></div><button class="adminIdentity" id="adminIdentity" aria-label="Admin account"><span class="adminAvatar">A</span><strong>Admin</strong></button></header>`;
    document.getElementById('adminFooterSlot').innerHTML =
      `<footer class="adminFooter"><nav aria-label="Footer"><a href="${buildUrl('contact')}">Contact Us</a><a href="${buildUrl('about')}">About Us</a><a href="${buildUrl('privacy')}">Privacy</a></nav><span>© ${siteInfo.year} HobbyHub — Discover · Learn · Connect · Grow</span></footer>`;
    const menu = document.getElementById('adminMenuToggle');
    function closeMenu() {
      document.body.classList.remove('adminNavOpen');
      menu.setAttribute('aria-expanded', 'false');
    }
    menu.addEventListener('click', () => {
      const open = document.body.classList.toggle('adminNavOpen');
      menu.setAttribute('aria-expanded', String(open));
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && document.body.classList.contains('adminNavOpen')) {
        closeMenu();
        menu.focus();
      }
    });
    document.addEventListener('click', (event) => {
      if (
        document.body.classList.contains('adminNavOpen') &&
        !event.target.closest('.adminSidebar') &&
        !event.target.closest('#adminMenuToggle')
      )
        closeMenu();
    });
    document
      .getElementById('adminIdentity')
      .addEventListener('click', () =>
        dialog(
          'Admin account',
          '<p><strong>HobbyHub Admin</strong></p><p>Administrator · platform management</p>',
        ),
      );
  }
  function panel(title, body, subtitle = '') {
    return `<section class="adminPanel"><div class="adminPanelHead"><div><h2>${esc(title)}</h2>${subtitle ? `<p class="adminMuted">${esc(subtitle)}</p>` : ''}</div></div>${body}</section>`;
  }
  function stats(items) {
    return `<div class="adminStats">${items.map(([label, value, note, warm]) => `<article class="adminStat ${warm ? 'isWarm' : ''}"><p>${esc(label)}</p><strong>${esc(value)}</strong>${note ? `<small>${esc(note)}</small>` : ''}</article>`).join('')}</div>`;
  }
  function table(rows, columns, options = {}) {
    const scope = 'adminTable-' + ++tableCounter;
    const filters = options.status
      ? `<div class="adminField isShort"><label for="${scope}-filter">Status</label><select id="${scope}-filter" class="adminFilter"><option value="all">All statuses</option>${[...new Set(rows.map((row) => row.status).filter(Boolean))].map((status) => `<option value="${esc(status)}">${esc(pretty(status))}</option>`).join('')}</select></div>`
      : '';
    return `<div class="adminDataSet"><div class="adminToolbar"><div class="adminField"><label for="${scope}-search">Search ${esc(options.label || 'records')}</label><input id="${scope}-search" class="adminSearch" type="search" placeholder="Search by name, email or keyword…" autocomplete="off"></div>${filters}</div><div class="adminTableWrap"><table class="adminTable"><thead><tr>${columns.map((column) => `<th scope="col">${esc(column.label)}</th>`).join('')}<th scope="col">Details</th></tr></thead><tbody>${rows
      .map((row) => {
        const key = String(++viewCounter);
        views.set(key, {
          title: options.title || 'Record details',
          record: options.details ? options.details(row) : row,
        });
        return `<tr data-admin-row data-search="${esc(
          Object.values(row)
            .filter((value) => typeof value !== 'object')
            .join(' ')
            .toLowerCase(),
        )}" data-status="${esc(row.status || '')}">${columns.map((column) => `<td class="${column.wrap ? 'adminWrap' : ''}">${column.render ? column.render(row) : esc(row[column.key])}</td>`).join('')}<td><button type="button" class="adminBtn link" data-view="${key}">View</button></td></tr>`;
      })
      .join(
        '',
      )}</tbody></table></div><p class="adminNoResults adminEmpty" ${rows.length ? 'hidden' : ''}>No records match your search.</p><p class="adminResultCount adminMuted">${rows.length} records</p></div>`;
  }
  function bindContent(host) {
    host.querySelectorAll('.adminDataSet').forEach((dataset) => {
      const search = dataset.querySelector('.adminSearch'),
        filter = dataset.querySelector('.adminFilter');
      function filterRows() {
        let count = 0;
        const term = search?.value.trim().toLowerCase() || '';
        dataset.querySelectorAll('[data-admin-row]').forEach((row) => {
          row.hidden =
            !row.dataset.search.includes(term) ||
            (filter && filter.value !== 'all' && row.dataset.status !== filter.value);
          if (!row.hidden) count++;
        });
        dataset.querySelector('.adminNoResults').hidden = Boolean(count);
        dataset.querySelector('.adminResultCount').textContent = count + ' records';
      }
      search?.addEventListener('input', filterRows);
      filter?.addEventListener('change', filterRows);
    });
    host.querySelectorAll('[data-view]').forEach((button) =>
      button.addEventListener('click', () => {
        const item = views.get(button.dataset.view);
        if (item) detail(item.title, item.record);
      }),
    );
  }

  async function start(config) {
    mountSharedUi({ adminApp: true, active: config.page });
    const host = document.getElementById('adminWorkspace'),
      tabs = document.getElementById('adminTabs');
    if (window.DemoStore) {
      const controls = document.createElement('div');
      controls.className = 'adminDemoBar';
      const stamp = DemoStore.clock ? new Date(DemoStore.clock + 3 * 3600000).toISOString().slice(0, 16) : '';
      controls.innerHTML = `<strong>Local demo</strong><span>${!DemoStore.available ? 'Local storage is blocked; allow browser storage before continuing.' : location.protocol === 'file:' ? 'Use Live Server on one origin to share data across pages.' : 'Requests and changes persist on this browser.'}</span><label for="adminDemoClock">Demo time (Amman)</label><input id="adminDemoClock" type="datetime-local" value="${stamp}"><button type="button" class="adminBtn secondary" id="applyDemoClock">Apply</button><button type="button" class="adminBtn secondary" id="realDemoClock">Real time</button><button type="button" class="adminBtn secondary" id="resetDemoData">Reset demo</button>`;
      document.getElementById('adminHeaderSlot').appendChild(controls);
      controls.querySelector('#applyDemoClock').addEventListener('click', () => {
        try {
          DemoStore.setClock(controls.querySelector('#adminDemoClock').value);
          location.reload();
        } catch (error) {
          toast(error.message);
        }
      });
      controls.querySelector('#realDemoClock').addEventListener('click', () => {
        DemoStore.setClock(null);
        location.reload();
      });
      controls
        .querySelector('#resetDemoData')
        .addEventListener('click', () =>
          dialog(
            'Reset local demo?',
            '<p>Remove this project’s saved demo requests, bookings and settings and return to sample data?</p>',
            () => DemoStore.reset(),
          ),
        );
    }
    let state;
    try {
      state = await getAdminSnapshot();
    } catch (error) {
      host.innerHTML = panel('Unable to load records', '<p>Please reload this page to try again.</p>');
      return;
    }
    let active = Math.max(
      0,
      config.tabs.findIndex((tab) => tab.id === new URLSearchParams(location.search).get('tab')),
    );
    function render() {
      state = HobbyHubService.snapshot();
      views.clear();
      host.innerHTML = config.tabs[active].render(state);
      bindContent(host);
      if (config.bind) config.bind(host, state, render);
      tabs.querySelectorAll('[role=tab]').forEach((button, index) => {
        button.setAttribute('aria-selected', String(index === active));
        button.tabIndex = index === active ? 0 : -1;
      });
      host.setAttribute('aria-labelledby', 'adminTab-' + active);
    }
    document.addEventListener('hh:demo-data-updated', () => {
      if (!document.querySelector('dialog[open]')) render();
      else toast('Demo data changed in another tab. Close this dialog and reload before continuing.');
    });
    tabs.innerHTML = config.tabs
      .map(
        (tab, index) =>
          `<button id="adminTab-${index}" role="tab" aria-selected="${index === 0}" aria-controls="adminWorkspace" tabindex="${index === 0 ? 0 : -1}">${esc(tab.label)}</button>`,
      )
      .join('');
    tabs.querySelectorAll('button').forEach((button, index) =>
      button.addEventListener('click', () => {
        active = index;
        render();
      }),
    );
    tabs.addEventListener('keydown', (event) => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      active =
        event.key === 'Home'
          ? 0
          : event.key === 'End'
            ? config.tabs.length - 1
            : (active + (event.key === 'ArrowRight' ? 1 : -1) + config.tabs.length) % config.tabs.length;
      render();
      tabs.querySelectorAll('button')[active].focus();
    });
    render();
  }
  window.mountAdminUi = mount;
  window.AdminUI = Object.freeze({ start, panel, stats, table, badge, dialog, detail, toast, esc, pretty });
  window.addEventListener('pagehide', () => {
    clearTimeout(toastTimer);
    views.clear();
  });
})();
