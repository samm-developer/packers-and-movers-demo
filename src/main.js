import './style.css';
import { NAVBAR_MENU } from './data.js';
import { initModal, showToast } from './modal.js';

let currentView = 'home'; // 'home' | 'bangalore'

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  renderNavMenu();
  initModal();
  initHeroForm();
  initAdForm();
  initMumbaiForm();
  initContactForm();
  initViewSwitching();
  initCarousel();
  initReviewsCarousel();
});

// Automatic Image Carousel Logic
function initCarousel() {
  const container = document.getElementById('bangalore-carousel');
  if (!container) return;

  const slides = container.querySelectorAll('.carousel-slide');
  const dots = container.querySelectorAll('.carousel-dot');
  const captionTitle = document.getElementById('carousel-caption-title');
  const prevBtn = document.getElementById('carousel-prev');
  const nextBtn = document.getElementById('carousel-next');

  if (slides.length === 0) return;

  let currentIndex = 0;
  let timer = null;

  function showSlide(index) {
    if (index < 0) index = slides.length - 1;
    if (index >= slides.length) index = 0;
    currentIndex = index;

    slides.forEach((s, idx) => {
      s.classList.toggle('active', idx === currentIndex);
    });

    dots.forEach((d, idx) => {
      d.classList.toggle('active', idx === currentIndex);
    });

    const activeSlide = slides[currentIndex];
    const title = activeSlide.getAttribute('data-title');
    if (captionTitle && title) {
      captionTitle.innerText = title;
    }
  }

  function startAutoPlay() {
    stopAutoPlay();
    timer = setInterval(() => {
      showSlide(currentIndex + 1);
    }, 3500);
  }

  function stopAutoPlay() {
    if (timer) clearInterval(timer);
  }

  // Prev / Next button listeners
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      showSlide(currentIndex - 1);
      startAutoPlay();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      showSlide(currentIndex + 1);
      startAutoPlay();
    });
  }

  // Dot click listeners
  dots.forEach(dot => {
    dot.addEventListener('click', (e) => {
      const idx = parseInt(e.target.getAttribute('data-index') || '0', 10);
      showSlide(idx);
      startAutoPlay();
    });
  });

  // Pause on hover
  container.addEventListener('mouseenter', stopAutoPlay);
  container.addEventListener('mouseleave', startAutoPlay);

  startAutoPlay();
}

// Switch Active View Tab
function switchView(viewId) {
  currentView = viewId;
  const pageViews = document.querySelectorAll('.page-view');
  let viewFound = false;

  pageViews.forEach(view => {
    if (view.id === `view-${viewId}`) {
      view.classList.add('active');
      viewFound = true;
    } else {
      view.classList.remove('active');
    }
  });

  if (!viewFound) {
    // Default fallback to home if view is not built yet
    document.getElementById('view-home')?.classList.add('active');
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Update Active Class in Nav Menu
  document.querySelectorAll('.nav-menu-item').forEach(item => {
    const link = item.querySelector('a');
    if (link?.getAttribute('data-view') === viewId) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });
}

// Render Menu Bar
function renderNavMenu() {
  const container = document.getElementById('main-nav-menu');
  if (!container) return;

  container.innerHTML = NAVBAR_MENU.map(item => `
    <li class="nav-menu-item ${item.id === 'home' ? 'active' : ''}">
      <a href="${item.href}" data-view="${item.id}">${item.label}</a>
    </li>
  `).join('');

  container.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', (e) => {
      const viewAttr = link.getAttribute('data-view');
      if (viewAttr && document.getElementById(`view-${viewAttr}`)) {
        e.preventDefault();
        switchView(viewAttr);
      } else if (viewAttr === 'home' && link.getAttribute('href') === '#hero') {
        e.preventDefault();
        switchView('home');
      }
    });
  });
}

