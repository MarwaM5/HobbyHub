/* Shared contact-number format validation; this does not verify ownership. */
function validateContactPhone(value) {
  const phone = String(value ?? '').trim();
  const compact = phone.replace(/[ ()-]/g, '');
  if (!/^(?:(?:\+|00)962|0)(?:7[789]\d{7}|[2356]\d{7})$/.test(compact))
    throw Error('Enter a Jordanian phone number, for example 0791234567 or +962791234567.');
  return phone;
}
/* dataService.js | المكان الوحيد اللي الصفحات بتطلب منه البيانات.
   هلأ بيرجّع بيانات data.js. لما نعمل الباك إند بنغيّر داخل كل دالة فقط، مثلاً:
       const response = await fetch("/api/categories");
       return response.json();
   وصفحاتنا ما بتتغير أبداً. الدوال async من هلأ عشان نتعود على الشكل النهائي. */

// الكاتيجوريز ومعها هواياتها
async function getCategories() {
  return categories.map((category) => ({
    ...category,                                                            // نسخ بيانات الكاتيجوري
    hobbies: hobbies.filter((hobby) => hobby.categoryId === category.id)    // وإضافة هواياتها
  }));
}

async function getHowSteps() { return howSteps; }

// الأنشطة اللي الأدمن علّم عليها Featured (مجانية أو مدفوعة)
async function getFeaturedActivities() { return activities.filter((activity) => isActivityFeatured(activity)); }

async function getFaqs() { return faqs; }

async function getCurrentUser() { return currentUser; }


async function getDashboardNextSteps() { return dashboardNextSteps; }
async function getDashboardRecentActivity() { return dashboardRecentActivity; }

// Classes, events and trainings (mock data for the front-end phase).
async function getActivities() { return activities.filter((activity) => isActivityListed(activity)); }
async function getActivityById(id) { return activities.find((activity) => activity.id === id && (activity.status || "published") === "published") || null; }

/* Shared frontend contracts. These operate only on this document's mock records. */

const HobbyHubService = (() => {
  'use strict';
  const clone = (value) => JSON.parse(JSON.stringify(value));
  function toFils(value) {
    if (value == null || typeof value === 'boolean' || !/^\d+(?:\.\d{1,3})?$/.test(String(value).trim()))
      throw new Error('Enter a valid JOD amount.');
    const number = Number(value),
      fils = Math.round(number * 1000);
    if (!Number.isFinite(number) || number < 0 || !Number.isSafeInteger(fils))
      throw new Error('Enter a valid non-negative JOD amount.');
    return fils;
  }
  function rate(value = platformSettings.defaultCommissionPercent) {
    if (value == null || typeof value === 'boolean' || !/^\d+(?:\.\d{1,3})?$/.test(String(value).trim()))
      throw new Error('Enter a commission between 0 and 100%.');
    const number = Number(value);
    if (!Number.isFinite(number) || number < 0 || number > 100)
      throw new Error('Enter a commission between 0 and 100%.');
    return number;
  }
  function money(fils) {
    if (!Number.isSafeInteger(fils)) throw new Error('Invalid monetary amount.');
    return (
      'JOD ' + (fils / 1000).toLocaleString('en-JO', { minimumFractionDigits: 3, maximumFractionDigits: 3 })
    );
  }
  function split(amountFils, commissionPercent) {
    if (!Number.isSafeInteger(amountFils) || amountFils < 0) throw new Error('Invalid monetary amount.');
    const commissionFils = Math.round((amountFils * rate(commissionPercent)) / 100);
    return { amountFils, commissionFils, payableFils: amountFils - commissionFils };
  }
  function quote(activityId) {
    const activity = activities.find((item) => item.id === activityId);
    if (!activity) throw new Error('Activity not found.');
    const percent = activity.commissionPercent ?? platformSettings.defaultCommissionPercent;
    return { ...split(toFils(activity.priceJod), percent), commissionPercent: percent };
  }
  function paidBookings() {
    return simulatedPayments
      .filter((item) => item.status === 'paid' && item.amountFils > 0)
      .map((item) => ({ ...item, ...split(item.amountFils, item.commissionPercent) }));
  }
  function payoutDetails(payout) {
    const paymentIds = new Set(payout.paymentIds);
    const bookings = paidBookings().filter(
      (item) => paymentIds.has(item.id) && item.organizerId === payout.organizerId,
    );
    return {
      ...payout,
      grossFils: bookings.reduce((sum, item) => sum + item.amountFils, 0),
      commissionFils: bookings.reduce((sum, item) => sum + item.commissionFils, 0),
      payableFils: bookings.reduce((sum, item) => sum + item.payableFils, 0),
    };
  }
  function invoiceDetails(invoice, today = new Date(demoNow()).toISOString().slice(0, 10)) {
    const fees = serviceFees.filter((item) => invoice.feeIds.includes(item.id));
    const amountFils = fees.reduce((sum, item) => sum + item.amountFils, 0);
    return {
      ...invoice,
      amountFils,
      status: invoice.status === 'issued' && invoice.dueOn < today ? 'overdue' : invoice.status,
    };
  }
  function campaignVisible(campaign, today = new Date(demoNow()).toISOString().slice(0, 10)) {
    return (
      campaign.approved === true &&
      campaign.status === 'active' &&
      campaign.startsOn <= today &&
      today <= campaign.endsOn &&
      ['home-banner', 'home-premium', 'home-featured'].includes(campaign.placement)
    );
  }
  function summary() {
    const bookings = paidBookings(),
      sum = (rows, key) => rows.reduce((total, row) => total + row[key], 0);
    const payoutRows = payouts.map(payoutDetails),
      paidFees = serviceFees.filter((item) => item.status === 'paid');
    const paidEnrollmentIds = new Set(bookings.map((item) => item.enrollmentId));
    const outstanding = serviceFees.filter(
      (item) =>
        item.status === 'invoiced' &&
        (!item.invoiceId ||
          invoices.find((invoice) => invoice.id === item.invoiceId)?.status !== 'cancelled'),
    );
    return {
      totalUsers: users.filter((item) => item.role === 'user').length,
      activeUsers: users.filter((item) => item.role === 'user' && item.status === 'active').length,
      activeHobbies: hobbies.filter((item) => item.status !== 'archived').length,
      categories: categories.length,
      publishedActivities: activities.filter((item) => (item.status || 'published') === 'published').length,
      totalEnrollments: enrollments.length,
      paidEnrollments: enrollments.filter((item) => paidEnrollmentIds.has(item.id)).length,
      freeEnrollments: enrollments.filter(
        (item) => activities.find((activity) => activity.id === item.activityId)?.priceJod === 0,
      ).length,
      grossBookingFils: sum(bookings, 'amountFils'),
      commissionFils: sum(bookings, 'commissionFils'),
      pendingPayableFils: sum(
        payoutRows.filter((item) => item.status === 'pending'),
        'payableFils',
      ),
      paidOutFils: sum(
        payoutRows.filter((item) => item.status === 'paidOut'),
        'payableFils',
      ),
      advertisingRevenueFils: sum(
        paidFees.filter((item) => item.type === 'advertising'),
        'amountFils',
      ),
      featuredRevenueFils: sum(
        paidFees.filter((item) => item.type === 'featured'),
        'amountFils',
      ),
      otherServiceRevenueFils: sum(
        paidFees.filter((item) => ['other', 'listing'].includes(item.type)),
        'amountFils',
      ),
      outstandingServiceFils: sum(outstanding, 'amountFils'),
      outstandingInvoiceFils: sum(
        invoices
          .map((item) => invoiceDetails(item))
          .filter((item) => ['issued', 'overdue'].includes(item.status)),
        'amountFils',
      ),
      unreadMessages: contactMessages.filter((item) => item.status === 'new').length,
    };
  }
  function recordEvent(kind, detail) {
    platformActivityLog.unshift({
      id: 'log-' + Date.now() + '-' + platformActivityLog.length,
      kind,
      detail,
      createdAt: new Date(demoNow()).toISOString(),
    });
  }
  function markPayoutPaid(id) {
    const payout = payouts.find((item) => item.id === id);
    if (!payout || payout.status !== 'pending')
      throw new Error('Only a pending payout can be marked paid out.');
    if (!payoutDetails(payout).payableFils) throw new Error('This payout has no paid bookings.');
    payout.status = 'paidOut';
    payout.paidAt = new Date(demoNow()).toISOString();
    recordEvent('Simulated payout', id);
    return clone(payoutDetails(payout));
  }
  function markInvoicePaid(id) {
    const invoice = invoices.find((item) => item.id === id);
    if (!invoice || !['issued', 'overdue'].includes(invoice.status))
      throw new Error('Only an issued invoice can be marked paid.');
    invoice.status = 'paid';
    invoice.paidAt = new Date(demoNow()).toISOString();
    serviceFees
      .filter((item) => invoice.feeIds.includes(item.id))
      .forEach((item) => {
        item.status = 'paid';
      });
    recordEvent('Simulated external receipt', invoice.number);
    return clone(invoiceDetails(invoice));
  }
  function setDefaultCommission(value) {
    platformSettings.defaultCommissionPercent = rate(value);
    return platformSettings.defaultCommissionPercent;
  }
  function snapshot() {
    return clone({
      users,
      categories,
      hobbies,
      activities,
      organizers,
      communities,
      memberships,
      posts: communityPosts,
      enrollments,
      payments: simulatedPayments,
      payouts: payouts.map(payoutDetails),
      serviceFees,
      campaigns: advertisingCampaigns,
      invoices: invoices.map((item) => invoiceDetails(item)),
      contactMessages,
      questions: hobbyQuizQuestions,
      faqs,
      settings: platformSettings,
      content: websiteContent,
      journeyGoals: sharedJourneyGoals,
      ideaTemplates: [...Object.values(sharedIdeaBank).flat(), ...sharedGenericIdeas],
      recent: platformActivityLog,
      summary: summary(),
    });
  }
  return Object.freeze({
    toFils,
    money,
    split,
    quote,
    summary,
    snapshot,
    invoiceDetails,
    campaignVisible,
    markPayoutPaid,
    markInvoicePaid,
    setDefaultCommission,
  });
})();

