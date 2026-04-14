/* ===================================================
   CHRISTINE STORE — script.js
   Auth Guard | Product Renderer | Live Clock |
   Filter | Cart | Validation | Micro-interactions
   =================================================== */

'use strict';

console.log('Script loaded');

/* ─── STATE ─── */
let isLoggedIn = false;
let currentUser = null;
let cartCount = 0;
let pendingAction = null; // stores what to do after login

/* ─── PRODUCT DATA ─── */
const PRODUCTS = [
  {
    id: 1, category: 'men', badge: 'New',
    name: 'Tailored Navy Blazer',
    price: 249, oldPrice: 320,
    stars: 5, reviews: 142,
    img: 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=500&q=80'
  },
  {
    id: 2, category: 'women', badge: 'Trending',
    name: 'Silk Wrap Midi Dress',
    price: 189, oldPrice: null,
    stars: 5, reviews: 87,
    img: 'https://images.unsplash.com/photo-1550614000-4895a10e1bfd?w=500&q=80'
  },
  {
    id: 3, category: 'accessories', badge: 'Sale',
    name: 'Minimalist Leather Watch',
    price: 159, oldPrice: 219,
    stars: 4, reviews: 203,
    img: 'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=500&q=80'
  },
  {
    id: 4, category: 'women', badge: null,
    name: 'Cashmere Turtleneck',
    price: 139, oldPrice: null,
    stars: 5, reviews: 64,
    img: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&q=80'
  },
  {
    id: 5, category: 'men', badge: 'Sale',
    name: 'Premium Chino Pants',
    price: 89, oldPrice: 129,
    stars: 4, reviews: 318,
    img: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=500&q=80'
  },
  {
    id: 6, category: 'accessories', badge: 'New',
    name: 'Structured Tote Bag',
    price: 195, oldPrice: null,
    stars: 5, reviews: 99,
    img: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500&q=80'
  },
  {
    id: 7, category: 'men', badge: null,
    name: 'Oxford Button-Down Shirt',
    price: 79, oldPrice: null,
    stars: 4, reviews: 457,
    img: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500&q=80'
  },
  {
    id: 8, category: 'women', badge: 'Trending',
    name: 'High-Rise Linen Trousers',
    price: 115, oldPrice: 145,
    stars: 5, reviews: 71,
    img: 'https://n.nordstrommedia.com/it/4c002812-aed2-4609-9552-55db5092be1f.jpeg?h=368&w=240&dpr=2'
  }
];

/* ─── UTILITIES ─── */
const $ = id => document.getElementById(id);
const starsHTML = n => '★'.repeat(n) + '☆'.repeat(5 - n);

function showToast(msg) {
  const toast = $('toast');
  $('toast-msg').textContent = msg;
  toast.classList.add('visible');
  setTimeout(() => toast.classList.remove('visible'), 3000);
}

const THEME_KEY = 'christine-theme';

function applyTheme(theme) {
  console.log('Applying theme:', theme);
  document.body.classList.toggle('dark-theme', theme === 'dark');
  const icon = $('theme-toggle')?.querySelector('i');
  if (icon) icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch (e) {
    // localStorage not available
  }
}

function toggleTheme() {
  console.log('Toggling theme');
  applyTheme(document.body.classList.contains('dark-theme') ? 'light' : 'dark');
}