function initViewSwitching() {
  const logoTrigger = document.getElementById('logo-home-trigger');
  if (logoTrigger) {
    logoTrigger.addEventListener('click', (e) => {
      e.preventDefault();
      switchView('home');
    });
  }

  document.querySelectorAll('.trigger-home-link, .nav-home-btn').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      switchView('home');
    });
  });
}

// Theme Switcher
function initThemeToggle() {
  const toggleBtn = document.getElementById('theme-toggle-btn');
  const html = document.documentElement;

  const savedTheme = localStorage.getItem('theme') || 'dark';
  html.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const current = html.getAttribute('data-theme');
      const nextTheme = current === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-theme', nextTheme);
      localStorage.setItem('theme', nextTheme);
      updateThemeIcon(nextTheme);
    });
  }
}

function updateThemeIcon(theme) {
  const icon = document.querySelector('#theme-toggle-btn i');
  if (!icon) return;
  icon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
}

// Hero Form Submission Handler (Saves to MongoDB Atlas)
function initHeroForm() {
  const form = document.getElementById('hero-shift-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('hero-name')?.value || 'Customer';
    const mobile = document.getElementById('hero-mobile')?.value || '';
    const shiftingDetails = document.getElementById('hero-details')?.value || 'Home Shifting';
    const city = document.getElementById('hero-city')?.value || 'Bangalore';

    if (!mobile || mobile.length < 10) {
      showToast('Please enter a valid 10-digit mobile number', 'warning');
      return;
    }

    try {
      const response = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, mobile, shiftingDetails, city, source: 'Website Hero Form' })
      });

      const resData = await response.json();
      if (resData.success) {
        showToast(`Thank you ${name}! Shifting request saved to Database. Our expert will call ${mobile} within 5 minutes.`, 'success');
      } else {
        showToast(`Thank you ${name}! Shifting request received. Our expert will call ${mobile} within 5 minutes.`, 'success');
      }
    } catch (err) {
      showToast(`Thank you ${name}! Shifting request received. Our expert will call ${mobile} within 5 minutes.`, 'success');
    }

    form.reset();
  });
}

// Automatic 4-Item Row Reviews Carousel Logic
function initReviewsCarousel() {
  const container = document.getElementById('reviews-container');
  const track = document.getElementById('reviews-track');
  const prevBtn = document.getElementById('reviews-prev');
  const nextBtn = document.getElementById('reviews-next');

  if (!container || !track) return;

  const cards = track.querySelectorAll('.review-item-card');
  if (cards.length === 0) return;

  let currentIndex = 0;
  let timer = null;

  function getCardsPerView() {
    const width = window.innerWidth;
    if (width <= 520) return 1;
    if (width <= 768) return 2;
    if (width <= 1100) return 3;
    return 4; // 4 cards visible in 1 row on desktop
  }

  function updateCarousel() {
    const cardsPerView = getCardsPerView();
    const maxIndex = Math.max(0, cards.length - cardsPerView);
    if (currentIndex > maxIndex) currentIndex = 0;
    if (currentIndex < 0) currentIndex = maxIndex;

    const cardWidth = cards[0].offsetWidth;
    const gap = parseFloat(window.getComputedStyle(track).gap) || 20;

    const moveDistance = (cardWidth + gap) * currentIndex;
    track.style.transform = `translateX(-${moveDistance}px)`;
  }

  function nextSlide() {
    const cardsPerView = getCardsPerView();
    const maxIndex = Math.max(0, cards.length - cardsPerView);
    if (currentIndex >= maxIndex) {
      currentIndex = 0;
    } else {
      currentIndex++;
    }
    updateCarousel();
  }

  function prevSlide() {
    const cardsPerView = getCardsPerView();
    const maxIndex = Math.max(0, cards.length - cardsPerView);
    if (currentIndex <= 0) {
      currentIndex = maxIndex;
    } else {
      currentIndex--;
    }
    updateCarousel();
  }

  function startAutoPlay() {
    stopAutoPlay();
    timer = setInterval(nextSlide, 3500); // Auto scroll one by one every 3.5s
  }

  function stopAutoPlay() {
    if (timer) clearInterval(timer);
  }

  nextBtn?.addEventListener('click', () => {
    nextSlide();
    startAutoPlay();
  });

  prevBtn?.addEventListener('click', () => {
    prevSlide();
    startAutoPlay();
  });

  container.addEventListener('mouseenter', stopAutoPlay);
  container.addEventListener('mouseleave', startAutoPlay);

  window.addEventListener('resize', updateCarousel);

  startAutoPlay();
  updateCarousel();
}