async function getAdminSnapshot() {
  return HobbyHubService.snapshot();
}
async function getVisibleCampaigns(placement, today) {
  return advertisingCampaigns.filter(
    (item) => item.placement === placement && HobbyHubService.campaignVisible(item, today),
  );
}
async function getCommunityPosts(communityId) {
  return communityPosts.filter((item) => item.communityId === communityId && item.status === 'visible');
}
async function getUserEnrollments(userId) {
  return enrollments.filter((item) => item.userId === userId);
}

/* In-memory application commands. Replace these contracts with MVC services later.
   No authentication or cross-document persistence is simulated here. */
const AdminService = (() => {
  'use strict';
  const tables = {
    users,
    categories,
    hobbies,
    questions: hobbyQuizQuestions,
    activities,
    organizers,
    communities,
    posts: communityPosts,
    contacts: contactMessages,
    campaigns: advertisingCampaigns,
    invoices,
    fees: serviceFees,
  };
  const clone = (x) => JSON.parse(JSON.stringify(x));
  let serial = 0;
  const id = (kind) => kind + '-' + Date.now().toString(36) + '-' + ++serial;
  const required = (value, label) => {
    if (!String(value ?? '').trim()) throw Error(label + ' is required.');
    return String(value).trim();
  };
  const exists = (list, key, label) => {
    if (!list.some((x) => x.id === key)) throw Error('Choose a valid ' + label + '.');
  };
  const email = (value) => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) throw Error('Enter a valid email address.');
  };
  const safeReference = (value) => {
    if(typeof value==='string'&&value.length<2000000&&/^data:image\/(jpeg|png|webp);base64,[a-z0-9+/=]+$/i.test(value))return;
    if (
      value &&
      ((/^[a-z][a-z\d+.-]*:/i.test(value) && !/^https?:\/\//i.test(value)) ||
        /^\/\//.test(value) ||
        /[\u0000-\u001f\\]/.test(value))
    )
      throw Error('Use a relative image path or an HTTP(S) URL.');
  };
  const safeUrl = (value) => {
    try {
      const url = new URL(value);
      if (!['http:', 'https:'].includes(url.protocol)) throw Error();
    } catch {
      throw Error('Enter a valid HTTP(S) destination URL.');
    }
  };
  function save(kind, input) {
    const list = tables[kind];
    if (!list) throw Error('Unknown record type.');
    const old = input.id ? list.find((x) => x.id === input.id) : null;
    if (input.id && !old) throw Error('Record no longer exists.');
    let value = { ...clone(old || {}), ...clone(input), id: old?.id || id(kind) };
    if (kind === 'users') {
      value.name = required(value.name, 'Name');
      value.email = required(value.email, 'Email').toLowerCase();
      email(value.email);
      if (users.some((x) => x.id !== value.id && x.email.toLowerCase() === value.email))
        throw Error('This email is already in use.');
      value.role = old?.role || 'user';
      value.status = old?.status || 'active';
      value.joinedAt = old?.joinedAt || new Date(demoNow()).toISOString().slice(0, 10);
    }
    if (['categories', 'hobbies', 'organizers', 'communities', 'campaigns'].includes(kind))
      value.name = required(value.name, 'Name');
    if (kind === 'categories') {
      value.emoji = value.emoji || '✦';
      value.tint = value.tint || 'pink';
      if (categories.some((x) => x.id !== value.id && x.name.toLowerCase() === value.name.toLowerCase()))
        throw Error('This category already exists.');
    }
    if (kind === 'hobbies') {
      exists(categories, value.categoryId, 'category');
      value.description = required(value.description, 'Description');
      value.emoji = value.emoji || '✦';
      value.quizProfile = { ...old?.quizProfile, ...value.quizProfile };
      for (const question of hobbyQuizQuestions) {
        const mapping = Number(value.quizProfile[question.dimension]);
        if (!question.options.some((o) => Number(o.value) === mapping))
          throw Error('Choose a valid ' + question.dimension + ' mapping.');
        value.quizProfile[question.dimension] = mapping;
      }
      value.tags = hobbyQuizQuestions
        .filter((q) => ['environment', 'social', 'cost'].includes(q.dimension))
        .map((q) => q.options.find((o) => Number(o.value) === value.quizProfile[q.dimension])?.label)
        .filter(Boolean);
    }
    if (kind === 'questions') {
      value.question = required(value.question, 'Question');
      value.dimension = required(value.dimension, 'Dimension');
      const dimensions = [
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
      ];
      if (!dimensions.includes(value.dimension)) throw Error('Choose a supported quiz dimension.');

      if (!Array.isArray(value.options) || value.options.length < 2)
        throw Error('Add at least two answer options.');
      value.options = value.options.map((option, index) => ({
        id: option.id || id('option'),
        label: required(option.label, 'Option ' + (index + 1)),
        value: Number(option.value),
      }));
      if (
        value.options.some((o) => !Number.isInteger(o.value) || o.value < 0) ||
        new Set(value.options.map((o) => o.value)).size !== value.options.length
      )
        throw Error('Mappings must be distinct non-negative integers.');
      if (
        old &&
        hobbies.some((h) => !value.options.some((o) => o.value === Number(h.quizProfile?.[value.dimension])))
      )
        throw Error('An existing hobby uses a mapping you removed. Update those hobbies first.');
    }
    if (kind === 'organizers') {
      email(required(value.email, 'Email'));
      value.phone = validateContactPhone(value.phone);
    }
    if (kind === 'activities') {
      value.title = required(value.title, 'Title');
      value.description = required(value.description, 'Description');
      if (!['Class', 'Event', 'Training'].includes(value.type)) throw Error('Choose an activity type.');
      exists(categories, value.categoryId, 'category');
      exists(hobbies, value.hobbyId, 'hobby');
      exists(organizers, value.organizerId, 'organizer');
      value.organizer = organizers.find((o) => o.id === value.organizerId).name;
      value.priceJod = HobbyHubService.toFils(value.priceJod) / 1000;
      value.commissionPercent =
        value.commissionPercent === '' || value.commissionPercent == null
          ? null
          : Number(value.commissionPercent);
      HobbyHubService.split(1000, value.commissionPercent ?? platformSettings.defaultCommissionPercent);
      value.seats = Number(value.seats);
      if (!Number.isInteger(value.seats) || value.seats < 1)
        throw Error('Seats must be a positive whole number.');
      const booked = enrollments.filter((e) => e.activityId === value.id && e.status === 'confirmed').length;
      if (value.seats < booked) throw Error('Seats cannot be below existing confirmed enrollments.');
      required(value.date, 'Date');
      required(value.time, 'Time');
      if (Number.isNaN(new Date(value.date).getTime())) throw Error('Enter a valid activity date.');
      if(value.endDate || value.endTime || value.meetingDays){
        value.endDate=required(value.endDate,'End date');value.endTime=required(value.endTime,'End time');value.meetingDays=required(value.meetingDays,'Session days');
        const end=new Date(value.endDate);
        if(!/^\d{4}-\d{2}-\d{2}$/.test(value.endDate)||Number.isNaN(end.getTime())||end.toISOString().slice(0,10)!==value.endDate||end<new Date(value.date))throw Error('End date must be a valid date on or after the start date.');
        const clock=value.time.match(/^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/i);
        if(!clock || Number(clock[2])>59 || Number(clock[1])>(clock[3]?12:23) || (clock[3]&&Number(clock[1])<1) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(value.endTime))throw Error('Enter valid start and end times.');
        const hour=clock[3]?(Number(clock[1])%12+(clock[3].toUpperCase()==='PM'?12:0)):Number(clock[1]);
        value.startTime=String(hour).padStart(2,'0')+':'+clock[2];
        if(value.endTime<=value.startTime)throw Error('Session end time must be after its start time.');
      }
      if(value.sourceContactId){value.commissionPercent=15;if(value.isFeatured){value.featuredStartsAt=value.publishAt;value.featuredEndsAt=value.bookingClosesAt;}const request=contactMessages.find(r=>r.id===value.sourceContactId);if(value.status==='published'&&request?.activityRequest){const offer=request.agreement;if(offer?.status!=='accepted')throw Error('Record the organizer’s acceptance before publication.');if(offer.totalFils>0&&(!request.publicationReceipt||request.publicationReceipt.amountFils!==offer.totalFils))throw Error('Verify receipt of the publication fees before scheduling publication.');const current=quoteActivityPublication(value,offer.rates);if(['publishAt','bookingClosesAt','priceJod','isFeatured','totalFils'].some(key=>current[key]!==offer[key]))throw Error('Dates or pricing changed. Prepare a new offer and record approval.');value.listingFeeFils=offer.listingFeeFils;value.featuredFeeFils=offer.featuredFeeFils;}}
      if(value.publishAt&&!value.sourceContactId&&(!value.listingFeeFils||value.publicationRateSnapshot)){
        const rates=value.publicationRateSnapshot||platformSettings.requestPricing,q=quoteActivityPublication(value,rates);value.listingFeeFils=q.listingFeeFils;value.featuredFeeFils=q.featuredFeeFils;value.publicationRateSnapshot=clone(rates);
      }
      publicationWindow(value);
      if(value.sourceContactId&&activities.some(a=>a.id!==value.id&&a.sourceContactId===value.sourceContactId))throw Error('This request already has an activity.');
      if(value.publishAt&&value.status==='published'&&value.isFeatured&&!(Number(value.featuredFeeFils)>0))throw Error('Confirm a positive, fixed homepage-placement fee before publication.');
      value.duration = required(value.duration, 'Duration');
      value.sessions = value.sessions || value.duration;
      value.imageUrl = value.imageUrl || '';
      safeReference(value.imageUrl);
      value.listingFeeFils = Number(value.listingFeeFils || 0);
      if (!Number.isSafeInteger(value.listingFeeFils) || value.listingFeeFils < 0)
        throw Error('Invalid listing fee.');
      value.featuredFeeFils = value.featuredFeeFils == null ? 0 : Number(value.featuredFeeFils);
      if (!Number.isSafeInteger(value.featuredFeeFils) || value.featuredFeeFils < 0)
        throw Error('Invalid featured fee.');
      value.status = value.status || 'draft';
      if (!['draft', 'published', 'archived'].includes(value.status))
        throw Error('Invalid publication status.');
      if (value.delivery === 'online' || String(value.delivery).startsWith('Online')) {
        if (!['jitsi', 'zoom'].includes(value.onlineProvider)) throw Error('Choose an online provider.');
        value.delivery = value.onlineProvider === 'zoom' ? 'Online (Zoom)' : 'Online (Jitsi Meet)';
        if (value.onlineProvider === 'zoom') {
          safeUrl(required(value.zoomUrl, 'Zoom link'));
          value.zoomMeetingId = required(value.zoomMeetingId, 'Meeting ID');
        } else {
          value.jitsiRoomName = required(value.jitsiRoomName, 'Jitsi room');
          value.jitsiMeetingId = value.jitsiRoomName;
        }
      } else {
        value.delivery = 'In person';
        value.onlineProvider = null;
        value.location = required(value.location || 'Details provided by organizer', 'Location');
      }
    }
    if (kind === 'communities') {
      exists(hobbies, value.hobbyId, 'hobby');
      const hobby = hobbies.find((h) => h.id === value.hobbyId);
      value.categoryId = hobby.categoryId;
      if (communities.some((c) => c.id !== value.id && c.hobbyId === value.hobbyId))
        throw Error('This hobby already has a community.');
      value.description = required(value.description, 'Description');
      value.status = value.status || 'active';
    }
    if (kind === 'campaigns') {
      exists(organizers, value.organizerId, 'advertiser');
      safeReference(required(value.imageUrl, 'Creative image'));
      safeUrl(required(value.destinationUrl, 'Destination URL'));
      if (
        !['featured', 'banner', 'premium'].includes(value.type) ||
        !['home-featured', 'home-banner', 'home-premium'].includes(value.placement)
      )
        throw Error('Choose a valid campaign type and placement.');
      if (
        !/^\d{4}-\d{2}-\d{2}$/.test(value.startsOn) ||
        !/^\d{4}-\d{2}-\d{2}$/.test(value.endsOn) ||
        value.endsOn < value.startsOn
      )
        throw Error('Enter a valid start and end date.');
      if (!['draft', 'pending', 'scheduled', 'active', 'ended', 'cancelled'].includes(value.status))
        throw Error('Invalid campaign status.');
      if (value.status === 'active' && !value.approved)
        throw Error('Approve the campaign before activating it.');
      value.agreedFeeFils = Number(value.agreedFeeFils);
      if (!Number.isSafeInteger(value.agreedFeeFils) || value.agreedFeeFils < 0)
        throw Error('Invalid agreed fee.');
      if (value.invoiceId) {
        const invoice = invoices.find((i) => i.id === value.invoiceId);
        if (!invoice || invoice.organizerId !== value.organizerId || invoice.status === 'cancelled')
          throw Error('Choose an invoice for this advertiser.');
      }
    }
    if (kind === 'invoices') {
      if (old && old.status !== 'draft') throw Error('Only draft invoices can be edited.');
      exists(organizers, value.organizerId, 'billed party');
      value.number = required(value.number, 'Invoice number');
      if (invoices.some((i) => i.id !== value.id && i.number === value.number))
        throw Error('Invoice number must be unique.');
      if (!value.issuedOn || !value.dueOn || value.dueOn < value.issuedOn)
        throw Error('Due date must be on or after the invoice date.');
      value.description = required(value.description, 'Service description');
      if (!['listing', 'featured', 'advertising', 'other'].includes(value.serviceType))
        throw Error('Choose a service type.');
      value.amountFils = Number(value.amountFils);
      if (!Number.isSafeInteger(value.amountFils) || value.amountFils <= 0)
        throw Error('Invoice amount must be positive.');
      if (value.activityId) {
        exists(activities, value.activityId, 'activity');
        if (activities.find((a) => a.id === value.activityId).organizerId !== value.organizerId)
          throw Error('Activity belongs to another organizer.');
      }
      if (value.campaignId) {
        exists(advertisingCampaigns, value.campaignId, 'campaign');
        const campaign = advertisingCampaigns.find((c) => c.id === value.campaignId);
        if (campaign.organizerId !== value.organizerId)
          throw Error('Campaign belongs to another advertiser.');
        if (campaign.invoiceId && campaign.invoiceId !== value.id)
          throw Error('Campaign already has an invoice.');
      }
      value.status = 'draft';
      value.currency = 'JOD';
      const existingFee = value.sourceFeeId
        ? serviceFees.find((f) => f.id === value.sourceFeeId)
        : old?.feeIds?.[0] && serviceFees.find((f) => f.id === old.feeIds[0]);
      if (
        value.sourceFeeId &&
        (!existingFee ||
          (existingFee.invoiceId && existingFee.invoiceId !== value.id) ||
          existingFee.organizerId !== value.organizerId)
      )
        throw Error('This charge is already billed or belongs to another organizer.');
      const fee = {
        id: existingFee?.id || id('fee'),
        organizerId: value.organizerId,
        type: value.serviceType,
        description: value.description,
        activityId: value.activityId || null,
        campaignId: value.campaignId || null,
        amountFils: value.amountFils,
        invoiceId: value.id,
        status: 'draft',
      };
      if (existingFee) Object.assign(existingFee, fee);
      else serviceFees.push(fee);
      value.feeIds = [fee.id];
      if (value.campaignId) advertisingCampaigns.find((c) => c.id === value.campaignId).invoiceId = value.id;
    }
    if (old) Object.assign(old, value);
    else list.push(value);
    if(kind==='activities'&&value.sourceContactId){const r=contactMessages.find(r=>r.id===value.sourceContactId);if(r){r.activityId=value.id;r.organizerId=value.organizerId;r.reviewStatus='draftPrepared';}}
    if (kind === 'activities' && value.status === 'published') {
      for (const [type, amount] of [
        ['listing', value.listingFeeFils || 0],
        ['featured', value.isFeatured ? value.featuredFeeFils || 0 : 0],
      ]) {
        let fee = serviceFees.find(
          (f) => f.activityId === value.id && f.type === type && !f.invoiceId && f.status === 'unbilled',
        );
        if (!amount) {
          if (fee) serviceFees.splice(serviceFees.indexOf(fee), 1);
          continue;
        }
        const charge = {
          organizerId: value.organizerId,
          type,
          description: (type === 'listing' ? 'Activity listing' : 'Featured placement') + ' — ' + value.title,
          activityId: value.id,
          campaignId: null,
          amountFils: amount,
          invoiceId: null,
          status: 'unbilled',
        };
        if (fee) Object.assign(fee, charge);
        else if (
          !serviceFees.some(
            (f) => f.activityId === value.id && f.type === type && f.invoiceId && f.status !== 'cancelled',
          )
        )
          serviceFees.push({ id: id('fee'), ...charge });
      }
    }

    if(kind==='activities'&&value.status==='published'&&value.sourceContactId)reconcileRequestReceipt(value.sourceContactId);
    if (kind === 'organizers' && value.sourceContactId) {
      const request = contactMessages.find((c) => c.id === value.sourceContactId);
      if (request) {
        request.organizerId = value.id;
        request.status = 'read';
      }
    }
    if (kind === 'organizers')
      activities
        .filter((a) => a.organizerId === value.id)
        .forEach((a) => {
          a.organizer = value.name;
        });
    if (kind === 'categories' && !platformSettings.categoryTints[value.id])
      platformSettings.categoryTints[value.id] = '#FBE3DA';
    platformActivityLog.unshift({
      id: id('log'),
      kind: old ? 'Updated' : 'Created',
      detail: value.title || value.name || value.number || value.question || kind,
      createdAt: new Date(demoNow()).toISOString(),
    });
    return clone(value);
  }
  function remove(kind, key) {
    const list = tables[kind],
      record = list?.find((r) => r.id === key);
    if (!record) throw Error('Record not found.');
    const blocked =
      (kind === 'categories' &&
        (hobbies.some((h) => h.categoryId === key) || activities.some((a) => a.categoryId === key))) ||
      (kind === 'hobbies' &&
        (activities.some((a) => a.hobbyId === key) || communities.some((c) => c.hobbyId === key))) ||
      (kind === 'activities' &&
        (enrollments.some((e) => e.activityId === key) || serviceFees.some((f) => f.activityId === key))) ||
      (kind === 'organizers' &&
        (activities.some((a) => a.organizerId === key) ||
          invoices.some((i) => i.organizerId === key) ||
          advertisingCampaigns.some((c) => c.organizerId === key))) ||
      (kind === 'communities' &&
        (memberships.some((m) => m.communityId === key) ||
          communityPosts.some((p) => p.communityId === key))) ||
      (kind === 'campaigns' && invoices.some((i) => i.id === record.invoiceId));
    if (blocked)
      throw Error('Related records depend on this item. Archive it or update those records first.');
    if (
      ![
        'categories',
        'hobbies',
        'questions',
        'activities',
        'organizers',
        'communities',
        'campaigns',
      ].includes(kind)
    )
      throw Error('This record cannot be deleted.');
    list.splice(list.indexOf(record), 1);
  }
  function status(kind, key, next) {
    const item = tables[kind]?.find((x) => x.id === key);
    if (!item) throw Error('Record not found.');
    const allowed = {
      users: ['active', 'suspended'],
      activities: ['draft', 'published', 'archived'],
      communities: ['active', 'archived'],
      posts: ['visible', 'hidden'],
      contacts: ['new', 'read', 'archived'],
    };
    if (!allowed[kind]?.includes(next)) throw Error('Unsupported status.');
    if (kind === 'users' && item.role === 'admin') throw Error('Admin accounts are managed by the server.');
    if (kind === 'activities' && next === 'published') return save('activities', { ...item, status: next });
    item.status = next;
    return clone(item);
  }
  function reorderQuestion(key, delta) {
    const index = hobbyQuizQuestions.findIndex((q) => q.id === key),
      target = index + delta;
    if (index < 0 || target < 0 || target >= hobbyQuizQuestions.length) return;
    [hobbyQuizQuestions[index], hobbyQuizQuestions[target]] = [
      hobbyQuizQuestions[target],
      hobbyQuizQuestions[index],
    ];
  }
  function invoiceAction(key, action) {
    const item = invoices.find((i) => i.id === key);
    if (!item) throw Error('Invoice not found.');
    if (action === 'paid') return HobbyHubService.markInvoicePaid(key);
    if (action === 'issue') {
      if (item.status !== 'draft') throw Error('Only a draft can be issued.');
      if (!HobbyHubService.invoiceDetails(item).amountFils) throw Error('Add a service before issuing.');
      item.status = 'issued';
      serviceFees
        .filter((f) => item.feeIds.includes(f.id))
        .forEach((f) => {
          f.status = 'invoiced';
        });
    } else if (action === 'cancel') {
      if (['paid', 'cancelled'].includes(item.status))
        throw Error('A paid/cancelled invoice cannot be cancelled.');
      item.status = 'cancelled';
      serviceFees
        .filter((f) => item.feeIds.includes(f.id))
        .forEach((f) => {
          f.status = 'cancelled';
        });
    } else throw Error('Unsupported invoice action.');
    return clone(item);
  }
  function markFeePaid(key) {
    const fee = serviceFees.find((f) => f.id === key);
    if (!fee || fee.status !== 'invoiced') throw Error('Only an invoiced fee can be marked paid.');
    if (fee.invoiceId) return invoiceAction(fee.invoiceId, 'paid');
    fee.status = 'paid';
  }
  function submitContact(values) {
    const contactName=required(values.name,'Name');if(contactName.length<2||contactName.length>100||!/[\p{L}]/u.test(contactName))throw Error('Enter a contact name containing letters, between 2 and 100 characters.');
    email(values.email);
    required(values.topic, 'Topic');
    if (required(values.message, 'Message').length < 10)
      throw Error('Message must be at least 10 characters.');
    if (['advertising', 'list-activity'].includes(values.topic)) {
      required(values.businessName, 'Organization name');
      validateContactPhone(values.phone);
    }
    if(values.coverImageData)safeReference(values.coverImageData);
    if(values.topic==='list-activity'){values.activityRequest=validateActivityRequest(values.activityRequest||{});values.publicationEstimate=quoteActivityPublication(values.activityRequest);if(Number(values.activityRequest.priceJod)>0)values.payoutDetails=validateOrganizerPayout(values.payoutDetails||{});}
    const item = { ...values, reviewStatus:'new', id: id('message'), createdAt: new Date(demoNow()).toISOString(), status: 'new' };
    contactMessages.unshift(item);
    return clone(item);
  }
  function setTheme(values) {
    for (const [key, value] of Object.entries(values))
      if (!/^#[\da-f]{6}$/i.test(value) || !Object.hasOwn(platformSettings.theme, key))
        throw Error('Use a six-digit hex color.');
    Object.assign(platformSettings.theme, values);
    return clone(platformSettings.theme);
  }
  function saveContent(key, values) {
    if (!websiteContent.blocks?.[key]) throw Error('Unsupported content section.');
    const block = websiteContent.blocks[key];
    if (values.title !== undefined) block.title = required(values.title, 'Title');
    if (values.body !== undefined) block.body = required(values.body, 'Content');
    if (values.imageUrl !== undefined) {
      safeReference(values.imageUrl);
      block.imageUrl = values.imageUrl;
    }
    return clone(block);
  }
  return Object.freeze({
    save,
    remove,
    status,
    reorderQuestion,
    invoiceAction,
    markFeePaid,
    submitContact,
    setTheme,
    saveContent,
  });
})();

