// ── Laguna Dubai Rating — shared app logic ──

firebase.initializeApp(FIREBASE_CONFIG);
const db = firebase.firestore();

const REVIEWS_COL = db.collection('reviews');
const RATE_LIMIT_MS = 60 * 1000;
const RATE_LIMIT_KEY = 'laguna_rating_last_submit';

// ── helpers ──

function fmtDate(value) {
  const date = value && value.toDate ? value.toDate() : new Date(value);
  return new Intl.DateTimeFormat('ar-EG', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

const STAR_PATH =
  'M9.05 2.93c.3-.92 1.6-.92 1.9 0l1.29 3.96a1 1 0 0 0 .95.69h4.18c.97 0 1.37 1.24.59 1.81l-3.39 2.46a1 1 0 0 0-.36 1.12l1.29 3.96c.3.92-.75 1.69-1.54 1.12l-3.38-2.46a1 1 0 0 0-1.18 0l-3.38 2.46c-.79.57-1.84-.2-1.54-1.12l1.29-3.96a1 1 0 0 0-.36-1.12L2.04 9.39c-.78-.57-.38-1.81.59-1.81h4.18a1 1 0 0 0 .95-.69l1.29-3.96Z';

function makeStar(filled, sizeClass) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 20 20');
  svg.setAttribute('aria-hidden', 'true');
  svg.classList.add('star', sizeClass);
  if (filled) svg.classList.add('filled');
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', STAR_PATH);
  svg.appendChild(path);
  return svg;
}

function starsRow(rating, sizeClass) {
  const rounded = rating === null || rating === undefined ? 0 : Math.round(rating);
  const label = rating === null || rating === undefined ? 'غير متاح' : String(rating);
  const box = document.createElement('div');
  box.className = 'flex-stars';
  box.setAttribute('role', 'img');
  box.setAttribute('aria-label', 'تقييم ' + label + ' من 5');
  for (let i = 1; i <= 5; i++) {
    box.appendChild(makeStar(i <= rounded, sizeClass));
  }
  return box;
}

function showError(message) {
  const box = document.getElementById('formError');
  if (!box) return;
  box.textContent = message;
  box.classList.remove('hidden');
}

function hideError() {
  const box = document.getElementById('formError');
  if (box) box.classList.add('hidden');
}

// ── star picker (reviews page) ──

function initPicker() {
  const picker = document.getElementById('ratingPicker');
  if (!picker) return;
  const hidden = document.getElementById('ratingValue');
  const hint = document.getElementById('ratingHint');
  const buttons = Array.from(picker.querySelectorAll('.star-btn'));
  let value = 5;

  function paint(preview) {
    const active = preview || value;
    buttons.forEach((btn) => {
      const n = Number(btn.dataset.rating);
      const star = btn.querySelector('.star');
      star.classList.toggle('filled', n <= active);
      btn.setAttribute('aria-checked', n === value ? 'true' : 'false');
    });
  }

  buttons.forEach((btn) => {
    const n = Number(btn.dataset.rating);
    btn.addEventListener('mouseenter', () => paint(n));
    btn.addEventListener('mouseleave', () => paint(0));
    btn.addEventListener('click', () => {
      value = n;
      hidden.value = String(n);
      hint.textContent = 'قيمتك: ' + n + ' من 5';
      paint(0);
    });
  });

  paint(0);
}

// ── reviews list (reviews page) ──

const AVATAR_COLORS = ['#0e7c86', '#e2693e', '#0a4b52', '#b45309', '#0f766e', '#9a3412'];

function buildAvatar(name) {
  const div = document.createElement('div');
  div.className = 'avatar';
  const clean = (name || 'زائر').trim();
  div.textContent = clean.charAt(0);
  let hash = 0;
  for (let i = 0; i < clean.length; i++) hash = (hash * 31 + clean.charCodeAt(i)) % 997;
  div.style.background = AVATAR_COLORS[hash % AVATAR_COLORS.length];
  return div;
}

function buildReviewCard(doc) {
  const data = doc.data();
  const li = document.createElement('li');
  li.className = 'review-card';

  const head = document.createElement('div');
  head.className = 'review-head';

  head.appendChild(buildAvatar(data.reviewerName));

  const who = document.createElement('div');
  who.className = 'review-who';

  const name = document.createElement('p');
  name.className = 'review-name';
  name.textContent = data.reviewerName || 'زائر';

  const time = document.createElement('time');
  time.className = 'review-date';
  time.dateTime = data.createdAt ? data.createdAt.toDate().toISOString() : '';
  time.textContent = fmtDate(data.createdAt || new Date());

  who.appendChild(name);
  who.appendChild(time);
  head.appendChild(who);
  li.appendChild(head);

  li.appendChild(starsRow(data.rating, 'star-sm'));

  if (data.comment) {
    const comment = document.createElement('p');
    comment.className = 'review-comment';
    comment.textContent = data.comment;
    li.appendChild(comment);
  }

  return li;
}

function watchReviews() {
  const list = document.getElementById('reviewsList');
  const countEl = document.getElementById('reviewsCount');
  const emptyEl = document.getElementById('reviewsEmpty');
  const loadingEl = document.getElementById('reviewsLoading');
  if (!list) return;

  REVIEWS_COL.orderBy('createdAt', 'desc').onSnapshot(
    (snap) => {
      loadingEl.classList.add('hidden');
      list.querySelectorAll('.review-card').forEach((el) => el.remove());
      if (snap.empty) {
        emptyEl.classList.remove('hidden');
        countEl.textContent = '0';
        return;
      }
      emptyEl.classList.add('hidden');
      countEl.textContent = String(snap.size);
      snap.docs.forEach((doc, i) => {
        const card = buildReviewCard(doc);
        card.classList.add('anim-rise', 'stagger-' + ((i % 4) + 1));
        list.appendChild(card);
      });
    },
    (error) => {
      console.error('reviews load failed', error);
      loadingEl.textContent = 'حصلت مشكلة في تحميل التقييمات.';
    }
  );
}

// ── submit review ──

function rateLimited() {
  const last = Number(localStorage.getItem(RATE_LIMIT_KEY) || 0);
  return Date.now() - last < RATE_LIMIT_MS;
}

function validate(name, rating, comment) {
  if (!name) return 'الاسم مطلوب.';
  if (name.length < 2) return 'الاسم لازم يكون حرفين على الأقل.';
  if (name.length > 50) return 'الاسم طويل أوي.';
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return 'التقييم لازم يكون رقمًا صحيحًا من 1 لـ 5.';
  }
  if (comment.length < 5) return 'التعليق لازم يكون 5 حروف على الأقل.';
  if (comment.length > 500) return 'التعليق طويل جدًا.';
  return null;
}

