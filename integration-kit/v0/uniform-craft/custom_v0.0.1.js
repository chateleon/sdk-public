(function (win, doc) {
  win.chateleonCustom = (function () {
    console.info("Chatleon Custom SDK loaded");
    function chateleonCustom(apiId) {
      var shadowrootNode;
      var chateleonContainer;
      var shopifyChatButton;
      var shopifyChatChild;
      const addShopifyClickListener = (chateleonContainer, shopifyChatButton) => {
        chateleonContainer.addEventListener('click', function () {
          chateleonContainer.style.display = 'none';
          shopifyChatButton.style.display = 'block';
          shopifyChatButton.click();
        });
      };

      // Callback function to execute when child is added in the DOM
      const bodyCallback = (mutationList, observer) => {
        for (const mutation of mutationList) {
          if (mutation.addedNodes[0]?.id === 'chateleon-animation') {
            console.info("chateleon-animation added!");
            chateleonAnimation = document.getElementById('chateleon-animation');
            chateleonContainer.append(chateleonAnimation);
            observer.disconnect();
          }
          else if (mutation.addedNodes[0]?.id === 'shopify-chat') {
            console.info("shopifyChat added!");
            shopifyChatChild = mutation.addedNodes[0].children[0];
            shadowrootNode = mutation.addedNodes[0].children[0].shadowRoot;
            const chateleonContainer = document.getElementById('chateleon-container');
            if (!chateleonContainer) {
              chateleon('create', apiId, null, null, customImpl);
              const chateleonContainer = document.createElement('div');
              chateleonContainer.id = 'chateleon-container';
              chateleonContainer.style.position = 'fixed';
              chateleonContainer.style.bottom = '-10px';
              chateleonContainer.style.right = '-40px';
              chateleonContainer.style.cursor = 'pointer';
              chateleonContainer.style.zIndex = 2147483647;
              document.body.appendChild(chateleonContainer);
            }
            shadowRootElem(shadowrootNode);
            addChatBoxObserver(shopifyChatChild);
          }
        }
      }
      const BodyNode = document.body;
      const config = { childList: true, subtree: true };
      const bodyObserver = new MutationObserver(bodyCallback);
      bodyObserver.observe(BodyNode, config);

      // Observing SHADOWROOT
      const shadowRootCallback = (mutationList, observer) => {
        for (const mutation of mutationList) {
          if (mutation.target?.className === 'chat-toggle chat-toggle--#49d50d chat-toggle--icon-button chat-toggle--text-button chat-toggle--bottom-right' ||
            mutation.target?.className === 'chat-toggle chat-toggle--#49d50d chat-toggle--icon-button chat-toggle--bottom-right icon-only mobile-only') {
            shopifyChatButton = mutation.target;
            shopifyChatButton.style.display = 'none';
            chateleonContainer = document.getElementById('chateleon-container');
            addShopifyClickListener(chateleonContainer, shopifyChatButton);
          }
        }
      }
      function shadowRootElem(bodyNode) {
        const BodyNode = bodyNode;
        const config = { childList: true, subtree: true };
        const bodyObserver = new MutationObserver(shadowRootCallback);
        bodyObserver.observe(BodyNode, config);
      }

      // Callback function to execute when element's attribute changes
      const chatBoxCallback = (mutationList, observer) => {
        for (const mutation of mutationList) {
          chateleonContainer.style.display = 'block';
          let shopifyCustomElement = document.getElementById("ShopifyChat");
          let shopifyChatButton = shopifyCustomElement.shadowRoot.lastChild.lastChild;
          let shopifyCustomElementHeight = shopifyCustomElement.clientHeight;
          if (
            mutation.type === 'attributes'
            && mutation.attributeName === 'style'
            && mutation.target.id == 'ShopifyChat'
          ) {
            if (
              (shopifyCustomElementHeight >= 200 &&
                shopifyCustomElementHeight <= 1200)
            ) {
              shopifyCustomElement.style.display = 'block';
              shopifyCustomElement.style.zIndex = 1000000;
              shopifyChatButton.style.display = 'block';
              if (chateleonContainer) {
                chateleonContainer.style.zIndex = 100;
                chateleonContainer.style.display = 'none';
              }
            } else {
              shopifyCustomElement.style.display = 'none';
              shopifyChatButton.style.display = 'none';
              if (chateleonContainer) {
                chateleonContainer.style.display = 'block';
                chateleonContainer.style.zIndex = 2147483647;
              }
            }
          }
        }
      }

      const addChatBoxObserver = function (bodyNode) {
        const chatBoxContainer = bodyNode;
        const chatBoxObserver = new MutationObserver(chatBoxCallback);
        const config = { attributes: true, subtree: true };
        chatBoxObserver.observe(chatBoxContainer, config);
      }
    }

    // For custom implementation
    const customImpl = (filteredGif, id, trackEvent) => {
      var elem = document.createElement("img");
      elem.id = "chateleon-animation";
      document.body.appendChild(elem);
      elem.setAttribute("src", filteredGif.original);
      elem.onmouseover = trackEvent;
      elem.onclick = trackEvent;

      if (window.innerWidth <= 750) {
        elem.style.width = 178.5 + "px";
        elem.style.height = 100.8 + "px";
      }
      else {
        elem.style.width = 232.72 + "px";
        elem.style.height = 130.90 + "px";
      }
      // console.log(window.innerWidth, window.innerHeight);
      elem.style.position = "relative";
      elem.style.bottom = -2 + "vh";
    };
    return chateleonCustom;
  })()
})(window, document);
