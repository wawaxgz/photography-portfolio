/* ========== 設定與狀態變數 ========== */
const WORKS_URL = 'https://raw.githubusercontent.com/wawaxgz/photography-portfolio/main/data/works.json';
const LOAD_STEP = window.innerWidth <= 768 ? 3 : 6;

let works = [];
let currentList = [];
let visibleCount = LOAD_STEP;
let currentCategory = '全部';
let currentPriceSort = 'default';

const gallery = document.querySelector('#gallery');
const loadTrigger = document.querySelector('#load-trigger');

/* ========== 初始化 ========== */
async function init() {
  const loadingEl = document.querySelector('#gallery-loading');
  const errorEl   = document.querySelector('#gallery-error');

  loadingEl.style.display = 'block';
  errorEl.style.display = 'none';
  gallery.style.display = 'none';

  try {
    const response = await fetch(WORKS_URL);
    if (!response.ok) throw new Error('Network response was not ok');

    const data = await response.json();
    const savedFavorites = JSON.parse(localStorage.getItem('favorites')) || {};

    works = data.map(function (item) {
      return Object.assign({}, item, {
        isFavorite: savedFavorites[item.name] || false
      });
    });

    loadingEl.style.display = 'none';
    gallery.style.display = 'flex';
    startApp();

  } catch (error) {
    loadingEl.style.display = 'none';
    errorEl.style.display = 'block';
    console.error('資料載入失敗', error);
  }
}

function startApp() {
  renderWorks(works);
  buildFilters();
  buildSlider();
  updateFavCount();
}

/* ========== 渲染卡片 ========== */
function renderWorks(list) {
  currentList = list;
  const visible = list.slice(0, visibleCount);

  let html = '';
  visible.forEach(function (work) {
    html = html + `
      <div class="card">
        <img src="${work.image}" alt="${work.name}" loading="lazy">
        <button class="heart-btn ${work.isFavorite ? 'active' : ''}" data-name="${work.name}">♥</button>
        <h3>${work.name}</h3>
        <p>價格：$${work.price}</p>
        <p>分類：${work.category}</p>
        <p>相機：${work.camera}</p>
        <p>底片：${work.film}</p>
      </div>
    `;
  });

  gallery.innerHTML = html;
  loadTrigger.style.display = visibleCount >= list.length ? 'none' : 'block';
}

/* ========== 篩選 + 排序 ========== */
function applyFiltersAndSort() {
  let result = currentCategory === '全部'
    ? [...works]
    : works.filter(function (work) {
        return work.category === currentCategory;
      });

  if (currentPriceSort === 'asc') {
    result.sort(function (a, b) { return a.price - b.price; });
  } else if (currentPriceSort === 'desc') {
    result.sort(function (a, b) { return b.price - a.price; });
  }

  visibleCount = LOAD_STEP;
  renderWorks(result);
}

function buildFilters() {
  const categories = ['全部', ...new Set(works.map(function (work) {
    return work.category;
  }))];

  const filtersDiv = document.querySelector('#filters');
  filtersDiv.innerHTML = '';

  categories.forEach(function (category) {
    const btn = document.createElement('button');
    btn.textContent = category;
    btn.className = 'filter-btn';

    btn.addEventListener('click', function () {
      document.querySelectorAll('.filter-btn').forEach(function (b) {
        b.classList.remove('active');
      });
      btn.classList.add('active');
      currentCategory = category;
      applyFiltersAndSort();
    });

    filtersDiv.appendChild(btn);
  });

  document.querySelector('.filter-btn').classList.add('active');

  document.querySelector('#price-sort').addEventListener('change', function () {
    currentPriceSort = this.value;
    applyFiltersAndSort();
  });
}

/* ========== 無限捲動 ========== */
const observer = new IntersectionObserver(function (entries) {
  entries.forEach(function (entry) {
    if (entry.isIntersecting && visibleCount < currentList.length) {
      visibleCount = visibleCount + LOAD_STEP;
      renderWorks(currentList);
    }
  });
});

observer.observe(loadTrigger);

