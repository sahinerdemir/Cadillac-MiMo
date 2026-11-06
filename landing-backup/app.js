/* ==========================================================================
   Cadillac MiMo Hotel Coming Soon Page JS
   Theme: Miami Modern Retro-Luxury (Light Mode)
   Popup controls and interactive modal handlers
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initComingSoonPopup();
});

/**
 * Handles the elegant popup behavior when clicking social icons
 */
function initComingSoonPopup() {
  const dialog = document.getElementById('comingSoonDialog');
  const closeBtn = document.getElementById('closeDialogBtn');
  const socialIcons = document.querySelectorAll('.social-icon');
  
  if (!dialog || !closeBtn) return;
  
  // Show dialog when social icons with placeholder links are clicked
  socialIcons.forEach(icon => {
    icon.addEventListener('click', (e) => {
      const href = icon.getAttribute('href');
      // If it's a placeholder link (#), display the elegant popup modal
      if (href === '#' || href === '') {
        e.preventDefault();
        dialog.showModal();
      }
    });
  });
  
  // Close dialog on close button click
  closeBtn.addEventListener('click', () => {
    dialog.close();
  });
  
  // Close dialog when clicking outside the dialog content box (on the blurred backdrop)
  dialog.addEventListener('click', (e) => {
    const rect = dialog.getBoundingClientRect();
    const isInDialog = (
      e.clientX >= rect.left &&
      e.clientX <= rect.right &&
      e.clientY >= rect.top &&
      e.clientY <= rect.bottom
    );
    if (!isInDialog) {
      dialog.close();
    }
  });
}
