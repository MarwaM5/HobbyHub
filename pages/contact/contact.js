/* General enquiries go to the admin inbox. Organizer requests have their own page. */
document.addEventListener('DOMContentLoaded', () => {
  const loggedIn = isLoggedIn();
  if (loggedIn) {
    document.getElementById('contactApp').classList.add('hhUserApp');
    document.getElementById('contactMain').classList.add('hhUserMain');
    document.getElementById('hhUserSidebarSlot').hidden = false;
    document.getElementById('hhUserHeaderSlot').hidden = false;
  }
  mountSharedUi({ userApp: loggedIn, active: 'contact', title: 'Contact us', subtitle: 'Talk to the HobbyHub team' });
  const get = (id) => document.getElementById(id),
    form = get('contactForm');
  const fields = [
    ['contactName', 'nameError'],
    ['contactEmail', 'emailError'],
    ['contactMessage', 'messageError'],
  ];
  function validate() {
    let valid = true;
    fields.forEach(([id, errorId]) => {
      const input = get(id),
        value = input.value.trim();
      let message = !value ? 'Please complete this field.' : '';
      if (id === 'contactName' && value && value.length < 2)
        message = 'Enter your name using at least 2 characters.';
      if (id === 'contactEmail' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
        message = 'Enter a valid email address.';
      if (id === 'contactMessage' && value && value.length < 10)
        message = 'Please add a little more detail (at least 10 characters).';
      input.setCustomValidity(message);
      input.setAttribute('aria-invalid', String(Boolean(message)));
      get(errorId).textContent = message;
      valid = valid && !message;
    });
    return valid;
  }
  fields.forEach(([id, errorId]) =>
    get(id).addEventListener('input', () => {
      get(id).setCustomValidity('');
      get(id).setAttribute('aria-invalid', 'false');
      get(errorId).textContent = '';
      get('contactFeedback').hidden = true;
      get('messageCount').textContent = get('contactMessage').value.length + ' / 1000';
    }),
  );
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const feedback = get('contactFeedback');
    feedback.hidden = true;
    if (!validate() || !form.reportValidity()) {
      form.querySelector('[aria-invalid="true"]')?.focus();
      return;
    }
    try {
      AdminService.submitContact({
        name: get('contactName').value.trim(),
        email: get('contactEmail').value.trim(),
        message: get('contactMessage').value.trim(),
        topic: 'general',
        preferredContact: 'email',
      });
      if (window.DemoStore && !DemoStore.save())
        throw Error('Your message could not be saved. Check browser storage and try again.');
      feedback.textContent = 'Your message is saved in the admin’s local demo inbox. No email has been sent.';
      feedback.classList.remove('isError');
      feedback.setAttribute('role', 'status');
      form.reset();
      get('messageCount').textContent = '0 / 1000';
    } catch (error) {
      feedback.textContent = error.message;
      feedback.classList.add('isError');
      feedback.setAttribute('role', 'alert');
    }
    feedback.hidden = false;
  });
});
