// Moving Cost Calculator Logic

export function initCalculator() {
  const moveType = document.getElementById('calc-move-type');
  const sizeSelect = document.getElementById('calc-home-size');
  const distanceInput = document.getElementById('calc-distance');
  const packingTier = document.getElementById('calc-packing-tier');
  const resultDisplay = document.getElementById('calc-price-output');
  const bookBtn = document.getElementById('calc-book-btn');

  if (!sizeSelect || !resultDisplay) return;

  function calculatePrice() {
    const isIntercity = moveType.value === 'intercity';
    const size = sizeSelect.value;
    const dist = parseFloat(distanceInput.value) || 20;
    const tier = packingTier.value;

    let base = 3500;

    // Home size multiplier
    switch (size) {
      case '1bhk': base = 4200; break;
      case '2bhk': base = 7500; break;
      case '3bhk': base = 12000; break;
      case '4bhk': base = 18500; break;
      case 'vehicle': base = 3500; break;
      case 'office': base = 14000; break;
      default: base = 5000;
    }

    // Distance calculation
    if (isIntercity) {
      base += dist * 35;
    } else {
      base += Math.max(0, dist - 15) * 40;
    }

    // Packing tier multiplier
    if (tier === 'premium') {
      base *= 1.25;
    } else if (tier === 'vip') {
      base *= 1.5;
    }

    const minPrice = Math.round(base);
    const maxPrice = Math.round(base * 1.2);

    resultDisplay.innerHTML = `₹${minPrice.toLocaleString('en-IN')} - ₹${maxPrice.toLocaleString('en-IN')}`;
  }

  [moveType, sizeSelect, distanceInput, packingTier].forEach(element => {
    if (element) {
      element.addEventListener('change', calculatePrice);
      element.addEventListener('input', calculatePrice);
    }
  });

  calculatePrice();

  if (bookBtn) {
    bookBtn.addEventListener('click', () => {
      const openModalEvt = new CustomEvent('openQuoteModal', {
        detail: {
          moveType: moveType.value,
          size: sizeSelect.value,
          estimatedPrice: resultDisplay.innerText
        }
      });
      window.dispatchEvent(openModalEvt);
    });
  }
}
