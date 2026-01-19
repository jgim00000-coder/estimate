function get(id) {
  return document.getElementById(id);
}

// ===== COMMON FUNCTIONS =====
function hideAll() {
  ['view-home', 'view-login', 'view-signup', 'view-cart', 'view-cs', 'view-admin', 'view-find', 'view-quotation', 'view-order'].forEach(id => {
    const el = get(id);
    if (el) el.style.display = 'none';
  });
}

function toast(msg) {
  const t = get('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => t.classList.remove('show'), 1400);
}

function goHome() {
  hideAll();
  get('view-home').style.display = 'block';
  // 모든 카테고리 링크에서 active 클래스 제거
  document.querySelectorAll('.cat-link').forEach(link => {
    link.classList.remove('active');
  });
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}

function goLogin() {
  hideAll();
  get('view-login').style.display = 'block';
  get('login-id').value = '';
  get('login-pw').value = '';
}

function goSignup() {
  hideAll();
  get('view-signup').style.display = 'block';
  get('signup-step-1').style.display = 'block';
  get('signup-step-2').style.display = 'none';
  get('sign-id').value = '';
  get('sign-pw').value = '';
  get('sign-pw2').value = '';
  get('sign-name').value = '';
  get('sign-phone').value = '';
  get('sign-addr').value = '';
  get('sign-addr-detail').value = '';
  get('check-all').checked = false;
  get('term1').checked = false;
  get('term2').checked = false;
}

function goCart() {
  hideAll();
  get('view-cart').style.display = 'block';
  renderCartView();
}

function goFindAccount() {
  hideAll();
  get('view-find').style.display = 'block';
  switchFindTab('id');
  // 입력값 초기화
  get('find-id-name').value = '';
  get('find-id-phone').value = '';
  get('find-pw-id').value = '';
  get('find-pw-name').value = '';
  get('find-pw-phone').value = '';
  get('find-id-result').style.display = 'none';
  get('find-pw-result').style.display = 'none';
}

function switchFindTab(tab) {
  const idTab = get('find-id-tab');
  const pwTab = get('find-pw-tab');
  const idPanel = get('find-id-panel');
  const pwPanel = get('find-pw-panel');

  if (tab === 'id') {
    idTab.style.background = 'var(--home-primary)';
    idTab.style.color = '#fff';
    pwTab.style.background = '#fff';
    pwTab.style.color = '#64748b';
    idPanel.style.display = 'block';
    pwPanel.style.display = 'none';
    get('find-id-result').style.display = 'none';
  } else {
    pwTab.style.background = 'var(--home-primary)';
    pwTab.style.color = '#fff';
    idTab.style.background = '#fff';
    idTab.style.color = '#64748b';
    pwPanel.style.display = 'block';
    idPanel.style.display = 'none';
    get('find-pw-result').style.display = 'none';
  }
}

function findId() {
  const name = get('find-id-name').value.trim();
  const phone = get('find-id-phone').value.trim();

  if (!name || !phone) {
    return alert('이름과 휴대폰번호를 입력해주세요.');
  }

  const users = JSON.parse(localStorage.getItem(USER_DB_KEY) || '[]');
  const found = users.find(u => u.name === name && u.phone === phone);

  if (found) {
    get('found-id').textContent = found.id;
    get('find-id-result').style.display = 'block';
  } else {
    alert('일치하는 회원 정보가 없습니다.');
  }
}

function findPassword() {
  const id = get('find-pw-id').value.trim();
  const name = get('find-pw-name').value.trim();
  const phone = get('find-pw-phone').value.trim();

  if (!id || !name || !phone) {
    return alert('모든 정보를 입력해주세요.');
  }

  const users = JSON.parse(localStorage.getItem(USER_DB_KEY) || '[]');
  const found = users.find(u => u.id === id && u.name === name && u.phone === phone);

  if (found) {
    get('found-pw').textContent = found.pw;
    get('find-pw-result').style.display = 'block';
  } else {
    alert('일치하는 회원 정보가 없습니다.');
  }
}

function showCS() {
  get('view-cs').style.display = 'flex';
}

function hideCS() {
  get('view-cs').style.display = 'none';
}

function goAdmin() {
  hideAll();
  get('view-admin').style.display = 'block';
  get('admin-pw').focus();
}

function adminLogin() {
  const pw = get('admin-pw').value.trim();
  if (pw === '1234') {
    get('admin-pw').parentElement.parentElement.parentElement.style.display = 'none';
    get('admin-panel').style.display = 'block';
    renderOrderList();
    renderUserList();
    toast('관리자 모드로 접속했습니다');
  } else {
    alert('비밀번호가 틀렸습니다');
    get('admin-pw').value = '';
    get('admin-pw').focus();
  }
}

function adminLogout() {
  if (confirm('관리자 모드를 종료하시겠습니까?')) {
    get('admin-pw').value = '';
    get('admin-panel').style.display = 'none';
    get('admin-pw').parentElement.parentElement.parentElement.style.display = 'block';
    goHome();
  }
}

// ===== 상품 마진/상세 콘텐츠 관리 =====
const CONTENT_DB_KEY = 'print_content_db';
const DEFAULT_CONTENT = {
  indigo: {
    margin: 100,
    img: {
      staple: '',
      perfect: ''
    },
    info: {
      staple: '<p>HP Indigo 7K 프리미엄 인쇄</p>',
      perfect: '<p>HP Indigo (무선) 프리미엄 인쇄</p>'
    },
    guide: {
      staple: 'PDF 권장',
      perfect: 'PDF 권장 (무선)'
    },
    ship: {
      staple: '착불/택배',
      perfect: '착불/택배'
    }
  },
  digital: {
    margin: 100,
    img: {
      staple: '',
      perfect: ''
    },
    info: {
      staple: '<p>흑백 디지털 마스터 (중철)</p>',
      perfect: '<p>흑백 디지털 마스터 (무선)</p>'
    },
    guide: {
      staple: 'Grayscale 권장',
      perfect: 'Grayscale 권장'
    },
    ship: {
      staple: '착불/택배',
      perfect: '착불/택배'
    }
  },
  offset: {
    margin: 30,
    img: {
      staple: '',
      perfect: ''
    },
    info: {
      staple: '<p>대량 옵셋 인쇄 (중철)</p>',
      perfect: '<p>대량 옵셋 인쇄 (무선)</p>'
    },
    guide: {
      staple: 'CMYK 필수',
      perfect: 'CMYK 필수'
    },
    ship: {
      staple: '용달 착불',
      perfect: '용달 착불'
    }
  },
  flyer_small: {
    margin: 50,
    img: {
      staple: '',
      perfect: ''
    },
    info: {
      staple: '<p>소량 전단 안내 (단면)</p>',
      perfect: '<p>소량 전단 안내 (양면)</p>'
    },
    guide: {
      staple: '단면/양면 선택',
      perfect: '단면/양면 선택'
    },
    ship: {
      staple: '착불/택배',
      perfect: '착불/택배'
    }
  },
  flyer_large: {
    margin: 20,
    img: {
      staple: '',
      perfect: ''
    },
    info: {
      staple: '<p>대량 전단 안내 (중철)</p>',
      perfect: '<p>대량 전단 안내 (무선)</p>'
    },
    guide: {
      staple: '대량 제작 문의',
      perfect: '대량 제작 문의'
    },
    ship: {
      staple: '용달/착불',
      perfect: '용달/착불'
    }
  }
};
let contentDB = JSON.parse(localStorage.getItem(CONTENT_DB_KEY) || 'null') || DEFAULT_CONTENT;

function mergeContentDefaults() {
  const merged = JSON.parse(JSON.stringify(DEFAULT_CONTENT));
  Object.keys(merged).forEach(cat => {
    if (contentDB[cat]) merged[cat] = { ...merged[cat],
      ...contentDB[cat]
    };
  });
  contentDB = merged;
  localStorage.setItem(CONTENT_DB_KEY, JSON.stringify(contentDB));
}
mergeContentDefaults();

// 디버그: 현재 contentDB를 새 창에 예쁘게 출력
function dumpContentDB() {
  try {
    const w = window.open('', '_blank');
    const pre = w.document.createElement('pre');
    pre.style.whiteSpace = 'pre-wrap';
    pre.style.padding = '12px';
    pre.textContent = JSON.stringify(contentDB, null, 2);
    w.document.body.appendChild(pre);
    w.document.title = 'contentDB dump';
  } catch (e) {
    alert('새 창을 열 수 없습니다. 콘솔에 출력합니다.');
    console.log('contentDB', contentDB);
    alert('콘솔에 contentDB를 출력했습니다. (개발자 도구 확인)');
  }
}

function initAdminContentEditor() {
  if (window.jQuery && $('#adm-info-txt').length && !$('#adm-info-txt').data('summernote')) {
    $('#adm-info-txt').summernote({
      height: 300,
      lang: 'ko-KR'
    });
  }
}

function loadAdminContent() {
  initAdminContentEditor();
  const cat = get('adm-cat-select').value;
  const data = contentDB[cat];
  if (!data) return;
  get('adm-margin-val').value = data.margin ?? 100;
  const binding = get('adm-binding-select') ? get('adm-binding-select').value : 'staple';
  let imgVal = '';
  if (data.img) {
    if (typeof data.img === 'string') imgVal = data.img;
    else if (typeof data.img === 'object') imgVal = data.img[binding] || data.img.staple || data.img.perfect || '';
  }
  get('adm-img-url').value = imgVal || '';
  if (imgVal) {
    get('adm-img-preview').style.display = 'block';
    get('adm-img-preview-img').src = imgVal;
  } else {
    get('adm-img-preview').style.display = 'none';
  }

  // Load info/guide/ship per binding
  let infoVal = '';
  if (data.info) {
    if (typeof data.info === 'string') infoVal = data.info;
    else if (typeof data.info === 'object') infoVal = data.info[binding] || data.info.staple || data.info.perfect || '';
  }
  if (window.jQuery && $('#adm-info-txt').length) $('#adm-info-txt').summernote('code', infoVal || '');

  let guideVal = '';
  if (data.guide) {
    if (typeof data.guide === 'string') guideVal = data.guide;
    else if (typeof data.guide === 'object') guideVal = data.guide[binding] || data.guide.staple || data.guide.perfect || '';
  }
  get('adm-guide-txt').value = guideVal || '';

  let shipVal = '';
  if (data.ship) {
    if (typeof data.ship === 'string') shipVal = data.ship;
    else if (typeof data.ship === 'object') shipVal = data.ship[binding] || data.ship.staple || data.ship.perfect || '';
  }
  get('adm-ship-txt').value = shipVal || '';
  // NOTE: Do not overwrite the per-binding values with the raw object here — above we already loaded binding-specific values.
}

// ===== HOMEPAGE CONTENT MANAGEMENT =====
const HOMEPAGE_DB_KEY = 'print_homepage_v1';
const DEFAULT_HOMEPAGE = {
  slides: [
    'https://images.unsplash.com/photo-1542435503-956c469947f6?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=1400&q=80'
  ],
  quoteImg: '',
  logo: ''
};

let homepageDB = JSON.parse(localStorage.getItem(HOMEPAGE_DB_KEY) || 'null') || DEFAULT_HOMEPAGE;

function loadAdminHomepage() {
  homepageDB = JSON.parse(localStorage.getItem(HOMEPAGE_DB_KEY) || 'null') || DEFAULT_HOMEPAGE;
  // 슬라이드 프리뷰
  for (let i = 0; i < 3; i++) {
    const p = get('adm-home-slide-' + i + '-preview');
    if (p) p.src = homepageDB.slides && homepageDB.slides[i] ? homepageDB.slides[i] : DEFAULT_HOMEPAGE.slides[i];
  }
  const q = get('adm-home-quote-preview');
  if (q) q.src = homepageDB.quoteImg || DEFAULT_HOMEPAGE.quoteImg;
  const l = get('adm-home-logo-preview');
  if (l) l.src = homepageDB.logo || '';
}

function handleHomepageImageUpload(event, key, index) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) {
    alert('이미지 파일만 업로드 가능합니다.');
    return;
  }
  const reader = new FileReader();
  reader.onload = function(e) {
    const dataUrl = e.target.result;
    if (key === 'slides') {
      homepageDB.slides = homepageDB.slides || [];
      homepageDB.slides[index] = dataUrl;
      const prev = get('adm-home-slide-' + index + '-preview');
      if (prev) prev.src = dataUrl;
    } else if (key === 'quote') {
      homepageDB.quoteImg = dataUrl;
      const prev = get('adm-home-quote-preview');
      if (prev) prev.src = dataUrl;
    } else if (key === 'logo') {
      homepageDB.logo = dataUrl;
      const prev = get('adm-home-logo-preview');
      if (prev) prev.src = dataUrl;
    }
  };
  reader.readAsDataURL(file);
}

