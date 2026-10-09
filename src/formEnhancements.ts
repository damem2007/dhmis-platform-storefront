const LOADING_MS = 900;

function markLoading(button: HTMLButtonElement) {
  if (button.disabled || button.dataset.loading === "true") return;
  button.dataset.loading = "true";
  button.setAttribute("aria-busy", "true");
  window.setTimeout(() => {
    button.dataset.loading = "false";
    button.removeAttribute("aria-busy");
  }, LOADING_MS);
}

export function installFormEnhancements(root: ParentNode = document) {
  const enhance = () => {
    root.querySelectorAll<HTMLButtonElement>("button").forEach((button) => {
      if (button.dataset.loadingBound === "true") return;
      if (button.hasAttribute("aria-haspopup")) return;
      button.dataset.loadingBound = "true";
      button.addEventListener("click", () => markLoading(button), { capture: true });
    });
    root.querySelectorAll<HTMLFormElement>("form").forEach((form) => {
      if (form.dataset.loadingBound === "true") return;
      form.dataset.loadingBound = "true";
      form.addEventListener("submit", (event) => {
        const submitter = (event as SubmitEvent).submitter;
        if (submitter instanceof HTMLButtonElement) markLoading(submitter);
      }, { capture: true });
    });
  };
  enhance();
  const observer = new MutationObserver(enhance);
  observer.observe(root, { childList: true, subtree: true });
  return () => observer.disconnect();
}