/* ─── LIVE CLOCK ─── */
function updateClock() {
  const now = new Date();
  const dateOpts = { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
  const timeOpts = { hour: '2-digit', minute: '2-digit', second: '2-digit' };
  const clockEl = $('live-clock');
  const navTimeEl = $('nav-time');
  if (clockEl) clockEl.textContent = now.toLocaleString('en-US', dateOpts);
  if (navTimeEl) {
    const valueEl = navTimeEl.querySelector('.nav-time-value');
    if (valueEl) {
      valueEl.textContent = now.toLocaleTimeString('en-US', timeOpts);
    } else {
      navTimeEl.innerHTML = `<i class="fas fa-clock"></i> <span class="nav-time-value">${now.toLocaleTimeString('en-US', timeOpts)}</span>`;
    }
  }
}
updateClock();
setInterval(updateClock, 1000);

/* ─── SCROLL: NAVBAR RESIZE ─── */
window.addEventListener('scroll', () => {
  const navbar = $('navbar');
  if (!navbar) return;
  navbar.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

/* ─── PRODUCT RENDERING ─── */
function buildProductCard(p) {
  const badgeClass = p.badge === 'Sale' ? 'sale' : '';
  const oldPriceHTML = p.oldPrice ? `<span class="price-old">rwf ${p.oldPrice}</span>` : '';
  const badgeHTML = p.badge ? `<span class="product-badge ${badgeClass}">${p.badge}</span>` : '';

  return `
    <div class="product-card" data-id="${p.id}" data-category="${p.category}">
      <div class="product-img-wrap">
        <img src="${p.img}" alt="${p.name}" loading="lazy" />
        ${badgeHTML}
        <div class="product-overlay">
          <button class="add-to-cart-btn" data-id="${p.id}" onclick="handleAddToCart(${p.id}, event)">
            <i class="fas fa-shopping-bag"></i> Add to Cart
          </button>
        </div>
      </div>
      <div class="product-info">
        <p class="product-category">${p.category}</p>
        <h3 class="product-name">${p.name}</h3>
        <div class="product-footer">
          <div class="product-price">
            <span class="price-current"> rwf ${p.price}</span>
            ${oldPriceHTML}
          </div>
          <div style="display:flex;align-items:center;gap:0.5rem;">
            <span class="product-stars">${starsHTML(p.stars)}</span>
            <button class="wishlist-btn" aria-label="Add to wishlist" onclick="toggleWishlist(this)">
              <i class="far fa-heart"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderProducts(filter = 'all') {
  const grid = $('product-grid');
  if (!grid) return;
  const filtered = filter === 'all' ? PRODUCTS : PRODUCTS.filter(p => p.category === filter);
  grid.innerHTML = filtered.map(buildProductCard).join('');
}

/* ─── FILTER BAR ─── */
function filterProducts(cat) {
  // Update active filter button
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === cat);
  });
  renderProducts(cat);
  document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
}

document.addEventListener('click', e => {
  const btn = e.target.closest('.filter-btn');
  if (!btn) return;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderProducts(btn.dataset.filter);
});

/* ─── WISHLIST TOGGLE ─── */
function toggleWishlist(btn) {
  const icon = btn.querySelector('i');
  const active = btn.classList.toggle('active');
  icon.className = active ? 'fas fa-heart' : 'far fa-heart';
  showToast(active ? '❤️ Added to wishlist' : 'Removed from wishlist');
}

/* ─── AUTH GUARD ─── */
function requireAuth(action) {
  if (isLoggedIn) {
    action();
  } else {
    pendingAction = action;
    openModal();
  }
}

function handleAddToCart(productId, event) {
  if (event) event.stopPropagation();
  requireAuth(() => {
    cartCount++;
    $('cart-badge').textContent = cartCount;
    const product = PRODUCTS.find(p => p.id === productId);
    showToast(`🛍️ "${product.name}" added to cart!`);
  });
}

/* ─── HERO / ORDER CTA ─── */
const heroCta = $('hero-cta');
if (heroCta) {
  heroCta.addEventListener('click', () => {
    requireAuth(() => {
      showToast('🎉 Welcome! Browse and add items to your cart.');
      const productsSection = document.getElementById('products');
      if (productsSection) productsSection.scrollIntoView({ behavior: 'smooth' });
    });
  });
}

const userBtn = $('user-btn');
console.log('userBtn found:', !!userBtn);
if (userBtn) {
  userBtn.addEventListener('click', () => {
    console.log('User button clicked, isLoggedIn:', isLoggedIn);
    if (isLoggedIn) {
      showToast(`👋 Logged in as ${currentUser.name}`);
    } else {
      pendingAction = null;
      openModal();
    }
  });
}

const cartBtn = $('cart-btn');
if (cartBtn) {
  cartBtn.addEventListener('click', () => {
    requireAuth(() => {
      showToast(cartCount > 0 ? `🛒 You have ${cartCount} item(s) in your cart.` : '🛒 Your cart is empty. Start shopping!');
    });
  });
};
/* ─── MODAL ─── */
function openModal() {
  console.log('Opening modal');
  const modal = $('auth-modal');
  if (!modal) {
    console.log('Modal not found');
    return;
  }
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
  setTimeout(() => {
    const nameField = $('reg-name');
    if (nameField) nameField.focus();
  }, 350);
}

function closeModal() {
  const modal = $('auth-modal');
  if (!modal) return;
  modal.classList.remove('active');
  document.body.style.overflow = '';
  clearErrors();
  const authForm = $('auth-form');
  if (authForm) authForm.reset();
}

const modalCloseBtn = $('modal-close-btn');
if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
const authModal = $('auth-modal');
if (authModal) {
  authModal.addEventListener('click', e => {
    if (e.target === authModal) closeModal();
  });
}
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});

/* ─── FORM VALIDATION ─── */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function clearErrors() {
  ['name-error', 'email-error', 'pass-error'].forEach(id => {
    const el = $(id);
    if (el) el.textContent = '';
  });
  ['reg-name', 'reg-email', 'reg-password'].forEach(id => {
    const el = $(id);
    if (el) el.classList.remove('error');
  });
}

function validateForm(name, email, password) {
  clearErrors();
  let valid = true;

  const setError = (fieldId, errId, msg) => {
    $(errId).textContent = msg;
    $(fieldId).classList.add('error');
    valid = false;
  };

  if (!name || name.trim().length < 2) {
    setError('reg-name', 'name-error', 'Name must be at least 2 characters.');
  } else if (name.trim().length > 60) {
    setError('reg-name', 'name-error', 'Name must be 60 characters or fewer.');
  }

  if (!email || !EMAIL_RE.test(email.trim())) {
    setError('reg-email', 'email-error', 'Please enter a valid email address.');
  }

  if (!password || password.length < 8) {
    setError('reg-password', 'pass-error', 'Password must be at least 8 characters.');
  }

  return valid;
}

function handleAuthSubmit(e) {
  e.preventDefault();
  const name     = $('reg-name').value;
  const email    = $('reg-email').value;
  const password = $('reg-password').value;

  if (!validateForm(name, email, password)) return;

  // Save user to local variable (no actual server)
  currentUser = { name: name.trim(), email: email.trim().toLowerCase() };
  isLoggedIn = true;

  closeModal();
  showToast(`✅ Welcome, ${currentUser.name.split(' ')[0]}! Account created.`);

  // Update user icon
  const userBtn = $('user-btn');
  userBtn.querySelector('i').className = 'fas fa-check-circle';
  userBtn.style.color = '#0066FF';

  // Execute any pending action
  if (pendingAction) {
    setTimeout(() => {
      pendingAction();
      pendingAction = null;
    }, 600);
  }
}

/* ─── NEWSLETTER ─── */
function handleNewsletter(e) {
  e.preventDefault();
  const email = $('nl-email').value.trim();
  if (!EMAIL_RE.test(email)) {
    showToast('⚠️ Please enter a valid email address.');
    return;
  }
  $('newsletter-form').innerHTML = `
    <div style="color:rgba(255,255,255,0.9);font-weight:600;font-size:1rem;padding:1rem;display:flex;align-items:center;gap:.5rem;justify-content:center;">
      <i class="fas fa-check-circle" style="color:#4CAF50;font-size:1.4rem;"></i>
      You're subscribed! Check your inbox soon.
    </div>`;
}

/* ─── INIT ─── */
// Apply theme immediately
let storedTheme = 'light';
try {
  storedTheme = localStorage.getItem(THEME_KEY) || 'light';
} catch (e) {
  // localStorage not available
}
applyTheme(storedTheme);

// Attach theme toggle immediately if element exists
const themeBtn = $('theme-toggle');
console.log('themeBtn found:', !!themeBtn);
if (themeBtn) {
  themeBtn.addEventListener('click', toggleTheme);
}

// Hamburger menu toggle
const hamburger = $('hamburger');
const navLinks = document.querySelector('.nav-links');
console.log('hamburger found:', !!hamburger);
if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('mobile-open');
    const icon = hamburger.querySelector('i');
    if (icon) {
      icon.className = navLinks.classList.contains('mobile-open') ? 'fas fa-times' : 'fas fa-bars';
    }
  });

  // Close menu when clicking a link
  navLinks.addEventListener('click', (e) => {
    if (e.target.closest('.nav-link') || e.target.closest('.nav-icon-btn')) {
      navLinks.classList.remove('mobile-open');
      const icon = hamburger.querySelector('i');
      if (icon) icon.className = 'fas fa-bars';
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  renderProducts('all');
  updateClock(); // Update clock after DOM is ready
});
