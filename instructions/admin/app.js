/* ==========================================================================
   Cadillac MiMo - Admin Portal Controller
   Interactivity: Form data binding, Auth management, Vercel API connection
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  initLoginForm();
  initDirectoryForm();
  initManagerPanelToggle();
  initLogout();
});

/**
 * 1. Session-based Authentication Check
 */
function checkAuth() {
  const password = sessionStorage.getItem('adminPassword');
  const loginScreen = document.getElementById('loginScreen');
  const adminDashboard = document.getElementById('adminDashboard');
  
  if (password) {
    // Session exists: show dashboard and load database info
    loginScreen.classList.add('hidden');
    adminDashboard.classList.remove('hidden');
    loadDirectoryData();
  } else {
    // Show login screen
    loginScreen.classList.remove('hidden');
    adminDashboard.classList.add('hidden');
  }
}

/**
 * 2. Login Submit Handler (Server-Verified Auth)
 */
function initLoginForm() {
  const form = document.getElementById('loginForm');
  const passwordInput = document.getElementById('adminPassword');
  const submitBtn = form.querySelector('button[type="submit"]');
  const errorEl = document.getElementById('loginError');
  const toggleBtn = document.getElementById('togglePasswordBtn');

  if (toggleBtn && passwordInput) {
    toggleBtn.addEventListener('click', () => {
      const isPassword = passwordInput.type === 'password';
      passwordInput.type = isPassword ? 'text' : 'password';
      toggleBtn.textContent = isPassword ? '🙈' : '👁️';
    });
  }
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorEl.textContent = '';
    
    const password = passwordInput.value.trim();
    if (!password) {
      errorEl.textContent = 'Please enter the admin password.';
      return;
    }
    
    // Show verifying state
    const originalBtnText = submitBtn.textContent;
    submitBtn.textContent = 'Verifying...';
    submitBtn.disabled = true;

    try {
      const res = await fetch('/api/verify-auth', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${password}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Incorrect password. Access denied.');
      }

      // Store validated password in sessionStorage
      sessionStorage.setItem('adminPassword', password);
      passwordInput.value = '';
      checkAuth();
      showToast('Signed in successfully.');
    } catch (err) {
      errorEl.textContent = err.message || 'Incorrect password. Access denied.';
      showToast(err.message || 'Incorrect password.', true);
      passwordInput.focus();
    } finally {
      submitBtn.textContent = originalBtnText;
      submitBtn.disabled = false;
    }
  });
}

/**
 * 3. Logout Handler
 */
function initLogout() {
  const logoutBtn = document.getElementById('logoutBtn');
  logoutBtn.addEventListener('click', () => {
    sessionStorage.removeItem('adminPassword');
    document.getElementById('adminPassword').value = '';
    checkAuth();
    showToast('Logged out successfully.');
  });
}

/**
 * 4. Fetch Stay Information from server
 */
async function loadDirectoryData() {
  const statusEl = document.getElementById('saveStatus');
  statusEl.textContent = 'Loading live data...';
  
  try {
    const response = await fetch('/api/get-data');
    if (!response.ok) {
      throw new Error('Failed to load database content.');
    }
    
    const data = await response.json();
    populateForm(data);
    
    statusEl.textContent = 'All changes pushed online.';
    statusEl.className = 'save-status success';
  } catch (error) {
    console.error('Error fetching stay details:', error);
    statusEl.textContent = 'Failed to load live data. Displaying fallback values.';
    statusEl.className = 'save-status error';
    showToast('Error loading stay details from server.', true);
  }
}

/**
 * Map JSON structure to Form inputs
 */
