document.addEventListener("DOMContentLoaded", () => {
  mountSharedUi({ active: "privacy" });

  // Keep the table-of-contents links on this page, without relying on a router.
  document.querySelectorAll('.privacyContents a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const target = document.querySelector(link.getAttribute("href"));
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      history.replaceState(null, "", link.getAttribute("href"));
    });
  });
});
