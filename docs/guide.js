// Progressive documentation helpers. The reference and examples are static HTML.
const status = document.querySelector('#copy-status');
for (const button of document.querySelectorAll('[data-copy]')) {
  button.hidden = false;
  button.addEventListener('click', async () => {
    const code = document.getElementById(button.dataset.copy);
    try {
      await navigator.clipboard.writeText(code.textContent);
      button.textContent = 'Copiat';
      status.textContent = 'Cod copiat.';
    } catch {
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(code);
      selection.removeAllRanges();
      selection.addRange(range);
      button.textContent = 'Cod selectat';
      status.textContent = 'Selectați și copiați codul cu Ctrl+C sau ⌘C.';
    }
  });
}
const toggle = document.querySelector('[data-demo-toggle]');
if (toggle) {
  toggle.disabled = false;
  toggle.addEventListener('click', () => toggle.setAttribute('aria-pressed', String(toggle.getAttribute('aria-pressed') !== 'true')));
}
const dismiss = document.querySelector('[data-demo-dismiss]');
const restore = document.querySelector('[data-demo-restore]');
if (dismiss && restore) {
  dismiss.hidden = false;
  restore.hidden = false;
  dismiss.addEventListener('click', () => {
    document.querySelector('#notice-example').hidden = true;
    restore.focus();
  });
  restore.addEventListener('click', () => {
    document.querySelector('#notice-example').hidden = false;
    dismiss.focus();
  });
}
