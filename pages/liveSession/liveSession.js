(function () {
  const loggedIn = isLoggedIn();
  document.body.classList.toggle('hasUserSession', loggedIn);
  if (!loggedIn) {
    const shell = document.querySelector('.hhUserApp'),
      main = document.querySelector('.hhUserMain');
    if (shell) shell.classList.remove('hhUserApp');
    if (main) main.classList.remove('hhUserMain');
    const side = document.getElementById('hhUserSidebarSlot'),
      head = document.getElementById('hhUserHeaderSlot');
    if (side) side.remove();
    if (head) head.remove();
  }
  mountSharedUi({
    userApp: loggedIn,
    active: loggedIn ? 'classesBrowse' : 'classes',
    title: 'Live Session',
    subtitle: 'Your online hobby space',
  });
  const params = new URLSearchParams(location.search),
    id = params.get('id'),
    activity = activities.find((item) => item.id === id && (item.status || 'published') === 'published'),
    host = document.getElementById('liveSessionPage');
  if (!loggedIn) {
    host.innerHTML = `<section class="lsNotFound"><h2>Log in to access your session</h2><p>Your online session details are available to enrolled members.</p><button class="hhBtn hhBtnPrimary" id="lsLogin">Log in or sign up</button></section>`;
    document.getElementById('lsLogin').addEventListener('click', showLoginModal);
    return;
  }
  if (
    !activity ||
    !String(activity.delivery || '')
      .toLowerCase()
      .startsWith('online')
  ) {
    host.innerHTML = `<section class="lsNotFound"><h2>Online session not found</h2><p>This activity does not have an online session available.</p><a class="hhBtn hhBtnPrimary" href="${buildUrl('classesBrowse', '?u=1')}">Browse classes &amp; events</a></section>`;
    return;
  }
  if (!hasActivityEnrollment(activity.id)) {
    host.innerHTML = `<section class="lsNotFound"><h2>Enrollment required</h2><p>Enroll in this activity to access its online session.</p><a class="hhBtn hhBtnPrimary" href="${buildUrl('activityDetails', '?id=' + encodeURIComponent(activity.id) + '&u=1')}">View activity</a></section>`;
    return;
  }

  let zoomReady = false;
  try {
    validateZoomDetails({ ...activity });
    zoomReady = true;
  } catch {}
  const schedule = activitySchedule(activity);
  const meetingId = activity.zoomMeetingId || 'Not provided yet',
    passcode = activity.zoomPasscode || 'No separate passcode provided';
  host.innerHTML = `<a class="lsBack" href="${buildUrl('activityDetails', '?id=' + encodeURIComponent(activity.id) + '&u=1')}">← Back to activity</a>
 <section class="lsHero"><div class="lsHeroCopy"><div class="lsBadges"><span class="lsBadge lsBadgeOnline">● Online · Zoom</span><span class="lsBadge">${escapeHtml(activity.type || 'Class')}</span></div><p class="lsEyebrow">YOUR HOBBY, LIVE</p><h1>${escapeHtml(activity.title)}</h1><p class="lsMeta">${escapeHtml(schedule.dates)}<br>${escapeHtml(schedule.hours)} · ${escapeHtml(schedule.days)}<br>Hosted by ${escapeHtml(activity.organizer || 'Your activity host')}</p><p class="lsMeta">Your organizer hosts this activity on Zoom. Open the meeting link at your scheduled session time.</p></div><aside class="lsStatusCard"><p class="lsStatusLabel">YOUR ONLINE SESSION</p><h2>Meet. Learn. Create.</h2>${zoomReady ? `<a class="hhBtn hhBtnPrimary lsJoin" id="lsJoin" href="${escapeHtml(activity.zoomUrl)}" target="_blank" rel="noopener noreferrer">Join Zoom meeting ↗</a><p class="lsStatusText">Opens Zoom in a new tab. The organizer controls meeting access.</p>` : `<p class="lsStatusText" role="status">The organizer’s Zoom details are not available yet. Check back here or contact the HobbyHub team.</p><a class="hhBtn hhBtnOutline" href="${buildUrl('contact', '?u=1')}">Contact us</a>`}</aside></section>
 <div class="lsGrid"><section class="lsPanel"><h2>Meeting details</h2><div class="lsCopyRow"><div class="lsCopyText"><span>Meeting ID</span><strong>${escapeHtml(meetingId)}</strong></div>${activity.zoomMeetingId ? `<button class="lsCopy" data-copy="${escapeHtml(activity.zoomMeetingId)}">Copy</button>` : ''}</div><div class="lsCopyRow"><div class="lsCopyText"><span>Passcode</span><strong>${escapeHtml(passcode)}</strong></div>${activity.zoomPasscode ? `<button class="lsCopy" data-copy="${escapeHtml(activity.zoomPasscode)}">Copy</button>` : ''}</div><p class="lsMeta">Keep these details private. They are provided for enrolled participants.</p></section><section class="lsPanel"><h2>Before you join</h2><div class="lsTipList"><div class="lsTip"><span class="lsTipIcon">✓</span><span>Check your connection, microphone and camera.</span></div><div class="lsTip"><span class="lsTipIcon">♫</span><span>Have your materials ready and join from a quiet place.</span></div><div class="lsTip"><span class="lsTipIcon">✦</span><span>Follow the session schedule and your organizer’s joining instructions.</span></div></div></section></div>`;
  host.querySelectorAll('[data-copy]').forEach((button) =>
    button.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(button.dataset.copy);
        button.textContent = 'Copied!';
      } catch {
        button.textContent = 'Select and copy the details';
      }
      setTimeout(() => (button.textContent = 'Copy'), 1600);
    }),
  );
})();