function saveHomepageContent() {
  localStorage.setItem(HOMEPAGE_DB_KEY, JSON.stringify(homepageDB));
  applyHomepageContent();
  alert('홈페이지 컨텐츠가 저장되었습니다.');
}

function applyHomepageContent(preserveAdminOpen) {
  homepageDB = JSON.parse(localStorage.getItem(HOMEPAGE_DB_KEY) || 'null') || homepageDB || DEFAULT_HOMEPAGE;
  // 슬라이더 이미지 적용
  const slidesEls = document.querySelectorAll('#home-slider .home-slide img');
  slidesEls.forEach((img, i) => {
    if (homepageDB.slides && homepageDB.slides[i]) img.src = homepageDB.slides[i];
  });
  // 견적 이미지 적용
  const quoteImgEl = get('quote-indigo-img');
  if (quoteImgEl && homepageDB.quoteImg) quoteImgEl.src = homepageDB.quoteImg;
  // 로고 적용 (header img inside .brand)
  const headerLogo = document.querySelector('.brand img');
  if (headerLogo && homepageDB.logo) headerLogo.src = homepageDB.logo;
  if (!preserveAdminOpen) loadAdminHomepage();
}


function handleImageUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) {
    alert('이미지 파일만 업로드 가능합니다.');
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    const dataUrl = e.target.result;
    get('adm-img-url').value = dataUrl;
    get('adm-img-preview').style.display = 'block';
    get('adm-img-preview-img').src = dataUrl;
  };
  reader.readAsDataURL(file);
}

// ===== 견적서 파일 첨부 =====
let quoteAttachedFiles = [];

function handleQuoteFileUpload(event) {
  const files = Array.from(event.target.files);
  if (files.length === 0) return;

  files.forEach(file => {
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      alert(`${file.name}은(는) 너무 큽니다. 최대 50MB까지 첨부 가능합니다.`);
      return;
    }

    quoteAttachedFiles.push({
      name: file.name,
      size: file.size,
      type: file.type,
      file: file
    });
  });

  updateQuoteFileList();
  event.target.value = ''; // 같은 파일 재선택 가능하도록
}

function updateQuoteFileList() {
  const listEl = get('quote-file-list');
  if (quoteAttachedFiles.length === 0) {
    listEl.innerHTML = '';
    return;
  }

  listEl.innerHTML = quoteAttachedFiles.map((f, idx) => {
    const sizeKB = (f.size / 1024).toFixed(1);
    const sizeMB = (f.size / (1024 * 1024)).toFixed(2);
    const sizeText = f.size > 1024 * 1024 ? `${sizeMB}MB` : `${sizeKB}KB`;

    return `
          <div style="display:flex; align-items:center; justify-content:space-between; padding:8px 10px; background:#0f172a; border-radius:6px; margin-bottom:6px; font-size:11px;">
            <div style="flex:1; overflow:hidden;">
              <div style="color:#f8fafc; font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${f.name}</div>
              <div style="color:#94a3b8; margin-top:2px;">${sizeText}</div>
            </div>
            <button onclick="removeQuoteFile(${idx})" style="background:#ef4444; border:none; color:white; padding:4px 8px; border-radius:4px; cursor:pointer; font-size:10px; font-weight:700;">삭제</button>
          </div>
        `;
  }).join('');
}

function removeQuoteFile(idx) {
  quoteAttachedFiles.splice(idx, 1);
  updateQuoteFileList();
}

function saveAdminContent() {
  const cat = get('adm-cat-select').value;
  const marginVal = Number(get('adm-margin-val').value) || 0;
  const binding = get('adm-binding-select') ? get('adm-binding-select').value : 'staple';
  const imgVal = get('adm-img-url').value.trim();

  // Ensure contentDB[cat] exists
  contentDB[cat] = contentDB[cat] || {
    margin: 100,
    img: {
      staple: '',
      perfect: ''
    },
    info: {
      staple: '',
      perfect: ''
    },
    guide: {
      staple: '',
      perfect: ''
    },
    ship: {
      staple: '',
      perfect: ''
    }
  };
  // Normalize img to object form if needed
  if (!contentDB[cat].img || typeof contentDB[cat].img === 'string') {
    const prev = contentDB[cat].img || '';
    contentDB[cat].img = {
      staple: prev,
      perfect: prev
    };
  }
  // Normalize info/guide/ship to object form if needed
  if (!contentDB[cat].info || typeof contentDB[cat].info === 'string') {
    const prev = contentDB[cat].info || '';
    contentDB[cat].info = {
      staple: prev,
      perfect: prev
    };
  }
  if (!contentDB[cat].guide || typeof contentDB[cat].guide === 'string') {
    const prev = contentDB[cat].guide || '';
    contentDB[cat].guide = {
      staple: prev,
      perfect: prev
    };
  }
  if (!contentDB[cat].ship || typeof contentDB[cat].ship === 'string') {
    const prev = contentDB[cat].ship || '';
    contentDB[cat].ship = {
      staple: prev,
      perfect: prev
    };
  }

  contentDB[cat].margin = marginVal;
  contentDB[cat].img[binding] = imgVal;

  const infoVal = (window.jQuery && $('#adm-info-txt').length) ? $('#adm-info-txt').summernote('code') : '';
  contentDB[cat].info[binding] = infoVal;
  contentDB[cat].guide[binding] = get('adm-guide-txt').value;
  contentDB[cat].ship[binding] = get('adm-ship-txt').value;
  localStorage.setItem(CONTENT_DB_KEY, JSON.stringify(contentDB));
  applyContentToDetailTabs(cat);
  alert('저장되었습니다 (마진율 ' + marginVal + '% 적용)');
}

function generateAIContent() {
  if (!confirm('AI로 상세설명을 생성하시겠습니까? 기존 내용은 대체됩니다.')) return;
  const sample = `<h2>상품 특징</h2><p>프리미엄 인쇄 품질과 선명한 컬러를 제공합니다.</p><ul><li>고급 종이 사용</li><li>선명한 색감</li><li>빠른 제작</li></ul>`;
  if (window.jQuery && $('#adm-info-txt').length) $('#adm-info-txt').summernote('code', sample);
  alert('기본 템플릿이 적용되었습니다. 수정 후 저장해주세요.');
}

function applyContentToDetailTabs(cat) {
  const data = contentDB[cat];
  if (!data) return;
  const detail = get('tab-detail-content');
  const guide = get('tab-guide-content');
  const ship = get('tab-shipping-content');
  const binding = window.currentBindType || (get('adm-binding-select') ? get('adm-binding-select').value : 'staple');

  // detail (info)
  let infoHtml = '';
  if (data.info) {
    if (typeof data.info === 'string') infoHtml = data.info;
    else if (typeof data.info === 'object') infoHtml = data.info[binding] || data.info.staple || data.info.perfect || '';
  }
  if (detail) detail.innerHTML = infoHtml || '';

  // guide
  let guideTxt = '';
  if (data.guide) {
    if (typeof data.guide === 'string') guideTxt = data.guide;
    else if (typeof data.guide === 'object') guideTxt = data.guide[binding] || data.guide.staple || data.guide.perfect || '';
  }
  if (guide) guide.innerHTML = `<div style="background:#fff; border-radius:12px; padding:30px;"><h2 style="font-size:20px; font-weight:900; color:#0f172a; margin:0 0 20px 0; border-left:4px solid var(--primary); padding-left:12px;">제작 가이드</h2><div style="line-height:1.8; color:#475569;">${(guideTxt || '').replace(/\n/g,'<br>')}</div></div>`;

  // ship
  let shipTxt = '';
  if (data.ship) {
    if (typeof data.ship === 'string') shipTxt = data.ship;
    else if (typeof data.ship === 'object') shipTxt = data.ship[binding] || data.ship.staple || data.ship.perfect || '';
  }
  if (ship) ship.innerHTML = `<div style="background:#fff; border-radius:12px; padding:30px;"><h2 style="font-size:20px; font-weight:900; color:#0f172a; margin:0 0 20px 0; border-left:4px solid var(--primary); padding-left:12px;">배송 안내</h2><div style="line-height:1.8; color:#475569;">${(shipTxt || '').replace(/\n/g,'<br>')}</div></div>`;
}

function showAdminTab(tabId) {
  ['adm-orders', 'adm-content', 'adm-users'].forEach(id => {
    const el = get(id);
    if (el) el.style.display = 'none';
  });
  const activeTab = get(tabId);
  if (activeTab) activeTab.style.display = 'block';
  if (tabId === 'adm-content') loadAdminContent();
  if (tabId === 'adm-homepage') loadAdminHomepage();
}

function renderOrderList() {
  const orders = JSON.parse(localStorage.getItem(ORDER_KEY) || '[]');
  const body = get('order-list-body');
  body.innerHTML = '';

  if (orders.length === 0) {
    body.innerHTML = '<tr><td colspan="5" style="padding:30px; text-align:center; color:#64748b;">아직 주문이 없습니다.</td></tr>';
  } else {
    orders.forEach((order, i) => {
      const tr = document.createElement('tr');
      tr.style.borderBottom = '1px solid #e6edf3';
      tr.innerHTML = `
            <td style="padding:10px;">${order.date || '-'}</td>
            <td style="padding:10px;">${order.userName || '비회원'}</td>
            <td style="padding:10px;">상품</td>
            <td style="padding:10px;">${(order.price || 0).toLocaleString()}원</td>
            <td style="padding:10px; text-align:center;">
              <button style="padding:4px 8px; background:#037a3f; color:#fff; border:none; border-radius:4px; cursor:pointer; font-size:11px; font-weight:700;">상세보기</button>
            </td>
          `;
      body.appendChild(tr);
    });
  }
}

function renderUserList() {
  const users = JSON.parse(localStorage.getItem(USER_DB_KEY) || '[]');
  const body = get('user-list-body');
  body.innerHTML = '';

  if (users.length === 0) {
    body.innerHTML = '<tr><td colspan="5" style="padding:30px; text-align:center; color:#64748b;">등록된 회원이 없습니다.</td></tr>';
  } else {
    users.forEach((user, i) => {
      const tr = document.createElement('tr');
      tr.style.borderBottom = '1px solid #e6edf3';
      const typeText = user.type === 'business' ? '사업자' : '일반';
      tr.innerHTML = `
            <td style="padding:10px;">${user.id || '-'}</td>
            <td style="padding:10px;">${user.name || '-'}</td>
            <td style="padding:10px;">${user.phone || '-'}</td>
            <td style="padding:10px;">${typeText}</td>
            <td style="padding:10px;">${user.joinDate || '-'}</td>
          `;
      body.appendChild(tr);
    });
  }
}