function enrollInActivity(activityId, paid = false) {
  const activity = activities.find((a) => a.id === activityId && (a.status || 'published') === 'published');
  if (!activity) throw Error('Activity is unavailable.');
  if(!isActivityListed(activity))throw Error('Booking is closed or this activity is not yet open.');
  const existing = enrollments.find(
    (e) => e.userId === currentUser.id && e.activityId === activityId && e.status === 'confirmed',
  );
  if (existing) return existing;
  if (
    enrollments.filter((e) => e.activityId === activityId && e.status === 'confirmed').length >=
    activity.seats
  )
    throw Error('This activity is full.');
  if (activity.priceJod > 0 && !paid) throw Error('Complete checkout before enrolling.');
  const enrollment = {
    id: 'enrollment-' + Date.now() + '-' + enrollments.length,
    userId: currentUser.id,
    activityId,
    status: 'confirmed',
    createdAt: new Date(demoNow()).toISOString().slice(0, 10),
  };
  enrollments.push(enrollment);
  if (activity.priceJod > 0) {
    const quote = HobbyHubService.quote(activityId),
      payment = {
        id: 'payment-' + Date.now() + '-' + simulatedPayments.length,
        enrollmentId: enrollment.id,
        organizerId: activity.organizerId,
        amountFils: quote.amountFils,
        commissionPercent: quote.commissionPercent,
        status: 'paid',
        paidAt: new Date(demoNow()).toISOString(),
      };
    simulatedPayments.push(payment);
    let payout = payouts.find((p) => p.organizerId === activity.organizerId && p.status === 'pending' && p.paymentIds.every(id=>enrollments.find(e=>e.id===simulatedPayments.find(pay=>pay.id===id)?.enrollmentId)?.activityId===activity.id));
    if (!payout) {
      payout = {
        id: 'payout-' + Date.now() + '-' + payouts.length,
        organizerId: activity.organizerId,
        paymentIds: [],
        status: 'pending',
        paidAt: null,
      };
      payouts.push(payout);
    }
    payout.paymentIds.push(payment.id);
  }
  return enrollment;
}
function hasActivityEnrollment(activityId) {
  return enrollments.some(
    (e) => e.activityId === activityId && e.userId === currentUser.id && e.status === 'confirmed',
  );
}
function applyWebsiteContent() {
  document.querySelectorAll('[data-content-key]').forEach((node) => {
    const block = websiteContent.blocks?.[node.dataset.contentKey];
    if (block && node.textContent.trim() !== block.body) node.textContent = block.body;
  });
  if (document.body.dataset.page === 'contact') {
    document.querySelectorAll('a[href^="mailto:"]').forEach((a) => {
      a.href = 'mailto:' + websiteContent.contact.email;
      a.textContent = websiteContent.contact.email;
    });
    document.querySelectorAll('a[href^="tel:"]').forEach((a) => {
      a.href = 'tel:' + websiteContent.contact.phone;
      a.textContent = websiteContent.contact.phone;
    });
  }
  document.querySelectorAll('[data-content-image]').forEach((node) => {
    const block = websiteContent.blocks?.[node.dataset.contentImage];
    if (block?.imageUrl) {
      const path = block.imageUrl;
      if (!/^[a-z][a-z\d+.-]*:/i.test(path) || /^https?:\/\//i.test(path))
        node.src = /^https?:|^\//.test(path) ? path : getRoot() + path;
    }
  });
}
function saveWebsiteBlock(key, body, imageUrl) {
  return AdminService.saveContent(key, { body, imageUrl });
}
function saveFaq(input) {
  const question = String(input.question || '').trim(),
    answer = String(input.answer || '').trim();
  if (!question || !answer) throw Error('Question and answer are required.');
  const old = faqs.find((f) => f.id === input.id);
  if (input.id && !old) throw Error('FAQ not found.');
  const value = { id: old?.id || 'faq-' + Date.now(), question, answer };
  if (old) Object.assign(old, value);
  else faqs.push(value);
  return value;
}
function saveIdeaTemplate(id, values) {
  const idea = [...Object.values(sharedIdeaBank).flat(), ...sharedGenericIdeas].find((i) => i.id === id);
  if (!idea) throw Error('Idea not found.');
  if (
    !values.title?.trim() ||
    !values.description?.trim() ||
    !values.steps?.length ||
    values.steps.some((s) => !s[0]?.trim() || !s[1]?.trim())
  )
    throw Error('Complete the title, description and every step.');
  Object.assign(idea, values);
}

function savePlatformConfig(values) {
  HobbyHubService.split(1000, values.defaultCommissionPercent);
  for (const value of Object.values(values.categoryTints))
    if (!/^#[\da-f]{6}$/i.test(value)) throw Error('Invalid category color.');
  for (const pack of values.adPackages)
    if (
      !Number.isSafeInteger(pack.priceFils) ||
      pack.priceFils < 0 ||
      !Number.isInteger(pack.durationDays) ||
      pack.durationDays < 1
    )
      throw Error('Enter valid package prices and durations.');
  AdminService.setTheme(values.theme);
  HobbyHubService.setDefaultCommission(values.defaultCommissionPercent);
  Object.assign(platformSettings.categoryTints, values.categoryTints);
  platformSettings.adPackages = values.adPackages.map((p) => ({ ...p }));
  return HobbyHubService.snapshot().settings;
}
function saveFeaturedSelection(ids) {
  if (ids.some((id) => !activities.some((a) => a.id === id && a.status === 'published')))
    throw Error('Only published activities can be featured.');
  activities.forEach((a) => {
    a.isFeatured = a.status === 'published' && ids.includes(a.id);
  });
}
function saveContactInformation(values) {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email) || !validateContactPhone(values.phone))
    throw Error('Enter valid contact details.');
  Object.assign(websiteContent.contact, values);
}
function removeFaq(id) {
  const index = faqs.findIndex((f) => f.id === id);
  if (index < 0) throw Error('FAQ not found.');
  faqs.splice(index, 1);
}

