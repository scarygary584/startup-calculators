/* Validation shared by generated and older inline calculator forms. */
(() => {
  const forms = [...document.querySelectorAll('form')].filter(form => form.querySelector('input[type="number"]'));
  for (const form of forms) {
    const notice = document.createElement('p');
    notice.className = 'calculator-input-notice';
    notice.setAttribute('role', 'status');
    notice.hidden = true;
    form.before(notice);
    form.addEventListener('submit', event => event.preventDefault());
    const inputs = [...form.querySelectorAll('input[type="number"]')];
    for (const input of inputs) {
      input.min = '0';
      input.step = 'any';
      input.required = true;
      const label = document.querySelector(`label[for="${input.id}"]`)?.textContent || '';
      if (/percent|%/i.test(label) && !/markup|retry|roi|return/i.test(label)) input.max = input.id === 'setupMargin' ? '99.99' : '100';
    }
    form.addEventListener('input', event => {
      const invalid = inputs.filter(input => !input.checkValidity());
      for (const input of inputs) input.setAttribute('aria-invalid', String(!input.checkValidity()));
      notice.hidden = invalid.length === 0;
      if (invalid.length) {
        const label = document.querySelector(`label[for="${invalid[0].id}"]`)?.textContent || 'Input';
        notice.textContent = `${label}: enter a nonnegative number${invalid[0].max ? ' no higher than ' + invalid[0].max : ''}. Results are unavailable until corrected.`;
        const scope = form.closest('.calculator-grid, .calculator-shell, .owner-grid') || form.closest('section');
        scope?.querySelectorAll('.results-card strong, .owner-results strong, .calculator-shell-display strong, .mini-readout strong').forEach(node => node.textContent = 'N/A');
        event.stopImmediatePropagation();
      }
    }, true);
  }
  if (forms.length && document.querySelector('body[data-calculator]')) {
    const note = document.createElement('section');
    note.className = 'section';
    note.innerHTML = '<div class="disclaimer"><strong>About these estimates:</strong> Results subtract only the costs listed. Unless a source is cited, defaults are illustrative scenarios, not measured local averages or a prediction of demand. Include your actual overhead and paid labor; owner earnings can include payment for your own work. Taxes and financing are excluded unless entered. N/A means a ratio or payback cannot be calculated at those inputs. Annualized results assume the same activity continues.</div>';
    document.querySelector('main')?.append(note);
  }
})();