function populateForm(data) {
  if (!data) return;

  // Codes Section
  if (data.codes) {
    document.getElementById('gateCode').value = data.codes.gateCode || '';
    document.getElementById('wifiNetwork').value = data.codes.wifiNetwork || '';
    document.getElementById('wifiPassword').value = data.codes.wifiPassword || '';
    
    // Additional Wi-Fi
    document.getElementById('wifiNetwork1').value = data.codes.wifiNetwork1 || 'WI-TEK_75a4';
    document.getElementById('wifiPassword1').value = data.codes.wifiPassword1 || '88888888';
    document.getElementById('wifiNetwork2').value = data.codes.wifiNetwork2 || 'WI-TEK_1f46';
    document.getElementById('wifiPassword2').value = data.codes.wifiPassword2 || '88888888';
    document.getElementById('wifiNetwork3').value = data.codes.wifiNetwork3 || 'WI-TEK_322C';
    document.getElementById('wifiPassword3').value = data.codes.wifiPassword3 || '88888888';
    document.getElementById('wifiNetwork4').value = data.codes.wifiNetwork4 || 'WI-TEK_7274';
    document.getElementById('wifiPassword4').value = data.codes.wifiPassword4 || '88888888';
  }

  // Info Guidelines Section
  if (data.info) {
    document.getElementById('infoLaundry').value = data.info.laundry || '';
    document.getElementById('infoTrash').value = data.info.trash || '';
    document.getElementById('infoPark').value = data.info.park || '';
    document.getElementById('infoHotWater').value = data.info.hotWater || '';
    document.getElementById('infoSmoking').value = data.info.smoking || '';
    document.getElementById('infoPackage').value = data.info.package || '';
    document.getElementById('infoParking').value = data.info.parking || '';
  }

  // Housekeeping Section
  if (data.housekeeping) {
    document.getElementById('hkStudio').value = data.housekeeping.studioRate || '';
    document.getElementById('hkOneBed').value = data.housekeeping.oneBedRate || '';
    document.getElementById('hkTwoBed').value = data.housekeeping.twoBedRate || '';
    document.getElementById('hkExtraTowel').value = data.housekeeping.extraTowelCost || '';
    document.getElementById('hkLongTerm').value = data.housekeeping.longTermPolicy || '';
  }

  // Rules Section
  if (data.rules) {
    document.getElementById('rulesQuiet').value = data.rules.quietHours || '';
    document.getElementById('rulesCheckout').value = data.rules.checkoutTime || '';
    document.getElementById('rulesAc').value = data.rules.acGuidelines || '';
    document.getElementById('rulesSecurity').value = data.rules.security || '';
  }

  // Support Section
  if (data.support) {
    document.getElementById('supportName').value = data.support.name || 'Sweda';
    document.getElementById('currentManagerName').textContent = data.support.name || 'Sweda';
    document.getElementById('supportPhone').value = data.support.phone || '';
    document.getElementById('supportWhatsapp').value = data.support.whatsapp || '';
    document.getElementById('supportHours').value = data.support.hours || '';
    document.getElementById('supportEmergency').value = data.support.emergencyNote || '';
  }

  // Social Section
  if (data.social) {
    document.getElementById('socialInstagram').value = data.social.instagram || '';
    document.getElementById('socialFacebook').value = data.social.facebook || '';
  }

  // Titles Section
  if (data.titles) {
    document.getElementById('titleCodesEn').value = data.titles.codesEn || '';
    document.getElementById('titleCodesEs').value = data.titles.codesEs || '';
    document.getElementById('titlePropertyEn').value = data.titles.propertyEn || '';
    document.getElementById('titlePropertyEs').value = data.titles.propertyEs || '';
    document.getElementById('titleHkEn').value = data.titles.hkEn || '';
    document.getElementById('titleHkEs').value = data.titles.hkEs || '';
    document.getElementById('titleRulesEn').value = data.titles.rulesEn || '';
    document.getElementById('titleRulesEs').value = data.titles.rulesEs || '';
    document.getElementById('titleGuideEn').value = data.titles.guideEn || '';
    document.getElementById('titleGuideEs').value = data.titles.guideEs || '';
    document.getElementById('titleSupportEn').value = data.titles.supportEn || '';
    document.getElementById('titleSupportEs').value = data.titles.supportEs || '';
  }
}

/**
 * 5. Submit changes to the database
 */
