document.addEventListener("DOMContentLoaded", () => {
  mountSharedUi({ active: "contact" });

  const form = document.getElementById("contactForm");
  const message = document.getElementById("contactMessage");
  const count = document.getElementById("messageCount");
  const feedback = document.getElementById("contactFeedback");
  const fields = {
    name: document.getElementById("contactName"),
    email: document.getElementById("contactEmail"),
    topic: document.getElementById("contactTopic"),
    message
  };
  const errors = {
    name: document.getElementById("nameError"),
    email: document.getElementById("emailError"),
    topic: document.getElementById("topicError"),
    message: document.getElementById("messageError")
  };

  message.addEventListener("input", () => {
    count.textContent = `${message.value.length} / 1000`;
    if (message.value.length > 1000) message.value = message.value.slice(0, 1000);
    count.textContent = `${message.value.length} / 1000`;
  });

  Object.values(fields).forEach((field) => {
    field.addEventListener("input", () => {
      field.classList.remove("isInvalid");
      const key = Object.keys(fields).find((item) => fields[item] === field);
      if (key) errors[key].textContent = "";
    });
    field.addEventListener("change", () => {
      field.classList.remove("isInvalid");
      const key = Object.keys(fields).find((item) => fields[item] === field);
      if (key) errors[key].textContent = "";
    });
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    feedback.hidden = true;
    let valid = true;
    const values = {
      name: fields.name.value.trim(),
      email: fields.email.value.trim(),
      topic: fields.topic.value,
      message: fields.message.value.trim()
    };
    const setError = (key, text) => {
      errors[key].textContent = text;
      fields[key].classList.toggle("isInvalid", Boolean(text));
      if (text) valid = false;
    };

    setError("name", values.name ? "" : "Please enter your name.");
    setError("email", !values.email ? "Please enter your email address." : (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email) ? "" : "Please enter a valid email address."));
    setError("topic", values.topic ? "" : "Please choose a topic.");
    setError("message", !values.message ? "Please enter your message." : (values.message.length < 10 ? "Please enter at least 10 characters." : ""));

    if (!valid) {
      const firstInvalid = form.querySelector(".isInvalid");
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    feedback.textContent = "Thanks for reaching out! This form is a front-end demo, so your message hasn’t been sent or saved.";
    feedback.hidden = false;
    feedback.classList.add("isVisible");
    form.reset();
    count.textContent = "0 / 1000";
    Object.values(errors).forEach((error) => error.textContent = "");
    Object.values(fields).forEach((field) => field.classList.remove("isInvalid"));
  });
});
