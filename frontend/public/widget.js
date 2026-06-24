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
    var result;
    if (isOpen) {
      result = ICONS.close;
      console.log('6a.getButtonContent: isOpen=true, returning close icon');
      return result;
    }
    if (configData && configData.logo_url) {
      result = '<img src="' + configData.logo_url + '" alt="" style="width:30px;height:30px;border-radius:8px;object-fit:cover;" onerror="this.style.display=\'none\'" />';
      console.log('6a.getButtonContent: logo_url is set (' + configData.logo_url + '), returning <img> (OVERWRITES icon!)');
      return result;
    }
    result = ICONS[currentIcon] || ICONS.bot;
    console.log('6a.getButtonContent: returning ICONS["' + currentIcon + '"]', result ? '(found)' : '(MISSING, using bot fallback)');
    return result;
  }

  function updateButton() {
    var content = getButtonContent();
    console.log('6b.updateButton: setting button.innerHTML to', content.substring(0, 80) + '...');
    button.innerHTML = content;
    console.log('6b.updateButton: button.innerHTML after write is', button.innerHTML.substring(0, 80) + '...');
    console.log('6b.updateButton: button style.background is now:', button.style.background || getComputedStyle(button).background);
  }

  fetch(BASE_URL + '/api/v1/widget/config/' + API_KEY)
    .then(function(r) { return r.json(); })
    .then(function(config) {
      console.log('=== WIDGET DEBUG ===');
      console.log('1. Full config object received:', JSON.stringify(config, null, 2));
      console.log('2. config.widget_icon value:', JSON.stringify(config.widget_icon));
      console.log('2a. config.button_color value:', JSON.stringify(config.button_color));
      console.log('2b. config.logo_url value:', JSON.stringify(config.logo_url));

      var bgBefore = button.style.background || button.style.backgroundColor || '(computed: ' + getComputedStyle(button).background + ')';
      console.log('5a. Button background BEFORE applying config:', bgBefore);

      configData = config;
      if (config.button_color) {
        button.style.setProperty('background', config.button_color, 'important');
        button.style.setProperty('box-shadow', '0 8px 32px ' + config.button_color + '66', 'important');
        var bgAfter = button.style.background || button.style.backgroundColor || '(computed: ' + getComputedStyle(button).background + ')';
        console.log('5b. Button background AFTER applying config.button_color (' + config.button_color + '):', bgAfter);
      } else {
        console.log('5b. config.button_color was falsy — NOT applied (value=' + JSON.stringify(config.button_color) + ')');
      }

      if (config.widget_icon) {
        currentIcon = config.widget_icon;
        console.log('3. currentIcon after assignment:', currentIcon);
        console.log('4. ICONS[currentIcon] result:', ICONS[currentIcon]);
        if (!ICONS[currentIcon]) {
          console.warn('4a. WARNING: ICONS["' + currentIcon + '"] is undefined! Falling back to ICONS.bot');
        }
      } else {
        console.log('3. config.widget_icon was falsy — currentIcon stays:', currentIcon);
        console.log('4. ICONS[currentIcon] result:', ICONS[currentIcon]);
      }
      console.log('6a. updateButton() called — will set innerHTML');
      updateButton();
      console.log('6b. button.innerHTML after updateButton():', button.innerHTML);
      console.log('=== END WIDGET DEBUG ===');
    })
    .catch(function(err) { console.error('Syntrix AI: Failed to load branding', err); });

  button.onclick = function() {
    isOpen = !isOpen;
    console.log('=== CLICK DEBUG ===');
    console.log('isOpen toggled to:', isOpen);
    console.log('6c. CLICK: button.style.background BEFORE updateButton():', button.style.background || getComputedStyle(button).background);
    if (isOpen) {
      iframeWrapper.style.opacity = '1';
      iframeWrapper.style.visibility = 'visible';
      iframeWrapper.style.transform = 'translateY(0) scale(1)';
      button.style.transform = 'scale(0.9)';
      console.log('CLICK: opener — transform set to scale(0.9)');
    } else {
      iframeWrapper.style.opacity = '0';
      iframeWrapper.style.visibility = 'hidden';
      iframeWrapper.style.transform = 'translateY(16px) scale(0.96)';
      button.style.transform = 'scale(1)';
      console.log('CLICK: closer — transform set to scale(1)');
    }
    updateButton();
    console.log('6c. CLICK: button.innerHTML after updateButton():', button.innerHTML.substring(0, 80) + '...');
    console.log('6c. CLICK: button.style.background after:', button.style.background || getComputedStyle(button).background);
    console.log('=== CLICK DEBUG END ===');
  };

  button.onmouseenter = function() {
    if (!isOpen) {
      button.style.transform = 'translateY(-3px) scale(1.06)';
      console.log('HOVER enter: transform set to translateY(-3px) scale(1.06)');
    }
  };
  button.onmouseleave = function() {
    if (!isOpen) {
      button.style.transform = 'translateY(0) scale(1)';
      console.log('HOVER leave: transform set to translateY(0) scale(1)');
    }
  };

})();
