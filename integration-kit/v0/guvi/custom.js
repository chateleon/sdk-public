(function (win, doc) {

    win.chateleonCustom = (function () {

        console.info("Chatleon Custom SDK loaded");
        function chateleonCustom(apiId) {

            const addGuviClickListener = () => {
                var chateleonContainer = document.getElementById('chateleon-container');
                var ymDivBarContainer = document.getElementById('ymDivBar');

                chateleonContainer.addEventListener('click', function () {
                    ymDivBarContainer.click();
                });
            };

            // Callback function to execute when mutations are observed
            const bodyCallback = (mutationList, observer) => {
                for (const mutation of mutationList) {
                    if (mutation.type === "childList") {
                        console.log(`The impact was in ${mutation.target} element. - ${mutation.target.id}`);

                        if (mutation.addedNodes[0]?.id == 'ymPluginDivContainerInitial') {
                            console.log('ymPluginDivContainerInitial container added');
                            chateleon('create', apiId, null, null, customImpl);

                            // Add mutation observer for chatBox
                            addChatBoxObserver();
                        }

                        if (mutation.addedNodes[0]?.id == 'chateleon-container') {
                            console.log('chateleon-container container added');
                            if (window.chateleonIsLoaded) {
                                var guviChatImage = document.querySelector('#ymDivBar img');
                                guviChatImage.style.display = 'none';
                            }

                            addGuviClickListener();
                            observer.disconnect();
                        }
                    }
                }
            };

            const chatBoxCallback = (mutationList, observer) => {
                if (window.chateleonIsLoaded) {
                    for (const mutation of mutationList) {
                        if (mutation.type === "attributes") {
                            // console.log(`The ${mutation.attributeName} attribute was modified.`);

                            if (mutation.attributeName === 'style') {
                                if (mutation.target.id === 'ymDivBar') {
                                    var guviChatImage = document.querySelector('#ymDivBar img');
                                    guviChatImage.style.display = 'none';

                                    var chateleonContainer = document.getElementById('chateleon-container');

                                    if (chateleonContainer && mutation.target.style.display === 'none') {
                                        chateleonContainer.style.display = 'none';
                                    } else if (chateleonContainer) {
                                        chateleonContainer.style.display = 'block';
                                    }
                                }
                            }
                        }
                    }
                }
            };

            const customImpl = (filteredGif, id, trackEvent) => {
                var elem = document.createElement("img");
                elem.setAttribute("src", filteredGif.original);
                elem.style.cssText = 'height: 149px; width: 172px';
                elem.onmouseover = trackEvent;
                elem.onclick = trackEvent;

                var elemDiv = document.createElement('div');
                elemDiv.id = id;
                elemDiv.style.cssText = 'position: fixed; bottom: -15px; right: -43px; z-index: 99998; cursor: pointer;';
                document.body.appendChild(elemDiv);
                elemDiv.appendChild(elem);
            };

            const guviBodyNode = document.body;
            const config = { childList: true };
            const bodyObserver = new MutationObserver(bodyCallback);
            bodyObserver.observe(guviBodyNode, config);

            const addChatBoxObserver = function () {
                const chatBoxContainer = document.getElementById('ymPluginDivContainerInitial');
                const chatBoxObserver = new MutationObserver(chatBoxCallback);
                const config = { attributes: true, subtree: true };
                chatBoxObserver.observe(chatBoxContainer, config);
            }
        }

        return chateleonCustom;
    })();

})(window, document)
