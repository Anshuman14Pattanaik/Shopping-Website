/* ============================================================
   SHOPPING WEB — Application Logic (Complete)
============================================================ */

// ── Constants ──────────────────────────────────────────────
const FREE_SHIPPING = 200;
const SHIPPING_COST = 12;

// Currency rates relative to USD
const CURRENCY_RATES = {
  USD: { rate: 1,      symbol: '$',    label: 'USD' },
  INR: { rate: 83.5,   symbol: '₹',    label: 'INR' },
  EUR: { rate: 0.92,   symbol: '€',    label: 'EUR' },
  GBP: { rate: 0.79,   symbol: '£',    label: 'GBP' },
  AED: { rate: 3.67,   symbol: 'د.إ ', label: 'AED' },
  JPY: { rate: 149.5,  symbol: '¥',    label: 'JPY' },
  CAD: { rate: 1.36,   symbol: 'C$',   label: 'CAD' },
  AUD: { rate: 1.53,   symbol: 'A$',   label: 'AUD' }
};

const COLOR_MAP = {
  black: '#222', white: '#eee', blue: '#3b82f6',
  green: '#22c55e', brown: '#92400e', beige: '#d4b896',
  red: '#ef4444', pink: '#ec4899'
};

const CATEGORY_CFG = {
  tops:        { emoji: '👔', grad: 'linear-gradient(135deg,#667eea,#764ba2)' },
  bottoms:     { emoji: '👖', grad: 'linear-gradient(135deg,#2563eb,#7c3aed)' },
  shoes:       { emoji: '👟', grad: 'linear-gradient(135deg,#f97316,#ef4444)' },
  outerwear:   { emoji: '🧥', grad: 'linear-gradient(135deg,#059669,#0d9488)' },
  bags:        { emoji: '👜', grad: 'linear-gradient(135deg,#e11d48,#be185d)' },
  accessories: { emoji: '💎', grad: 'linear-gradient(135deg,#0ea5e9,#6366f1)' }
};

// ── State ──────────────────────────────────────────────────
let allProducts    = [];
let filtered       = [];
let bundle         = [];
let instanceCounter = 0;
let currentUser    = null;
let currentCurrency = 'USD';
let dragCounter    = 0;
let dialogProductId = null;

const filters = {
  category: 'all',
  color:    'all',
  season:   'all',
  maxPrice: 300,
  search:   ''
};

// ── DOM Helpers ────────────────────────────────────────────
const $  = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);

const dom = {
  // login
  loginOverlay:  $('#login-overlay'),
  panelLogin:    $('#panel-login'),
  panelRegister: $('#panel-register'),
  formLogin:     $('#form-login'),
  formRegister:  $('#form-register'),
  btnGoogle:     $('#btn-google'),
  btnX:          $('#btn-x'),
  goRegister:    $('#go-register'),
  goLogin:       $('#go-login'),
  // app
  mainHeader:    $('#main-header'),
  mainFilters:   $('#main-filters'),
  mainContent:   $('#main-content'),
  // header
  userAvatar:    $('#user-avatar'),
  userInitial:   $('#user-initial'),
  logoutBtn:     $('#logout-btn'),
  currencySelect:$('#currency-select'),
  themeToggle:   $('#theme-toggle'),
  themeIcon:     $('#theme-icon'),
  search:        $('#search'),
  // filters
  priceRange:    $('#price-range'),
  priceVal:      $('#price-val'),
  resultsCount:  $('#results-count'),
  clearFilters:  $('#clear-filters'),
  // catalog
  grid:          $('#product-grid'),
  noResults:     $('#no-results'),
  template:      $('#product-card-template'),
  // builder
  dropZone:      $('#drop-zone'),
  dropPh:        $('#drop-ph'),
  bundleList:    $('#bundle-list'),
  clearBundle:   $('#clear-bundle'),
  shipMsg:       $('#ship-msg'),
  shipFill:      $('#ship-fill'),
  sCount:        $('#s-count'),
  sSub:          $('#s-sub'),
  sShip:         $('#s-ship'),
  sTotal:        $('#s-total'),
  ctaBtn:        $('#cta-btn'),
  // dialogs
  dialog:        $('#qv-dialog'),
  payDialog:     $('#pay-dialog'),
  toasts:        $('#toast-container')
};

