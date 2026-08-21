document.addEventListener('DOMContentLoaded', () => {
  fetchDirectoryData(); // Fetch live database values
  initAccordions();
  initCopyToClipboard();
});

/**
 * Fetch stay details from database API and dynamically bind to DOM
 */
async function fetchDirectoryData() {
  try {
    const response = await fetch('/api/get-data');
    if (!response.ok) throw new Error('Data fetch failed');
    const data = await response.json();
    updateDOM(data);
  } catch (err) {
    console.warn("Could not load dynamic database stay information, using HTML defaults:", err);
  }
}

/**
 * Overwrite default values with database content dynamically
 */
function updateDOM(data) {
  if (!data) return;

  const setText = (id, val) => {
    const el = document.getElementById(id);
    if (el && val) el.innerHTML = val;
  };
  const setAttr = (id, attr, val) => {
    const el = document.getElementById(id);
    if (el && val) el.setAttribute(attr, val);
  };

  // Codes
  if (data.codes) {
    setText('gateCodeDisplay', data.codes.gateCode);
    setAttr('gateCodeCopyBtn', 'data-copy', data.codes.gateCode);

    setText('wifiNetworkDisplay', data.codes.wifiNetwork);
    setAttr('wifiNetworkCopyBtn', 'data-copy', data.codes.wifiNetwork);

    setText('wifiPasswordDisplay', data.codes.wifiPassword);
    setAttr('wifiPasswordCopyBtn', 'data-copy', data.codes.wifiPassword);
  }

  // Info Guidelines
  if (data.info) {
    setText('infoLaundryDisplay', data.info.laundry);
    setText('infoTrashDisplay', data.info.trash);
    setText('infoParkDisplay', data.info.park);
    setText('infoHotWaterDisplay', data.info.hotWater);
    setText('infoSmokingDisplay', data.info.smoking);
    setText('infoPackageDisplay', data.info.package);
    setText('infoParkingDisplay', data.info.parking);
  }

  // Housekeeping
  if (data.housekeeping) {
    setText('hkStudioRateDisplay', data.housekeeping.studioRate);
    setText('hkOneBedRateDisplay', data.housekeeping.oneBedRate);
    setText('hkTwoBedRateDisplay', data.housekeeping.twoBedRate);
    setText('hkExtraTowelDisplay', data.housekeeping.extraTowelCost);
    setText('hkLongTermDisplay', data.housekeeping.longTermPolicy);
  }

  // Rules
  if (data.rules) {
    setText('rulesQuietDisplay', data.rules.quietHours);
    setText('rulesCheckoutDisplay', data.rules.checkoutTime);
    setText('rulesAcDisplay', data.rules.acGuidelines);
    setText('rulesSecurityDisplay', data.rules.security);
  }

  // Support & Contact CTAs
  if (data.support) {
    setText('supportNameDisplay', data.support.name || 'Nisa');
    setText('supportHoursDisplay', data.support.hours);
    setText('supportEmergencyDisplay', data.support.emergencyNote);
    
    // Sanitize phone for tel: tags
    const cleanPhone = data.support.phone ? data.support.phone.replace(/\D/g, '') : '7866228549';
    setAttr('supportPhoneBtn', 'href', `tel:${cleanPhone}`);
    setAttr('heroCallBtn', 'href', `tel:${cleanPhone}`);
    setAttr('supportWhatsappBtn', 'href', data.support.whatsapp);
  }
}

/**
 * 1. Independent Accordion Menu System
 * Toggles accordion blocks open and closed independently.
 * Keeps Entrance Codes expanded on initial load as configured in HTML.
 */
function initAccordions() {
  const triggers = document.querySelectorAll('.accordion-trigger');
  
  triggers.forEach(trigger => {
    trigger.addEventListener('click', () => {
      const item = trigger.closest('.accordion-item');
      if (!item) return;
      
      const isActive = item.classList.contains('active');
      
      // Toggle current item
      if (isActive) {
        item.classList.remove('active');
        trigger.setAttribute('aria-expanded', 'false');
      } else {
        item.classList.add('active');
        trigger.setAttribute('aria-expanded', 'true');
      }
    });
  });
}

/**
 * 2. Clipboard Copy Utility with Toast Notifications
 */
function initCopyToClipboard() {
  const copyButtons = document.querySelectorAll('.copy-btn');
  const toastContainer = document.getElementById('toastContainer');
  
  if (!toastContainer) return;
  
  copyButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent trigger clicks if nested
      
      const textToCopy = btn.getAttribute('data-copy');
      if (!textToCopy) return;
      
      // Attempt using modern Clipboard API
      navigator.clipboard.writeText(textToCopy)
        .then(() => {
          // Success Feedback
          handleButtonFeedback(btn);
          showToast(`Copied: "${textToCopy}" to clipboard!`);
        })
        .catch(err => {
          console.error('Failed to copy text: ', err);
          // Fallback method for older iOS browsers
          fallbackCopyText(textToCopy, btn);
        });
    });
  });
  
  /**
   * Temporary button text change feedback
   */
  function handleButtonFeedback(btn) {
    const textEl = btn.querySelector('.btn-text');
    const originalText = textEl ? textEl.textContent : 'Copy';
    
    // Save original classes & content
    btn.classList.add('copied-state');
    if (textEl) textEl.textContent = 'Copied!';
    
    setTimeout(() => {
      btn.classList.remove('copied-state');
      if (textEl) textEl.textContent = originalText;
    }, 1500);
  }

  /**
   * Fallback text copy mechanism for older mobile browsers
   */
  function fallbackCopyText(text, btn) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    // Prevent scrolling
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.position = 'fixed';
    
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      const successful = document.execCommand('copy');
      if (successful) {
        handleButtonFeedback(btn);
        showToast(`Copied: "${text}" to clipboard!`);
      } else {
        showToast('Unable to copy. Please copy manually.');
      }
    } catch (err) {
      showToast('Error copying code.');
    }
    
    document.body.removeChild(textArea);
  }

  /**
   * 3. Toast Notifications Generator
   */
  let toastTimeout;
  function showToast(message) {
    // Clear any existing toast elements to prevent piling
    const existingToasts = toastContainer.querySelectorAll('.toast');
    existingToasts.forEach(t => t.remove());
    if (toastTimeout) clearTimeout(toastTimeout);
    
    // Create new Toast pill
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.setAttribute('role', 'alert');
    
    // Checkmark svg
    toast.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="#25D366" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px;"><polyline points="20 6 9 17 4 12"></polyline></svg>
      <span>${message}</span>
    `;
    
    toastContainer.appendChild(toast);
    
    // Hide and remove after 2.5 seconds
    toastTimeout = setTimeout(() => {
      toast.classList.add('toast-hide');
      // Wait for fade transition before removing
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, 2200);
  }
}