function resetAllData() {
  if (confirm('⚠️ 모든 데이터를 초기화하시겠습니까?\n(복구 불가능합니다)')) {
    localStorage.removeItem(CART_KEY);
    localStorage.removeItem(ORDER_KEY);
    localStorage.removeItem(USER_DB_KEY);
    localStorage.removeItem(CURRENT_USER_KEY);
    alert('초기화 완료되었습니다');
    location.reload();
  }
}

// ===== QUOTATION (견적) 함수 =====
function addQuoteToCart() {
  const coating = get('quote-coating').value;
  const paper = get('quote-paper').value;
  const color = get('quote-color').value;
  const size = get('quote-size').value;
  const qty = get('quote-qty').value;
  const totalPrice = get('quote-total-price').textContent;

  const title = get('quote-title').textContent;
  const cart = JSON.parse(localStorage.getItem(CART_KEY) || '[]');

  // 첨부 파일 정보
  const fileInfo = quoteAttachedFiles.length > 0 ?
    `📎 첨부파일 ${quoteAttachedFiles.length}개: ${quoteAttachedFiles.map(f => f.name).join(', ')}` :
    '';

  cart.push({
    name: `${title} (${size}, ${qty})`,
    qty: parseInt(qty),
    price: parseInt(totalPrice.replace(/[^0-9]/g, '')),
    shipping: 0,
    specs: `코팅: ${coating}, 용지: ${paper}, 색상: ${color}, 사이즈: ${size}`,
    files: quoteAttachedFiles.map(f => ({
      name: f.name,
      size: f.size,
      type: f.type
    })),
    fileInfo: fileInfo,
    date: new Date().toLocaleString()
  });

  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartBadge();
  alert('견적이 장바구니에 추가되었습니다!' + (fileInfo ? '\n' + fileInfo : ''));

  // 파일 목록 초기화
  quoteAttachedFiles = [];
  updateQuoteFileList();

  goHome();
}

// 견적요약서에서 장바구니에 추가
function addToCartFromQuote() {
  // 먼저 계산 실행
  if (typeof calculateIndigo === 'function') {
    calculateIndigo();
  }

  // 파일 확인
  if (quoteAttachedFiles.length === 0) {
    alert('파일을 첨부해주세요.');
    return;
  }

  // 견적 요약서 정보 가져오기
  const cat = get('sum-cat')?.textContent || '-';
  const qty = get('sum-qty')?.textContent || '-';
  const total = get('sum-total')?.textContent || '0원';
  const totalPrice = parseInt(total.replace(/[^0-9]/g, '')) || 0;

  if (totalPrice === 0) {
    alert('먼저 견적을 계산해주세요.');
    return;
  }

  const cart = JSON.parse(localStorage.getItem(CART_KEY) || '[]');

  // 파일 정보
  const fileInfo = quoteAttachedFiles.length > 0 ?
    `📎 첨부파일 ${quoteAttachedFiles.length}개: ${quoteAttachedFiles.map(f => f.name).join(', ')}` :
    '';

  cart.push({
    name: `${cat} (${qty})`,
    qty: qty,
    price: totalPrice,
    shipping: 0,
    specs: `카테고리: ${cat}, 수량: ${qty}`,
    files: quoteAttachedFiles.map(f => ({
      name: f.name,
      size: f.size,
      type: f.type
    })),
    fileInfo: fileInfo,
    date: new Date().toLocaleString()
  });

  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartBadge();
  alert('장바구니에 추가되었습니다!');
}

// 견적요약서에서 바로 주문
function orderDirectlyFromQuote() {
  const user = JSON.parse(localStorage.getItem(CURRENT_USER_KEY));
  if (!user) {
    alert('로그인이 필요합니다.');
    goLogin();
    return;
  }

  // 먼저 계산 실행
  if (typeof calculateIndigo === 'function') {
    calculateIndigo();
  }

  // 파일 확인
  if (quoteAttachedFiles.length === 0) {
    alert('파일을 첨부해주세요.');
    return;
  }

  // 견적 요약서 정보 가져오기
  const cat = get('sum-cat')?.textContent || '-';
  const qty = get('sum-qty')?.textContent || '-';
  const total = get('sum-total')?.textContent || '0원';
  const totalPrice = parseInt(total.replace(/[^0-9]/g, '')) || 0;

  if (totalPrice === 0) {
    alert('먼저 견적을 계산해주세요.');
    return;
  }

  // 파일 정보
  const fileInfo = quoteAttachedFiles.length > 0 ?
    `📎 첨부파일 ${quoteAttachedFiles.length}개: ${quoteAttachedFiles.map(f => f.name).join(', ')}` :
    '';

  const orders = JSON.parse(localStorage.getItem(ORDER_KEY) || '[]');
  orders.push({
    name: `${cat} (${qty})`,
    qty: qty,
    price: totalPrice,
    shipping: 0,
    specs: `카테고리: ${cat}, 수량: ${qty}`,
    files: quoteAttachedFiles.map(f => ({
      name: f.name,
      size: f.size,
      type: f.type
    })),
    fileInfo: fileInfo,
    userId: user.id,
    userName: user.name,
    userPhone: user.phone,
    date: new Date().toLocaleString(),
    orderDate: new Date().toISOString(),
    status: '접수완료',
    orderId: 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9)
  });

  localStorage.setItem(ORDER_KEY, JSON.stringify(orders));

  // 파일 목록 초기화
  quoteAttachedFiles = [];
  if (typeof updateQuoteFileList === 'function') {
    updateQuoteFileList();
  }

  alert('주문이 접수되었습니다!');
  goHome();
}

function showCS() {
  hideAll();
  const csModal = get('view-cs');
  if (csModal) csModal.style.display = 'flex';
  get('cs-message').value = '';
}

function hideCS() {
  hideAll();
  goHome();
}

function submitCS() {
  const msg = get('cs-message').value.trim();
  if (!msg) return alert('문의 내용을 입력해주세요.');
  toast('문의가 접수되었습니다.');
  hideCS();
}

// ===== SIGNUP LOGIC =====
const USER_DB_KEY = 'print_users_v2';
const CART_KEY = 'print_cart_v2';
const ORDER_KEY = 'print_order_v2';
const CURRENT_USER_KEY = 'print_current_user';
let currentSignupType = 'general';

function startSignup(type) {
  currentSignupType = type;
  const isBiz = type === 'business';
  get('signup-step-1').style.display = 'none';
  get('signup-step-2').style.display = 'block';
  get('area-business').style.display = isBiz ? 'block' : 'none';
}

function backToStep1() {
  get('signup-step-1').style.display = 'block';
  get('signup-step-2').style.display = 'none';
}

function toggleAllTerms() {
  const isChecked = get('check-all').checked;
  get('term1').checked = isChecked;
  get('term2').checked = isChecked;
}

function checkIdDuplicate() {
  const id = get('sign-id').value.trim();
  if (!id) return alert('아이디를 입력해주세요');
  const users = JSON.parse(localStorage.getItem(USER_DB_KEY) || '[]');
  const exists = users.find(u => u.id === id);
  alert(exists ? '이미 사용중인 아이디입니다.' : '사용 가능한 아이디입니다.');
}

function openAddressSearch() {
  if (typeof daum === 'undefined') {
    alert('주소 API 준비 중입니다.');
    return;
  }
  new daum.Postcode({
    oncomplete: function(data) {
      const addr = data.userSelectedType === 'R' ? data.roadAddress : data.jibunAddress;
      get('sign-addr').value = addr;
      get('sign-addr-detail').focus();
    }
  }).open();
}

function submitSignup() {
  if (!get('term1').checked || !get('term2').checked) {
    return alert('모든 약관에 동의해야 가입할 수 있습니다.');
  }
  const id = get('sign-id').value.trim();
  const pw = get('sign-pw').value.trim();
  const pw2 = get('sign-pw2').value.trim();
  const name = get('sign-name').value.trim();
  const phone = get('sign-phone').value.trim();
  const addr = get('sign-addr').value.trim();
  const detail = get('sign-addr-detail').value.trim();

  if (!id || !pw || !name || !phone) return alert('필수 정보를 입력해주세요.');
  if (pw !== pw2) return alert('비밀번호가 일치하지 않습니다.');

  const users = JSON.parse(localStorage.getItem(USER_DB_KEY) || '[]');
  if (users.find(u => u.id === id)) return alert('아이디 중복확인을 해주세요.');

  let userData = {
    id,
    pw,
    name,
    phone,
    address: addr ? `${addr} ${detail}` : '',
    type: currentSignupType,
    joinDate: new Date().toLocaleDateString()
  };

  if (currentSignupType === 'business') {
    const bizName = get('sign-biz-name').value.trim();
    const bizNum = get('sign-biz-num').value.trim();
    const bizFile = get('sign-biz-file').value;
    if (!bizName || !bizNum || !bizFile) return alert('사업자 정보를 모두 입력해주세요.');
    userData.bizName = bizName;
    userData.bizNum = bizNum;
    userData.status = 'pending';
  } else {
    userData.status = 'active';
  }

  users.push(userData);
  localStorage.setItem(USER_DB_KEY, JSON.stringify(users));
  alert(currentSignupType === 'business' ? '가입 신청이 완료되었습니다.' : '회원가입이 완료되었습니다!');
  goLogin();
}

// ===== LOGIN LOGIC =====
function login(event) {
  if (event) event.preventDefault();
  const userId = document.getElementById('userId')?.value || document.getElementById('login-id')?.value;
  const userPassword = document.getElementById('userPassword')?.value || document.getElementById('login-pw')?.value;

  if (!userId || !userPassword) {
    alert('아이디와 비밀번호를 입력해주세요.');
    return false;
  }

  const users = JSON.parse(localStorage.getItem(USER_DB_KEY) || '[]');
  const user = users.find(u => u.id === userId && u.pw === userPassword);

  if (user) {
    // 사업자 회원이고 승인 대기 중인 경우
    if (user.type === 'business' && user.status === 'pending') {
      alert('사업자 회원 가입 승인 대기 중입니다. 관리자 승인 후 이용 가능합니다.');
      return false;
    }

    // 로그인 성공
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    updateNav();
    updateHomeLoginCard();
    toast('로그인되었습니다.');
    goHome();
    return false;
  } else {
    alert('아이디 또는 비밀번호가 일치하지 않습니다.');
    return false;
  }
}

function logout() {
  if (confirm('로그아웃 하시겠습니까?')) {
    localStorage.removeItem(CURRENT_USER_KEY);
    updateNav();
    updateHomeLoginCard();
    goHome();
  }
}

function updateNav() {
  const user = JSON.parse(localStorage.getItem(CURRENT_USER_KEY));
  const nav = get('nav-links');
  if (!nav) return;

  if (user) {
    nav.innerHTML = `
          <a>${user.name}님</a>
          <a onclick="logout()" style="color:#ef4444;">로그아웃</a>
          <a onclick="goFindAccount()">ID·PW찾기</a>
          <a onclick="goOrderHistory()">주문내역</a>
          <a onclick="goCart()" class="nav-cart">장바구니 <span class="cart-badge" id="cart-badge">0</span></a>
        `;
  } else {
    nav.innerHTML = `
          <a onclick="goLogin()">로그인</a>
          <a onclick="goSignup()">회원가입</a>
          <a onclick="goFindAccount()">ID·PW찾기</a>
          <a onclick="goOrderHistory()">주문내역</a>
          <a onclick="goCart()" class="nav-cart">장바구니 <span class="cart-badge" id="cart-badge">0</span></a>
        `;
  }
  updateCartBadge();

  // 홈 화면 로그인 카드 업데이트
  updateHomeLoginCard();
}

