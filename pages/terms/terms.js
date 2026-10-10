document.addEventListener("DOMContentLoaded", () => {
  mountSharedUi({ active: "terms" });
  document.querySelectorAll('.termsContents a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const target = document.querySelector(link.getAttribute("href"));
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      history.replaceState(null, "", link.getAttribute("href"));
    });
  });
});