function initDirectoryForm() {
  const form = document.getElementById('directoryForm');
  const statusEl = document.getElementById('saveStatus');
  const saveBtn = document.getElementById('saveBtn');
  
  // Track input changes across all inputs (including manager panel) to trigger local state warning
  const allInputs = document.querySelectorAll('input, textarea');
  allInputs.forEach(input => {
    input.addEventListener('input', () => {
      if (statusEl.className !== 'save-status error') {
        statusEl.textContent = 'Changes are local. Press Save to push online.';
        statusEl.className = 'save-status';
      }
    });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Disable save button to prevent double submissions
    saveBtn.disabled = true;
    statusEl.textContent = 'Saving stay details...';
    
    const password = sessionStorage.getItem('adminPassword');
    if (!password) {
      showToast('Session expired. Please log in again.', true);
      checkAuth();
      saveBtn.disabled = false;
      return;
    }

    // Build JSON Payload matching our database architecture
    const payload = {
      codes: {
        gateCode: document.getElementById('gateCode').value.trim(),
        wifiNetwork: document.getElementById('wifiNetwork').value.trim(),
        wifiPassword: document.getElementById('wifiPassword').value.trim(),
        
        // Additional Wi-Fi
        wifiNetwork1: document.getElementById('wifiNetwork1').value.trim(),
        wifiPassword1: document.getElementById('wifiPassword1').value.trim(),
        wifiNetwork2: document.getElementById('wifiNetwork2').value.trim(),
        wifiPassword2: document.getElementById('wifiPassword2').value.trim(),
        wifiNetwork3: document.getElementById('wifiNetwork3').value.trim(),
        wifiPassword3: document.getElementById('wifiPassword3').value.trim(),
        wifiNetwork4: document.getElementById('wifiNetwork4').value.trim(),
        wifiPassword4: document.getElementById('wifiPassword4').value.trim()
      },
      info: {
        laundry: document.getElementById('infoLaundry').value.trim(),
        trash: document.getElementById('infoTrash').value.trim(),
        park: document.getElementById('infoPark').value.trim(),
        hotWater: document.getElementById('infoHotWater').value.trim(),
        smoking: document.getElementById('infoSmoking').value.trim(),
        package: document.getElementById('infoPackage').value.trim(),
        parking: document.getElementById('infoParking').value.trim()
      },
      housekeeping: {
        studioRate: document.getElementById('hkStudio').value.trim(),
        oneBedRate: document.getElementById('hkOneBed').value.trim(),
        twoBedRate: document.getElementById('hkTwoBed').value.trim(),
        extraTowelCost: document.getElementById('hkExtraTowel').value.trim(),
        longTermPolicy: document.getElementById('hkLongTerm').value.trim()
      },
      rules: {
        quietHours: document.getElementById('rulesQuiet').value.trim(),
        checkoutTime: document.getElementById('rulesCheckout').value.trim(),
        acGuidelines: document.getElementById('rulesAc').value.trim(),
        security: document.getElementById('rulesSecurity').value.trim()
      },
      support: {
        name: document.getElementById('supportName').value.trim(),
        phone: document.getElementById('supportPhone').value.trim(),
        whatsapp: document.getElementById('supportWhatsapp').value.trim(),
        hours: document.getElementById('supportHours').value.trim(),
        emergencyNote: document.getElementById('supportEmergency').value.trim()
      },
      social: {
        instagram: document.getElementById('socialInstagram').value.trim(),
        facebook: document.getElementById('socialFacebook').value.trim()
      },
      titles: {
        codesEn: document.getElementById('titleCodesEn').value.trim(),
        codesEs: document.getElementById('titleCodesEs').value.trim(),
        propertyEn: document.getElementById('titlePropertyEn').value.trim(),
        propertyEs: document.getElementById('titlePropertyEs').value.trim(),
        hkEn: document.getElementById('titleHkEn').value.trim(),
        hkEs: document.getElementById('titleHkEs').value.trim(),
        rulesEn: document.getElementById('titleRulesEn').value.trim(),
        rulesEs: document.getElementById('titleRulesEs').value.trim(),
        guideEn: document.getElementById('titleGuideEn').value.trim(),
        guideEs: document.getElementById('titleGuideEs').value.trim(),
        supportEn: document.getElementById('titleSupportEn').value.trim(),
        supportEs: document.getElementById('titleSupportEs').value.trim()
      }
    };

    try {
      const response = await fetch('/api/save-data', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${password}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.status === 401) {
        // Password failed - offer immediate recovery prompt so changes aren't lost
        const retryPassword = prompt('Password rejected by server. Please enter the admin password (cadillac5201) to save your changes:');
        if (retryPassword && retryPassword.trim()) {
          const cleanRetry = retryPassword.trim();
          const retryRes = await fetch('/api/save-data', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${cleanRetry}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
          });

          if (retryRes.ok) {
            sessionStorage.setItem('adminPassword', cleanRetry);
            statusEl.textContent = 'All changes pushed online.';
            statusEl.className = 'save-status success';
            showToast('Settings saved successfully!');
            return;
          }
        }

        // Unauthorized: session reset
        sessionStorage.removeItem('adminPassword');
        document.getElementById('adminPassword').value = '';
        checkAuth();
        
        const loginErrorEl = document.getElementById('loginError');
        if (loginErrorEl) {
          loginErrorEl.textContent = 'Incorrect password. Access denied.';
        }
        showToast('Incorrect password. Access denied.', true);
        throw new Error('Unauthorized');
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Server error saving stay details.');
      }

      // Success
      document.getElementById('currentManagerName').textContent = document.getElementById('supportName').value.trim();
      const managerPanel = document.getElementById('managerPanel');
      if (managerPanel) {
        managerPanel.classList.remove('active');
        document.getElementById('toggleManagerBtn').textContent = 'Edit Profile';
      }
      statusEl.textContent = 'All changes pushed online.';
      statusEl.className = 'save-status success';
      showToast('Settings saved successfully!');
    } catch (error) {
      if (error.message !== 'Unauthorized') {
        console.error('Error posting stay details:', error);
        statusEl.textContent = `Save failed: ${error.message}`;
        statusEl.className = 'save-status error';
        showToast(error.message, true);
      }
    } finally {
      saveBtn.disabled = false;
    }
  });
}