/* ========== 輪播 ========== */
function buildSlider() {
  const strip = document.querySelector('#strip');
  strip.innerHTML = '';

  works.forEach(function (work, index) {
    const img = document.createElement('img');
    img.src = work.image;
    img.alt = work.name;
    if (index > 0) img.loading = 'lazy';
    strip.appendChild(img);
  });

  let current = 0;

  function updateSlide() {
    strip.style.transform = `translateX(${current * -100}%)`;
  }

  document.querySelector('#next').addEventListener('click', function () {
    current = current === works.length - 1 ? 0 : current + 1;
    updateSlide();
  });

  document.querySelector('#prev').addEventListener('click', function () {
    current = current === 0 ? works.length - 1 : current - 1;
    updateSlide();
  });
}

/* ========== 收藏 ========== */
function updateFavCount() {
  const count = works.filter(function (work) {
    return work.isFavorite;
  }).length;
  document.querySelector('#fav-count').textContent = count;
}

gallery.addEventListener('click', function (event) {
  if (event.target.classList.contains('heart-btn')) {
    const name = event.target.dataset.name;
    const work = works.find(function (w) { return w.name === name; });

    work.isFavorite = !work.isFavorite;
    event.target.classList.toggle('active', work.isFavorite);

    const savedFavorites = JSON.parse(localStorage.getItem('favorites')) || {};
    savedFavorites[name] = work.isFavorite;
    localStorage.setItem('favorites', JSON.stringify(savedFavorites));

    updateFavCount();
    return;
  }

  const card = event.target.closest('.card');
  if (!card) return;

  const name = card.querySelector('.heart-btn').dataset.name;
  const work = works.find(function (w) { return w.name === name; });

  document.querySelector('#modal-image').src = work.image;
  document.querySelector('#modal-image').alt = work.name;
  document.querySelector('#modal-name').textContent = work.name;
  document.querySelector('#modal-description').textContent = work.description || '';
  document.querySelector('#modal-price').textContent = work.price;
  document.querySelector('#modal-category').textContent = work.category;
  document.querySelector('#modal-camera').textContent = work.camera;
  document.querySelector('#modal-film').textContent = work.film;

  document.querySelector('#work-modal').classList.add('show');
});

/* ========== Modal 關閉 ========== */
const modal = document.querySelector('#work-modal');

document.querySelector('#modal-close').addEventListener('click', function () {
  modal.classList.remove('show');
});

modal.addEventListener('click', function (event) {
  if (event.target === modal) modal.classList.remove('show');
});

/* ========== 回到頂部 ========== */
const topBtn = document.querySelector('#back-btn');

window.addEventListener('scroll', function () {
  topBtn.classList.toggle('show', window.scrollY > 250);
});