/* Outgoing settlement contract, separate from the customer's booking checkout. */
const SettlementService = (() => {
  const copy = (value) => JSON.parse(JSON.stringify(value));
  function details(id) {
    const row = HobbyHubService.snapshot().payouts.find((p) => p.id === id);
    if (!row) throw Error('Payout not found.');
    return row;
  }
  function validateRecipient(value) {
    const recipient = {
      name: String(value.name || '').trim(),
      method: value.method,
      provider: String(value.provider || '').trim(),
      identifier: String(value.identifier || '').trim(),
      checkedWithOrganizer: value.checkedWithOrganizer === true,
    };
    if (recipient.name.length < 2 || recipient.name.length > 120)
      throw Error('Enter the account holder’s name.');
    if (!['bank', 'wallet', 'cliq'].includes(recipient.method)) throw Error('Choose a payout method.');
    if (!recipient.provider) throw Error('Enter the receiving bank or wallet provider.');
    if (recipient.method === 'bank') {
      recipient.identifier = recipient.identifier.replace(/\s/g, '').toUpperCase();
      if (!/^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(recipient.identifier))
        throw Error('Enter a correctly formatted IBAN.');
    } else if (recipient.method === 'wallet') {
      recipient.identifier = recipient.identifier.replace(/[\s-]/g, '');
      if (!/^(?:(?:\+|00)962|0)?7[789]\d{7}$/.test(recipient.identifier))
        throw Error('Enter a Jordanian mobile wallet number.');
    } else if (!/^[\w.@+\-]{3,80}$/.test(recipient.identifier))
      throw Error('Enter the recipient’s CliQ alias, email or phone.');
    if (!recipient.checkedWithOrganizer)
      throw Error('Check these recipient details with the organizer before continuing.');
    return recipient;
  }
  function complete(id, request) {
    const quote = details(id);
    const original=payouts.find(p=>p.id===id);if(!original||!payoutReady(original))throw Error('Organizer settlement is available after the activity ends and refunds are reviewed.');
    if (quote.status !== 'pending') throw Error('This payout has already been settled.');
    if (!quote.payableFils || quote.payableFils !== request.expectedAmountFils)
      throw Error('The payable changed. Review the breakdown again.');
    const recipient = validateRecipient(request.recipient);
    if (!request.confirmedReview) throw Error('Confirm the recipient and amount.');
    if (!['preview', 'external'].includes(request.mode))
      throw Error('Choose how to complete this settlement.');
    const reference =
      request.mode === 'preview'
        ? 'PREVIEW-' + Date.now() + '-' + id
        : String(request.reference || '').trim();
    const paidOn = request.mode === 'preview' ? new Date(demoNow()).toISOString().slice(0, 10) : request.paidOn;
    if (reference.length < 3 || reference.length > 100)
      throw Error('Enter the bank or wallet transfer reference.');
    if (payouts.some((p) => p.id !== id && p.transferReference === reference))
      throw Error('This transfer reference is already attached to another payout.');
    if (!isValidPaymentDay(paidOn) || paidOn > new Date(demoNow()).toISOString().slice(0, 10))
      throw Error('Enter the actual transfer date, not a future date.');
    if (request.mode === 'external' && !request.externalTransferCompleted)
      throw Error('Confirm that the transfer was completed outside HobbyHub.');
    const organizer = organizers.find((o) => o.id === quote.organizerId);
    if (!organizer) throw Error('Organizer not found.');
    // Financial status changes only after the whole request has validated.
    HobbyHubService.markPayoutPaid(id);
    const payout = payouts.find((p) => p.id === id);
    Object.assign(payout, {
      recipientSnapshot: recipient,
      transferReference: reference,
      transferDate: paidOn,
      settlementMode: request.mode,
      simulated: request.mode === 'preview',
      settledAmountFils: quote.payableFils,
      notes: String(request.notes || '').trim(),
    });
    organizer.payoutRecipient = copy(recipient);
    if(platformActivityLog[0])Object.assign(platformActivityLog[0],{kind:'Organizer settlement',detail:organizer.name+' · '+reference});
    return details(id);
  }
  return Object.freeze({ details, validateRecipient, complete });
})();
function recordOrganizerPayment(invoiceId, request) {
  const invoice = invoices.find((i) => i.id === invoiceId);
  if (!invoice || !['issued', 'overdue'].includes(invoice.status))
    throw Error('Only an issued unpaid invoice can receive a payment.');
  const total = HobbyHubService.invoiceDetails(invoice).amountFils;
  if (!total || request.expectedAmountFils !== total)
    throw Error('Invoice total changed. Review the invoice again.');
  if (!['bank', 'wallet', 'cliq'].includes(request.method)) throw Error('Choose how payment was received.');
  const reference = String(request.reference || '').trim();
  if (reference.length < 3 || reference.length > 100) throw Error('Enter the payment reference.');
  if (invoices.some((i) => i.id !== invoiceId && i.paymentReference === reference))
    throw Error('This payment reference has already been recorded.');
  if (
    !isValidPaymentDay(request.receivedOn) ||
    request.receivedOn > new Date(demoNow()).toISOString().slice(0, 10)
  )
    throw Error('Enter the actual receipt date.');
  if (!request.receiptConfirmed) throw Error('Confirm that you received this payment.');
  HobbyHubService.markInvoicePaid(invoiceId);
  Object.assign(invoice, {
    paymentReference: reference,
    receiptMethod: request.method,
    receivedOn: request.receivedOn,
    paymentNotes: String(request.notes || '').trim(),
  });
  if(platformActivityLog[0])Object.assign(platformActivityLog[0],{kind:'Organizer payment receipt',detail:invoice.number+' · '+reference});
  return HobbyHubService.invoiceDetails(invoice);
}