function initForm() {
  const form = document.getElementById('reviewForm');
  if (!form) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    hideError();

    const company = document.getElementById('company');
    if (company && company.value.trim().length > 0) {
      showError('بيانات مش صالحة.');
      return;
    }

    if (rateLimited()) {
      showError('كتير أوي، استنى شوية قبل ما تضيف تقييم جديد.');
      return;
    }

    const name = document.getElementById('reviewerName').value.trim();
    const rating = Number(document.getElementById('ratingValue').value);
    const comment = document.getElementById('comment').value.trim();

    const error = validate(name, rating, comment);
    if (error) {
      showError(error);
      return;
    }

    const btn = document.getElementById('submitBtn');
    btn.disabled = true;
    btn.textContent = 'بيتبعت...';

    try {
      await REVIEWS_COL.add({
        cafeId: 'main',
        reviewerName: name,
        rating: rating,
        comment: comment,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
      localStorage.setItem(RATE_LIMIT_KEY, String(Date.now()));
      form.classList.add('hidden');
      document.getElementById('formSuccess').classList.remove('hidden');
    } catch (err) {
      console.error('submit failed', err);
      showError('حصلت مشكلة، جرّب تاني.');
      btn.disabled = false;
      btn.textContent = 'أضف التقييم';
    }
  });
}

// ── home page stats ──

function watchHomeStats() {
  const nameEl = document.getElementById('cafeName');
  const descEl = document.getElementById('cafeDesc');
  const addressEl = document.getElementById('cafeAddress');
  const avgEl = document.getElementById('avgRating');
  const countEl = document.getElementById('ratingCount');
  const starsEl = document.getElementById('avgStars');
  const coverEl = document.getElementById('coverImg');
  if (!nameEl) return;

  db.collection('cafes')
    .doc('main')
    .get()
    .then((snap) => {
      if (!snap.exists) return;
      const data = snap.data();
      if (data.name) nameEl.textContent = data.name;
      if (data.description) descEl.textContent = data.description;
      if (data.address) addressEl.textContent = data.address;
      if (data.coverImage) coverEl.src = data.coverImage;
    })
    .catch((err) => console.error('cafe load failed', err));

  REVIEWS_COL.onSnapshot(
    (snap) => {
      if (snap.empty) return;
      const total = snap.docs.reduce((sum, doc) => sum + (doc.data().rating || 0), 0);
      const avg = total / snap.size;
      avgEl.textContent = avg.toFixed(1);
      countEl.textContent = 'من ' + snap.size + ' تقييم';
      starsEl.innerHTML = '';
      starsEl.appendChild(starsRow(avg, 'star-lg'));
    },
    (error) => console.error('stats load failed', error)
  );
}

// ── boot ──

document.addEventListener('DOMContentLoaded', () => {
  initPicker();
  watchReviews();
  initForm();
  watchHomeStats();
});