// ── Fallback Data ──────────────────────────────────────────
const FALLBACK = [
  {"id":1,"name":"Silk Blouse","price":68,"category":"tops","color":"white","season":"spring","image":"https://m.media-amazon.com/images/I/71VFs2XrDVL._AC_UY350_.jpg","description":"Elegant silk blouse with pearl buttons and a relaxed fit perfect for layering."},
  {"id":2,"name":"Cashmere Sweater","price":120,"category":"tops","color":"beige","season":"winter","image":"https://static.aceomni.cmsaceturtle.com/prod/product-image/aceomni/Wrangler/Monobrand/WMJK005313/WMJK005313_1.jpg","description":"Ultra-soft cashmere crew neck sweater for ultimate warmth and luxury."},
  {"id":3,"name":"Linen Camp Shirt","price":55,"category":"tops","color":"blue","season":"summer","image":"https://assets.myntassets.com/dpr_1.5,q_30,w_400,c_limit,fl_progressive/assets/images/2025/DECEMBER/29/whOIuYJh_53cefe3ad52f4621929279281260e4b5.jpg","description":"Breathable linen camp collar shirt with a relaxed summer silhouette."},
  {"id":4,"name":"Graphic Tee","price":35,"category":"tops","color":"black","season":"all-season","image":"https://m.media-amazon.com/images/I/81auLqNjbSL._AC_UY1100_.jpg","description":"Premium heavyweight cotton tee with abstract geometric print."},
  {"id":5,"name":"Slim Chinos","price":75,"category":"bottoms","color":"beige","season":"spring","image":"https://m.media-amazon.com/images/I/71Y7lPLUXkL._AC_UY1100_.jpg","description":"Tailored slim-fit chino trousers with a modern tapered leg."},
  {"id":6,"name":"Selvedge Denim","price":90,"category":"bottoms","color":"blue","season":"all-season","image":"https://5.imimg.com/data5/SELLER/Default/2024/12/469933097/YK/BI/XC/37190943/men-track-pants-500x500.jpg","description":"Japanese selvedge denim jeans with a classic straight-leg fit."},
  {"id":7,"name":"Pleated Trousers","price":85,"category":"bottoms","color":"black","season":"fall","image":"https://wearmarts.com/public/uploads/all/QidctaSCny0LdBO5abjoXTmxOzWbeuNcoUaSFtak.png","description":"High-waisted pleated wool-blend trousers with a sophisticated drape."},
  {"id":8,"name":"Cargo Pants","price":65,"category":"bottoms","color":"green","season":"all-season","image":"https://static.cilory.com/771131-thickbox_default/mens-sage-green-acid-washed-bell-bottom-denim-jeans.jpg","description":"Relaxed-fit cargo pants with multiple utility pockets."},
  {"id":9,"name":"Leather Sneakers","price":130,"category":"shoes","color":"white","season":"all-season","image":"https://www.campusshoes.com/cdn/shop/files/LEVEL_LEVEL_WHT-L.GRY_07_831c7a2c-ff1b-4011-9268-b11f984219c6.webp?v=1757580207","description":"Minimalist full-grain leather sneakers with a clean low-top profile."},
  {"id":10,"name":"Chelsea Boots","price":160,"category":"shoes","color":"brown","season":"fall","image":"https://bugattishoes.in/cdn/shop/files/322-A9S01-6900-4100.jpg?v=1762412735","description":"Italian suede Chelsea boots with elastic side panels and stacked heel."},
  {"id":11,"name":"Canvas Loafers","price":70,"category":"shoes","color":"beige","season":"summer","image":"https://m.media-amazon.com/images/I/61iq+p8OrdL._AC_UY1000_.jpg","description":"Lightweight canvas slip-on loafers with a cushioned insole."},
  {"id":12,"name":"Running Shoes","price":110,"category":"shoes","color":"black","season":"all-season","image":"https://shop.teamsg.in/cdn/shop/files/22-07-202401188.png?v=1744374583","description":"Performance running shoes with responsive cushioning and breathable mesh."},
  {"id":13,"name":"Wool Overcoat","price":220,"category":"outerwear","color":"black","season":"winter","image":"https://m.media-amazon.com/images/I/71VFs2XrDVL._AC_UY350_.jpg","description":"Tailored double-breasted Italian wool overcoat with satin lining."},
  {"id":14,"name":"Bomber Jacket","price":145,"category":"outerwear","color":"green","season":"fall","image":"https://static.aceomni.cmsaceturtle.com/prod/product-image/aceomni/Wrangler/Monobrand/WMJK005313/WMJK005313_1.jpg","description":"Classic nylon bomber jacket with ribbed cuffs and brass zipper."},
  {"id":15,"name":"Denim Jacket","price":95,"category":"outerwear","color":"blue","season":"spring","image":"https://assets.myntassets.com/dpr_1.5,q_30,w_400,c_limit,fl_progressive/assets/images/2025/DECEMBER/29/whOIuYJh_53cefe3ad52f4621929279281260e4b5.jpg","description":"Vintage-wash trucker denim jacket with copper hardware details."},
  {"id":16,"name":"Rain Parka","price":175,"category":"outerwear","color":"black","season":"spring","image":"https://m.media-amazon.com/images/I/81auLqNjbSL._AC_UY1100_.jpg","description":"Waterproof hooded parka with sealed seams and adjustable drawcord."},
  {"id":17,"name":"Leather Tote","price":140,"category":"bags","color":"brown","season":"all-season","image":"https://m.media-amazon.com/images/I/71Y7lPLUXkL._AC_UY1100_.jpg","description":"Full-grain vegetable-tanned leather tote with interior laptop sleeve."},
  {"id":18,"name":"Canvas Backpack","price":85,"category":"bags","color":"green","season":"all-season","image":"https://5.imimg.com/data5/SELLER/Default/2024/12/469933097/YK/BI/XC/37190943/men-track-pants-500x500.jpg","description":"Waxed canvas backpack with leather straps and brass buckle closures."},
  {"id":19,"name":"Crossbody Bag","price":60,"category":"bags","color":"black","season":"all-season","image":"https://wearmarts.com/public/uploads/all/QidctaSCny0LdBO5abjoXTmxOzWbeuNcoUaSFtak.png","description":"Compact nylon crossbody bag with adjustable webbing shoulder strap."},
  {"id":20,"name":"Weekend Duffle","price":115,"category":"bags","color":"beige","season":"all-season","image":"https://static.cilory.com/771131-thickbox_default/mens-sage-green-acid-washed-bell-bottom-denim-jeans.jpg","description":"Spacious canvas and leather duffle bag perfect for weekend getaways."},
  {"id":21,"name":"Silk Scarf","price":45,"category":"accessories","color":"red","season":"spring","image":"https://www.campusshoes.com/cdn/shop/files/LEVEL_LEVEL_WHT-L.GRY_07_831c7a2c-ff1b-4011-9268-b11f984219c6.webp?v=1757580207","description":"Hand-rolled silk twill scarf with an original abstract watercolor print."},
  {"id":22,"name":"Leather Belt","price":55,"category":"accessories","color":"brown","season":"all-season","image":"https://bugattishoes.in/cdn/shop/files/322-A9S01-6900-4100.jpg?v=1762412735","description":"Full-grain English bridle leather belt with solid brass roller buckle."},
  {"id":23,"name":"Aviator Sunglasses","price":95,"category":"accessories","color":"black","season":"summer","image":"https://m.media-amazon.com/images/I/61iq+p8OrdL._AC_UY1000_.jpg","description":"Titanium frame aviator sunglasses with polarized CR-39 lenses."},
  {"id":24,"name":"Merino Beanie","price":30,"category":"accessories","color":"red","season":"winter","image":"https://shop.teamsg.in/cdn/shop/files/22-07-202401188.png?v=1744374583","description":"Fine-gauge merino wool ribbed beanie with a classic fold-over cuff."}
];

