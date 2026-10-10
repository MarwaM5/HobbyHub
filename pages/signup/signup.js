/* Sign-up validation for the static front-end demo. No account details are stored. */
document.addEventListener("DOMContentLoaded", () => {
  mountSharedUi();
  applyRoutes(document);

  const form = document.getElementById("signupForm");
  const nameInput = document.getElementById("signupName");
  const emailInput = document.getElementById("signupEmail");
  const passwordInput = document.getElementById("signupPassword");
  const confirmInput = document.getElementById("signupConfirmPassword");
  const termsInput = document.getElementById("signupTerms");
  const alertBox = document.getElementById("signupAlert");

  const errors = {
    name: document.getElementById("nameError"),
    email: document.getElementById("emailError"),
    password: document.getElementById("passwordError"),
    confirm: document.getElementById("confirmPasswordError"),
    terms: document.getElementById("termsError")
  };

  // Deliberately practical rather than over-restrictive: browser-friendly email and an 8+ character password.
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const passwordLengthRegex = /^.{8,}$/s;
  const passwordLetterRegex = /[A-Za-z]/;
  const passwordNumberRegex = /\d/;

  function setError(input, errorNode, message) {
    errorNode.textContent = message;
    input.setAttribute("aria-invalid", message ? "true" : "false");
    const wrapper = input.closest(".signupInputWrap");
    if (wrapper) wrapper.classList.toggle("hasError", Boolean(message));
  }

  function showAlert(message, isError = false) {
    alertBox.textContent = message;
    alertBox.classList.toggle("isError", isError);
    alertBox.hidden = false;
  }

  function clearAlert() {
    alertBox.hidden = true;
    alertBox.textContent = "";
    alertBox.classList.remove("isError");
  }

  function validateName(showMessage = true) {
    const value = nameInput.value.trim();
    const message = !value ? "Please enter your full name." : (value.length < 2 ? "Enter at least 2 characters." : "");
    setError(nameInput, errors.name, showMessage ? message : "");
    return !message;
  }

  function validateEmail(showMessage = true) {
    const value = emailInput.value.trim();
    const message = !value ? "Please enter your email address." : (!emailRegex.test(value) ? "Enter a valid email address, like name@example.com." : "");
    setError(emailInput, errors.email, showMessage ? message : "");
    return !message;
  }

  function getPasswordChecks(value) {
    return {
      length: passwordLengthRegex.test(value),
      number: passwordNumberRegex.test(value),
      case: /[a-z]/.test(value) && /[A-Z]/.test(value),
      special: /[^A-Za-z0-9\s]/.test(value)
    };
  }

  function updatePasswordGuidance() {
    const value = passwordInput.value;
    const checks = getPasswordChecks(value);
    document.querySelectorAll("[data-rule]").forEach((item) => {
      const met = checks[item.dataset.rule];
      item.classList.toggle("isMet", met);
      item.querySelector("span").textContent = met ? "✓" : "○";
    });

    const count = Object.values(checks).filter(Boolean).length;
    const bar = document.getElementById("passwordStrengthBar");
    const text = document.getElementById("passwordStrengthText");
    // There are four password requirements: length, number, mixed case, and special character.
    const widths = ["0%", "25%", "50%", "75%", "100%"];
    const colors = ["#EADDD2", "#C8503E", "#C8503E", "#E0A63A", "#7DA477"];
    bar.style.width = value ? widths[count] : "0%";
    bar.style.background = colors[count];

    // Keep the initial/empty state neutral, and show success only when all four rules pass.
    text.textContent = !value
      ? "Use the checklist below to create a strong password."
      : count === 4
        ? "Strong password — all requirements met."
        : count >= 3
          ? "Good progress — check the remaining requirements."
          : "Keep going — your password can be stronger.";

    if (confirmInput.value) validateConfirm(true);
  }

  function validatePassword(showMessage = true) {
    const value = passwordInput.value;
    const checks = getPasswordChecks(value);
    let message = "";
    if (!value) message = "Please create a password.";
    else if (!checks.length) message = "Use at least 8 characters.";
    else if (!checks.number) message = "Add at least one number.";
    else if (!checks.case) message = "Use both uppercase and lowercase letters.";
    else if (!checks.special) message = "Add at least one special character, such as ! or #.";
    setError(passwordInput, errors.password, showMessage ? message : "");
    return !message;
  }

  function validateConfirm(showMessage = true) {
    const value = confirmInput.value;
    const message = !value ? "Please confirm your password." : value !== passwordInput.value ? "These passwords don't match yet." : "";
    setError(confirmInput, errors.confirm, showMessage ? message : "");
    return !message;
  }

  function validateTerms(showMessage = true) {
    const message = termsInput.checked ? "" : "Please agree to continue creating your account.";
    errors.terms.textContent = showMessage ? message : "";
    termsInput.setAttribute("aria-invalid", message ? "true" : "false");
    return !message;
  }

  [nameInput, emailInput, passwordInput, confirmInput].forEach((input) => {
    input.addEventListener("input", clearAlert);
  });
  nameInput.addEventListener("blur", () => validateName(Boolean(nameInput.value.trim())));
  emailInput.addEventListener("blur", () => validateEmail(Boolean(emailInput.value.trim())));
  emailInput.addEventListener("input", () => {
    if (emailInput.value.trim()) validateEmail(true);
  });
  passwordInput.addEventListener("input", () => {
    updatePasswordGuidance();
    if (passwordInput.value) validatePassword(true);
    else setError(passwordInput, errors.password, "");
  });
  passwordInput.addEventListener("blur", () => validatePassword(Boolean(passwordInput.value)));
  confirmInput.addEventListener("input", () => {
    if (confirmInput.value) validateConfirm(true);
    else setError(confirmInput, errors.confirm, "");
  });
  confirmInput.addEventListener("blur", () => validateConfirm(Boolean(confirmInput.value)));
  termsInput.addEventListener("change", () => {
    validateTerms(true);
    clearAlert();
  });

  document.querySelectorAll("[data-toggle-password]").forEach((button) => {
    button.addEventListener("click", () => {
      const input = document.getElementById(button.dataset.togglePassword);
      const isHidden = input.type === "password";
      input.type = isHidden ? "text" : "password";
      button.setAttribute("aria-label", isHidden ? "Hide password" : "Show password");
      button.setAttribute("aria-pressed", String(isHidden));
      button.innerHTML = isHidden
        ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3 21 21"/><path d="M10.6 6.1A10.9 10.9 0 0 1 12 6c6.1 0 9.5 6 9.5 6a16 16 0 0 1-3.1 3.7"/><path d="M6.2 6.3C3.8 8 2.5 12 2.5 12s3.4 6 9.5 6c1.3 0 2.4-.3 3.4-.7"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/></svg>'
        : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 12s3.4-6 9.5-6 9.5 6 9.5 6-3.4 6-9.5 6-9.5-6-9.5-6Z"/><circle cx="12" cy="12" r="2.5"/></svg>';
    });
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    clearAlert();

    const valid = [
      validateName(true),
      validateEmail(true),
      validatePassword(true),
      validateConfirm(true),
      validateTerms(true)
    ].every(Boolean);

    if (!valid) {
      const firstInvalid = form.querySelector('[aria-invalid="true"]');
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    showAlert("Thanks for joining HobbyHub! Account creation will be available soon. Your details haven’t been saved.");
  });
});