function isValidPaymentDay(value){if(!/^\d{4}-\d{2}-\d{2}$/.test(value||''))return false;const date=new Date(value+'T12:00:00Z');return !Number.isNaN(date.getTime())&&date.toISOString().slice(0,10)===value;}

/* Frontend project suggestions: replace with an AI endpoint later. */
function createHobbyProject(hobbyId, variation, time, level) {
 const projects={"drawing": ["Create a three-panel postcard", "Sketch three scenes from your day"], "calligraphy": ["Make a hand-lettered gift tag", "Letter a short quote for your desk"], "photography": ["Tell a story in five photos", "Create a three-photo colour collection"], "pottery": ["Make a small pinch-pot dish", "Shape a textured clay pendant"], "crochet": ["Crochet a small coaster", "Make a two-colour bookmark"], "tatreez": ["Stitch a small geometric motif", "Make a stitched bookmark motif"], "accessoriesHandicrafts": ["Make a personalised beaded bracelet", "Design a matching keyring"], "guitar": ["Record a short three-chord song", "Create a four-bar chord loop"], "oud": ["Record a short oud melody", "Create a four-bar oud phrase"], "singing": ["Record a verse of a favourite song", "Create a short vocal harmony"], "piano": ["Record a short piano melody", "Compose a four-bar piano phrase"], "dabke": ["Build a short dabke sequence", "Record a short dabke step combination"], "modernDance": ["Create a short dance sequence", "Choreograph a chorus-length routine"], "hiking": ["Create a local walking-route journal", "Make a nearby trail photo map"], "camping": ["Build a campsite layout plan", "Pack and test a basic camp kit at home"], "snorkeling": ["Make a marine-life identification card", "Create a supervised snorkelling preparation checklist"], "windsurfing": ["Create a windsurfing preparation card", "Build a supervised lesson preparation plan"], "cycling": ["Map a short local cycling route", "Create a bike preparation checklist"], "football": ["Complete a three-station ball-control circuit", "Record a short passing challenge"], "running": ["Complete a comfortable walk-run session", "Create a personal warm-up card"], "swimming": ["Create a supervised pool-session plan", "Make a pool preparation and reflection card"], "tennis": ["Complete a short controlled rally challenge", "Record a ball-control practice sequence"], "padel": ["Complete a short partner rally challenge", "Create a court-positioning diagram"], "cooking": ["Make a colourful three-ingredient salad", "Prepare a simple lunch bowl"], "bakingDesserts": ["Make a small batch of oat cookies", "Create a no-bake dessert cup"], "homeGardening": ["Plant a small herb pot", "Create a labelled seed-starting tray"], "coffeeBrewing": ["Make a two-cup coffee comparison card", "Create your own coffee recipe card"], "chess": ["Build an annotated three-puzzle collection", "Annotate a short chess game"], "tawleh": ["Create an illustrated opening-move card", "Annotate one friendly tawleh round"], "reading": ["Create a one-page illustrated book review", "Make a character relationship map"], "groupBoardGames": ["Create a quick-start game guide", "Design a small paper board game"]};
 const hobby=hobbies.find(h=>h.id===hobbyId);
 const title=(projects[hobbyId]||["Create a small personal hobby project"])[variation % (projects[hobbyId]?.length||1)];
 const parsed=typeof time==='number'?time:time==='1 hour'?60:Number(String(time).replace(/ minutes?$/,''));
 if(!Number.isInteger(parsed)||parsed<5||parsed>480)throw Error('Choose a session between 5 and 480 whole minutes.');
 const minutes=parsed;
 const parts=[Math.round(minutes*.2),Math.round(minutes*.6)];parts.push(minutes-parts[0]-parts[1]);
 return {title,description:`Your outcome: ${title.toLowerCase()}. Use this ${minutes}-minute session to make a first version; finishing can take another session.`,emoji:hobby?.emoji||"🌱",place:"Choose a suitable space",minutes,steps:[
 ["Prepare your first version",`Choose the materials and a manageable scope for: ${title.toLowerCase()}. About ${parts[0]} min.`],
 ["Make the project",`${level==="Beginner"?"Keep the first version simple":"Add one detail that challenges you"}. Work toward the named outcome with the tools you have. About ${parts[1]} min.`],
 ["Keep your result",`Save, photograph or write down what you made. Mark only completed milestones and note what remains. About ${parts[2]} min.`]]};
}

