// frontend/src/hooks/useHideChatbot.js

import { useEffect } from 'react';

const hideAll = () => {
  const selectors = [
    '#bp-web-widget-container',
    '#bp-web-widget',
    '.bpw-widget-btn',
    '.bpw-floating-button',
    '[id^="bp-"]',
    '[class^="bpw-"]',
  ];
  selectors.forEach(sel => {
    document.querySelectorAll(sel).forEach(el => {
      el.style.cssText = 'display:none!important;visibility:hidden!important;opacity:0!important;pointer-events:none!important;';
    });
  });
};

const useHideChatbot = () => {
  useEffect(() => {
    // Hide immediately
    hideAll();

    // Watch for any new botpress elements added to DOM and hide them instantly
    const observer = new MutationObserver(() => {
      hideAll();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
    };
  }, []);
};

export default useHideChatbot;