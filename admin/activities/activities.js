document.addEventListener('DOMContentLoaded', () => {
  const m = AdminManager,
    u = AdminUI;
  u.start({
    page: 'activities',
    bind: m.bind,
    tabs: [
      {
        id: 'activities',
        label: 'Activities',
        render: (s) =>
          m.managed(
            'activities',
            'Classes, events & training',
            s.activities.map((a) => ({
              ...a,
              category: s.categories.find((c) => c.id === a.categoryId)?.name,
              hobby: s.hobbies.find((h) => h.id === a.hobbyId)?.name,
            })),
            [
              { key: 'title', label: 'Title', wrap: true },
              { key: 'type', label: 'Type' },
              { key: 'category', label: 'Category' },
              { key: 'hobby', label: 'Hobby' },
              { key: 'organizer', label: 'Organizer' },
              { key: 'date', label: 'Date' },
              {
                label: 'Price',
                render: (r) =>
                  r.priceJod === 0
                    ? 'Free'
                    : u.esc(HobbyHubService.money(HobbyHubService.toFils(r.priceJod))),
              },
              { key: 'delivery', label: 'Delivery' },
              { label: 'Status', render: (r) => u.badge(r.status) },
            ],
          ),
      },
      {
        id: 'organizers',
        label: 'Organizers',
        render: (s) =>
          m.managed(
            'organizers',
            'External organizers',
            s.organizers,
            [
              { key: 'name', label: 'Business name' },
              { key: 'email', label: 'Email' },
              { key: 'phone', label: 'Phone' },
            ],
            {
              details: (r) => ({
                ...r,
                activities: s.activities.filter((a) => a.organizerId === r.id).map((a) => a.title),
                campaigns: s.campaigns.filter((c) => c.organizerId === r.id).map((c) => c.name),
                invoices: s.invoices.filter((i) => i.organizerId === r.id).map((i) => i.number),
                outstandingFees: HobbyHubService.money(
                  s.serviceFees
                    .filter((f) => f.organizerId === r.id && f.status === 'invoiced')
                    .reduce((t, f) => t + f.amountFils, 0),
                ),
              }),
            },
          ),
      },
    ],
  });
});