function activitySchedule(activity){
 const formatDate=value=>{const date=new Date(value);return Number.isNaN(date.getTime())?'Date to be confirmed':date.toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'});};
 const start=formatDate(activity.date),end=activity.endDate?formatDate(activity.endDate):'';
 const clock=value=>{if(!/^\d{2}:\d{2}$/.test(value||''))return value||'Time to be confirmed';const [h,m]=value.split(':').map(Number);return (h%12||12)+':'+String(m).padStart(2,'0')+(h<12?' AM':' PM');};
 return {dates:end&&end!==start?start+' – '+end:start,hours:activity.endTime?clock(activity.startTime||activity.time)+' – '+clock(activity.endTime):clock(activity.time)+' · End time to be confirmed',days:activity.meetingDays||'Session days to be confirmed'};
}

/* Activity request and publication contracts. Times explicitly use the configured Amman offset. */
function activityDateTime(value,label='Date and time'){
 if(!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value||''))throw Error(label+' is required.');
 const [day,time]=value.split('T');const d=new Date(day+'T'+time+':00Z');
 if(Number.isNaN(d.getTime())||d.toISOString().slice(0,16)!==value)throw Error('Enter a valid '+label.toLowerCase()+'.');
 return new Date(value+':00+03:00').getTime();
}
function publicationWindow(value,requireAll=false){
 const any=value.publishAt||value.bookingClosesAt||value.featuredStartsAt||value.featuredEndsAt;
 if(!any&&!requireAll)return null;
 const start=activityDateTime(value.publishAt,'Publication start'),close=activityDateTime(value.bookingClosesAt,'Booking deadline');
 const date=new Date(value.date);if(Number.isNaN(date.getTime()))throw Error('Enter the activity start date.');
 const day= /^\d{4}-\d{2}-\d{2}$/.test(value.date)?value.date:[date.getFullYear(),String(date.getMonth()+1).padStart(2,'0'),String(date.getDate()).padStart(2,'0')].join('-');
 let clock=value.startTime||value.time;
 if(!/^\d{2}:\d{2}$/.test(clock||'')){const match=String(clock).match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);if(!match)throw Error('Enter the session start time.');clock=String(Number(match[1])%12+(match[3].toUpperCase()==='PM'?12:0)).padStart(2,'0')+':'+match[2];}
 const event=activityDateTime(day+'T'+clock,'Activity start');
 if(close<=start)throw Error('Booking must close after publication begins.');
 if(close>event)throw Error('Booking must close at or before the activity starts.');
 let featuredHours=0;
 if(value.isFeatured){const from=activityDateTime(value.featuredStartsAt,'Homepage start'),to=activityDateTime(value.featuredEndsAt,'Homepage end');if(from<start||to>close||to<=from)throw Error('Homepage placement must fall within the publication and booking period.');featuredHours=(to-from)/3600000;}
 return {publicationHours:(close-start)/3600000,featuredHours};
}
function formatDisplayPeriod(hours){const minutes=Math.round(hours*60),days=Math.floor(minutes/1440),h=Math.floor(minutes%1440/60),m=minutes%60;return [days?days+' day'+(days===1?'':'s'):'',h?h+' hr':'',m?m+' min':''].filter(Boolean).join(' ')||'0 min';}
function isActivityListed(activity,now=demoNow()){
 if((activity.status||'published')!=='published')return false;
 if(!activity.publishAt)return true;
 try{return now>=activityDateTime(activity.publishAt)&&now<activityDateTime(activity.bookingClosesAt);}catch{return false;}
}
function isActivityFeatured(activity,now=demoNow()){
 if(!activity.isFeatured||!isActivityListed(activity,now))return false;
 if(!activity.featuredStartsAt&&!activity.featuredEndsAt)return true;
 try{return now>=activityDateTime(activity.featuredStartsAt)&&now<activityDateTime(activity.featuredEndsAt);}catch{return false;}
}
function validateActivityRequest(input){
 const a={...input};if(a.sessionDays){const pattern=calculateRequestSchedule(a.date,a.endDate,a.sessionDays);a.meetingDays=pattern.meetingDays;a.sessions=pattern.sessions;a.duration=pattern.duration;}if(a.isFeatured){a.featuredStartsAt=a.publishAt;a.featuredEndsAt=a.bookingClosesAt;}
 for(const key of ['title','hobbyId','type','description','level','date','endDate','time','endTime','meetingDays','duration','sessions','delivery'])if(!String(a[key]??'').trim())throw Error('Complete the activity details: '+key+'.');
 if(!hobbies.some(h=>h.id===a.hobbyId)||!['Class','Event','Training'].includes(a.type)||!['inperson','online'].includes(a.delivery))throw Error('Choose a valid hobby, activity type and delivery.');
 for(const [key,value]of Object.entries(a))if(typeof value==='string'&&value.length>3000)throw Error('Activity details are too long.');
 for(const key of ['date','endDate']){const parsed=new Date(a[key]+'T00:00:00Z');if(!/^\d{4}-\d{2}-\d{2}$/.test(a[key])||Number.isNaN(parsed.getTime())||parsed.toISOString().slice(0,10)!==a[key])throw Error('Enter a valid activity date.');}
 if(a.endDate<a.date||!/^([01]\d|2[0-3]):[0-5]\d$/.test(a.time)||!/^([01]\d|2[0-3]):[0-5]\d$/.test(a.endTime)||a.endTime<=a.time)throw Error('Activity end date/time must follow its start date/time.');
 if(a.title.trim().length<3||a.title.length>150||a.description.trim().length<10)throw Error('Use a clear activity title and a description of at least 10 characters.');
 a.seats=Number(a.seats);if(!Number.isInteger(a.seats)||a.seats<1||a.seats>100000)throw Error('Enter a whole number of seats from 1 to 100000.');
 a.priceJod=HobbyHubService.toFils(a.priceJod)/1000;
 if(a.delivery==='inperson'&&!String(a.location||'').trim())throw Error('Enter the venue or address.');
 if(a.delivery==='online'&&!['jitsi','zoom'].includes(a.onlineProvider))throw Error('Choose the online meeting provider.');
 if(a.acceptedTerms!==true)throw Error('Accept the 15% paid-booking commission and separate homepage-placement terms.');
 a.isFeatured=Boolean(a.isFeatured);a.startTime=a.time;publicationWindow(a,true);
 if(a.delivery==='online'&&a.onlineProvider==='zoom'){let url;try{url=new URL(a.zoomUrl);}catch{throw Error('Enter the Zoom meeting link.');}if(url.protocol!=='https:'||!/(^|\.)zoom\.us$|(^|\.)zoom\.com$/.test(url.hostname))throw Error('Use an HTTPS Zoom meeting link.');if(!/^\d{9,11}$/.test(String(a.zoomMeetingId||'').replace(/\s/g,'')))throw Error('Enter the 9–11 digit Zoom meeting ID.');a.zoomMeetingId=String(a.zoomMeetingId).replace(/\s/g,'');const linked=url.pathname.match(/\/j\/(\d{9,11})(?:\/|$)/);if(linked&&linked[1]!==a.zoomMeetingId)throw Error('The meeting ID must match the Zoom link.');}

 a.commissionPercent=15;delete a.featuredFeeFils;delete a.listingFeeFils;delete a.status;return a;
}
function requestActivityPrefill(requestId){
 const request=contactMessages.find(r=>r.id===requestId);if(!request?.activityRequest)throw Error('Activity request not found.');
 const existing=activities.find(a=>a.sourceContactId===requestId);if(existing)return {existingId:existing.id};
 const organizer=organizers.find(o=>o.id===request.organizerId||o.email.toLowerCase()===request.email.toLowerCase());if(!organizer)throw Error('Add or link the organizer before preparing the activity.');
 const a=validateActivityRequest(request.activityRequest),h=hobbies.find(h=>h.id===a.hobbyId);
 const quote=quoteActivityPublication(a);if(a.delivery==='online'&&a.onlineProvider==='jitsi')a.jitsiRoomName='HobbyHub-'+request.id.replace(/[^a-zA-Z0-9-]/g,'');
 return {...a,organizerId:organizer.id,categoryId:h.categoryId,sourceContactId:requestId,status:'draft',imageUrl:request.coverImageData||request.imageReference||'',commissionPercent:15,featuredFeeFils:quote.featuredFeeFils,listingFeeFils:quote.listingFeeFils};
}
function updateActivityRequestStatus(id,status){const r=contactMessages.find(r=>r.id===id);if(!r?.activityRequest)throw Error('Request not found.');if(!['new','followUp','closed'].includes(status))throw Error('Choose a valid request state.');r.reviewStatus=status;return r;}

