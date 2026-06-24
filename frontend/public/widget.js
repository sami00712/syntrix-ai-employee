(function() {
  var scriptTag = document.currentScript;
  var API_KEY = scriptTag.getAttribute('data-api-key');
  var BASE_URL;
  if (scriptTag && scriptTag.src) {
    var url = new URL(scriptTag.src);
    BASE_URL = url.origin;
  } else {
    BASE_URL = window.location.origin;
  }
  var BACKEND_URL = 'https://syntrix-ai-employee-production.up.railway.app';

  if (!API_KEY) {
    console.error('AI Employee Widget: API Key is missing!');
    return;
  }

  var ICONS = {
    bot: '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>',
    message: '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"/></svg>',
    close: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>'
  };

  var configData = null;
  var currentIcon = 'bot';
  var isOpen = false;

  var container = document.createElement('div');
  container.id = 'ai-employee-widget-container';
  container.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:2147483647;font-family:Inter,-apple-system,BlinkMacSystemFont,sans-serif;';

  var button = document.createElement('div');
  button.style.cssText = 'width:60px;height:60px;border-radius:18px;background:#4f46e5;color:white;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 8px 32px rgba(79,70,229,0.35);transition:all 0.3s cubic-bezier(0.4,0,0.2,1);position:relative;overflow:hidden;';
  button.innerHTML = ICONS.bot;
  container.appendChild(button);

  var iframeWrapper = document.createElement('div');
  iframeWrapper.style.cssText = 'position:absolute;bottom:76px;right:0;width:400px;height:620px;max-width:calc(100vw - 48px);max-height:calc(100vh - 140px);border-radius:20px;overflow:hidden;box-shadow:0 25px 80px -12px rgba(0,0,0,0.25);opacity:0;visibility:hidden;transform:translateY(16px) scale(0.96);transition:all 0.35s cubic-bezier(0.4,0,0.2,1);transform-origin:bottom right;background:white;';
  container.appendChild(iframeWrapper);

  var iframe = document.createElement('iframe');
  iframe.src = BASE_URL + '/widget/' + API_KEY;
  iframe.style.cssText = 'width:100%;height:100%;border:none;';
  iframeWrapper.appendChild(iframe);

  document.body.appendChild(container);

  function getButtonContent() {
    if (isOpen) return ICONS.close;
    if (configData && configData.logo_url) {
      return '<img src="' + configData.logo_url + '" alt="" style="width:30px;height:30px;border-radius:8px;object-fit:cover;" onerror="this.style.display=\'none\'" />';
    }
    return ICONS[currentIcon] || ICONS.bot;
  }

  function updateButton() {
    button.innerHTML = getButtonContent();
  }

  fetch(BACKEND_URL + '/api/v1/widget/config/' + API_KEY)
    .then(function(r) { return r.json(); })
    .then(function(config) {
      configData = config;
      if (config.button_color) {
        button.style.setProperty('background', config.button_color, 'important');
        button.style.setProperty('box-shadow', '0 8px 32px ' + config.button_color + '66', 'important');
      }
      if (config.widget_icon) {
        currentIcon = config.widget_icon;
      }
      updateButton();
    })
    .catch(function(err) { console.error('Syntrix AI: Failed to load branding', err); });

  button.onclick = function() {
    isOpen = !isOpen;
    if (isOpen) {
      iframeWrapper.style.opacity = '1';
      iframeWrapper.style.visibility = 'visible';
      iframeWrapper.style.transform = 'translateY(0) scale(1)';
      button.style.transform = 'scale(0.9)';
    } else {
      iframeWrapper.style.opacity = '0';
      iframeWrapper.style.visibility = 'hidden';
      iframeWrapper.style.transform = 'translateY(16px) scale(0.96)';
      button.style.transform = 'scale(1)';
    }
    updateButton();
  };

  button.onmouseenter = function() {
    if (!isOpen) button.style.transform = 'translateY(-3px) scale(1.06)';
  };
  button.onmouseleave = function() {
    if (!isOpen) button.style.transform = 'translateY(0) scale(1)';
  };

})();