// ============================================================
// CURRENCY HELPERS
// ============================================================
function convertPrice(usdPrice) {
  const cfg = CURRENCY_RATES[currentCurrency];
  const converted = usdPrice * cfg.rate;
  // No decimals for JPY and INR (round), others 2dp
  if (currentCurrency === 'JPY') return `${cfg.symbol}${Math.round(converted)}`;
  if (currentCurrency === 'INR') return `${cfg.symbol}${Math.round(converted).toLocaleString('en-IN')}`;
  return `${cfg.symbol}${converted.toFixed(2)}`;
}

function convertRaw(usdPrice) {
  return usdPrice * CURRENCY_RATES[currentCurrency].rate;
}

// ============================================================
// LOGIN / AUTH
// ============================================================
function setupLogin() {
  // Toggle panels
  dom.goRegister.addEventListener('click', () => {
    dom.panelLogin.hidden = true;
    dom.panelRegister.hidden = false;
  });
  dom.goLogin.addEventListener('click', () => {
    dom.panelRegister.hidden = true;
    dom.panelLogin.hidden = false;
  });

  // Password visibility toggles
  setupPwToggle('pw-toggle-li', 'li-pass');
  setupPwToggle('pw-toggle-reg', 'reg-pass');

  // Social login (simulated)
  dom.btnGoogle.addEventListener('click', () => {
    simulateSocialLogin('Google User');
  });
  dom.btnX.addEventListener('click', () => {
    simulateSocialLogin('X User');
  });

  // Login form submit
  dom.formLogin.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = $('#li-email').value.trim();
    const pass  = $('#li-pass').value;
    if (!email || !pass) return;

    // Check saved accounts
    const accounts = JSON.parse(localStorage.getItem('sw-accounts') || '[]');
    const found = accounts.find(a => a.email === email && a.password === pass);
    if (found) {
      loginUser({ name: found.firstName + ' ' + found.lastName, email: found.email });
    } else {
      toast('Invalid email or password', 'error');
      $('#li-pass').value = '';
    }
  });

  // Register form submit
  dom.formRegister.addEventListener('submit', (e) => {
    e.preventDefault();
    const fname   = $('#reg-fname').value.trim();
    const lname   = $('#reg-lname').value.trim();
    const email   = $('#reg-email').value.trim();
    const phone   = $('#reg-phone').value.trim();
    const country = $('#reg-country').value;
    const pass    = $('#reg-pass').value;

    if (!fname || !lname || !email || !phone || !country || !pass) {
      toast('Please fill in all fields', 'error');
      return;
    }
    if (pass.length < 6) {
      toast('Password must be at least 6 characters', 'error');
      return;
    }

    const accounts = JSON.parse(localStorage.getItem('sw-accounts') || '[]');
    if (accounts.find(a => a.email === email)) {
      toast('An account with this email already exists', 'error');
      return;
    }

    accounts.push({ firstName: fname, lastName: lname, email, phone, country, password: pass });
    localStorage.setItem('sw-accounts', JSON.stringify(accounts));
    toast(`Account created! Welcome, ${fname} 🎉`, 'success');
    loginUser({ name: `${fname} ${lname}`, email });
  });

  // Logout
  dom.logoutBtn.addEventListener('click', () => {
    currentUser = null;
    localStorage.removeItem('sw-current-user');
    bundle = [];
    showLoginPage();
    toast('Logged out successfully', 'info');
  });

  // Auto-login if session saved
  const saved = localStorage.getItem('sw-current-user');
  if (saved) {
    try {
      currentUser = JSON.parse(saved);
      showApp();
    } catch {
      showLoginPage();
    }
  } else {
    showLoginPage();
  }
}