function quoteActivityPublication(activity,rates=platformSettings.requestPricing){
 const period=publicationWindow({...activity,featuredStartsAt:activity.publishAt,featuredEndsAt:activity.bookingClosesAt},true);
 const amount=HobbyHubService.toFils(activity.priceJod);
 const freeRate=Number(rates.freeListingDailyFils),homeRate=Number(rates.homepageDailyFils);
 if(!Number.isSafeInteger(freeRate)||freeRate<0||!Number.isSafeInteger(homeRate)||homeRate<0)throw Error('Configure valid publication rates.');
 const listingFeeFils=amount===0?Math.round(period.publicationHours/24*freeRate):0;
 const featuredFeeFils=activity.isFeatured?Math.round(period.publicationHours/24*homeRate):0;
 return {publicationHours:period.publicationHours,listingFeeFils,featuredFeeFils,totalFils:listingFeeFils+featuredFeeFils,commissionPercent:15,rates:{freeListingDailyFils:freeRate,homepageDailyFils:homeRate},publishAt:activity.publishAt,bookingClosesAt:activity.bookingClosesAt,priceJod:amount/1000,isFeatured:Boolean(activity.isFeatured)};
}
function saveRequestPricing(values){const result={};for(const key of ['freeListingDailyFils','homepageDailyFils']){result[key]=Number(values[key]);if(!Number.isSafeInteger(result[key])||result[key]<0||result[key]>1000000)throw Error('Use daily rates between JOD 0 and 1000.');}Object.assign(platformSettings.requestPricing,result);return result;}
function validateOrganizerPayout(values){const result=SettlementService.validateRecipient({...values,checkedWithOrganizer:true});return {...result,checkedWithOrganizer:false};}
function requestQuoteSource(request){return activities.find(a=>a.sourceContactId===request.id)||request.activityRequest;}
function prepareOrganizerQuote(id){const request=contactMessages.find(r=>r.id===id);if(!request?.activityRequest)throw Error('Activity request not found.');const source=requestQuoteSource(request);const quote=quoteActivityPublication(source);if(request.publicationReceipt){if(['publishAt','bookingClosesAt','priceJod','isFeatured','totalFils'].some(k=>quote[k]!==request.agreement[k]))throw Error('A payment is already recorded. Reconcile it before changing paid terms.');return request.agreement;}request.agreement={...quote,status:'prepared',preparedAt:new Date(demoNow()).toISOString(),account:{...platformSettings.receivingAccount}};return request.agreement;}
function recordOrganizerDecision(id,input){const request=contactMessages.find(r=>r.id===id),offer=request?.agreement;if(!offer)throw Error('Prepare the offer first.');if(!['accepted','declined','changesRequested'].includes(input.decision)||!['email','phone','whatsapp'].includes(input.channel))throw Error('Choose the reply and contact channel.');const reference=String(input.reference||'').trim();if(reference.length<5||reference.length>300||input.confirmed!==true)throw Error('Record the organizer’s actual reply and confirm you received it.');Object.assign(offer,{status:input.decision,channel:input.channel,replyReference:reference,repliedAt:new Date(demoNow()).toISOString()});return offer;}
function organizerQuoteText(request){const offer=request.agreement;if(!offer)throw Error('Prepare the offer first.');const fmt=HobbyHubService.money,account=offer.account;return ['HobbyHub activity proposal — '+requestQuoteSource(request).title,'Organizer: '+request.businessName,'Publication: '+offer.publishAt+' → '+offer.bookingClosesAt+' (Amman UTC+03:00)','Display period: '+formatDisplayPeriod(offer.publicationHours),'Paid-booking commission: 15%. Free bookings: no booking commission.','Free-activity publication: '+fmt(offer.listingFeeFils),'Homepage placement: '+fmt(offer.featuredFeeFils),'Total publication/placement fees: '+fmt(offer.totalFils),'Daily rates are prorated to the actual hours and rounded to the nearest fils.',offer.totalFils?account?.holder&&account?.identifier?'Pay HobbyHub: '+[account.holder,account.method,account.provider,account.identifier].filter(Boolean).join(' · '):'Payment instructions pending: admin must configure HobbyHub’s receiving account before requesting a transfer.':'No fixed publication payment due.','Please reply to confirm or decline these dates and fees. No publication is approved by this quotation alone.'].join('\n');}

