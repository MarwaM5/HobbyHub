/* Login page interactions: front-end demo only; no credentials are stored. */
document.addEventListener("DOMContentLoaded", () => {
  mountSharedUi();

  const form = document.getElementById("loginForm");
  const email = document.getElementById("loginEmail");
  const password = document.getElementById("loginPassword");
  const emailError = document.getElementById("emailError");
  const passwordError = document.getElementById("passwordError");
  const notice = document.getElementById("loginNotice");
  const togglePassword = document.getElementById("btnTogglePassword");
  const forgotDialog = document.getElementById("forgotDialog");
  const forgotEmail = document.getElementById("forgotEmail");
  const forgotForm = document.getElementById("forgotForm");
  const forgotError = document.getElementById("forgotError");
  const forgotNotice = document.getElementById("forgotNotice");

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function setFieldError(input, errorElement, message) {
    errorElement.textContent = message;
    const wrap = input.closest(".loginInputWrap");
    if (wrap) wrap.classList.toggle("hasError", Boolean(message));
    input.setAttribute("aria-invalid", message ? "true" : "false");
  }

  function showNotice(element, message, isError = false) {
    element.textContent = message;
    element.classList.toggle("isError", isError);
    element.hidden = false;
  }

  function hideNotice(element) {
    element.hidden = true;
    element.textContent = "";
    element.classList.remove("isError");
  }

  [email, password].forEach((input) => {
    input.addEventListener("input", () => {
      hideNotice(notice);
      if (input === email) setFieldError(email, emailError, email.value && !emailPattern.test(email.value.trim()) ? "Enter a valid email address." : "");
      if (input === password) setFieldError(password, passwordError, "");
    });
  });

  togglePassword.addEventListener("click", () => {
    const isHidden = password.type === "password";
    password.type = isHidden ? "text" : "password";
    togglePassword.setAttribute("aria-label", isHidden ? "Hide password" : "Show password");
    togglePassword.setAttribute("aria-pressed", String(isHidden));
    togglePassword.innerHTML = isHidden
      ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3 21 21"/><path d="M10.6 6.1A10.9 10.9 0 0 1 12 6c6.1 0 9.5 6 9.5 6a16 16 0 0 1-3.1 3.7"/><path d="M6.2 6.3C3.8 8 2.5 12 2.5 12s3.4 6 9.5 6c1.3 0 2.4-.3 3.4-.7"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/></svg>'
      : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 12s3.4-6 9.5-6 9.5 6 9.5 6-3.4 6-9.5 6-9.5-6-9.5-6Z"/><circle cx="12" cy="12" r="2.5"/></svg>';
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    hideNotice(notice);

    const emailValue = email.value.trim();
    const passwordValue = password.value;
    const emailMessage = !emailValue ? "Please enter your email address." : (!emailPattern.test(emailValue) ? "Enter a valid email address." : "");
    const passwordMessage = !passwordValue ? "Please enter your password." : "";

    setFieldError(email, emailError, emailMessage);
    setFieldError(password, passwordError, passwordMessage);

    if (emailMessage) {
      email.focus();
      return;
    }
    if (passwordMessage) {
      password.focus();
      return;
    }

    // Replace this navigation with the future server-authenticated role response.
    window.location.href = buildUrl("dashboard", "?u=1");
  });

  function openForgotDialog() {
    forgotDialog.hidden = false;
    document.body.classList.add("loginDialogOpen");
    forgotEmail.value = email.value.trim();
    hideNotice(forgotNotice);
    forgotError.textContent = "";
    window.setTimeout(() => forgotEmail.focus(), 0);
  }

  function closeForgotDialog() {
    forgotDialog.hidden = true;
    document.body.classList.remove("loginDialogOpen");
    document.getElementById("btnForgotPassword").focus();
  }

  document.getElementById("btnForgotPassword").addEventListener("click", openForgotDialog);
  document.getElementById("btnCloseForgot").addEventListener("click", closeForgotDialog);
  forgotDialog.addEventListener("click", (event) => {
    if (event.target === forgotDialog) closeForgotDialog();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !forgotDialog.hidden) closeForgotDialog();
  });

  forgotForm.addEventListener("submit", (event) => {
    event.preventDefault();
    hideNotice(forgotNotice);
    const value = forgotEmail.value.trim();
    if (!value) {
      forgotError.textContent = "Please enter your email address.";
      forgotEmail.setAttribute("aria-invalid", "true");
      forgotEmail.focus();
      return;
    }
    if (!emailPattern.test(value)) {
      forgotError.textContent = "Enter a valid email address.";
      forgotEmail.setAttribute("aria-invalid", "true");
      forgotEmail.focus();
      return;
    }
    forgotError.textContent = "";
    forgotEmail.setAttribute("aria-invalid", "false");
    showNotice(forgotNotice, "If this were connected to an account, a password reset link would be sent to this email.");
  });

  applyRoutes(document);
});