function updateHomeLoginCard() {
  const user = JSON.parse(localStorage.getItem(CURRENT_USER_KEY));
  const loginForm = get('home-login-form');
  const userWelcome = get('home-user-welcome');
  const userNameEl = get('home-user-name');

  if (!loginForm || !userWelcome) return;

  if (user) {
    // 로그인 상태: 환영 메시지 표시
    loginForm.style.display = 'none';
    userWelcome.style.display = 'block';
    if (userNameEl) userNameEl.textContent = user.name + ' 회원님';
  } else {
    // 비로그인 상태: 로그인 폼 표시
    loginForm.style.display = 'block';
    userWelcome.style.display = 'none';
  }
}

// ===== CART LOGIC =====
function updateCartBadge() {
  const cart = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
  const badge = get('cart-badge');
  if (badge) badge.textContent = cart.length;
}

function renderCartView() {
  const cart = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
  const list = get('cart-list');
  list.innerHTML = '';

  let totalP = 0,
    totalS = 0;

  if (cart.length === 0) {
    list.innerHTML = `<div style="text-align:center; padding:60px 20px; background:#f8fafc; border-radius:16px; border:2px dashed var(--line); color:#64748b;">🛒 장바구니가 비어있습니다</div>`;
  } else {
    cart.forEach((item, i) => {
      const itemTotal = (item.price || 0);
      totalP += itemTotal;
      totalS += (item.shipping || 0);

      // 첨부파일 정보 표시
      const filesHtml = (item.files && item.files.length > 0) ?
        `<div style="margin-top:8px; padding:8px; background:#f1f5f9; border-radius:6px; font-size:11px; color:#475569;">
                 📎 첨부파일 ${item.files.length}개: ${item.files.map(f => f.name).join(', ')}
               </div>` :
        '';

      list.innerHTML += `
            <div style="display:flex; justify-content:space-between; background:#fff; border:1px solid var(--line); border-radius:16px; padding:18px; align-items:center;">
              <div style="flex:1;">
                <h4 style="margin:0 0 8px 0; font-weight:900; color:#0f172a;">${item.name || '상품'}</h4>
                <p style="margin:0; font-size:12px; color:#64748b;">수량: ${item.qty || 0}</p>
                ${filesHtml}
              </div>
              <div style="text-align:right;">
                <div style="font-size:18px; font-weight:1100; color:#0f172a;">${itemTotal.toLocaleString()}원</div>
                <button class="btn btn-secondary" onclick="removeCart(${i})" style="width:80px; padding:6px; margin-top:8px; font-size:12px;">삭제</button>
              </div>
            </div>
          `;
    });
  }

  get('ct-price').textContent = totalP.toLocaleString() + '원';
  get('ct-ship').textContent = totalS.toLocaleString() + '원';
  get('ct-total').textContent = (totalP + totalS).toLocaleString() + '원';
}

function removeCart(i) {
  const cart = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
  cart.splice(i, 1);
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  renderCartView();
  updateCartBadge();
}

function submitOrder() {
  const user = JSON.parse(localStorage.getItem(CURRENT_USER_KEY));
  if (!user) return alert('로그인이 필요합니다.');

  const cart = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
  if (cart.length === 0) return alert('장바구니가 비었습니다.');

  // 장바구니의 각 항목에 파일이 있는지 확인
  const itemsWithoutFiles = cart.filter(item => !item.files || item.files.length === 0);
  if (itemsWithoutFiles.length > 0) {
    alert('파일이 첨부되지 않은 항목이 있습니다. 모든 항목에 파일을 첨부해주세요.');
    return;
  }

  const orders = JSON.parse(localStorage.getItem(ORDER_KEY) || '[]');
  // 각 장바구니 항목을 개별 주문으로 저장
  cart.forEach(item => {
    orders.push({
      ...item,
      userId: user.id,
      userName: user.name,
      userPhone: user.phone,
      date: new Date().toLocaleString(),
      orderDate: new Date().toISOString(),
      status: '접수완료',
      orderId: 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9)
    });
  });
  localStorage.setItem(ORDER_KEY, JSON.stringify(orders));
  localStorage.removeItem(CART_KEY);

  updateCartBadge();
  alert('주문이 접수되었습니다!');
  goHome();
}

function goOrderHistory() {
  const user = JSON.parse(localStorage.getItem(CURRENT_USER_KEY));
  if (!user) {
    alert('로그인이 필요합니다.');
    goLogin();
    return;
  }

  hideAll();
  get('view-order').style.display = 'block';
  renderOrderHistory();
}

function renderOrderHistory() {
  const user = JSON.parse(localStorage.getItem(CURRENT_USER_KEY));
  if (!user) return;

  const orders = JSON.parse(localStorage.getItem(ORDER_KEY) || '[]');
  // 현재 로그인한 사용자의 주문만 필터링
  const userOrders = orders.filter(order => order.userId === user.id);

  const listEl = get('order-history-list');
  const emptyEl = get('order-empty');

  if (userOrders.length === 0) {
    listEl.innerHTML = '';
    emptyEl.style.display = 'block';
    return;
  }

  emptyEl.style.display = 'none';

  // 날짜순으로 정렬 (최신순)
  userOrders.sort((a, b) => {
    const dateA = new Date(a.orderDate || a.date || 0);
    const dateB = new Date(b.orderDate || b.date || 0);
    return dateB - dateA;
  });

  listEl.innerHTML = userOrders.map((order, i) => {
    const orderDate = order.orderDate ? new Date(order.orderDate).toLocaleString('ko-KR') : (order.date || '-');
    const statusColors = {
      '접수완료': '#10b981',
      '제작중': '#3b82f6',
      '배송중': '#f59e0b',
      '배송완료': '#6366f1',
      '취소': '#ef4444'
    };
    const statusColor = statusColors[order.status] || '#64748b';

    return `
          <div style="background:#fff; border:1px solid var(--line); border-radius:16px; padding:20px; box-shadow:0 2px 8px rgba(0,0,0,0.04);">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:16px;">
              <div style="flex:1;">
                <div style="display:flex; align-items:center; gap:12px; margin-bottom:8px;">
                  <div style="font-weight:900; font-size:16px; color:#0f172a;">${order.name || '상품'}</div>
                  <span style="padding:4px 12px; background:${statusColor}15; color:${statusColor}; border-radius:6px; font-size:12px; font-weight:700;">${order.status || '접수완료'}</span>
                </div>
                <div style="font-size:13px; color:#64748b; margin-bottom:4px;">주문번호: ${order.orderId || 'N/A'}</div>
                <div style="font-size:13px; color:#64748b;">주문일시: ${orderDate}</div>
              </div>
              <div style="text-align:right;">
                <div style="font-size:20px; font-weight:1100; color:#0f172a; margin-bottom:8px;">${(order.price || 0).toLocaleString()}원</div>
                <div style="font-size:12px; color:#64748b;">수량: ${order.qty || 0}${order.qty ? (order.name && order.name.includes('권') ? '권' : '개') : ''}</div>
              </div>
            </div>
            
            ${order.specs ? `
              <div style="padding:12px; background:#f8fafc; border-radius:8px; margin-bottom:12px;">
                <div style="font-size:12px; color:#64748b; margin-bottom:4px;">주문 사양</div>
                <div style="font-size:13px; color:#475569; font-weight:600;">${order.specs}</div>
              </div>
            ` : ''}
            
            ${order.fileInfo ? `
              <div style="padding:12px; background:#f1f5f9; border-radius:8px; margin-bottom:12px;">
                <div style="font-size:12px; color:#64748b; margin-bottom:4px;">첨부파일</div>
                <div style="font-size:13px; color:#475569;">${order.fileInfo}</div>
              </div>
            ` : ''}
            
            <div style="display:flex; gap:10px; margin-top:12px;">
              <button onclick="viewOrderDetail('${order.orderId || i}')" style="flex:1; padding:10px; background:var(--primary); color:#fff; border:none; border-radius:8px; font-weight:700; font-size:13px; cursor:pointer;">상세보기</button>
              <button onclick="toast('문의 기능 준비중')" style="flex:1; padding:10px; background:#e2e8f0; color:#475569; border:none; border-radius:8px; font-weight:700; font-size:13px; cursor:pointer;">문의하기</button>
            </div>
          </div>
        `;
  }).join('');
}

function viewOrderDetail(orderId) {
  const user = JSON.parse(localStorage.getItem(CURRENT_USER_KEY));
  if (!user) return;

  const orders = JSON.parse(localStorage.getItem(ORDER_KEY) || '[]');
  const order = orders.find(o => (o.orderId === orderId || o.userId === user.id) && o.userId === user.id);

  if (!order) {
    alert('주문 정보를 찾을 수 없습니다.');
    return;
  }

  const orderDate = order.orderDate ? new Date(order.orderDate).toLocaleString('ko-KR') : (order.date || '-');
  const statusColors = {
    '접수완료': '#10b981',
    '제작중': '#3b82f6',
    '배송중': '#f59e0b',
    '배송완료': '#6366f1',
    '취소': '#ef4444'
  };
  const statusColor = statusColors[order.status] || '#64748b';

  const detailHtml = `
        <div style="max-width:600px; margin:0 auto;">
          <h3 style="margin:0 0 20px 0; font-weight:1100; color:#0f172a;">주문 상세</h3>
          
          <div style="background:#fff; border:1px solid var(--line); border-radius:16px; padding:24px; margin-bottom:16px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; padding-bottom:16px; border-bottom:2px solid #e2e8f0;">
              <div>
                <div style="font-weight:900; font-size:18px; color:#0f172a; margin-bottom:8px;">${order.name || '상품'}</div>
                <div style="font-size:13px; color:#64748b;">주문번호: ${order.orderId || 'N/A'}</div>
              </div>
              <span style="padding:6px 16px; background:${statusColor}15; color:${statusColor}; border-radius:8px; font-size:13px; font-weight:700;">${order.status || '접수완료'}</span>
            </div>
            
            <div style="margin-bottom:16px;">
              <div style="font-size:12px; color:#64748b; margin-bottom:6px;">주문일시</div>
              <div style="font-size:14px; color:#0f172a; font-weight:600;">${orderDate}</div>
            </div>
            
            <div style="margin-bottom:16px;">
              <div style="font-size:12px; color:#64748b; margin-bottom:6px;">수량</div>
              <div style="font-size:14px; color:#0f172a; font-weight:600;">${order.qty || 0}개</div>
            </div>
            
            ${order.specs ? `
              <div style="margin-bottom:16px;">
                <div style="font-size:12px; color:#64748b; margin-bottom:6px;">주문 사양</div>
                <div style="font-size:14px; color:#0f172a; font-weight:600;">${order.specs}</div>
              </div>
            ` : ''}
            
            ${order.fileInfo ? `
              <div style="margin-bottom:16px;">
                <div style="font-size:12px; color:#64748b; margin-bottom:6px;">첨부파일</div>
                <div style="font-size:14px; color:#0f172a;">${order.fileInfo}</div>
              </div>
            ` : ''}
            
            <div style="padding-top:16px; border-top:2px solid #e2e8f0; margin-top:16px;">
              <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                <span style="font-size:14px; color:#64748b;">상품금액</span>
                <span style="font-size:14px; color:#0f172a; font-weight:700;">${(order.price || 0).toLocaleString()}원</span>
              </div>
              <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                <span style="font-size:14px; color:#64748b;">배송비</span>
                <span style="font-size:14px; color:#0f172a; font-weight:700;">${(order.shipping || 0).toLocaleString()}원</span>
              </div>
              <div style="display:flex; justify-content:space-between; padding-top:12px; border-top:1px dashed #e2e8f0; margin-top:12px;">
                <span style="font-size:16px; color:#0f172a; font-weight:900;">총 결제금액</span>
                <span style="font-size:20px; color:var(--primary); font-weight:1100;">${((order.price || 0) + (order.shipping || 0)).toLocaleString()}원</span>
              </div>
            </div>
          </div>
          
          <button onclick="document.body.removeChild(this.closest('[style*=\'position:fixed\']'))" class="btn btn-primary" style="width:100%;">닫기</button>
        </div>
      `;

  // 모달로 표시
  const modal = document.createElement('div');
  modal.style.cssText = 'position:fixed; inset:0; background:rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; z-index:2000; padding:20px; overflow-y:auto;';
  modal.innerHTML = `
        <div style="background:#fff; border-radius:16px; padding:24px; max-width:700px; width:100%; max-height:90vh; overflow-y:auto;">
          ${detailHtml}
        </div>
      `;
  modal.onclick = function(e) {
    if (e.target === modal) {
      document.body.removeChild(modal);
    }
  };
  document.body.appendChild(modal);
}

