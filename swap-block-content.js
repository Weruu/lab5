function swapBlockContent() {
  const block1 = document.querySelector('[data-block="1"]');
  const block6 = document.querySelector('[data-block="6"]');

  if (!block1 || !block6) {
    return;
  }

  const temp = block1.textContent;
  block1.textContent = block6.textContent;
  block6.textContent = temp;
}
