/* ==========================================================================
   Cadillac MiMo Hotel Guest Instructions JavaScript
   Interactivity: Accordions, Clipboard Actions, and Toast Alerts
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initAccordions();
  initCopyToClipboard();
});

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