function setupPwToggle(btnId, inputId) {
  const btn   = $(`#${btnId}`);
  const input = $(`#${inputId}`);
  if (!btn || !input) return;
  btn.addEventListener('click', () => {
    const isPass = input.type === 'password';
    input.type   = isPass ? 'text' : 'password';
    btn.textContent = isPass ? '🙈' : '👁';
  });
}

function simulateSocialLogin(providerName) {
  loginUser({ name: providerName, email: `${providerName.toLowerCase().replace(' ','')}@social.com` });
}

function loginUser(user) {
  currentUser = user;
  localStorage.setItem('sw-current-user', JSON.stringify(user));
  showApp();
  toast(`Welcome, ${user.name.split(' ')[0]}! 👋`, 'success');
}

function showLoginPage() {
  dom.loginOverlay.style.display    = 'flex';
  dom.mainHeader.style.display      = 'none';
  dom.mainFilters.style.display     = 'none';
  dom.mainContent.style.display     = 'none';
  dom.panelLogin.hidden             = false;
  dom.panelRegister.hidden          = true;
  // reset forms
  dom.formLogin.reset();
  dom.formRegister.reset();
}

function showApp() {
  dom.loginOverlay.style.display    = 'none';
  dom.mainHeader.style.display      = '';
  dom.mainFilters.style.display     = '';
  dom.mainContent.style.display     = '';

  // Update avatar
  if (currentUser) {
    dom.userInitial.textContent = currentUser.name.charAt(0).toUpperCase();
    dom.userAvatar.title        = currentUser.name;
  }
}

