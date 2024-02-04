"use strict";
(function (win, doc) {
  win.chateleon = (function () {

    const loadLottieAnimation = (function (win, doc) {
      const dependency = [
        {
          id: 'lottie-dependency-script',
          url: 'https://unpkg.com/@dotlottie/player-component@1.3.0/dist/dotlottie-player.js'
        }
      ];
      dependency.map((value) => {
        let script = document.getElementById(value.id);
        if (!script) {
          script = document.createElement('script');
          script.src = value.url;
          script.id = value.id;
          script.async = true;
          doc.body.appendChild(script);
        }
      });

      const lottieScript = doc.getElementById('lottie-dependency-script');
      const createLottieElement = function (responseData) {
        const lottieAnimationContainer = document.createElement('dotlottie-player');
        lottieAnimationContainer.src = responseData;
        lottieAnimationContainer.className = 'lottie-animation';
        lottieAnimationContainer.loop = true;
        lottieAnimationContainer.autoplay = true;
        doc.body.appendChild(lottieAnimationContainer);
        return doc.body.appendChild(lottieAnimationContainer);
      }
      if (lottieScript) {
        console.log('Lottie Dependencies Loaded Successfully');
        return createLottieElement;
      } else {
        console.log('Something went wrong');
      }
    })(window, document);

    // BASE_URL should be replaced using a script like github workflow
    const BASE_URL = "https://sdk-api.qa.chateleon.com";
    const SERVE_PATH = "/serve";
    const TRACK_SERVE_PATH = "/track/serve";
    const TRACK_INTERACTION_PATH = "/track/interaction";
    const TOKEN_HEADER_NAME = "x-api-key";

    console.info("Chatleon SDK loaded");
    const chateleon = function (event, data, custom) {
      var CONTAINER_ID = "chateleon-container";
      switch (event) {
        case "move":
          moveGif(data, CONTAINER_ID);
          break;
        case "create":
          // Do an API call with the key and validate
          const xhr = new XMLHttpRequest();
          xhr.withCredentials = true; // to send cookies
          xhr.open("POST", BASE_URL + SERVE_PATH, true);
          xhr.setRequestHeader(TOKEN_HEADER_NAME, data);
          xhr.onreadystatechange = function () {
            // Call a function when the state changes.
            if (this.readyState === XMLHttpRequest.DONE) {
              // Request finished. Do processing here.
              if (this.status === 200) {
                const responseData = JSON.parse(this.responseText);
                const lottieAnimations = responseData.data.gifs[0].original;
                const xhr = new XMLHttpRequest();
                if (responseData.data.extensionType === "LOTTIE_JSON") {
                  xhr.open("GET", lottieAnimations);
                  xhr.onreadystatechange = function () {
                    if (this.readyState === XMLHttpRequest.DONE) {
                      if (this.status === 200) {
                        const JSONbody = JSON.parse(this.responseText);
                        loadLottieAnimation(JSONbody);
                        const lottieAnimation = document.querySelector(".lottie-animation");
                        addStyles(lottieAnimation);
                      }
                    }
                  }
                  xhr.send();
                } else if (responseData.data.extensionType === "LOTTIE") {
                  loadLottieAnimation(lottieAnimations);
                  const lottieAnimation = document.querySelector(".lottie-animation");
                  addStyles(lottieAnimation);
                }
              } else {
                win.chateleonIsLoaded = false;
                console.warn("Chateleon Warning: Invalid API Key");
              }
            }
          };
          xhr.send();
          // Get the user Gif pack and store it locally
          break;
        default:
          console.warn("Chateleon Warning : Invalid event " + event);
      }

      function addStyles(lottieAnimation) {
        if (lottieAnimation) {
          win.chateleonIsLoaded = true;
          if (custom) {
            custom(CONTAINER_ID, trackEvent);
          } else {
            createAndAppendElementInDOM(
              lottieAnimation,
              CONTAINER_ID
            );
          }
          trackServe();
        }
      }

      function createAndAppendElementInDOM(lottieAnimation, conatinerId) {
        const elemDiv = doc.createElement("div");
        elemDiv.id = conatinerId;
        doc.body.appendChild(elemDiv);
        elemDiv.append(lottieAnimation);
        elemDiv.style.position = "absolute";
        elemDiv.style.right = "0px";
        elemDiv.style.bottom = "0px";
        elemDiv.style.width = "200px";
        elemDiv.style.height = "120px";
        elemDiv.onmouseover = trackEvent;
        elemDiv.onclick = trackEvent;
      }

      function trackServe() {
        const xhr = new XMLHttpRequest();
        xhr.withCredentials = true; // to send cookies
        xhr.open("POST", BASE_URL + TRACK_SERVE_PATH, true);
        xhr.setRequestHeader(TOKEN_HEADER_NAME, data);
        xhr.onreadystatechange = function () {
          // Call a function when the state changes.
          if (this.readyState === XMLHttpRequest.DONE) {
            // Request finished. Do processing here.
            if (this.status === 200) {
            } else {
              console.warn("Chateleon Warning: Invalid API Key");
            }
          }
        };
        xhr.send();
      }

      function trackInteraction(eventData) {
        const xhr = new XMLHttpRequest();
        xhr.withCredentials = true; // to send cookies
        xhr.open("POST", BASE_URL + TRACK_INTERACTION_PATH, true);
        xhr.setRequestHeader("Content-type", "application/json");
        xhr.setRequestHeader(TOKEN_HEADER_NAME, data);
        xhr.onreadystatechange = function () {
          // Call a function when the state changes.
          if (this.readyState === XMLHttpRequest.DONE) {
            // Request finished. Do processing here.
            if (this.status === 200) {
              // debugger;
            } else {
              console.warn("Chateleon Warning: Invalid API Key");
            }
          }
        };
        xhr.send(
          JSON.stringify({
            eventData: {
              type: eventData.type,
            },
          })
        );
      }

      function moveGif(data, id) {
        const gifContainer = doc.querySelector("#" + id);
        // TODO: Data validation pending
        data.cssText ? (gifContainer.style.cssText = data.cssText) : null;
        data.top ? (gifContainer.style.top = data.top) : null;
        data.left ? (gifContainer.style.left = data.left) : null;
        data.bottom ? (gifContainer.style.bottom = data.bottom) : null;
        data.right ? (gifContainer.style.right = data.right) : null;
        data.zIndex ? (gifContainer.style.zIndex = data.zIndex) : null;
        data.width ? (gifContainer.style.width = data.width) : null;
        data.visibility
          ? (gifContainer.style.visibility = data.visibility)
          : null;
      }
      const trackEvent = function (event) {
        // Do an API call and store the tracking information
        trackInteraction(event);
      };
    };

    return chateleon;
  })();
})(window, document);
