// ============================================================
// ELEMENTS
// ============================================================

const els = {
  btn: document.getElementById('feedbackBtn'),
  modal: document.getElementById('feedbackModal'),
  closeBtn: document.getElementById('closeFeedbackBtn'),
  form: document.getElementById('feedbackForm'),
  success: document.getElementById('feedbackSuccess'),
  submit: document.getElementById('btnFeedbackSubmit'),
  categoryGrid: document.getElementById('categoryGrid'),
  text: document.getElementById('feedbackText'),
  contact: document.getElementById('feedbackContact'),
  rating: document.getElementById('feedbackRating'),
};

const editInputs = document.querySelectorAll('.edit-input');
const charHint = els.text?.parentElement?.querySelector('.char-hint');

// ============================================================
// STATE
// ============================================================

const answers = { category: null, rating: null };
let turnstileRendered = false;

// ============================================================
// HELPERS
// ============================================================

function checkFormInputs() {
  let allFilled = true;

  const textVal = els.text?.value.trim() || '';
  if (!textVal || textVal.length < 100) allFilled = false;

  if (charHint) charHint.textContent = textVal.length + '/100';

  if (answers.category === null) allFilled = false;
  if (answers.rating === null) allFilled = false;

  const captcha =
    window.turnstile && turnstileRendered && turnstile.getResponse();
  if (!captcha) allFilled = false;

  if (els.submit) els.submit.disabled = !allFilled;
}

function resetForm() {
  answers.category = null;
  answers.rating = null;

  document
    .querySelectorAll('.feedback-category')
    .forEach((c) => c.classList.remove('selected'));
  document.querySelectorAll('.star').forEach((s) => {
    s.classList.remove('filled');
    s.querySelector('svg path').setAttribute('fill', 'none');
  });

  if (els.text) els.text.value = '';
  if (els.contact) els.contact.value = '';
  if (charHint) charHint.textContent = '0/100';

  if (window.turnstile && turnstileRendered) turnstile.reset();

  if (els.form) els.form.style.display = '';
  if (els.success) els.success.classList.remove('show');
  if (els.submit) {
    els.submit.disabled = true;
    els.submit.textContent = 'Send Feedback';
  }

  checkFormInputs();
}

function openFeedback() {
  resetForm();
  els.modal?.classList.add('show');
  lucide.createIcons();

  if (!turnstileRendered && window.turnstile) {
    turnstile.render('#turnstile-feedback', {
      sitekey: '0x4AAAAAADugg40RVC10rsmD',
      callback: () => checkFormInputs(),
    });
    turnstileRendered = true;
  }
}

function closeFeedback() {
  els.modal?.classList.remove('show');
}

// ============================================================
// MODAL OPEN / CLOSE
// ============================================================

if (els.btn && els.modal) {
  els.btn.addEventListener('click', openFeedback);
}

if (els.closeBtn && els.modal) {
  els.closeBtn.addEventListener('click', closeFeedback);
}

els.modal?.addEventListener('click', (e) => {
  if (e.target === els.modal) closeFeedback();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && els.modal?.classList.contains('show')) {
    closeFeedback();
  }
});

// ============================================================
// CATEGORY SELECTION
// ============================================================

els.categoryGrid?.addEventListener('click', (e) => {
  const card = e.target.closest('.feedback-category');
  if (!card) return;

  document
    .querySelectorAll('.feedback-category')
    .forEach((c) => c.classList.remove('selected'));
  card.classList.add('selected');

  answers.category = card.dataset.category;
  checkFormInputs();
});

// ============================================================
// STAR RATING
// ============================================================

els.rating?.addEventListener('click', (e) => {
  const star = e.target.closest('.star');
  if (!star) return;

  const stars = els.rating.querySelectorAll('.star');
  const value = Number(star.dataset.value);

  stars.forEach((s) => {
    const shouldFill = Number(s.dataset.value) <= value;
    s.classList.toggle('filled', shouldFill);
    s.querySelector('svg path').setAttribute(
      'fill',
      shouldFill ? 'currentColor' : 'none',
    );
  });

  answers.rating = value;
  checkFormInputs();
});

// ============================================================
// INPUT LISTENERS
// ============================================================

editInputs.forEach((field) => {
  field.addEventListener('input', checkFormInputs);
});

// ============================================================
// SUBMIT
// ============================================================

els.submit?.addEventListener('click', async () => {
  els.submit.disabled = true;
  els.submit.textContent = 'Submitting...';

  try {
    const res = await fetch('/api/feedback-submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        category: answers.category,
        rating: answers.rating,
        feedback: els.text?.value.trim(),
        contact: els.contact?.value.trim(),
        cfToken: turnstile.getResponse(),
      }),
    });

    const data = await res.json();

    if (!data.ok) throw new Error(data.error || 'Submission failed');

    if (els.form) els.form.style.display = 'none';
    if (els.success) els.success.classList.add('show');
    lucide.createIcons();
  } catch (err) {
    alert('Something went wrong. Please try again.');
    if (els.submit) {
      els.submit.disabled = false;
      els.submit.textContent = 'Send Feedback';
    }
  }
});
