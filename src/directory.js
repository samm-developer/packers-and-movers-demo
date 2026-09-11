import { CITIES, DIRECTORY_LISTINGS } from './data.js';

export function initDirectory() {
  const tabsContainer = document.getElementById('city-tabs');
  const listingsGrid = document.getElementById('listings-grid');
  const searchInput = document.getElementById('directory-search');
  const resultsCounter = document.getElementById('directory-counter');

  let activeCity = 'all';
  let searchQuery = '';

  if (!tabsContainer || !listingsGrid) return;

  // Render City Tabs
  function renderTabs() {
    tabsContainer.innerHTML = CITIES.map(city => `
      <button class="city-tab ${city.id === activeCity ? 'active' : ''}" data-city="${city.id}">
        <i class="fas ${city.icon}"></i>
        <span>${city.name}</span>
      </button>
    `).join('');

    tabsContainer.querySelectorAll('.city-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        activeCity = tab.dataset.city;
        renderTabs();
        renderListings();
      });
    });
  }

  // Filter & Render Listings Cards
  function renderListings() {
    const filtered = DIRECTORY_LISTINGS.filter(item => {
      const matchCity = activeCity === 'all' || item.city === activeCity;
      const matchSearch = searchQuery === '' || 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.cityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.services.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchCity && matchSearch;
    });

    if (resultsCounter) {
      resultsCounter.innerText = `Showing ${filtered.length} verified listings`;
    }

    if (filtered.length === 0) {
      listingsGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem;">
          <i class="fas fa-search" style="font-size: 3rem; color: var(--text-muted); margin-bottom: 1rem;"></i>
          <h3>No moving partners found</h3>
          <p style="color: var(--text-secondary); max-width: 400px; margin: 0.5rem auto 1.5rem;">
            No listing matched "${searchQuery}". Try selecting another city or clearing your search filter.
          </p>
          <button class="btn-secondary" id="clear-search-btn">Reset Filters</button>
        </div>
      `;

      const resetBtn = document.getElementById('clear-search-btn');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          activeCity = 'all';
          searchQuery = '';
          if (searchInput) searchInput.value = '';
          renderTabs();
          renderListings();
        });
      }
      return;
    }

    listingsGrid.innerHTML = filtered.map(item => `
      <div class="listing-card">
        <div class="listing-header">
          <div class="listing-title">
            <h4>${item.name}</h4>
            <div class="listing-location">
              <i class="fas fa-map-marker-alt" style="color: var(--accent-emerald);"></i>
              ${item.address}
            </div>
          </div>
          <span class="badge-verified">
            <i class="fas fa-shield-alt"></i> ${item.badgeText}
          </span>
        </div>

        <div style="display: flex; align-items: center; justify-content: space-between;">
          <div class="rating-badge">
            <i class="fas fa-star"></i>
            <span>${item.rating}</span>
            <span style="color: var(--text-muted); font-size: 0.8rem;">(${item.reviews} reviews)</span>
          </div>
          <span style="font-size: 0.85rem; color: var(--accent-cyan); font-weight: 600;">
            <i class="fas fa-history"></i> ${item.experience}
          </span>
        </div>

        <div class="listing-tags">
          ${item.services.map(srv => `<span class="listing-tag">${srv}</span>`).join('')}
        </div>

        <div class="listing-footer">
          <div>
            <span style="font-size: 0.75rem; color: var(--text-muted); display: block;">Est. Range</span>
            <span style="font-weight: 700; color: var(--accent-emerald); font-size: 1rem;">${item.priceTag}</span>
          </div>
          <button class="btn-primary direct-call-btn" data-phone="${item.phone}" data-name="${item.name}">
            <i class="fas fa-phone-alt"></i> Contact
          </button>
        </div>
      </div>
    `).join('');

    listingsGrid.querySelectorAll('.direct-call-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const phone = e.currentTarget.dataset.phone;
        const name = e.currentTarget.dataset.name;
        
        const openModalEvt = new CustomEvent('openQuoteModal', {
          detail: {
            vendorName: name,
            vendorPhone: phone
          }
        });
        window.dispatchEvent(openModalEvt);
      });
    });
  }

  // Search input handler
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      renderListings();
    });
  }

  renderTabs();
  renderListings();
}
