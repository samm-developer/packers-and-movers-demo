// Modal & Toast Notification Logic

export function initModal() {
  const overlay = document.getElementById('quote-modal-overlay');
  const closeBtn = document.getElementById('modal-close-btn');
  const form = document.getElementById('quote-modal-form');
  const modalHeaderTitle = document.getElementById('modal-title-text');
  const modalSub = document.getElementById('modal-sub-text');

  if (!overlay) return;

  function showModal(detail = {}) {
    if (modalHeaderTitle) {
      if (detail.vendorName) {
        modalHeaderTitle.innerText = `Contact ${detail.vendorName}`;
        modalSub.innerText = `Get instant price quote directly from this verified moving partner`;
      } else if (detail.estimatedPrice) {
        modalHeaderTitle.innerText = `Request Best Rate (${detail.estimatedPrice})`;
        modalSub.innerText = `Lock in your estimated rate with top-rated Packers & Movers`;
      } else {
        modalHeaderTitle.innerText = `Get Instant Free Moving Quote`;
        modalSub.innerText = `Receive up to 4 competitive quotes from verified packers in 10 minutes`;
      }
    }

    overlay.classList.add('active');
  }

  function hideModal() {
    overlay.classList.remove('active');
  }

  // Trigger buttons across page
  document.querySelectorAll('[data-trigger-quote]').forEach(btn => {
    btn.addEventListener('click', () => showModal());
  });

  if (closeBtn) closeBtn.addEventListener('click', hideModal);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) hideModal();
  });

  window.addEventListener('openQuoteModal', (e) => {
    showModal(e.detail || {});
  });

  // Handle Form Submission (Saves to MongoDB Atlas)
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('modal-input-name')?.value || 'Customer';
      const phone = document.getElementById('modal-input-phone')?.value || '';
      const detailsInput = form.querySelector('input[placeholder*="2BHK"]');
      const shiftingDetails = detailsInput?.value || 'Instant Quote Request';

      if (!phone || phone.length < 10) {
        showToast('Please enter a valid 10-digit contact number', 'warning');
        return;
      }

      hideModal();

      try {
        const res = await fetch('/api/quotes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, mobile: phone, shiftingDetails, source: 'Modal Popup Form' })
        });
        const data = await res.json();
        if (data.success) {
          showToast(`Thank you ${name}! Your quote request was saved to Database. Partner will call ${phone}.`, 'success');
        } else {
          showToast(`Thank you ${name}! Our verified partner will call you at ${phone} shortly.`, 'success');
        }
      } catch (err) {
        showToast(`Thank you ${name}! Our verified partner will call you at ${phone} shortly.`, 'success');
      }

      form.reset();
    });
  }
}

export function showToast(message, type = 'info') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  const iconMap = {
    success: 'fa-check-circle',
    warning: 'fa-exclamation-triangle',
    info: 'fa-info-circle'
  };

  toast.innerHTML = `
    <i class="fas ${iconMap[type] || 'fa-bell'}" style="color: var(--accent-emerald);"></i>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}