// ===== HOME LOGIC =====
// Top nav (비로그인 기본)
function renderNav() {
  updateNav();
}

// Home navigation stubs
function getScrollbarWidth() {
  // 스크롤바 너비 계산
  const outer = document.createElement('div');
  outer.style.visibility = 'hidden';
  outer.style.overflow = 'scroll';
  outer.style.msOverflowStyle = 'scrollbar';
  document.body.appendChild(outer);

  const inner = document.createElement('div');
  outer.appendChild(inner);

  const scrollbarWidth = outer.offsetWidth - inner.offsetWidth;

  outer.parentNode.removeChild(outer);
  return scrollbarWidth;
}

function toggleFullMenu() {
  const panel = get('full-menu-panel');
  if (!panel) return;

  const isOpen = panel.classList.contains('show');
  if (isOpen) {
    panel.classList.remove('show');
    // 스크롤바 복원 시 레이아웃 시프트 방지
    document.body.style.paddingRight = '';
    document.body.style.overflow = '';
  } else {
    // 스크롤바 숨김 시 레이아웃 시프트 방지
    const scrollbarWidth = getScrollbarWidth();
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = scrollbarWidth + 'px';
    }
    panel.classList.add('show');
    document.body.style.overflow = 'hidden';
  }
}

// 메뉴 외부 클릭 시 닫기
document.addEventListener('click', function(e) {
  const panel = get('full-menu-panel');
  const menuBtn = document.querySelector('.menu-btn');
  if (!panel || !panel.classList.contains('show')) return;

  // 메뉴 버튼이나 패널 내부 클릭이 아니면 닫기
  if (!panel.contains(e.target) && !menuBtn.contains(e.target)) {
    panel.classList.remove('show');
    document.body.style.paddingRight = '';
    document.body.style.overflow = '';
  }
});

function setCategory(cat, bindType) {
  hideAll();
  get('view-quotation').style.display = 'block';
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });

  // 카테고리에 맞는 계산기 모드 매핑
  const modeMap = {
    'indigo': 'book_indigo',
    'digital': 'book_digital',
    'offset': 'book_offset',
    'flyer_small': 'flyer_small',
    'flyer_large': 'flyer_large'
  };

  // 카테고리명이 이미 모드명인 경우 (flyer_small, flyer_large)
  const targetMode = modeMap[cat] || (cat.startsWith('flyer_') ? cat : 'book_indigo');

  // 모드 직접 설정 (탭이 없으므로)
  setTimeout(() => {
    // 종이 초기화 (아직 안 되어 있다면)
    if (typeof initIndPaper === 'function') {
      initIndPaper();
    }

    // 모드 직접 설정
    if (typeof setQuoteMode === 'function') {
      setQuoteMode(targetMode, null);
    } else {
      // setQuoteMode가 아직 정의되지 않았으면 직접 모드 설정
      if (typeof currentQuoteMode !== 'undefined') {
        currentQuoteMode = targetMode;
        // UI 업데이트는 setQuoteMode 내부에서 처리됨
      }
    }

  }, 100);

  window.currentCategory = cat;
  // 결정된 바인딩 우선순위: 전달된 bindType > 저장된 카테고리별 내용 > 이전값 > 기본 'staple'
  if (bindType) {
    window.currentBindType = bindType;
  } else {
    const data = contentDB[cat] || {};
    // prefer the binding which has non-empty content (img or info)
    const stapleHas = (data.img && typeof data.img === 'object' && (data.img.staple || '').toString().trim()) || (data.info && typeof data.info === 'object' && (data.info.staple || '').toString().trim());
    const perfectHas = (data.img && typeof data.img === 'object' && (data.img.perfect || '').toString().trim()) || (data.info && typeof data.info === 'object' && (data.info.perfect || '').toString().trim());
    if (stapleHas && !perfectHas) window.currentBindType = 'staple';
    else if (!stapleHas && perfectHas) window.currentBindType = 'perfect';
    else window.currentBindType = window.currentBindType || 'staple';
  }

  // 모든 카테고리 링크에서 active 클래스 제거
  document.querySelectorAll('.cat-link').forEach(link => {
    link.classList.remove('active');
  });

  // 선택된 카테고리에 active 클래스 추가
  const catMap = {
    'indigo': '소량 인디고',
    'digital': '흑백 디지털',
    'offset': '대량 옵셋',
    'flyer_small': '소량 전단',
    'flyer_large': '대량 전단'
  };

  // 선택된 카테고리 링크 찾기
  const catText = catMap[cat];
  document.querySelectorAll('.cat-link').forEach(link => {
    if (link.textContent.trim() === catText) {
      link.classList.add('active');
    }
  });

  // 기본으로 상세 탭을 활성화
  if (typeof switchProductTab === 'function') switchProductTab('detail');

  const titles = {
    indigo: '소량 인디고',
    digital: '흑백 디지털',
    offset: '대량 옵셋',
    flyer_small: '소량 전단',
    flyer_large: '대량 전단'
  };

  const bindNames = {
    staple: '중철',
    perfect: '무선'
  };

  let titleText = titles[cat] || '견적 계산기';
  if ((cat === 'indigo' || cat === 'digital' || cat === 'offset') && bindType) {
    titleText += ' - ' + bindNames[bindType];
  }

  get('quote-title').textContent = titleText;

  // 인디고, 디지털, 옵셋인 경우 제본 타입에 따라 라디오 버튼 자동 선택
  if (cat === 'indigo' || cat === 'digital' || cat === 'offset') {
    setTimeout(() => {
      const radios = document.getElementsByName('ind-bind');
      radios.forEach(r => {
        if (r.value === window.currentBindType) {
          r.checked = true;
          // 라디오 버튼 스타일 업데이트
          const label = r.parentElement;
          if (label) {
            // 같은 그룹의 모든 label 초기화
            document.querySelectorAll('input[name="ind-bind"]').forEach(radio => {
              const lbl = radio.parentElement;
              if (lbl) {
                lbl.style.border = '1px solid #cbd5e1';
                lbl.style.background = '#fff';
                lbl.style.color = '#475569';
                lbl.style.fontWeight = '600';
              }
            });
            // 선택된 항목 스타일 변경
            label.style.border = '2px solid var(--primary)';
            label.style.background = '#ecfdf5';
            label.style.color = 'var(--primary)';
            label.style.fontWeight = '700';
          }
        }
      });
    }, 100);
  }

  if (typeof contentDB !== 'undefined' && contentDB[cat]) {
    applyContentToDetailTabs(cat);
    const imgEl = get('quote-indigo-img');
    if (imgEl && contentDB[cat].img) {
      let imgSrc = '';
      if (typeof contentDB[cat].img === 'string') imgSrc = contentDB[cat].img;
      else if (typeof contentDB[cat].img === 'object') {
        imgSrc = contentDB[cat].img[window.currentBindType] || contentDB[cat].img.staple || contentDB[cat].img.perfect || '';
      }
      if (imgSrc) imgEl.src = imgSrc;
    }
    // Apply text (info/guide/ship) per binding if present
    const data = contentDB[cat];
    const binding = window.currentBindType || 'staple';
    const detail = get('tab-detail-content');
    const guide = get('tab-guide-content');
    const ship = get('tab-shipping-content');

    let infoHtml = '';
    if (data.info) {
      if (typeof data.info === 'string') infoHtml = data.info;
      else if (typeof data.info === 'object') infoHtml = data.info[binding] || data.info.staple || data.info.perfect || '';
    }
    if (detail) detail.innerHTML = infoHtml || '';

    let guideHtml = '';
    if (data.guide) {
      if (typeof data.guide === 'string') guideHtml = data.guide;
      else if (typeof data.guide === 'object') guideHtml = data.guide[binding] || data.guide.staple || data.guide.perfect || '';
    }
    if (guide) guide.innerHTML = `<div style="background:#fff; border-radius:12px; padding:30px;"><h2 style="font-size:20px; font-weight:900; color:#0f172a; margin:0 0 20px 0; border-left:4px solid var(--primary); padding-left:12px;">제작 가이드</h2><div style="line-height:1.8; color:#475569;">${(guideHtml || '').replace(/\n/g,'<br>')}</div></div>`;

    let shipHtml = '';
    if (data.ship) {
      if (typeof data.ship === 'string') shipHtml = data.ship;
      else if (typeof data.ship === 'object') shipHtml = data.ship[binding] || data.ship.staple || data.ship.perfect || '';
    }
    if (ship) ship.innerHTML = `<div style="background:#fff; border-radius:12px; padding:30px;"><h2 style="font-size:20px; font-weight:900; color:#0f172a; margin:0 0 20px 0; border-left:4px solid var(--primary); padding-left:12px;">배송 안내</h2><div style="line-height:1.8; color:#475569;">${(shipHtml || '').replace(/\n/g,'<br>')}</div></div>`;
  }
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}

// Slider
let homeIdx = 0;

function slides() {
  return Array.from(document.querySelectorAll('#home-slider .home-slide'));
}

function updatePager() {
  const s = slides();
  s.forEach((el, i) => el.classList.toggle('active', i === homeIdx));

  const p = get('home-pager');
  if (p) {
    p.innerHTML = '';
    s.forEach((_, i) => {
      const dot = document.createElement('div');
      dot.className = 'home-pager-dot' + (i === homeIdx ? ' active' : '');
      dot.onclick = () => {
        homeIdx = i;
        updatePager();
        resetAutoSlide();
      };
      p.appendChild(dot);
    });
  }
}

function homeNext() {
  const s = slides();
  if (!s.length) return;
  homeIdx = (homeIdx + 1) % s.length;
  updatePager();
  resetAutoSlide();
}

function homePrev() {
  const s = slides();
  if (!s.length) return;
  homeIdx = (homeIdx - 1 + s.length) % s.length;
  updatePager();
  resetAutoSlide();
}

// 바인딩 토글 UI/함수 제거: 상단 카테고리에서 바인딩을 선택하도록 변경됨

// 자동 슬라이드
let autoSlideTimer = null;

function startAutoSlide() {
  autoSlideTimer = setInterval(() => {
    homeNext();
  }, 4000); // 4초마다 자동 넘김
}

function stopAutoSlide() {
  if (autoSlideTimer) {
    clearInterval(autoSlideTimer);
    autoSlideTimer = null;
  }
}

function resetAutoSlide() {
  stopAutoSlide();
  startAutoSlide();
}

// Initialize
renderNav();
updatePager();
updateCartBadge();
updateHomeLoginCard();
startAutoSlide();

// 슬라이더에 마우스 올리면 자동 슬라이드 일시정지
const slider = get('home-slider');
if (slider) {
  slider.addEventListener('mouseenter', stopAutoSlide);
  slider.addEventListener('mouseleave', startAutoSlide);
}

