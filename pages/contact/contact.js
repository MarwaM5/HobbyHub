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
    message,
    businessName:document.getElementById("contactBusinessName"),
    phone:document.getElementById("contactPhone")
  };
  const errors = {
    name: document.getElementById("nameError"),
    email: document.getElementById("emailError"),
    topic: document.getElementById("topicError"),
    message: document.getElementById("messageError"),
    businessName:document.getElementById("businessNameError"),
    phone:document.getElementById("phoneError")
  };

  const businessTopic=()=>['advertising','list-activity'].includes(fields.topic.value);
  function updateBusinessFields(){const show=businessTopic();document.getElementById('contactBusinessFields').hidden=!show;fields.businessName.required=show;fields.phone.required=show;}
  fields.topic.addEventListener('change',updateBusinessFields);updateBusinessFields();
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
      message: fields.message.value.trim(),
      businessName:businessTopic()?fields.businessName.value.trim():"",
      phone:businessTopic()?fields.phone.value.trim():""
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

    setError("businessName",businessTopic()&&!values.businessName?"Please enter your organization’s name.":"");
    setError("phone",businessTopic()&&!/^[+\d][\d\s()-]{6,24}$/.test(values.phone)?"Please enter a contact phone number.":"");
    if (!valid) {
      const firstInvalid = form.querySelector(".isInvalid");
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    AdminService.submitContact(values);
    feedback.textContent = "Thank you for your message.";
    feedback.hidden = false;
    feedback.classList.add("isVisible");
    form.reset();
    updateBusinessFields();
    count.textContent = "0 / 1000";
    Object.values(errors).forEach((error) => error.textContent = "");
    Object.values(fields).forEach((field) => field.classList.remove("isInvalid"));
  });
});
