const WORKS_URL = 'https://raw.githubusercontent.com/wawaxgz/photography-portfolio/main/data/works.json';

let works = [];

async function init() {
  try {
    const response = await fetch(WORKS_URL);
    const data = await response.json();

    const savedFavorites = JSON.parse(localStorage.getItem('favorites')) || {};

    works = data.map(function (item) {
      return Object.assign({}, item, {
        isFavorite: savedFavorites[item.name] || false
      });
    });

    startApp();

  } catch (error) {
    console.error('資料載入失敗', error);
  }
}

function startApp() {
  renderWorks(works);
  buildFilters();
  buildSlider();
}
 
/* ---------- Day 1：按讚功能 ---------- */
const button = document.querySelector('.like-btn');
const countSpan = document.querySelector('#like-count');
let count = 0;
 
button.addEventListener('click', function () {
  count = count + 1;
  countSpan.textContent = count;
});
 
 
/* ---------- Day 3 + Day 5：渲染函式 ---------- */
const gallery = document.querySelector('#gallery');

function renderWorks(list) {
  gallery.innerHTML = '';

  let html = '';

  list.forEach(function (work, index) {
    html = html + `
      <div class="card">
        <img src="${work.image}" alt="${work.name}">
        <button class="heart-btn ${work.isFavorite ? 'active' : ''}" data-index="${index}">♥</button>
        <h3>${work.name}</h3>
        <p>價格：$${work.price}</p>
        <p>分類：${work.category}</p>
        <p>相機：${work.camera}</p>
        <p>底片：${work.film}</p>
      </div>
    `;
  });

  gallery.innerHTML = html;
}

/* ---------- 篩選按鈕 ---------- */
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

      if (category === '全部') {
        renderWorks(works);
      } else {
        const filtered = works.filter(function (work) {
          return work.category === category;
        });
        renderWorks(filtered);
      }
    });

    filtersDiv.appendChild(btn);
  });

  document.querySelector('.filter-btn').classList.add('active');
}

/* ---------- 輪播 ---------- */
function buildSlider() {
  const strip = document.querySelector('#strip');
  strip.innerHTML = '';

  works.forEach(function (work) {
    const img = document.createElement('img');
    img.src = work.image;
    img.alt = work.name;
    strip.appendChild(img);
  });

  let current = 0;

  function updateSlide() {
    strip.style.transform = `translateX(${current * -100}%)`;
  }

  document.querySelector('#next').addEventListener('click', function () {
    if (current === works.length - 1) {
      current = 0;
    } else {
      current = current + 1;
    }
    updateSlide();
  });

  document.querySelector('#prev').addEventListener('click', function () {
    if (current === 0) {
      current = works.length - 1;
    } else {
      current = current - 1;
    }
    updateSlide();
  });
}

/* ---------- 回到頂部按鈕 ---------- */
const topBtn = document.querySelector('#back-btn');

// 1. 監控捲動 (Scroll Event)
window.addEventListener('scroll', () => {
    // 取得捲動高度
    const scrollDistance = window.scrollY;

    /* classList.toggle('類別名稱', 條件)
       - 如果條件為 true，就加上這個 class
       - 如果條件為 false，就移除這個 class
    */
    topBtn.classList.toggle('show', scrollDistance > 250);
});

// 2. 點擊回頂部
topBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth' // 加入平滑捲動效果
    });
});

/* ---------- 按圖片愛心 ---------- */

document.querySelector('#gallery').addEventListener('click', function (event) {
  if (event.target.classList.contains('heart-btn')) {
    const index = Number(event.target.dataset.index);
    works[index].isFavorite = !works[index].isFavorite;
    event.target.classList.toggle('active', works[index].isFavorite);

    const savedFavorites = JSON.parse(localStorage.getItem('favorites')) || {};
    savedFavorites[works[index].name] = works[index].isFavorite;
    localStorage.setItem('favorites', JSON.stringify(savedFavorites));
  }
});

/* ---------- 聯絡表單驗證 ---------- */

const nameInput    = document.querySelector('#name-input');
const phoneInput   = document.querySelector('#phone-input');
const emailInput   = document.querySelector('#email-input');
const messageInput = document.querySelector('#message-input');
const charCount    = document.querySelector('#char-count');
const submitBtn    = document.querySelector('#submit-btn');
const countryCode  = document.querySelector('#country-code');
const intlReminder = document.querySelector('#intl-reminder');

/* --- 選台灣/其他，控制紅字提醒 --- */
countryCode.addEventListener('change', function () {
  intlReminder.style.display = this.value === 'other' ? 'block' : 'none';
});

/* --- 驗證規則 --- */
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

/* --- 顯示／清除錯誤 --- */
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

/* --- blur：游標離開時驗證 --- */
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

/* --- 字數計算 --- */
messageInput.addEventListener('input', function () {
  charCount.textContent = this.value.length + ' / 50';
});

/* --- 提交 --- */
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

/* ---------- 留言板 ---------- */

const commentText     = document.querySelector('#comment-text');
const commentCount    = document.querySelector('#comment-char-count');
const commentSubmit   = document.querySelector('#comment-submit');
const commentList     = document.querySelector('#comment-list');

// 讀留言資料，有就用，沒有就用空陣列
let comments = JSON.parse(localStorage.getItem('comments')) || [];

// nextId 從現有留言的最大 id + 1 開始，避免 id 重複
let nextId = comments.length > 0
  ? Math.max(...comments.map(c => c.id)) + 1
  : 0;

let currentSort = 'newest';  // 預設新到舊
/* --- 字數計算 --- */
commentText.addEventListener('input', function () {
  commentCount.textContent = this.value.length + ' / 30';
});

/* --- 渲染留言列表 --- */
function renderComments() {
  commentList.innerHTML = '';

  // 根據排序決定顯示順序
  const sorted = currentSort === 'newest'
    ? [...comments].reverse()   // 新到舊：反轉陣列
    : [...comments];            // 舊到新：原本的順序

  sorted.forEach(function (comment) {
    const card = document.createElement('div');
    card.className = 'comment-card';
    card.dataset.id = comment.id;

    card.innerHTML = `
      <button class="comment-delete">✕</button>
      <span class="comment-content">${comment.text}</span>
      <span class="comment-time">${comment.time}</span>
    `;

    commentList.appendChild(card);
  });
}

/* --- 送出留言 --- */
commentSubmit.addEventListener('click', function () {
  const text = commentText.value.trim();
  if (text === '') return;  // 空白不送出

  // 建立一筆新資料，存進陣列
  const now = new Date();
  const timeStr = now.getFullYear() + '/'
    + String(now.getMonth() + 1).padStart(2, '0') + '/'
    + String(now.getDate()).padStart(2, '0') + ' '
    + String(now.getHours()).padStart(2, '0') + ':'
    + String(now.getMinutes()).padStart(2, '0');

  comments.push({
    id: nextId++,
    text: text,
    time: timeStr
  });

  // 清空輸入框
  commentText.value = '';
  commentCount.textContent = '0 / 30';

  // 重新渲染
  renderComments();
  localStorage.setItem('comments', JSON.stringify(comments)); 
});

/* --- 刪除留言（事件委派） --- */
commentList.addEventListener('click', function (event) {
  if (event.target.classList.contains('comment-delete')) {
    const card = event.target.closest('.comment-card');
    const id = Number(card.dataset.id);

    // 從陣列裡移除這筆
    comments = comments.filter(function (c) {
      return c.id !== id;
    });

    // 重新渲染
    renderComments();
    localStorage.setItem('comments', JSON.stringify(comments));
  }
});

/* --- 排序按鈕 --- */
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

init();
