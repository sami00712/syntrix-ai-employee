(function() {
  // Config
  const scriptTag = document.currentScript;
  const API_KEY = scriptTag.getAttribute('data-api-key');
  
  // Robust URL detection
  let BASE_URL;
  if (scriptTag && scriptTag.src) {
    const url = new URL(scriptTag.src);
    BASE_URL = url.origin;
  } else {
    BASE_URL = window.location.origin;
  }
  
  // Allow override via data-backend-url attribute on script tag
  let BACKEND_URL = scriptTag.getAttribute('data-backend-url');
  if (!BACKEND_URL) {
    BACKEND_URL = BASE_URL.replace(':3000', ':8000');
  }

  if (!API_KEY) {
    console.error('AI Employee Widget: API Key is missing!');
    return;
  }

  // Icons SVG definitions
  const ICONS = {
    bot: `
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/>
      </svg>
    `,
    message: `
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"/>
      </svg>
    `,
    close: `
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
      </svg>
    `
  };

  let currentIcon = 'bot';

  // Create Container
  const container = document.createElement('div');
  container.id = 'ai-employee-widget-container';
  container.style.cssText = 'position: fixed; bottom: 20px; right: 20px; z-index: 2147483647; font-family: Inter, sans-serif;';
  document.body.appendChild(container);

  // Create Button
  const button = document.createElement('div');
  button.innerHTML = ICONS.bot;
  button.style.cssText = `
    width: 64px; 
    height: 64px; 
    border-radius: 24px; 
    background-color: #4f46e5; 
    color: white; 
    display: flex; 
    align-items: center; 
    justify-content: center; 
    cursor: pointer; 
    box-shadow: 0 10px 40px -10px rgba(79, 70, 229, 0.4); 
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  `;
  container.appendChild(button);

  // Create Iframe Wrapper
  const iframeWrapper = document.createElement('div');
  iframeWrapper.style.cssText = `
    position: absolute;
    bottom: 80px;
    right: 0;
    width: 400px;
    height: 600px;
    max-width: calc(100vw - 40px);
    max-height: calc(100vh - 120px);
    border-radius: 32px;
    overflow: hidden;
    box-shadow: 0 20px 80px -20px rgba(0,0,0,0.15);
    opacity: 0;
    visibility: hidden;
    transform: translateY(20px) scale(0.95);
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    transform-origin: bottom right;
    border: 1px solid rgba(255,255,255,0.2);
  `;
  container.appendChild(iframeWrapper);

  // Create Iframe
  const iframe = document.createElement('iframe');
  iframe.src = `${BASE_URL}/widget/${API_KEY}`;
  iframe.style.cssText = 'width: 100%; height: 100%; border: none;';
  iframeWrapper.appendChild(iframe);

  // Fetch Custom Branding
  fetch(`${BACKEND_URL}/api/v1/widget/config/${API_KEY}`)
    .then(res => res.json())
    .then(config => {
      console.log('Syntrix AI: Config loaded', config);
      if (config.button_color) {
        button.style.setProperty('background', config.button_color, 'important');
        button.style.setProperty('background-color', config.button_color, 'important');
        button.style.setProperty('box-shadow', `0 10px 40px -10px ${config.button_color}66`, 'important');
      }
      if (config.widget_icon) {
        currentIcon = config.widget_icon;
        if (!isOpen) {
          button.innerHTML = ICONS[currentIcon] || ICONS.bot;
        }
      }
    })
    .catch(err => console.error('Syntrix AI: Failed to load custom branding', err));

  // Toggle Logic
  let isOpen = false;
  button.onclick = () => {
    isOpen = !isOpen;
    if (isOpen) {
      iframeWrapper.style.opacity = '1';
      iframeWrapper.style.visibility = 'visible';
      iframeWrapper.style.transform = 'translateY(0) scale(1)';
      button.style.transform = 'rotate(90deg) scale(0.9)';
      button.innerHTML = ICONS.close;
    } else {
      iframeWrapper.style.opacity = '0';
      iframeWrapper.style.visibility = 'hidden';
      iframeWrapper.style.transform = 'translateY(20px) scale(0.95)';
      button.style.transform = 'rotate(0deg) scale(1)';
      button.innerHTML = ICONS[currentIcon] || ICONS.bot;
    }
  };

  // Hover Effects
  button.onmouseenter = () => { if(!isOpen) button.style.transform = 'translateY(-5px) scale(1.05)'; };
  button.onmouseleave = () => { if(!isOpen) button.style.transform = 'translateY(0) scale(1)'; };

})();