function calculateRequestSchedule(first,last,days){
 const start=new Date(first+'T00:00:00Z'),end=new Date(last+'T00:00:00Z');
 if(Number.isNaN(start.getTime())||Number.isNaN(end.getTime())||end<start)throw Error('Choose a valid first and last session date.');
 if(!Array.isArray(days))throw Error('Choose the session days.');
 const chosen=[...new Set(days.map(Number))];if(!chosen.length||chosen.some(d=>!Number.isInteger(d)||d<0||d>6))throw Error('Choose the session days.');
 if(!chosen.includes(start.getUTCDay())||!chosen.includes(end.getUTCDay()))throw Error('The first and last session dates must match the selected session days.');
 const span=Math.round((end-start)/86400000)+1;if(span>730)throw Error('Choose an activity span of up to two years.');let count=0;for(let i=0;i<span;i++)if(chosen.includes((start.getUTCDay()+i)%7))count++;
 return {duration:span+' calendar day'+(span===1?'':'s'),sessions:count+' session'+(count===1?'':'s'),meetingDays:chosen.map(d=>['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][d]).join(', ')};
}

function demoNow(){return typeof window!=='undefined'&&window.DemoStore?window.DemoStore.now():Date.now();}
function requestStage(request){if(request.activityId&&activities.some(a=>a.id===request.activityId&&a.status==='published'))return 'published';if(request.agreement?.status==='declined')return 'declined';if(request.agreement?.status==='changesRequested')return 'changes';if(request.agreement?.status!=='accepted')return request.agreement?'reply':'review';if(request.agreement.totalFils>0&&!request.publicationReceipt)return 'payment';return 'publish';}
function recordPublicationReceipt(id,input){const r=contactMessages.find(r=>r.id===id);if(r?.agreement?.status!=='accepted')throw Error('Record organizer approval first.');if(r.publicationReceipt)throw Error('This receipt is already recorded.');if(input.confirmed!==true||HobbyHubService.toFils(input.amountJod)!==r.agreement.totalFils||String(input.reference||'').trim().length<3||!isValidPaymentDay(input.receivedOn)||input.receivedOn>new Date(demoNow()).toISOString().slice(0,10))throw Error('Confirm the exact amount, payment date and transfer reference.');if(contactMessages.some(x=>x.publicationReceipt?.reference===input.reference.trim()))throw Error('This payment reference is already used.');r.publicationReceipt={amountFils:r.agreement.totalFils,reference:input.reference.trim(),receivedOn:input.receivedOn,recordedAt:new Date(demoNow()).toISOString()};return r.publicationReceipt;}
function reconcileRequestReceipt(id){const r=contactMessages.find(r=>r.id===id);if(!r?.publicationReceipt||!r.activityId)return;const fees=serviceFees.filter(f=>f.activityId===r.activityId&&['listing','featured'].includes(f.type));if(!fees.length||invoices.some(i=>i.sourceRequestId===id))return;const invoice={id:'request-invoice-'+id,sourceRequestId:id,number:'HH-'+id,organizerId:r.organizerId,issuedOn:r.publicationReceipt.receivedOn,dueOn:r.publicationReceipt.receivedOn,currency:'JOD',feeIds:fees.map(f=>f.id),status:'paid',paidAt:r.publicationReceipt.recordedAt,paymentNotes:r.publicationReceipt.reference};invoices.push(invoice);fees.forEach(f=>{f.status='paid';f.invoiceId=invoice.id;});}
function payoutReady(payout,now=demoNow()){return payout.paymentIds.every(id=>{const payment=simulatedPayments.find(p=>p.id===id),booking=enrollments.find(e=>e.id===payment?.enrollmentId),a=activities.find(a=>a.id===booking?.activityId);if(!a)return false;const d=new Date(a.endDate||a.date),date=[d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');try{return now>=activityDateTime(date+'T'+(a.endTime||'23:59'));}catch{return false;}});}