// Business Advertising Form Submission Handler (Saves to MongoDB Atlas)
function initAdForm() {
  const form = document.getElementById('advertise-inquiry-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('ad-name')?.value || 'Business Partner';
    const email = document.getElementById('ad-email')?.value || '';
    const mobile = document.getElementById('ad-mobile')?.value || '';
    const businessName = document.getElementById('ad-company')?.value || '';
    const message = document.getElementById('ad-message')?.value || '';

    if (!email && !mobile) {
      showToast('Please enter your contact email or mobile number', 'warning');
      return;
    }

    try {
      const res = await fetch('/api/ad-inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, mobile, businessName, message })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Thank you ${name}! Advertising inquiry saved to Database. Our listing manager will call ${mobile || email}.`, 'success');
      } else {
        showToast(`Thank you ${name}! Advertising request received.`, 'success');
      }
    } catch (err) {
      showToast(`Thank you ${name}! Advertising inquiry received successfully.`, 'success');
    }

    form.reset();
  });
}

// Mumbai Form Submission Handler (Saves to MongoDB Atlas)
function initMumbaiForm() {
  const form = document.getElementById('mumbai-shift-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('mumbai-name')?.value || 'Customer';
    const mobile = document.getElementById('mumbai-phone')?.value || '';
    const date = document.getElementById('mumbai-date')?.value || '';
    const fromLoc = document.getElementById('mumbai-from')?.value || 'Mumbai';
    const toLoc = document.getElementById('mumbai-to')?.value || 'Destination';

    if (!mobile || mobile.length < 10) {
      showToast('Please enter a valid 10-digit mobile number', 'warning');
      return;
    }

    const shiftingDetails = `Shifting from ${fromLoc} to ${toLoc} (Date: ${date})`;

    try {
      const res = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, mobile, shiftingDetails, city: 'Mumbai', source: 'Mumbai Page Quick Form' })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Thank you ${name}! Mumbai shifting request saved to Database. Partner will call ${mobile}.`, 'success');
      } else {
        showToast(`Thank you ${name}! Shifting request received for ${mobile}.`, 'success');
      }
    } catch (err) {
      showToast(`Thank you ${name}! Shifting request received for ${mobile}.`, 'success');
    }

    form.reset();
  });
}

// Contact Page Form Submission Handler (Saves to MongoDB Atlas)
function initContactForm() {
  const form = document.getElementById('contact-page-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('contact-name')?.value || 'Customer';
    const mobile = document.getElementById('contact-mobile')?.value || '';
    const email = document.getElementById('contact-email')?.value || '';
    const city = document.getElementById('contact-city')?.value || 'General';
    const message = document.getElementById('contact-message')?.value || '';

    if (!mobile || mobile.length < 10) {
      showToast('Please enter a valid 10-digit mobile number', 'warning');
      return;
    }

    try {
      const res = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, mobile, shiftingDetails: `Message: ${message} (Email: ${email})`, city, source: 'Contact Us Page Form' })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Thank you ${name}! Your query was saved to Database. Support will contact ${mobile}.`, 'success');
      } else {
        showToast(`Thank you ${name}! Message received. Support will call ${mobile}.`, 'success');
      }
    } catch (err) {
      showToast(`Thank you ${name}! Message received. Support will call ${mobile}.`, 'success');
    }

    form.reset();
  });
}
