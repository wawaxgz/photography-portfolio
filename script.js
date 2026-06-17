const works = [
  {
    name: '濟州島街道',
    price: 20,
    category: '韓國',
    camera: 'C34EFJ',
    film: 'Fujifilm C200',
    image: 'https://raw.githubusercontent.com/wawaxgz/photography-portfolio/main/assets/img/street2.jpeg'
  },
  {
    name: '城山日出峰',
    price: 50,
    category: '韓國',
    camera: 'C35EFJ',
    film: 'Fujifilm C200',
    image: 'https://raw.githubusercontent.com/wawaxgz/photography-portfolio/main/assets/img/songsanpeak.jpeg'
  },
  {
    name: '濟州島街頭',
    price: 20,
    category: '韓國',
    camera: 'C35EFJ',
    film: 'Fujifilm C200',
    image: 'https://raw.githubusercontent.com/wawaxgz/photography-portfolio/main/assets/img/street1.jpeg'
  }
];
 
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

  list.forEach(function (work) {
    html = html + `
      <div class="card">
        <img src="${work.image}" alt="${work.name}">
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

renderWorks(works);


/* ---------- Day 5：篩選按鈕 ---------- */
const categories = ['全部', ...new Set(works.map(function (work) {
  return work.category;
}))];

const filtersDiv = document.querySelector('#filters');

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

/* ---------- Day 4：輪播 ---------- */
const strip = document.querySelector('#strip');

// 用 works 陣列把圖片塞進帶子
works.forEach(function (work) {
  const img = document.createElement('img');
  img.src = work.image;
  img.alt = work.name;
  strip.appendChild(img);
});

// 座標變數
let current = 0;

// 更新位移的函式
function updateSlide() {
  strip.style.transform = `translateX(${current * -100}%)`;
}

// 下一張
document.querySelector('#next').addEventListener('click', function () {
  if (current === works.length - 1) {
    current = 0;
  } else {
    current = current + 1;
  }
  updateSlide();
});

// 上一張
document.querySelector('#prev').addEventListener('click', function () {
  if (current === 0) {
    current = works.length - 1;
  } else {
    current = current - 1;
  }
  updateSlide();
});

// 第六天

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