// 라디오 버튼 스타일 전환
document.addEventListener('DOMContentLoaded', function() {
  // 표지 인쇄 상세 드롭다운 변경 시 라디오 버튼 업데이트
  const coverPrintSelect = document.getElementById('ind-coverPrint-select');
  if (coverPrintSelect) {
    coverPrintSelect.addEventListener('change', function() {
      const value = this.value;
      const [print, color] = value.split('-');

      // 라디오 버튼 업데이트
      const printRadio = document.getElementById('ind-coverPrint-' + print);
      const colorRadio = document.getElementById('ind-coverColor-' + color);

      if (printRadio) {
        printRadio.checked = true;
        printRadio.dispatchEvent(new Event('change'));
      }
      if (colorRadio) {
        colorRadio.checked = true;
        colorRadio.dispatchEvent(new Event('change'));
      }
    });
  }

  // 내지 인쇄 상세 드롭다운 변경 시 라디오 버튼 업데이트
  const innerPrintSelect = document.getElementById('ind-innerPrint-select');
  if (innerPrintSelect) {
    // 포커스 이벤트에서 테두리 강제 제거
    innerPrintSelect.addEventListener('focus', function() {
      this.style.setProperty('border-color', '#cbd5e1', 'important');
      this.style.setProperty('outline', 'none', 'important');
      this.style.setProperty('box-shadow', 'none', 'important');
      this.style.setProperty('border', '1px solid #cbd5e1', 'important');
    }, true);

    innerPrintSelect.addEventListener('mousedown', function() {
      this.style.setProperty('border-color', '#cbd5e1', 'important');
      this.style.setProperty('border', '1px solid #cbd5e1', 'important');
    });

    innerPrintSelect.addEventListener('mouseup', function() {
      this.style.setProperty('border-color', '#cbd5e1', 'important');
      this.style.setProperty('border', '1px solid #cbd5e1', 'important');
    });

    innerPrintSelect.addEventListener('change', function() {
      const value = this.value;
      const [print, color] = value.split('-');

      // 테두리 즉시 제거
      this.style.setProperty('border-color', '#cbd5e1', 'important');
      this.style.setProperty('outline', 'none', 'important');
      this.style.setProperty('box-shadow', 'none', 'important');
      this.style.setProperty('border', '1px solid #cbd5e1', 'important');
      this.blur();

      // 라디오 버튼 업데이트
      const printRadio = document.getElementById('ind-innerPrint-' + print);
      const colorRadio = document.getElementById('ind-innerColor-' + color);

      if (printRadio) {
        printRadio.checked = true;
        printRadio.dispatchEvent(new Event('change'));
      }
      if (colorRadio) {
        colorRadio.checked = true;
        colorRadio.dispatchEvent(new Event('change'));
      }

      // 추가 확인
      setTimeout(() => {
        this.style.setProperty('border-color', '#cbd5e1', 'important');
        this.style.setProperty('border', '1px solid #cbd5e1', 'important');
      }, 0);
    });
  }

  // 코팅 드롭다운 변경 시 라디오 버튼 업데이트
  const coatingSelect = document.getElementById('ind-coating-select');
  if (coatingSelect) {
    coatingSelect.addEventListener('change', function() {
      const value = this.value;
      // 코팅 라디오 버튼 업데이트
      const coatRadio0 = document.getElementById('ind-coat-0');
      const coatRadio1 = document.getElementById('ind-coat-1');

      if (value === '0') {
        if (coatRadio0) {
          coatRadio0.checked = true;
          coatRadio0.dispatchEvent(new Event('change'));
        }
      } else {
        if (coatRadio1) {
          coatRadio1.checked = true;
          coatRadio1.dispatchEvent(new Event('change'));
        }
      }
    });
  }

  // 표지 페이지 드롭다운 변경 시 단면/양면 자동 선택
  const coverPagesSelect = document.getElementById('ind-coverPages');
  if (coverPagesSelect) {
    coverPagesSelect.addEventListener('change', function() {
      const pages = this.value;
      const coverPrintSelect = document.getElementById('ind-coverPrint-select');

      if (coverPrintSelect) {
        if (pages === '2') {
          // 2p 선택 시 단면 선택
          coverPrintSelect.value = '1-color';
          coverPrintSelect.dispatchEvent(new Event('change'));
        } else if (pages === '4') {
          // 4p 선택 시 양면 선택
          coverPrintSelect.value = '2-color';
          coverPrintSelect.dispatchEvent(new Event('change'));
        }
      }
    });
  }

  // 모든 라디오 버튼에 대해 이벤트 리스너 추가
  const radioGroups = ['ind-bind', 'ind-coverPrint', 'ind-coverColor', 'ind-coat', 'ind-innerPrint', 'ind-innerColor', 'ind-flyerSide'];

  radioGroups.forEach(groupName => {
    const radios = document.querySelectorAll(`input[name="${groupName}"]`);
    radios.forEach(radio => {
      radio.addEventListener('change', function() {
        // 같은 그룹의 모든 label 초기화 (라벨이 존재할 때만)
        document.querySelectorAll(`input[name="${groupName}"]`).forEach(r => {
          // 우선 라디오가 감싸인 label을 찾고, 없으면 label[for="id"] 형태로 찾음
          const lbl = r.closest('label') || document.querySelector(`label[for="${r.id}"]`);
          if (lbl && lbl.style) {
            lbl.style.border = '1px solid #cbd5e1';
            lbl.style.background = '#fff';
            lbl.style.color = '#475569';
            lbl.style.fontWeight = '600';
          }
        });

        // 선택된 항목 스타일 변경 (라벨이 있을 때만)
        const selLbl = this.closest('label') || document.querySelector(`label[for="${this.id}"]`);
        if (selLbl && selLbl.style) {
          selLbl.style.border = '2px solid var(--primary)';
          selLbl.style.background = '#ecfdf5';
          selLbl.style.color = 'var(--primary)';
          selLbl.style.fontWeight = '700';
        }
      });
    });
  });
});

// 상품 상세 탭 전환 함수
function switchProductTab(tabName) {
  // 모든 탭 버튼 초기화
  document.getElementById('tab-detail-btn').style.background = '#f1f5f9';
  document.getElementById('tab-detail-btn').style.color = '#64748b';
  document.getElementById('tab-detail-btn').style.fontWeight = '600';

  document.getElementById('tab-guide-btn').style.background = '#f1f5f9';
  document.getElementById('tab-guide-btn').style.color = '#64748b';
  document.getElementById('tab-guide-btn').style.fontWeight = '600';

  document.getElementById('tab-shipping-btn').style.background = '#f1f5f9';
  document.getElementById('tab-shipping-btn').style.color = '#64748b';
  document.getElementById('tab-shipping-btn').style.fontWeight = '600';

  // 모든 탭 콘텐츠 숨기기
  document.getElementById('tab-detail-content').style.display = 'none';
  document.getElementById('tab-guide-content').style.display = 'none';
  document.getElementById('tab-shipping-content').style.display = 'none';

  // 선택된 탭 활성화
  if (tabName === 'detail') {
    document.getElementById('tab-detail-btn').style.background = 'var(--primary)';
    document.getElementById('tab-detail-btn').style.color = '#fff';
    document.getElementById('tab-detail-btn').style.fontWeight = '700';
    document.getElementById('tab-detail-content').style.display = 'block';
  } else if (tabName === 'guide') {
    document.getElementById('tab-guide-btn').style.background = 'var(--primary)';
    document.getElementById('tab-guide-btn').style.color = '#fff';
    document.getElementById('tab-guide-btn').style.fontWeight = '700';
    document.getElementById('tab-guide-content').style.display = 'block';
  } else if (tabName === 'shipping') {
    document.getElementById('tab-shipping-btn').style.background = 'var(--primary)';
    document.getElementById('tab-shipping-btn').style.color = '#fff';
    document.getElementById('tab-shipping-btn').style.fontWeight = '700';
    document.getElementById('tab-shipping-content').style.display = 'block';
  }
}

// ==========================================
//  견적 계산기 로직
// ==========================================
const YEON_PRICE = {
  "스노우지": {
    "100": 62000,
    "120": 75000,
    "150": 95000,
    "180": 114000,
    "200": 127000
  },
  "아트지": {
    "100": 62000,
    "120": 75000,
    "150": 95000,
    "180": 114000,
    "200": 127000
  },
  "모조지": {
    "80": 51000,
    "100": 63000,
    "120": 75000,
    "150": 94000
  }
};
const OFFSET_PRICE_PER_COLOR = 5000;
const INDIGO_CLICK = {
  color: 200,
  mono: 40
};
const DIGITAL_CLICK = 20;

let currentQuoteMode = 'book_indigo';

function getRadio(name) {
  const radio = document.querySelector(`input[name="${name}"]:checked`);
  return radio ? radio.value : null;
}

