/* ============================================================
   SHOPPING WEB — Application Logic (Complete & Corrected)
============================================================ */

// ── Constants ──────────────────────────────────────────────
const FREE_SHIPPING = 24;  // $24 USD (≈ ₹2000 INR)
const SHIPPING_COST = 1.5;  // $1.5 USD (≈ ₹125 INR)

// Google OAuth Configuration
const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID_HERE'; // Replace with your actual client ID

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
let currentCurrency = 'INR';  // Default to INR for Indian pricing
let dragCounter    = 0;
let dialogProductId = null;

const filters = {
  category: 'all',
  color:    'all',
  season:   'all',
  maxPrice: 36,  // Updated max price ($36 = ₹3000)
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

// ── Updated Fallback Data (Corrected Pricing) ──────────────
const FALLBACK = [
  {"id":1,"name":"Silk Blouse","price":18,"category":"tops","color":"white","season":"spring","image":"https://m.media-amazon.com/images/I/71VFs2XrDVL._AC_UY350_.jpg","description":"Elegant silk blouse with pearl buttons and a relaxed fit perfect for layering."},
  {"id":2,"name":"Cashmere Sweater","price":30,"category":"tops","color":"beige","season":"winter","image":"https://static.aceomni.cmsaceturtle.com/prod/product-image/aceomni/Wrangler/Monobrand/WMJK005313/WMJK005313_1.jpg","description":"Ultra-soft cashmere crew neck sweater for ultimate warmth and luxury."},
  {"id":3,"name":"Linen Camp Shirt","price":15,"category":"tops","color":"blue","season":"summer","image":"https://assets.myntassets.com/dpr_1.5,q_30,w_400,c_limit,fl_progressive/assets/images/2025/DECEMBER/29/whOIuYJh_53cefe3ad52f4621929279281260e4b5.jpg","description":"Breathable linen camp collar shirt with a relaxed summer silhouette."},
  {"id":4,"name":"Graphic Tee","price":12,"category":"tops","color":"black","season":"all-season","image":"https://m.media-amazon.com/images/I/81auLqNjbSL._AC_UY1100_.jpg","description":"Premium heavyweight cotton tee with abstract geometric print."},
  {"id":5,"name":"Slim Chinos","price":20,"category":"bottoms","color":"beige","season":"spring","image":"https://m.media-amazon.com/images/I/71Y7lPLUXkL._AC_UY1100_.jpg","description":"Tailored slim-fit chino trousers with a modern tapered leg."},
  {"id":6,"name":"Selvedge Denim","price":24,"category":"bottoms","color":"blue","season":"all-season","image":"https://5.imimg.com/data5/SELLER/Default/2024/12/469933097/YK/BI/XC/37190943/men-track-pants-500x500.jpg","description":"Japanese selvedge denim jeans with a classic straight-leg fit."},
  {"id":7,"name":"Pleated Trousers","price":22,"category":"bottoms","color":"black","season":"fall","image":"https://wearmarts.com/public/uploads/all/QidctaSCny0LdBO5abjoXTmxOzWbeuNcoUaSFtak.png","description":"High-waisted pleated wool-blend trousers with a sophisticated drape."},
  {"id":8,"name":"Cargo Pants","price":19,"category":"bottoms","color":"green","season":"all-season","image":"https://static.cilory.com/771131-thickbox_default/mens-sage-green-acid-washed-bell-bottom-denim-jeans.jpg","description":"Relaxed-fit cargo pants with multiple utility pockets."},
  {"id":9,"name":"Leather Sneakers","price":26,"category":"shoes","color":"white","season":"all-season","image":"https://www.campusshoes.com/cdn/shop/files/LEVEL_LEVEL_WHT-L.GRY_07_831c7a2c-ff1b-4011-9268-b11f984219c6.webp?v=1757580207","description":"Minimalist full-grain leather sneakers with a clean low-top profile."},
  {"id":10,"name":"Chelsea Boots","price":34,"category":"shoes","color":"brown","season":"fall","image":"https://bugattishoes.in/cdn/shop/files/322-A9S01-6900-4100.jpg?v=1762412735","description":"Italian suede Chelsea boots with elastic side panels and stacked heel."},
  {"id":11,"name":"Canvas Loafers","price":16,"category":"shoes","color":"beige","season":"summer","image":"https://m.media-amazon.com/images/I/61iq+p8OrdL._AC_UY1000_.jpg","description":"Lightweight canvas slip-on loafers with a cushioned insole."},
  {"id":12,"name":"Running Shoes","price":25,"category":"shoes","color":"black","season":"all-season","image":"https://shop.teamsg.in/cdn/shop/files/22-07-202401188.png?v=1744374583","description":"Performance running shoes with responsive cushioning and breathable mesh."},
  {"id":13,"name":"Wool Overcoat","price":36,"category":"outerwear","color":"black","season":"winter","image":"https://m.media-amazon.com/images/I/71VFs2XrDVL._AC_UY350_.jpg","description":"Tailored double-breasted Italian wool overcoat with satin lining."},
  {"id":14,"name":"Bomber Jacket","price":32,"category":"outerwear","color":"green","season":"fall","image":"https://static.aceomni.cmsaceturtle.com/prod/product-image/aceomni/Wrangler/Monobrand/WMJK005313/WMJK005313_1.jpg","description":"Classic nylon bomber jacket with ribbed cuffs and brass zipper."},
  {"id":15,"name":"Denim Jacket","price":23,"category":"outerwear","color":"blue","season":"spring","image":"https://assets.myntassets.com/dpr_1.5,q_30,w_400,c_limit,fl_progressive/assets/images/2025/DECEMBER/29/whOIuYJh_53cefe3ad52f4621929279281260e4b5.jpg","description":"Vintage-wash trucker denim jacket with copper hardware details."},
  {"id":16,"name":"Rain Parka","price":35,"category":"outerwear","color":"black","season":"spring","image":"https://m.media-amazon.com/images/I/81auLqNjbSL._AC_UY1100_.jpg","description":"Waterproof hooded parka with sealed seams and adjustable drawcord."},
  {"id":17,"name":"Leather Tote","price":29,"category":"bags","color":"brown","season":"all-season","image":"https://m.media-amazon.com/images/I/71Y7lPLUXkL._AC_UY1100_.jpg","description":"Full-grain vegetable-tanned leather tote with interior laptop sleeve."},
  {"id":18,"name":"Canvas Backpack","price":21,"category":"bags","color":"green","season":"all-season","image":"https://5.imimg.com/data5/SELLER/Default/2024/12/469933097/YK/BI/XC/37190943/men-track-pants-500x500.jpg","description":"Waxed canvas backpack with leather straps and brass buckle closures."},
  {"id":19,"name":"Crossbody Bag","price":14,"category":"bags","color":"black","season":"all-season","image":"https://wearmarts.com/public/uploads/all/QidctaSCny0LdBO5abjoXTmxOzWbeuNcoUaSFtak.png","description":"Compact nylon crossbody bag with adjustable webbing shoulder strap."},
  {"id":20,"name":"Weekend Duffle","price":27,"category":"bags","color":"beige","season":"all-season","image":"https://static.cilory.com/771131-thickbox_default/mens-sage-green-acid-washed-bell-bottom-denim-jeans.jpg","description":"Spacious canvas and leather duffle bag perfect for weekend getaways."},
  {"id":21,"name":"Silk Scarf","price":13,"category":"accessories","color":"red","season":"spring","image":"https://www.campusshoes.com/cdn/shop/files/LEVEL_LEVEL_WHT-L.GRY_07_831c7a2c-ff1b-4011-9268-b11f984219c6.webp?v=1757580207","description":"Hand-rolled silk twill scarf with an original abstract watercolor print."},
  {"id":22,"name":"Leather Belt","price":17,"category":"accessories","color":"brown","season":"all-season","image":"https://bugattishoes.in/cdn/shop/files/322-A9S01-6900-4100.jpg?v=1762412735","description":"Full-grain English bridle leather belt with solid brass roller buckle."},
  {"id":23,"name":"Aviator Sunglasses","price":24,"category":"accessories","color":"black","season":"summer","image":"https://m.media-amazon.com/images/I/61iq+p8OrdL._AC_UY1000_.jpg","description":"Titanium frame aviator sunglasses with polarized CR-39 lenses."},
  {"id":24,"name":"Merino Beanie","price":12,"category":"accessories","color":"red","season":"winter","image":"https://shop.teamsg.in/cdn/shop/files/22-07-202401188.png?v=1744374583","description":"Fine-gauge merino wool ribbed beanie with a classic fold-over cuff."}
];

// ============================================================
// CURRENCY HELPERS
// ============================================================
function convertPrice(usdPrice) {
  const cfg = CURRENCY_RATES[currentCurrency];
  const converted = usdPrice * cfg.rate;
  if (currentCurrency === 'JPY') return `${cfg.symbol}${Math.round(converted)}`;
  if (currentCurrency === 'INR') return `${cfg.symbol}${Math.round(converted).toLocaleString('en-IN')}`;
  return `${cfg.symbol}${converted.toFixed(2)}`;
}

function convertRaw(usdPrice) {
  return usdPrice * CURRENCY_RATES[currentCurrency].rate;
}

// ============================================================
// GOOGLE OAUTH
// ============================================================
function handleCredentialResponse(response) {
  try {
    const payload = JSON.parse(atob(response.credential.split('.')[1]));
    const user = {
      name: payload.name,
      email: payload.email,
      picture: payload.picture,
      googleId: payload.sub
    };
    loginUser(user);
  } catch (error) {
    console.error('Error processing Google OAuth response:', error);
    toast('Failed to sign in with Google', 'error');
  }
}

function initializeGoogleAuth() {
  if (typeof google !== 'undefined' && google.accounts) {
    google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleCredentialResponse,
      auto_select: false,
      cancel_on_tap_outside: true
    });
    
    // Render the Google button inside existing button container
    const googleBtn = dom.btnGoogle;
    if (googleBtn) {
      google.accounts.id.renderButton(googleBtn, {
        type: 'standard',
        shape: 'rectangular',
        theme: 'outline',
        text: 'signin_with',
        size: 'large',
        logo_alignment: 'left',
        width: '100%'
      });
    }
  } else {
    console.warn('Google Identity Services not loaded');
    if (dom.btnGoogle) {
      dom.btnGoogle.style.display = 'none';
    }
  }
}

