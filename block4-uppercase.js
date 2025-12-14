const block4UppercaseKey = "block4UppercaseEnabled";

function getBlock4Element() {
  return (
    document.querySelector('[data-block="4"]') ||
    document.querySelector(".sidebar.right") ||
    document.querySelector('[role="complementary"]')
  );
}

function initBlock4UppercaseToggle() {
  const checkbox = document.querySelector("[data-uppercase-toggle]");
  const block4 = getBlock4Element();

  if (!checkbox || !block4) return;

  const savedState = localStorage.getItem(block4UppercaseKey) === "true";
  checkbox.checked = savedState;
  applyBlock4Capitalization(block4, savedState);

  checkbox.addEventListener("change", () => {
    const enabled = checkbox.checked;
    localStorage.setItem(block4UppercaseKey, String(enabled));
    applyBlock4Capitalization(block4, enabled);
  });
}

function applyBlock4Capitalization(block4, enabled) {
  block4.style.textTransform = enabled ? "capitalize" : "none";
}