topBtn.addEventListener('click', function () {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* ========== 聯絡表單 ========== */
const nameInput    = document.querySelector('#name-input');
const phoneInput   = document.querySelector('#phone-input');
const emailInput   = document.querySelector('#email-input');
const messageInput = document.querySelector('#message-input');
const charCount    = document.querySelector('#char-count');
const submitBtn    = document.querySelector('#submit-btn');
const countryCode  = document.querySelector('#country-code');
const intlReminder = document.querySelector('#intl-reminder');

countryCode.addEventListener('change', function () {
  intlReminder.style.display = this.value === 'other' ? 'block' : 'none';
});

function validateName(value) {
  if (value.trim() === '') return '姓名不能空白';
  if (!/^[\u4e00-\u9fa5a-zA-Z\s]+$/.test(value)) return '姓名不能包含數字或特殊符號';
  return '';
}

function validatePhone(value) {
  if (value.trim() === '') return '電話不能空白';
  if (!/^\d+$/.test(value)) return '電話只能輸入數字';
  if (value.length < 6 || value.length > 15) return '電話長度應介於 6 至 15 碼';
  return '';
}

function validateEmail(value) {
  if (value.trim() === '') return 'Email 不能空白';
  if (!value.includes('@')) return 'Email 格式不正確，請確認是否包含 @';
  return '';
}

function showError(input, message) {
  input.classList.add('input-error');
  const next = input.nextElementSibling;
  if (next && next.classList.contains('error-msg')) return;
  const err = document.createElement('p');
  err.className = 'error-msg';
  err.textContent = message;
  input.insertAdjacentElement('afterend', err);
}

function clearError(input) {
  input.classList.remove('input-error');
  const next = input.nextElementSibling;
  if (next && next.classList.contains('error-msg')) next.remove();
}

nameInput.addEventListener('blur', function () {
  const msg = validateName(this.value);
  msg ? showError(this, msg) : clearError(this);
});

phoneInput.addEventListener('blur', function () {
  const msg = validatePhone(this.value);
  const phoneRow = this.closest('.phone-row');
  if (msg) {
    phoneRow.classList.add('input-error');
    const next = phoneRow.nextElementSibling;
    if (!next || !next.classList.contains('error-msg')) {
      const err = document.createElement('p');
      err.className = 'error-msg';
      err.textContent = msg;
      phoneRow.insertAdjacentElement('afterend', err);
    }
  } else {
    phoneRow.classList.remove('input-error');
    const next = phoneRow.nextElementSibling;
    if (next && next.classList.contains('error-msg')) next.remove();
  }
});

emailInput.addEventListener('blur', function () {
  const msg = validateEmail(this.value);
  msg ? showError(this, msg) : clearError(this);
});

messageInput.addEventListener('input', function () {
  charCount.textContent = this.value.length + ' / 50';
});

submitBtn.addEventListener('click', function () {
  const nameMsg  = validateName(nameInput.value);
  const phoneMsg = validatePhone(phoneInput.value);
  const emailMsg = validateEmail(emailInput.value);

  nameMsg  ? showError(nameInput, nameMsg)   : clearError(nameInput);
  phoneMsg ? showError(phoneInput, phoneMsg) : clearError(phoneInput);
  emailMsg ? showError(emailInput, emailMsg) : clearError(emailInput);

  if (!nameMsg && !phoneMsg && !emailMsg) {
    alert('感謝您的訊息，我會盡快與您聯絡！');
  }
});

/* ========== 留言板 ========== */
const commentText   = document.querySelector('#comment-text');
const commentCount  = document.querySelector('#comment-char-count');
const commentSubmit = document.querySelector('#comment-submit');
const commentList   = document.querySelector('#comment-list');

let comments = JSON.parse(localStorage.getItem('comments')) || [];
let nextId = comments.length > 0 ? Math.max(...comments.map(c => c.id)) + 1 : 0;
let currentSort = 'newest';

commentText.addEventListener('input', function () {
  commentCount.textContent = this.value.length + ' / 30';
});

function renderComments() {
  commentList.innerHTML = '';

  const sorted = currentSort === 'newest'
    ? [...comments].reverse()
    : [...comments];

  sorted.forEach(function (comment) {
    const card = document.createElement('div');
    card.className = 'comment-card';
    card.dataset.id = comment.id;

    card.innerHTML = `
      <button class="comment-delete">✕</button>
      <span class="comment-content"></span>
      <span class="comment-time">${comment.time}</span>
    `;

    card.querySelector('.comment-content').textContent = comment.text;
    commentList.appendChild(card);
  });
}

commentSubmit.addEventListener('click', function () {
  const text = commentText.value.trim();
  if (text === '') return;

  const now = new Date();
  const timeStr = now.getFullYear() + '/'
    + String(now.getMonth() + 1).padStart(2, '0') + '/'
    + String(now.getDate()).padStart(2, '0') + ' '
    + String(now.getHours()).padStart(2, '0') + ':'
    + String(now.getMinutes()).padStart(2, '0');

  comments.push({ id: nextId++, text: text, time: timeStr });

  commentText.value = '';
  commentCount.textContent = '0 / 30';

  renderComments();
  localStorage.setItem('comments', JSON.stringify(comments));
});

commentList.addEventListener('click', function (event) {
  if (event.target.classList.contains('comment-delete')) {
    const card = event.target.closest('.comment-card');
    const id = Number(card.dataset.id);

    comments = comments.filter(function (c) { return c.id !== id; });

    renderComments();
    localStorage.setItem('comments', JSON.stringify(comments));
  }
});

document.querySelectorAll('.sort-btn').forEach(function (btn) {
  btn.addEventListener('click', function () {
    document.querySelectorAll('.sort-btn').forEach(function (b) {
      b.classList.remove('active');
    });
    this.classList.add('active');
    currentSort = this.dataset.sort;
    renderComments();
  });
});

renderComments();

/* ========== 啟動 ========== */
init();
