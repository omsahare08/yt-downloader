// Content script - runs on YouTube watch pages
// Currently used by popup.js via executeScript to extract page data
// Can be extended to inject a floating download button on the page

(function() {
  // Optional: inject a small download button below the video player
  // Uncomment the lines below to enable an in-page button

  
  function injectButton() {
    if (document.getElementById('yt-dl-btn')) return;

    const btn = document.createElement('button');
    btn.id = 'yt-dl-btn';
    btn.textContent = '⬇ Download';
    btn.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 9999;
      background: linear-gradient(135deg, #ff2d2d, #ff6b35);
      color: white;
      border: none;
      border-radius: 8px;
      padding: 10px 18px;
      font-weight: bold;
      font-size: 13px;
      cursor: pointer;
      box-shadow: 0 4px 20px rgba(255,45,45,0.4);
    `;
    btn.addEventListener('click', () => {
      // Opens the extension popup
      chrome.runtime.sendMessage({ action: 'openPopup' });
    });
    document.body.appendChild(btn);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectButton);
  } else {
    injectButton();
  }
  
})();