// ============================================================
// INITIALIZATION
// ============================================================
async function init() {
  setupLogin();
  setupTheme();

  allProducts = await fetchProducts();
  readURL();
  applyFilters();
  setupFilterListeners();
  setupDragDrop();
  setupDialogListeners();
  setupPaymentDialog();
  setupCurrency();
  setupMisc();
}

async function fetchProducts() {
  try {
    const res = await fetch('products.json');
    if (!res.ok) throw new Error(res.statusText);
    return await res.json();
  } catch (e) {
    console.warn('Fetch failed, using fallback:', e.message);
    return FALLBACK;
  }
}

// ============================================================
// CURRENCY
// ============================================================
function setupCurrency() {
  const saved = localStorage.getItem('sw-currency');
  if (saved && CURRENCY_RATES[saved]) {
    currentCurrency = saved;
    dom.currencySelect.value = saved;
  }

  dom.currencySelect.addEventListener('change', (e) => {
    currentCurrency = e.target.value;
    localStorage.setItem('sw-currency', currentCurrency);
    renderProducts();
    updateSummary();
    toast(`Currency changed to ${currentCurrency}`, 'info');
  });
}

// ============================================================
// RENDERING
// ============================================================
function renderProducts() {
  dom.grid.innerHTML = '';
  if (filtered.length === 0) {
    dom.noResults.hidden = false;
    dom.resultsCount.textContent = '0 products';
    return;
  }
  dom.noResults.hidden = true;
  const frag = document.createDocumentFragment();
  filtered.forEach(p => frag.appendChild(createCard(p)));
  dom.grid.appendChild(frag);
  dom.resultsCount.textContent = `${filtered.length} product${filtered.length !== 1 ? 's' : ''}`;
}

function createCard(product) {
  const clone = dom.template.content.cloneNode(true);
  const card  = clone.querySelector('.product-card');

  card.dataset.id = product.id;

  // Image
  const img = card.querySelector('.card-img');
  img.src = product.image || '';
  img.alt = product.name;
  img.onerror = function() {
    // fallback gradient bg with emoji if image fails
    this.style.display = 'none';
    const cfg = CATEGORY_CFG[product.category];
    card.querySelector('.card-image').style.background = cfg.grad;
    card.querySelector('.card-image').innerHTML +=
      `<span style="font-size:52px;filter:drop-shadow(0 4px 10px rgba(0,0,0,.25))">${cfg.emoji}</span>`;
  };

  card.querySelector('.card-badge').textContent  = product.category;
  card.querySelector('.card-name').textContent   = product.name;
  card.querySelector('.card-price').textContent  = convertPrice(product.price);
  card.querySelector('.dot-label').textContent   = product.color;
  card.querySelector('.tag-season').textContent  = product.season;

  const dot = card.querySelector('.tag-color .dot');
  dot.style.background = COLOR_MAP[product.color] || '#888';
  if (product.color === 'white') dot.style.border = '1px solid #999';

  return clone;
}

function renderBundle() {
  dom.bundleList.innerHTML = '';
  dom.dropPh.hidden        = bundle.length > 0;
  dom.clearBundle.hidden   = bundle.length === 0;

  bundle.forEach(item => {
    const el = document.createElement('div');
    el.className    = 'bundle-item';
    el.dataset.iid  = item.instanceId;
    el.innerHTML = `
      <div class="bi-img">
        <img src="${item.product.image || ''}" alt="${item.product.name}"
          onerror="this.style.display='none';this.parentElement.style.background='${CATEGORY_CFG[item.product.category].grad}';this.parentElement.innerHTML+='<span style=font-size:18px>${CATEGORY_CFG[item.product.category].emoji}</span>'">
      </div>
      <div class="bi-info">
        <div class="bi-name">${item.product.name}</div>
        <div class="bi-price">${convertPrice(item.product.price)}</div>
      </div>
      <button class="bi-remove" type="button" title="Remove">✕</button>
    `;
    dom.bundleList.appendChild(el);
  });

  updateSummary();
}