// ============================================================
// LOGIN / AUTH
// ============================================================
function setupLogin() {
  // Toggle panels
  dom.goRegister?.addEventListener('click', () => {
    dom.panelLogin.hidden = true;
    dom.panelRegister.hidden = false;
  });
  dom.goLogin?.addEventListener('click', () => {
    dom.panelRegister.hidden = true;
    dom.panelLogin.hidden = false;
  });

  // Password visibility toggles
  setupPwToggle('pw-toggle-li', 'li-pass');
  setupPwToggle('pw-toggle-reg', 'reg-pass');

  // X/Twitter login (simulated)
  dom.btnX?.addEventListener('click', () => {
    simulateSocialLogin('X User');
  });

  // Login form submit
  dom.formLogin?.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = $('#li-email')?.value.trim();
    const pass  = $('#li-pass')?.value;
    if (!email || !pass) return;

    const accounts = JSON.parse(localStorage.getItem('sw-accounts') || '[]');
    const found = accounts.find(a => a.email === email && a.password === pass);
    if (found) {
      loginUser({ name: found.firstName + ' ' + found.lastName, email: found.email });
    } else {
      toast('Invalid email or password', 'error');
      const passField = $('#li-pass');
      if (passField) passField.value = '';
    }
  });

  // Register form submit
  dom.formRegister?.addEventListener('submit', (e) => {
    e.preventDefault();
    const fname   = $('#reg-fname')?.value.trim();
    const lname   = $('#reg-lname')?.value.trim();
    const email   = $('#reg-email')?.value.trim();
    const phone   = $('#reg-phone')?.value.trim();
    const country = $('#reg-country')?.value;
    const pass    = $('#reg-pass')?.value;

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
  dom.logoutBtn?.addEventListener('click', () => {
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
  if (dom.loginOverlay) dom.loginOverlay.style.display = 'flex';
  if (dom.mainHeader) dom.mainHeader.style.display = 'none';
  if (dom.mainFilters) dom.mainFilters.style.display = 'none';
  if (dom.mainContent) dom.mainContent.style.display = 'none';
  dom.panelLogin.hidden = false;
  dom.panelRegister.hidden = true;
  dom.formLogin?.reset();
  dom.formRegister?.reset();
}

function showApp() {
  if (dom.loginOverlay) dom.loginOverlay.style.display = 'none';
  if (dom.mainHeader) dom.mainHeader.style.display = '';
  if (dom.mainFilters) dom.mainFilters.style.display = '';
  if (dom.mainContent) dom.mainContent.style.display = '';

  if (currentUser && dom.userInitial) {
    dom.userInitial.textContent = currentUser.name.charAt(0).toUpperCase();
    if (dom.userAvatar) dom.userAvatar.title = currentUser.name;
  }
}

// ============================================================
// INITIALIZATION
// ============================================================
async function init() {
  setupLogin();
  setupTheme();
  initializeGoogleAuth();

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
    if (dom.currencySelect) dom.currencySelect.value = saved;
  }

  dom.currencySelect?.addEventListener('change', (e) => {
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
  if (!dom.grid) return;
  dom.grid.innerHTML = '';
  
  if (filtered.length === 0) {
    if (dom.noResults) dom.noResults.hidden = false;
    if (dom.resultsCount) dom.resultsCount.textContent = '0 products';
    return;
  }
  
  if (dom.noResults) dom.noResults.hidden = true;
  const frag = document.createDocumentFragment();
  filtered.forEach(p => frag.appendChild(createCard(p)));
  dom.grid.appendChild(frag);
  if (dom.resultsCount) {
    dom.resultsCount.textContent = `${filtered.length} product${filtered.length !== 1 ? 's' : ''}`;
  }
}

function createCard(product) {
  if (!dom.template) return document.createElement('div');
  
  const clone = dom.template.content.cloneNode(true);
  const card  = clone.querySelector('.product-card');
  if (!card) return document.createElement('div');

  card.dataset.id = product.id;

  const img = card.querySelector('.card-img');
  if (img) {
    img.src = product.image || '';
    img.alt = product.name;
    img.onerror = function() {
      this.style.display = 'none';
      const cfg = CATEGORY_CFG[product.category];
      const cardImage = card.querySelector('.card-image');
      if (cardImage && cfg) {
        cardImage.style.background = cfg.grad;
        cardImage.innerHTML += `<span style="font-size:52px;filter:drop-shadow(0 4px 10px rgba(0,0,0,.25))">${cfg.emoji}</span>`;
      }
    };
  }

  const badge = card.querySelector('.card-badge');
  if (badge) badge.textContent = product.category;
  
  const name = card.querySelector('.card-name');
  if (name) name.textContent = product.name;
  
  const price = card.querySelector('.card-price');
  if (price) price.textContent = convertPrice(product.price);
  
  const dotLabel = card.querySelector('.dot-label');
  if (dotLabel) dotLabel.textContent = product.color;
  
  const season = card.querySelector('.tag-season');
  if (season) season.textContent = product.season;

  const dot = card.querySelector('.tag-color .dot');
  if (dot) {
    dot.style.background = COLOR_MAP[product.color] || '#888';
    if (product.color === 'white') dot.style.border = '1px solid #999';
  }

  return clone;
}

function renderBundle() {
  if (!dom.bundleList) return;
  
  dom.bundleList.innerHTML = '';
  if (dom.dropPh) dom.dropPh.hidden = bundle.length > 0;
  if (dom.clearBundle) dom.clearBundle.hidden = bundle.length === 0;

  bundle.forEach(item => {
    const el = document.createElement('div');
    el.className = 'bundle-item';
    el.dataset.iid = item.instanceId;
    el.innerHTML = `
      <div class="bi-img">
        <img src="${item.product.image || ''}" alt="${item.product.name}"
          onerror="this.style.display='none';this.parentElement.style.background='${CATEGORY_CFG[item.product.category]?.grad || ''}';this.parentElement.innerHTML+='<span style=font-size:18px>${CATEGORY_CFG[item.product.category]?.emoji || '📦'}</span>'">
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
  const count = bundle.length;
  const subtotalUSD = bundle.reduce((s, i) => s + i.product.price, 0);
  const isFree = subtotalUSD >= FREE_SHIPPING;
  const shipUSD = count === 0 ? 0 : (isFree ? 0 : SHIPPING_COST);
  const totalUSD = subtotalUSD + shipUSD;
  const progress = Math.min((subtotalUSD / FREE_SHIPPING) * 100, 100);

  if (dom.sCount) dom.sCount.textContent = count;
  if (dom.sSub) dom.sSub.textContent = convertPrice(subtotalUSD);
  if (dom.sShip) {
    dom.sShip.textContent = count === 0 ? '—' : (isFree ? 'FREE ✓' : convertPrice(SHIPPING_COST));
    dom.sShip.style.color = isFree ? 'var(--ok)' : '';
  }
  if (dom.sTotal) dom.sTotal.textContent = convertPrice(totalUSD);
  if (dom.shipFill) dom.shipFill.style.width = `${progress}%`;

  if (dom.shipMsg) {
    if (count === 0) {
      dom.shipMsg.textContent = 'Add items to start building!';
      dom.shipMsg.className = 'ship-msg';
    } else if (isFree) {
      dom.shipMsg.textContent = '🎉 You qualified for FREE shipping!';
      dom.shipMsg.className = 'ship-msg ok';
    } else {
      const rem = FREE_SHIPPING - subtotalUSD;
      dom.shipMsg.textContent = `Add ${convertPrice(rem)} more for free shipping`;
      dom.shipMsg.className = 'ship-msg';
    }
  }

  if (dom.ctaBtn) {
    dom.ctaBtn.disabled = count === 0;
    dom.ctaBtn.textContent = count === 0
      ? 'Build Your Look First'
      : `Checkout — ${convertPrice(totalUSD)}`;
  }
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
  const group = $(`#${groupId}`);
  if (!group) return;
  group.querySelectorAll('.pill').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.v === value);
  });
}

function setupFilterListeners() {
  const categoryGroup = $('#f-category');
  categoryGroup?.addEventListener('click', e => {
    const pill = e.target.closest('.pill');
    if (!pill) return;
    filters.category = pill.dataset.v;
    setFilterPill('f-category', filters.category);
    applyFilters();
  });

  const colorGroup = $('#f-color');
  colorGroup?.addEventListener('click', e => {
    const pill = e.target.closest('.pill');
    if (!pill) return;
    filters.color = pill.dataset.v;
    setFilterPill('f-color', filters.color);
    applyFilters();
  });

  const seasonGroup = $('#f-season');
  seasonGroup?.addEventListener('click', e => {
    const pill = e.target.closest('.pill');
    if (!pill) return;
    filters.season = pill.dataset.v;
    setFilterPill('f-season', filters.season);
    applyFilters();
  });

  dom.priceRange?.addEventListener('input', e => {
    filters.maxPrice = parseInt(e.target.value);
    if (dom.priceVal) dom.priceVal.textContent = convertPrice(filters.maxPrice);
    applyFilters();
  });

  dom.search?.addEventListener('input', e => {
    filters.search = e.target.value.trim();
    applyFilters();
  });

  dom.clearFilters?.addEventListener('click', () => {
    filters.category = 'all';
    filters.color    = 'all';
    filters.season   = 'all';
    filters.maxPrice = 36;
    filters.search   = '';
    setFilterPill('f-category', 'all');
    setFilterPill('f-color', 'all');
    setFilterPill('f-season', 'all');
    if (dom.priceRange) dom.priceRange.value = 36;
    if (dom.priceVal) dom.priceVal.textContent = convertPrice(36);
    if (dom.search) dom.search.value = '';
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
  if (filters.maxPrice  < 36)     p.set('maxPrice', filters.maxPrice);
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
    filters.maxPrice = parseInt(p.get('maxPrice'));
    if (dom.priceRange) dom.priceRange.value = filters.maxPrice;
    if (dom.priceVal) dom.priceVal.textContent = convertPrice(filters.maxPrice);
  }
  if (p.has('q')) {
    filters.search = p.get('q');
    if (dom.search) dom.search.value = filters.search;
  }
  setFilterPill('f-category', filters.category);
  setFilterPill('f-color',    filters.color);
  setFilterPill('f-season',   filters.season);
}

// ============================================================
// DRAG & DROP
// ============================================================
function setupDragDrop() {
  dom.grid?.addEventListener('dragstart', e => {
    const card = e.target.closest('.product-card');
    if (!card) return;
    e.dataTransfer.setData('text/plain', card.dataset.id);
    e.dataTransfer.effectAllowed = 'copy';
    requestAnimationFrame(() => card.classList.add('dragging'));
  });

  dom.grid?.addEventListener('dragend', e => {
    const card = e.target.closest('.product-card');
    if (card) card.classList.remove('dragging');
  });

  dom.dropZone?.addEventListener('dragover', e => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  });

  dom.dropZone?.addEventListener('dragenter', e => {
    e.preventDefault();
    dragCounter++;
    dom.dropZone.classList.add('drag-over');
  });

  dom.dropZone?.addEventListener('dragleave', () => {
    dragCounter--;
    if (dragCounter === 0) dom.dropZone.classList.remove('drag-over');
  });

  dom.dropZone?.addEventListener('drop', e => {
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
  if (window.innerWidth <= 1100 && dom.bundleList) {
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
  if (!p || !dom.dialog) return;
  dialogProductId = productId;

  const img = dom.dialog.querySelector('.qv-img');
  if (img) {
    img.src = p.image || '';
    img.alt = p.name;
    img.onerror = function() {
      this.style.display = 'none';
      const cfg = CATEGORY_CFG[p.category];
      const qvImage = dom.dialog.querySelector('.qv-image');
      if (qvImage && cfg) qvImage.style.background = cfg.grad;
    };
  }

  const badge = dom.dialog.querySelector('.qv-badge');
  if (badge) badge.textContent = p.category;
  
  const name = dom.dialog.querySelector('.qv-name');
  if (name) name.textContent = p.name;
  
  const desc = dom.dialog.querySelector('.qv-desc');
  if (desc) desc.textContent = p.description;
  
  const price = dom.dialog.querySelector('.qv-price');
  if (price) price.textContent = convertPrice(p.price);
  
  const season = dom.dialog.querySelector('.qv-season');
  if (season) season.textContent = p.season;

  const colorSpan = dom.dialog.querySelector('.qv-color');
  if (colorSpan) {
    const dot = colorSpan.querySelector('.dot');
    if (dot) dot.style.background = COLOR_MAP[p.color] || '#888';
    const colorText = colorSpan.querySelectorAll('span')[1];
    if (colorText) colorText.textContent = p.color;
  }

  dom.dialog.showModal();
}

function setupDialogListeners() {
  const closeBtn = $('#qv-close');
  closeBtn?.addEventListener('click', () => dom.dialog?.close());
  
  dom.dialog?.addEventListener('click', e => { 
    if (e.target === dom.dialog) dom.dialog.close(); 
  });
  
  const addBtn = $('#qv-add');
  addBtn?.addEventListener('click', () => {
    if (dialogProductId) { 
      addToBundle(dialogProductId); 
      dom.dialog?.close(); 
    }
  });
}

// ============================================================
// PAYMENT DIALOG
// ============================================================
function setupPaymentDialog() {
  const btnUpi = $('#btn-upi');
  const btnCod = $('#btn-cod');
  const panelUpi = $('#panel-upi');
  const panelCod = $('#panel-cod');
  const paySummary = $('#pay-summary-line');
  const qrAmount = $('#qr-amount');

  // Switch payment methods
  btnUpi?.addEventListener('click', () => {
    btnUpi.classList.add('active');
    btnCod?.classList.remove('active');
    if (panelUpi) panelUpi.hidden = false;
    if (panelCod) panelCod.hidden = true;
  });
  
  btnCod?.addEventListener('click', () => {
    btnCod.classList.add('active');
    btnUpi?.classList.remove('active');
    if (panelCod) panelCod.hidden = false;
    if (panelUpi) panelUpi.hidden = true;
  });

  // Close
  const payClose = $('#pay-close');
  payClose?.addEventListener('click', () => dom.payDialog?.close());
  
  dom.payDialog?.addEventListener('click', e => { 
    if (e.target === dom.payDialog) dom.payDialog.close(); 
  });

  // UPI Confirm
  const upiConfirm = $('#btn-upi-confirm');
  upiConfirm?.addEventListener('click', () => {
    dom.payDialog?.close();
    const total = bundle.reduce((s, i) => s + i.product.price, 0);
    const ship = total >= FREE_SHIPPING ? 0 : SHIPPING_COST;
    toast(`🎉 UPI Payment confirmed! Order placed — ${convertPrice(total + ship)}`, 'success');
    clearBundle();
  });

  // COD form submit
  const codForm = $('#cod-form');
  codForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const flat = $('#cod-flat')?.value.trim();
    const building = $('#cod-building')?.value.trim();
    const area = $('#cod-area')?.value.trim();
    const city = $('#cod-city')?.value.trim();
    const pin = $('#cod-pin')?.value.trim();
    const state = $('#cod-state')?.value;

    if (!flat || !building || !area || !city || !pin || !state) {
      toast('Please fill in all address fields', 'error');
      return;
    }
    if (!/^\d{6}$/.test(pin)) {
      toast('Please enter a valid 6-digit PIN code', 'error');
      return;
    }

    dom.payDialog?.close();
    const total = bundle.reduce((s, i) => s + i.product.price, 0);
    const ship = total >= FREE_SHIPPING ? 0 : SHIPPING_COST;
    toast(`📦 Order placed! COD — ${convertPrice(total + ship)}. Delivering to ${city}, ${state}`, 'success');
    clearBundle();
    codForm.reset();
  });

  // Open payment dialog when CTA clicked
  dom.ctaBtn?.addEventListener('click', () => {
    if (bundle.length === 0) return;

    // Reset to UPI tab
    btnUpi?.classList.add('active');
    btnCod?.classList.remove('active');
    if (panelUpi) panelUpi.hidden = false;
    if (panelCod) panelCod.hidden = true;

    // Update summary line
    const subtotal = bundle.reduce((s, i) => s + i.product.price, 0);
    const ship = subtotal >= FREE_SHIPPING ? 0 : SHIPPING_COST;
    const total = subtotal + ship;
    
    if (paySummary) {
      paySummary.textContent = `${bundle.length} item${bundle.length !== 1 ? 's' : ''} · Subtotal ${convertPrice(subtotal)} · Shipping ${ship === 0 ? 'FREE' : convertPrice(ship)} · Total ${convertPrice(total)}`;
    }
    
    if (qrAmount) {
      qrAmount.textContent = `Pay ${convertPrice(total)}`;
    }

    dom.payDialog?.showModal();
  });
}

// ============================================================
// MISC EVENT LISTENERS
// ============================================================
function setupMisc() {
  dom.grid?.addEventListener('click', e => {
    const card = e.target.closest('.product-card');
    if (!card) return;
    const id = parseInt(card.dataset.id);
    if (e.target.closest('.qv-btn')) {
      openDialog(id);
    } else if (e.target.closest('.card-add')) {
      addToBundle(id);
    }
  });

  dom.bundleList?.addEventListener('click', e => {
    const btn = e.target.closest('.bi-remove');
    if (!btn) return;
    const bundleItem = btn.closest('.bundle-item');
    if (bundleItem) {
      removeFromBundle(parseInt(bundleItem.dataset.iid));
    }
  });

  dom.clearBundle?.addEventListener('click', clearBundle);
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
  
  dom.themeToggle?.addEventListener('click', () => {
    const current = document.documentElement.dataset.theme;
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    localStorage.setItem('sw-theme', next);
    updateThemeIcon(next);
  });
}

function updateThemeIcon(theme) {
  if (dom.themeIcon) {
    dom.themeIcon.textContent = theme === 'dark' ? '☽' : '☀';
  }
}

// ============================================================
// TOAST NOTIFICATIONS
// ============================================================
function toast(message, type = 'info') {
  if (!dom.toasts) return;
  
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.textContent = message;
  dom.toasts.appendChild(el);
  
  setTimeout(() => {
    el.classList.add('out');
    el.addEventListener('animationend', () => {
      if (el.parentNode) {
        el.remove();
      }
    }, { once: true });
  }, 2800);
}

// ============================================================
// ERROR HANDLING
// ============================================================
window.addEventListener('error', (e) => {
  console.error('JavaScript Error:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
  console.error('Unhandled Promise Rejection:', e.reason);
});

// ============================================================
// START APPLICATION
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  // Add loading class to body
  document.body.classList.add('loading');
  
  // Initialize the application
  init().then(() => {
    // Remove loading class after initialization
    document.body.classList.remove('loading');
    console.log('Shopping Web application initialized successfully');
  }).catch((error) => {
    console.error('Failed to initialize application:', error);
    document.body.classList.remove('loading');
    toast('Failed to initialize application', 'error');
  });
});

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

// Format currency for display
function formatCurrency(amount, currency = currentCurrency) {
  const cfg = CURRENCY_RATES[currency];
  if (!cfg) return `$${amount.toFixed(2)}`;
  
  const converted = amount * cfg.rate;
  if (currency === 'JPY') return `${cfg.symbol}${Math.round(converted)}`;
  if (currency === 'INR') return `${cfg.symbol}${Math.round(converted).toLocaleString('en-IN')}`;
  return `${cfg.symbol}${converted.toFixed(2)}`;
}

// Debounce function for search
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Validate email format
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Generate unique ID
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Check if device is mobile
function isMobile() {
  return window.innerWidth <= 768;
}

// Smooth scroll to element
function scrollToElement(element, offset = 0) {
  if (!element) return;
  const elementPosition = element.offsetTop - offset;
  window.scrollTo({
    top: elementPosition,
    behavior: 'smooth'
  });
}

// Get browser info
function getBrowserInfo() {
  const userAgent = navigator.userAgent;
  let browserName = 'Unknown';
  
  if (userAgent.includes('Chrome')) browserName = 'Chrome';
  else if (userAgent.includes('Firefox')) browserName = 'Firefox';
  else if (userAgent.includes('Safari')) browserName = 'Safari';
  else if (userAgent.includes('Edge')) browserName = 'Edge';
  
  return {
    name: browserName,
    userAgent: userAgent,
    language: navigator.language,
    platform: navigator.platform
  };
}

// Export for debugging (if needed)
if (typeof window !== 'undefined') {
  window.ShoppingWebApp = {
    // State
    currentUser,
    currentCurrency,
    allProducts,
    filtered,
    bundle,
    filters,
    
    // Functions
    toast,
    convertPrice,
    addToBundle,
    removeFromBundle,
    clearBundle,
    formatCurrency,
    getBrowserInfo,
    
    // Version
    version: '2.0.0'
  };
}

// Console welcome message
console.log('%c🛍️ Shopping Web App %cv2.0.0', 'color: #7c3aed; font-size: 16px; font-weight: bold;', 'color: #6b7280; font-size: 12px;');
console.log('Professional shopping experience with real-time currency conversion, drag & drop, and Google OAuth integration.');