/**
 * Collapsible Manager Settings Panel Toggle Handler
 */
function initManagerPanelToggle() {
  const toggleBtn = document.getElementById('toggleManagerBtn');
  const closeBtn = document.getElementById('closeManagerBtn');
  const panel = document.getElementById('managerPanel');
  
  if (!toggleBtn || !panel || !closeBtn) return;
  
  toggleBtn.addEventListener('click', () => {
    panel.classList.toggle('active');
    toggleBtn.textContent = panel.classList.contains('active') ? 'Close Editor' : 'Edit Profile';
  });
  
  closeBtn.addEventListener('click', () => {
    panel.classList.remove('active');
    toggleBtn.textContent = 'Edit Profile';
  });
}

/**
 * 6. Dynamic Toast Alerts Generator
 */
let toastTimeout;
function showToast(message, isError = false) {
  const toastContainer = document.getElementById('toastContainer');
  if (!toastContainer) return;

  // Remove existing toasts
  const existingToasts = toastContainer.querySelectorAll('.toast');
  existingToasts.forEach(t => t.remove());
  if (toastTimeout) clearTimeout(toastTimeout);

  const toast = document.createElement('div');
  toast.className = `toast ${isError ? 'toast-error' : ''}`;
  toast.setAttribute('role', 'alert');

  // Simple icon selector
  const strokeColor = isError ? '#ef4444' : '#22c55e';
  const iconMarkup = isError 
    ? `<svg viewBox="0 0 24 24" fill="none" stroke="${strokeColor}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px;"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`
    : `<svg viewBox="0 0 24 24" fill="none" stroke="${strokeColor}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px;"><polyline points="20 6 9 17 4 12"></polyline></svg>`;

  toast.innerHTML = `
    ${iconMarkup}
    <span>${message}</span>
  `;

  toastContainer.appendChild(toast);

  toastTimeout = setTimeout(() => {
    toast.classList.add('toast-hide');
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

/**
 * 7. English to Spanish Auto-Translation Utility
 */
async function translateField(sourceId, targetId) {
  const sourceEl = document.getElementById(sourceId);
  const targetEl = document.getElementById(targetId);
  if (!sourceEl || !targetEl) return;

  const text = sourceEl.value.trim();
  if (!text) {
    showToast('Please enter an English title first.', true);
    return;
  }

  const btn = event?.currentTarget || document.activeElement;
  let originalText = '';
  if (btn && btn.classList.contains('translate-btn')) {
    originalText = btn.innerHTML;
    btn.innerHTML = '⌛ Translating...';
    btn.disabled = true;
  }

  try {
    const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|es`);
    if (!res.ok) throw new Error('Translation API failed');
    
    const data = await res.json();
    if (data.responseData && data.responseData.translatedText) {
      targetEl.value = data.responseData.translatedText;
      // Dispatch input event to notify any validation listeners of the change
      targetEl.dispatchEvent(new Event('input', { bubbles: true }));
      // Notify save bar of local unsaved change
      const saveStatus = document.getElementById('saveStatus');
      if (saveStatus) {
        saveStatus.textContent = 'Changes are local. Press Save to push online.';
      }
      showToast('Translated successfully!');
    } else {
      throw new Error('No translated text returned');
    }
  } catch (err) {
    console.error("Translation error:", err);
    showToast('Translation service failed. Please fill manually.', true);
  } finally {
    if (btn && btn.classList.contains('translate-btn')) {
      btn.innerHTML = originalText;
      btn.disabled = false;
    }
  }
}