function updateSummary() {
  const count    = bundle.length;
  const subtotalUSD = bundle.reduce((s, i) => s + i.product.price, 0);
  const isFree   = subtotalUSD >= FREE_SHIPPING;
  const shipUSD  = count === 0 ? 0 : (isFree ? 0 : SHIPPING_COST);
  const totalUSD = subtotalUSD + shipUSD;
  const progress = Math.min((subtotalUSD / FREE_SHIPPING) * 100, 100);

  dom.sCount.textContent = count;
  dom.sSub.textContent   = convertPrice(subtotalUSD);
  dom.sShip.textContent  = count === 0 ? '—' : (isFree ? 'FREE ✓' : convertPrice(SHIPPING_COST));
  dom.sTotal.textContent = convertPrice(totalUSD);
  dom.shipFill.style.width = `${progress}%`;

  if (count === 0) {
    dom.shipMsg.textContent = 'Add items to start building!';
    dom.shipMsg.className   = 'ship-msg';
  } else if (isFree) {
    dom.shipMsg.textContent = '🎉 You qualified for FREE shipping!';
    dom.shipMsg.className   = 'ship-msg ok';
  } else {
    const rem = FREE_SHIPPING - subtotalUSD;
    dom.shipMsg.textContent = `Add ${convertPrice(rem)} more for free shipping`;
    dom.shipMsg.className   = 'ship-msg';
  }

  dom.ctaBtn.disabled    = count === 0;
  dom.ctaBtn.textContent = count === 0
    ? 'Build Your Look First'
    : `Checkout — ${convertPrice(totalUSD)}`;

  dom.sShip.style.color = isFree ? 'var(--ok)' : '';
}

// ============================================================
// FILTERING
// ============================================================
function applyFilters() {
  filtered = allProducts.filter(p => {
    if (filters.category !== 'all' && p.category !== filters.category) return false;
    if (filters.color    !== 'all' && p.color    !== filters.color)    return false;
    if (filters.season   !== 'all' && p.season   !== filters.season)   return false;
    if (p.price > filters.maxPrice) return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const hay = `${p.name} ${p.category} ${p.color} ${p.description}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
  renderProducts();
  updateURL();
}

function setFilterPill(groupId, value) {
  $(`#${groupId}`).querySelectorAll('.pill').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.v === value);
  });
}

function setupFilterListeners() {
  $('#f-category').addEventListener('click', e => {
    const pill = e.target.closest('.pill');
    if (!pill) return;
    filters.category = pill.dataset.v;
    setFilterPill('f-category', filters.category);
    applyFilters();
  });

  $('#f-color').addEventListener('click', e => {
    const pill = e.target.closest('.pill');
    if (!pill) return;
    filters.color = pill.dataset.v;
    setFilterPill('f-color', filters.color);
    applyFilters();
  });

  $('#f-season').addEventListener('click', e => {
    const pill = e.target.closest('.pill');
    if (!pill) return;
    filters.season = pill.dataset.v;
    setFilterPill('f-season', filters.season);
    applyFilters();
  });

  dom.priceRange.addEventListener('input', e => {
    filters.maxPrice = parseInt(e.target.value);
    dom.priceVal.textContent = convertPrice(filters.maxPrice);
    applyFilters();
  });

  dom.search.addEventListener('input', e => {
    filters.search = e.target.value.trim();
    applyFilters();
  });

  dom.clearFilters.addEventListener('click', () => {
    filters.category = 'all';
    filters.color    = 'all';
    filters.season   = 'all';
    filters.maxPrice = 300;
    filters.search   = '';
    setFilterPill('f-category', 'all');
    setFilterPill('f-color', 'all');
    setFilterPill('f-season', 'all');
    dom.priceRange.value     = 300;
    dom.priceVal.textContent = convertPrice(300);
    dom.search.value         = '';
    applyFilters();
    toast('Filters cleared', 'info');
  });
}

// ── URL State ───────────────────────────────────────────────
function updateURL() {
  const p = new URLSearchParams();
  if (filters.category !== 'all') p.set('category', filters.category);
  if (filters.color    !== 'all') p.set('color',    filters.color);
  if (filters.season   !== 'all') p.set('season',   filters.season);
  if (filters.maxPrice  < 300)    p.set('maxPrice', filters.maxPrice);
  if (filters.search)             p.set('q',        filters.search);
  const qs = p.toString();
  window.history.replaceState(null, '', window.location.pathname + (qs ? `?${qs}` : ''));
}

function readURL() {
  const p = new URLSearchParams(window.location.search);
  if (p.has('category')) filters.category = p.get('category');
  if (p.has('color'))    filters.color    = p.get('color');
  if (p.has('season'))   filters.season   = p.get('season');
  if (p.has('maxPrice')) {
    filters.maxPrice         = parseInt(p.get('maxPrice'));
    dom.priceRange.value     = filters.maxPrice;
    dom.priceVal.textContent = convertPrice(filters.maxPrice);
  }
  if (p.has('q')) {
    filters.search   = p.get('q');
    dom.search.value = filters.search;
  }
  setFilterPill('f-category', filters.category);
  setFilterPill('f-color',    filters.color);
  setFilterPill('f-season',   filters.season);
}