function comma(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// 모드 변경 함수
function setQuoteMode(mode, el) {
  currentQuoteMode = mode;
  // 탭이 있는 경우에만 스타일 변경
  if (el) {
    document.querySelectorAll('.mode-tab-btn').forEach(b => {
      b.style.background = '#f3f4f6';
      b.style.color = '#4b5563';
      b.style.borderColor = '#e5e7eb';
    });
    el.style.background = '#1f2937';
    el.style.color = '#fff';
    el.style.borderColor = '#1f2937';
  }

  const isFlyer = mode.startsWith('flyer');

  // UI 제어
  if (isFlyer) {
    // 전단지 모드: 표지, 제본, 내지 페이지, 내지 인쇄, 제본방향 숨김
    const coverArea = get('ind-area-cover');
    const bindingArea = get('ind-area-binding');
    const bindingDirectionArea = get('ind-area-binding-direction');
    const innerPagesArea = get('ind-area-inner-pages');
    const innerPrintArea = get('ind-area-inner-print');
    const flyerSideArea = get('ind-flyer-side');

    if (coverArea) coverArea.style.display = 'none';
    if (bindingArea) bindingArea.style.display = 'none';
    if (bindingDirectionArea) bindingDirectionArea.style.display = 'none';
    if (innerPagesArea) innerPagesArea.style.display = 'none';
    if (innerPrintArea) innerPrintArea.style.display = 'none';
    if (flyerSideArea) flyerSideArea.style.display = 'block'; // 전단지 모드일 때만 표시

    // 내지 섹션은 전단지용으로 재활용 (표시하되 라벨만 변경)
    const innerArea = get('ind-area-inner');
    if (innerArea) innerArea.style.display = 'block';

    // 전단지 모드일 때는 좌우 분할 레이아웃을 단일 컬럼으로 변경
    const paperPrintContainer = get('ind-paper-print-container');
    const paperPrintDivider = get('ind-paper-print-divider');
    if (paperPrintContainer) {
      paperPrintContainer.style.display = 'block';
      paperPrintContainer.style.gridTemplateColumns = '1fr';
    }
    if (paperPrintDivider) {
      paperPrintDivider.style.display = 'none';
    }

    const titleInner = get('ind-title-inner');
    if (titleInner) titleInner.innerText = "📌 용지 및 인쇄";

    const labelInnerType = get('ind-innerType')?.previousElementSibling;
    if (labelInnerType) labelInnerType.innerText = "용지 상세";

    const labelInnerColor = get('ind-label-inner-color');
    if (labelInnerColor) labelInnerColor.innerText = "인쇄 상세";

    // 인쇄 상세 드롭다운 테두리 강제 제거
    setTimeout(() => {
      const coverPrintSelect = get('ind-coverPrint-select');
      const innerPrintSelect = get('ind-innerPrint-select');
      if (coverPrintSelect) {
        coverPrintSelect.blur();
        coverPrintSelect.style.setProperty('border-color', '#cbd5e1', 'important');
        coverPrintSelect.style.setProperty('border', '1px solid #cbd5e1', 'important');
        coverPrintSelect.style.setProperty('outline', 'none', 'important');
        coverPrintSelect.style.setProperty('box-shadow', 'none', 'important');
      }
      if (innerPrintSelect) {
        innerPrintSelect.blur();
        innerPrintSelect.style.setProperty('border-color', '#cbd5e1', 'important');
        innerPrintSelect.style.setProperty('border', '1px solid #cbd5e1', 'important');
        innerPrintSelect.style.setProperty('outline', 'none', 'important');
        innerPrintSelect.style.setProperty('box-shadow', 'none', 'important');
      }
    }, 100);
  } else {
    // 책자 모드
    const coverArea = get('ind-area-cover');
    const bindingArea = get('ind-area-binding');
    const bindingDirectionArea = get('ind-area-binding-direction');
    const innerPagesArea = get('ind-area-inner-pages');
    const innerPrintArea = get('ind-area-inner-print');
    const flyerSideArea = get('ind-flyer-side');

    if (coverArea) coverArea.style.display = 'block';
    if (bindingDirectionArea) bindingDirectionArea.style.display = 'block';
    if (innerPagesArea) innerPagesArea.style.display = 'block';
    if (innerPrintArea) innerPrintArea.style.display = 'block';
    if (flyerSideArea) flyerSideArea.style.display = 'none';

    // 책자 모드일 때는 좌우 분할 레이아웃으로 복원
    const paperPrintContainer = get('ind-paper-print-container');
    const paperPrintDivider = get('ind-paper-print-divider');
    if (paperPrintContainer) {
      paperPrintContainer.style.display = 'grid';
      paperPrintContainer.style.gridTemplateColumns = '1fr 1px 1fr';
    }
    if (paperPrintDivider) {
      paperPrintDivider.style.display = 'block';
    }

    // 소량 인디고, 흑백 디지털, 대량 옵셋 모드일 때는 후가공 섹션 숨김 (드롭다운에서 이미 선택함)
    if (mode === 'book_indigo' || mode === 'book_digital' || mode === 'book_offset') {
      if (bindingArea) bindingArea.style.display = 'none';
    }

    const titleInner = get('ind-title-inner');
    if (titleInner) titleInner.innerText = "📌 내지";

    const labelInnerType = get('ind-innerType')?.previousElementSibling;
    if (labelInnerType) labelInnerType.innerText = "용지 상세";

    // 인쇄 상세 드롭다운 테두리 강제 제거
    setTimeout(() => {
      const coverPrintSelect = get('ind-coverPrint-select');
      const innerPrintSelect = get('ind-innerPrint-select');
      if (coverPrintSelect) {
        coverPrintSelect.blur();
        coverPrintSelect.style.setProperty('border-color', '#cbd5e1', 'important');
        coverPrintSelect.style.setProperty('border', '1px solid #cbd5e1', 'important');
        coverPrintSelect.style.setProperty('outline', 'none', 'important');
        coverPrintSelect.style.setProperty('box-shadow', 'none', 'important');
      }
      if (innerPrintSelect) {
        innerPrintSelect.blur();
        innerPrintSelect.style.setProperty('border-color', '#cbd5e1', 'important');
        innerPrintSelect.style.setProperty('border', '1px solid #cbd5e1', 'important');
        innerPrintSelect.style.setProperty('outline', 'none', 'important');
        innerPrintSelect.style.setProperty('box-shadow', 'none', 'important');
      }
    }, 100);

    const labelInnerColor = get('ind-label-inner-color');
    if (labelInnerColor) labelInnerColor.innerText = "내지 색상";
  }

  // 흑백 모드 제어
  if (mode.includes('digital')) {
    const monoRadio = document.querySelector('input[name="ind-innerColor"][value="mono"]');
    if (monoRadio) {
      monoRadio.checked = true;
      monoRadio.dispatchEvent(new Event('change'));
    }
    const colorRadio = document.querySelector('input[name="ind-innerColor"][value="color"]');
    if (colorRadio) colorRadio.disabled = true;

    // 흑백 디지털 모드일 때 인쇄 상세 드롭다운을 흑백 옵션만 표시
    const innerPrintSelect = get('ind-innerPrint-select');
    if (innerPrintSelect) {
      // 현재 선택된 값 확인
      const currentValue = innerPrintSelect.value;
      const [printType] = currentValue.split('-');

      // 흑백 옵션만 남기고 컬러 옵션 제거
      innerPrintSelect.innerHTML = '';
      const option2Mono = document.createElement('option');
      option2Mono.value = '2-mono';
      option2Mono.textContent = '양면 흑백';
      innerPrintSelect.appendChild(option2Mono);

      const option1Mono = document.createElement('option');
      option1Mono.value = '1-mono';
      option1Mono.textContent = '단면 흑백';
      innerPrintSelect.appendChild(option1Mono);

      // 현재 값이 흑백이면 유지, 아니면 양면 흑백으로 설정
      const newValue = (currentValue.includes('-mono')) ? currentValue : printType + '-mono';
      innerPrintSelect.value = newValue;

      // 테두리 강제 제거
      innerPrintSelect.style.setProperty('border-color', '#cbd5e1', 'important');
      innerPrintSelect.style.setProperty('border', '1px solid #cbd5e1', 'important');
      innerPrintSelect.style.setProperty('outline', 'none', 'important');
      innerPrintSelect.style.setProperty('box-shadow', 'none', 'important');
      innerPrintSelect.blur();

      // 라디오 버튼 업데이트
      const [finalPrintType] = newValue.split('-');
      const printRadio = document.getElementById('ind-innerPrint-' + finalPrintType);
      const colorRadioInner = document.getElementById('ind-innerColor-mono');
      if (printRadio) printRadio.checked = true;
      if (colorRadioInner) colorRadioInner.checked = true;

      // 추가 확인
      setTimeout(() => {
        innerPrintSelect.style.setProperty('border-color', '#cbd5e1', 'important');
        innerPrintSelect.style.setProperty('border', '1px solid #cbd5e1', 'important');
        innerPrintSelect.blur();
      }, 0);
    }
  } else {
    const colorRadio = document.querySelector('input[name="ind-innerColor"][value="color"]');
    if (colorRadio) colorRadio.disabled = false;

    // 다른 모드일 때는 모든 옵션 표시
    const innerPrintSelect = get('ind-innerPrint-select');
    if (innerPrintSelect) {
      // 옵션이 이미 있으면 그대로 유지, 없으면 다시 생성
      if (innerPrintSelect.children.length === 2) {
        innerPrintSelect.innerHTML = '';
        const options = [{
            value: '2-color',
            text: '양면 컬러'
          },
          {
            value: '2-mono',
            text: '양면 흑백'
          },
          {
            value: '1-color',
            text: '단면 컬러'
          },
          {
            value: '1-mono',
            text: '단면 흑백'
          }
        ];
        options.forEach(opt => {
          const option = document.createElement('option');
          option.value = opt.value;
          option.textContent = opt.text;
          innerPrintSelect.appendChild(option);
        });

        // 기본값 설정 (현재 값이 유효하면 유지)
        const currentValue = innerPrintSelect.value;
        if (!currentValue || !options.find(o => o.value === currentValue)) {
          innerPrintSelect.value = '2-color';
        }
      }
    }
  }
}

// 종이 초기화
function initIndPaper() {
  const c = get('ind-coverType');
  const i = get('ind-innerType');
  if (!c || !i) return;

  for (let k in YEON_PRICE) {
    let opt = document.createElement('option');
    opt.value = k;
    opt.innerText = k;
    c.appendChild(opt.cloneNode(true));
    i.appendChild(opt.cloneNode(true));
  }
  updateIndGram('cover');
  updateIndGram('inner');

  // 내지 페이지 옵션 생성 (4페이지부터 500페이지까지 4페이지 단위)
  const innerPagesSelect = get('ind-innerPages');
  if (innerPagesSelect) {
    innerPagesSelect.innerHTML = '';
    for (let p = 4; p <= 500; p += 4) {
      let opt = document.createElement('option');
      opt.value = p;
      opt.innerText = p + '페이지';
      if (p === 64) opt.selected = true; // 기본값 64페이지
      innerPagesSelect.appendChild(opt);
    }
  }
}

// 평량 업데이트
function updateIndGram(t) {
  const typeEl = get('ind-' + t + 'Type');
  const gramEl = get('ind-' + t + 'Gram');
  if (!typeEl || !gramEl) return;

  const type = typeEl.value;
  gramEl.innerHTML = "";
  if (YEON_PRICE[type]) {
    for (let g in YEON_PRICE[type]) {
      let opt = document.createElement('option');
      opt.value = g;
      opt.innerText = g + "g";
      gramEl.appendChild(opt);
    }
  }
}

// 사이즈 타입 선택 함수
function selectSizeType(type) {
  const standardBtn = get('size-type-standard');
  const customBtn = get('size-type-custom');
  const standardContainer = get('size-standard-container');
  const customContainer = get('size-custom-container');

  if (type === 'standard') {
    standardBtn.style.background = '#1f2937';
    standardBtn.style.color = '#fff';
    customBtn.style.background = '#f3f4f6';
    customBtn.style.color = '#64748b';
    standardContainer.style.display = 'block';
    customContainer.style.display = 'none';
    // 규격사이즈 선택 시 값 업데이트
    updateSizeFromStandard();
  } else {
    standardBtn.style.background = '#f3f4f6';
    standardBtn.style.color = '#64748b';
    customBtn.style.background = '#1f2937';
    customBtn.style.color = '#fff';
    standardContainer.style.display = 'none';
    customContainer.style.display = 'block';
  }
}

// 규격사이즈 선택 시 가로×세로 값 업데이트
function updateSizeFromStandard() {
  const standardSelect = get('ind-bookSize-standard');
  if (!standardSelect) return;

  const selectedValue = standardSelect.value;
  const cuttingContainer = get('size-cutting-container');

  if (selectedValue === 'custom') {
    // 사이즈입력 선택 시 재단사이즈 입력 필드 활성화
    if (cuttingContainer) {
      cuttingContainer.style.display = 'flex';
    }
    const widthInput = get('ind-size-width');
    const heightInput = get('ind-size-height');
    if (widthInput && heightInput) {
      widthInput.value = '';
      heightInput.value = '';
      widthInput.focus();
    }
  } else {
    // 표준 사이즈 선택 시 값 자동 입력
    const [width, height] = selectedValue.split('×').map(v => parseInt(v));

    const widthInput = get('ind-size-width');
    const heightInput = get('ind-size-height');
    const workingWidthInput = get('ind-size-working-width');
    const workingHeightInput = get('ind-size-working-height');

    if (widthInput && heightInput) {
      widthInput.value = width;
      heightInput.value = height;
    }

    // 작업사이즈는 재단사이즈보다 약간 크게 설정 (기본 +4mm)
    if (workingWidthInput && workingHeightInput) {
      workingWidthInput.value = width + 4;
      workingHeightInput.value = height + 4;
    }

    // 재단사이즈 컨테이너는 표시
    if (cuttingContainer) {
      cuttingContainer.style.display = 'flex';
    }
  }
}

// 수량 변경 함수
function changeQty(delta) {
  const qtyInput = get('ind-qty');
  if (!qtyInput) return;

  const currentQty = parseInt(qtyInput.value) || 0;
  const newQty = Math.max(0, currentQty + delta);
  qtyInput.value = newQty;
}

// 빠른 수량 추가 함수
function quickAddQty(amount) {
  const qtyInput = get('ind-qty');
  if (!qtyInput) return;

  const currentQty = parseInt(qtyInput.value) || 0;
  qtyInput.value = currentQty + amount;
}

// 계산 함수
function calculateIndigo() {
  // 재단사이즈 또는 작업사이즈 선택 확인
  const sizeType = document.querySelector('input[name="size-type"]:checked');
  let width, height;

  if (sizeType && sizeType.value === 'working') {
    // 작업사이즈 사용
    width = parseInt(get('ind-size-working-width').value) || 0;
    height = parseInt(get('ind-size-working-height').value) || 0;
  } else {
    // 재단사이즈 사용 (기본)
    width = parseInt(get('ind-size-width').value) || 0;
    height = parseInt(get('ind-size-height').value) || 0;
  }

  if (!width || !height) {
    toast('가로와 세로 사이즈를 입력해주세요.');
    return;
  }

  // 표준 사이즈 판단 (mm 기준)
  let size = '';
  if (width === 210 && height === 297) size = 'A4';
  else if (width === 148 && height === 210) size = 'A5';
  else if (width === 182 && height === 257) size = 'B5';
  else {
    // 비표준 사이즈인 경우 가로 기준으로 가장 가까운 사이즈 선택
    if (width <= 160) size = 'A5';
    else if (width <= 200) size = 'B5';
    else size = 'A4';
  }

  const qty = parseInt(get('ind-qty').value) || 0;
  const margin = parseInt(get('ind-margin').value) || 0;

  if (currentQuoteMode.startsWith('flyer')) {
    calculateFlyer(size, qty, margin, width, height);
  } else {
    calculateBook(size, qty, margin, width, height);
  }
}

// 전단지 계산
function calculateFlyer(size, qty, margin, width, height) {
  const inType = get('ind-innerType').value;
  const inGram = get('ind-innerGram').value;
  if (!YEON_PRICE[inType] || !YEON_PRICE[inType][inGram]) {
    toast('종이 종류와 평량을 선택해주세요.');
    return;
  }
  const inPrice = YEON_PRICE[inType][inGram];

  // 전단지 모드에서는 인쇄 상세 드롭다운에서 단면/양면 및 색상 정보 가져오기
  let isDouble = true; // 기본값 양면
  let inColor = 'color'; // 기본값 컬러
  const innerPrintSelect = get('ind-innerPrint-select');
  if (innerPrintSelect) {
    const printValue = innerPrintSelect.value;
    // "2-color" 형식에서 첫 번째 숫자가 2면 양면, 1이면 단면
    const [printType, colorType] = printValue.split('-');
    isDouble = (printType === '2');
    inColor = colorType || 'color';
  } else {
    // 드롭다운이 없으면 라디오 버튼에서 가져오기 (하위 호환)
    inColor = getRadio('ind-innerColor') || 'color';
    const flyerSide = getRadio('ind-flyerSide');
    isDouble = (flyerSide === 'double');
  }

  let yieldSmall = 0;
  let yieldLarge = 0;

  if (size === 'A4') {
    yieldSmall = 2;
    yieldLarge = 8;
  } else if (size === 'A5') {
    yieldSmall = 4;
    yieldLarge = 16;
  } else if (size === 'B5') {
    yieldSmall = 2;
    yieldLarge = 8;
  }

  let pPaper = 0,
    pPrint = 0,
    pPlate = 0;

  if (currentQuoteMode === 'flyer_small') {
    const sheetsA3 = Math.ceil(qty / yieldSmall);
    const priceA3 = inPrice / 2000;
    pPaper = Math.round(sheetsA3 * priceA3);

    const clickUnit = INDIGO_CLICK[inColor];
    const finalClick = isDouble ? clickUnit : (clickUnit / 2);
    pPrint = sheetsA3 * finalClick;
  } else {
    const plateUnit = size.startsWith('B') ? 8000 : 11000;
    const plates = (inColor === 'color' ? 4 : 1) * (isDouble ? 2 : 1);
    pPlate = plates * plateUnit;

    const sheetsFull = Math.ceil(qty / yieldLarge);
    const yeon = sheetsFull / 500;
    pPaper = Math.round(yeon * inPrice);

    const degrees = (inColor === 'color' ? 4 : 1) * (isDouble ? 2 : 1);
    const printYeon = Math.max(1, yeon);
    pPrint = Math.round(printYeon * degrees * OFFSET_PRICE_PER_COLOR);
  }

  const totalRaw = pPaper + pPrint + pPlate;
  const totalMargin = totalRaw * (1 + margin / 100);
  const vat = totalMargin * 0.1;
  const final = Math.floor((totalMargin + vat) / 10) * 10;
  const perUnit = Math.round(final / qty);

  // 결과 표시
  get('sum-cat').textContent = currentQuoteMode === 'flyer_small' ? '소량 전단' : '대량 전단';
  get('sum-qty').textContent = qty + '장';
  get('sum-supply').textContent = comma(Math.round(totalMargin)) + '원';
  get('sum-vat').textContent = comma(Math.round(vat)) + '원';
  get('sum-ship').textContent = '-';
  get('sum-total').textContent = comma(final) + '원';
}

// 책자 계산
function calculateBook(size, qty, margin, width, height) {
  const innerPages = parseInt(get('ind-innerPages').value) || 0;
  const cvType = get('ind-coverType').value;
  const cvGram = get('ind-coverGram').value;
  const inType = get('ind-innerType').value;
  const inGram = get('ind-innerGram').value;

  if (!YEON_PRICE[cvType] || !YEON_PRICE[cvType][cvGram]) {
    toast('표지 종이 종류와 평량을 선택해주세요.');
    return;
  }
  if (!YEON_PRICE[inType] || !YEON_PRICE[inType][inGram]) {
    toast('내지 종이 종류와 평량을 선택해주세요.');
    return;
  }

  const cvPrice = YEON_PRICE[cvType][cvGram];
  const inPrice = YEON_PRICE[inType][inGram];
  // 드롭다운에서 선택한 제본 타입 우선 사용, 없으면 라디오 버튼에서 가져오기
  const bindType = window.currentBindType || getRadio('ind-bind') || 'perfect';
  // 코팅 값 가져오기 (드롭다운 또는 라디오 버튼)
  let coating = '0';
  const coatingSelect = get('ind-coating-select');
  if (coatingSelect) {
    coating = coatingSelect.value === '0' ? '0' : '1';
  } else {
    coating = getRadio('ind-coat') || '0';
  }
  const cvColor = getRadio('ind-coverColor') || 'color';
  const inColor = getRadio('ind-innerColor') || 'color';

  let cvP = 0,
    cvPr = 0,
    cvPl = 0,
    cvC = 0;
  let inP = 0,
    inPr = 0,
    inPl = 0;
  let bind = 0;

  if (currentQuoteMode === 'book_offset') {
    const pagesPerForm = (size === 'A5') ? 32 : 16;
    const plateUnit = (size === 'B5') ? 8000 : 11000;
    const isSelfCover = (bindType === 'staple' && cvType === inType);

    if (isSelfCover) {
      if (coating === '1') cvC = (qty <= 500) ? 45000 : 80000;
      const totalPages = innerPages + 4;
      const daesu = Math.ceil((totalPages / pagesPerForm) * 2) / 2;
      const plates = Math.ceil(daesu * (inColor === 'color' ? 8 : 2));
      inPl = plates * plateUnit;
      const yeon = (daesu * qty) / 500;
      inP = Math.round(yeon * inPrice);
      inPr = Math.round(Math.max(1, yeon) * (inColor === 'color' ? 8 : 2) * OFFSET_PRICE_PER_COLOR);
    } else {
      const cvPlates = (cvColor === 'color') ? 4 : 1;
      cvPl = cvPlates * 8000;
      const cvYeon = (qty / ((size === 'A5') ? 4 : 2)) / 500;
      cvP = Math.round(cvYeon * (cvPrice / 2));
      cvPr = Math.round(Math.max(1, cvYeon) * cvPlates * OFFSET_PRICE_PER_COLOR);
      if (coating === '1') cvC = (qty <= 500) ? 45000 : 80000;

      const daesu = Math.ceil((innerPages / pagesPerForm) * 2) / 2;
      inPl = Math.ceil(daesu * (inColor === 'color' ? 8 : 2)) * plateUnit;
      const yeon = (daesu * qty) / 500;
      inP = Math.round(yeon * inPrice);
      inPr = Math.round(Math.max(1, yeon) * (inColor === 'color' ? 8 : 2) * OFFSET_PRICE_PER_COLOR);
    }
    bind = 50000 + (qty * 300);
  } else {
    const cvSheet = cvPrice / 2000;
    cvP = Math.round(qty * cvSheet);
    const cClick = (currentQuoteMode === 'book_digital' || cvColor === 'color') ? INDIGO_CLICK.color : INDIGO_CLICK.mono;
    cvPr = qty * cClick;
    if (coating === '1') cvC = qty * 300;

    const inSheet = inPrice / 2000;
    const factor = (size === 'A5') ? 8 : 4;
    const sheets = Math.ceil(innerPages / factor) * qty;
    inP = Math.round(sheets * inSheet);
    let iClick = (currentQuoteMode === 'book_digital') ? DIGITAL_CLICK : INDIGO_CLICK[inColor];
    inPr = sheets * iClick;
    bind = qty * (bindType === 'staple' ? 200 : 400);
  }

  const totalRaw = cvP + cvPr + cvPl + cvC + inP + inPr + inPl + bind;
  const totalMargin = totalRaw * (1 + margin / 100);
  const vat = totalMargin * 0.1;
  const final = Math.floor((totalMargin + vat) / 10) * 10;
  const perUnit = Math.round(final / qty);

  // 결과 표시
  const modeNames = {
    'book_indigo': '소량',
    'book_digital': '흑백',
    'book_offset': '대량'
  };
  const bindNames = {
    'staple': '중철',
    'perfect': '무선'
  };
  // 드롭다운에서 선택한 제본 타입 우선 사용, 없으면 라디오 버튼에서 가져오기
  const selectedBindType = window.currentBindType || getRadio('ind-bind') || 'perfect';
  const bindText = bindNames[selectedBindType] || '무선';
  const modeText = modeNames[currentQuoteMode] || '책자';
  get('sum-cat').textContent = modeText + ' ' + bindText;
  get('sum-qty').textContent = qty + '권';
  get('sum-supply').textContent = comma(Math.round(totalMargin)) + '원';
  get('sum-vat').textContent = comma(Math.round(vat)) + '원';
  get('sum-ship').textContent = '-';
  get('sum-total').textContent = comma(final) + '원';
}

// 전단지 라디오 버튼도 스타일 처리
document.addEventListener('DOMContentLoaded', function() {
  // 사이즈 초기화
  if (get('ind-bookSize-standard')) {
    updateSizeFromStandard();
  }

  // 재단사이즈 입력 시 작업사이즈 자동 계산
  const widthInput = get('ind-size-width');
  const heightInput = get('ind-size-height');
  if (widthInput && heightInput) {
    widthInput.addEventListener('input', function() {
      updateWorkingSize();
    });
    heightInput.addEventListener('input', function() {
      updateWorkingSize();
    });
  }

  function updateWorkingSize() {
    const width = parseInt(get('ind-size-width').value) || 0;
    const height = parseInt(get('ind-size-height').value) || 0;
    const workingWidthInput = get('ind-size-working-width');
    const workingHeightInput = get('ind-size-working-height');
    if (workingWidthInput && workingHeightInput && width > 0 && height > 0) {
      workingWidthInput.value = width + 4;
      workingHeightInput.value = height + 4;
    }
  }


  const flyerRadios = document.querySelectorAll('input[name="ind-flyerSide"]');
  flyerRadios.forEach(radio => {
    radio.addEventListener('change', function() {
      flyerRadios.forEach(r => {
        const label = r.parentElement;
        label.style.border = '1px solid #cbd5e1';
        label.style.background = '#fff';
        label.style.color = '#475569';
        label.style.fontWeight = '600';
      });
      const selectedLabel = this.parentElement;
      selectedLabel.style.border = '2px solid var(--primary)';
      selectedLabel.style.background = '#ecfdf5';
      selectedLabel.style.color = 'var(--primary)';
      selectedLabel.style.fontWeight = '700';
    });
  });

  // 종이 초기화
  if (get('ind-coverType')) {
    initIndPaper();
    // 탭이 없으므로 null 전달
    if (typeof setQuoteMode === 'function') {
      setQuoteMode('book_indigo', null);
    }
  }
});