// ============================================================
// DRAG & DROP
// ============================================================
function setupDragDrop() {
  dom.grid.addEventListener('dragstart', e => {
    const card = e.target.closest('.product-card');
    if (!card) return;
    e.dataTransfer.setData('text/plain', card.dataset.id);
    e.dataTransfer.effectAllowed = 'copy';
    requestAnimationFrame(() => card.classList.add('dragging'));
  });

  dom.grid.addEventListener('dragend', e => {
    const card = e.target.closest('.product-card');
    if (card) card.classList.remove('dragging');
  });

  dom.dropZone.addEventListener('dragover', e => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  });

  dom.dropZone.addEventListener('dragenter', e => {
    e.preventDefault();
    dragCounter++;
    dom.dropZone.classList.add('drag-over');
  });

  dom.dropZone.addEventListener('dragleave', () => {
    dragCounter--;
    if (dragCounter === 0) dom.dropZone.classList.remove('drag-over');
  });

  dom.dropZone.addEventListener('drop', e => {
    e.preventDefault();
    dragCounter = 0;
    dom.dropZone.classList.remove('drag-over');
    const id = parseInt(e.dataTransfer.getData('text/plain'));
    if (id) addToBundle(id);
  });
}

// ============================================================
// BUNDLE MANAGEMENT
// ============================================================
function addToBundle(productId) {
  const product = allProducts.find(p => p.id === productId);
  if (!product) return;
  instanceCounter++;
  bundle.push({ instanceId: instanceCounter, product });
  renderBundle();
  toast(`${product.name} added to your look ✓`, 'success');
  if (window.innerWidth <= 1100) {
    dom.bundleList.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

function removeFromBundle(instanceId) {
  const idx = bundle.findIndex(i => i.instanceId === instanceId);
  if (idx === -1) return;
  const name = bundle[idx].product.name;
  bundle.splice(idx, 1);
  renderBundle();
  toast(`${name} removed`, 'error');
}

function clearBundle() {
  bundle = [];
  renderBundle();
  toast('Bundle cleared', 'info');
}

// ============================================================
// QUICK VIEW DIALOG
// ============================================================
function openDialog(productId) {
  const p = allProducts.find(x => x.id === productId);
  if (!p) return;
  dialogProductId = productId;

  const d = dom.dialog;
  const img = d.querySelector('.qv-img');
  img.src = p.image || '';
  img.alt = p.name;
  img.onerror = function() {
    this.style.display = 'none';
    const cfg = CATEGORY_CFG[p.category];
    d.querySelector('.qv-image').style.background = cfg.grad;
  };

  d.querySelector('.qv-badge').textContent   = p.category;
  d.querySelector('.qv-name').textContent    = p.name;
  d.querySelector('.qv-desc').textContent    = p.description;
  d.querySelector('.qv-price').textContent   = convertPrice(p.price);
  d.querySelector('.qv-season').textContent  = p.season;

  const colorSpan = d.querySelector('.qv-color');
  colorSpan.querySelector('.dot').style.background = COLOR_MAP[p.color] || '#888';
  colorSpan.querySelectorAll('span')[1].textContent = p.color;

  d.showModal();
}

function setupDialogListeners() {
  $('#qv-close').addEventListener('click', () => dom.dialog.close());
  dom.dialog.addEventListener('click', e => { if (e.target === dom.dialog) dom.dialog.close(); });
  $('#qv-add').addEventListener('click', () => {
    if (dialogProductId) { addToBundle(dialogProductId); dom.dialog.close(); }
  });
}

// ============================================================
// PAYMENT DIALOG
// ============================================================
function setupPaymentDialog() {
  const btnUpi    = $('#btn-upi');
  const btnCod    = $('#btn-cod');
  const panelUpi  = $('#panel-upi');
  const panelCod  = $('#panel-cod');
  const paySummary = $('#pay-summary-line');
  const qrAmount  = $('#qr-amount');

  // Switch payment methods
  btnUpi.addEventListener('click', () => {
    btnUpi.classList.add('active');
    btnCod.classList.remove('active');
    panelUpi.hidden = false;
    panelCod.hidden = true;
  });
  btnCod.addEventListener('click', () => {
    btnCod.classList.add('active');
    btnUpi.classList.remove('active');
    panelCod.hidden = false;
    panelUpi.hidden = true;
  });

  // Close
  $('#pay-close').addEventListener('click', () => dom.payDialog.close());
  dom.payDialog.addEventListener('click', e => { if (e.target === dom.payDialog) dom.payDialog.close(); });

  // UPI Confirm
  $('#btn-upi-confirm').addEventListener('click', () => {
    dom.payDialog.close();
    const total = bundle.reduce((s, i) => s + i.product.price, 0);
    const ship  = total >= FREE_SHIPPING ? 0 : SHIPPING_COST;
    toast(`🎉 UPI Payment confirmed! Order placed — ${convertPrice(total + ship)}`, 'success');
    clearBundle();
  });

  // COD form submit
  $('#cod-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const flat     = $('#cod-flat').value.trim();
    const building = $('#cod-building').value.trim();
    const area     = $('#cod-area').value.trim();
    const city     = $('#cod-city').value.trim();
    const pin      = $('#cod-pin').value.trim();
    const state    = $('#cod-state').value;

    if (!flat || !building || !area || !city || !pin || !state) {
      toast('Please fill in all address fields', 'error');
      return;
    }
    if (!/^\d{6}$/.test(pin)) {
      toast('Please enter a valid 6-digit PIN code', 'error');
      return;
    }

    dom.payDialog.close();
    const total = bundle.reduce((s, i) => s + i.product.price, 0);
    const ship  = total >= FREE_SHIPPING ? 0 : SHIPPING_COST;
    toast(`📦 Order placed! COD — ${convertPrice(total + ship)}. Delivering to ${city}, ${state}`, 'success');
    clearBundle();
    $('#cod-form').reset();
  });

  // Open payment dialog when CTA clicked
  dom.ctaBtn.addEventListener('click', () => {
    if (bundle.length === 0) return;

    // Reset to UPI tab
    btnUpi.classList.add('active');
    btnCod.classList.remove('active');
    panelUpi.hidden = false;
    panelCod.hidden = true;

    // Update summary line
    const subtotal = bundle.reduce((s, i) => s + i.product.price, 0);
    const ship     = subtotal >= FREE_SHIPPING ? 0 : SHIPPING_COST;
    const total    = subtotal + ship;
    paySummary.textContent = `${bundle.length} item${bundle.length !== 1 ? 's' : ''} · Subtotal ${convertPrice(subtotal)} · Shipping ${ship === 0 ? 'FREE' : convertPrice(ship)} · Total ${convertPrice(total)}`;
    qrAmount.textContent   = `Pay ${convertPrice(total)}`;

    dom.payDialog.showModal();
  });
}

// ============================================================
// MISC EVENT LISTENERS
// ============================================================
function setupMisc() {
  dom.grid.addEventListener('click', e => {
    const card = e.target.closest('.product-card');
    if (!card) return;
    const id = parseInt(card.dataset.id);
    if (e.target.closest('.qv-btn'))    openDialog(id);
    else if (e.target.closest('.card-add')) addToBundle(id);
  });

  dom.bundleList.addEventListener('click', e => {
    const btn = e.target.closest('.bi-remove');
    if (!btn) return;
    removeFromBundle(parseInt(btn.closest('.bundle-item').dataset.iid));
  });

  dom.clearBundle.addEventListener('click', clearBundle);
}

// ============================================================
// THEME TOGGLE
// ============================================================
function setupTheme() {
  const saved = localStorage.getItem('sw-theme');
  if (saved) {
    document.documentElement.dataset.theme = saved;
    updateThemeIcon(saved);
  }
  dom.themeToggle.addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    localStorage.setItem('sw-theme', next);
    updateThemeIcon(next);
  });
}

function updateThemeIcon(theme) {
  dom.themeIcon.textContent = theme === 'dark' ? '☽' : '☀';
}

// ============================================================
// TOAST NOTIFICATIONS
// ============================================================
function toast(message, type = 'info') {
  const el = document.createElement('div');
  el.className   = `toast ${type}`;
  el.textContent = message;
  dom.toasts.appendChild(el);
  setTimeout(() => {
    el.classList.add('out');
    el.addEventListener('animationend', () => el.remove(), { once: true });
  }, 2800);
}

// ============================================================
// START
// ============================================================
document.addEventListener('DOMContentLoaded', init);