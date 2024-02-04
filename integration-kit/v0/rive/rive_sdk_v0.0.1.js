"use strict";
(function (win, doc) {
  win.chateleon = (function () {

    const loadRiveAnimation = (function (win, doc) {
      const dependency = [
        {
          id: 'rive-dependency-script',
          url: 'https://unpkg.com/@rive-app/canvas@2.7.0/rive.js',
        }
      ];
      dependency.map((value) => {
        let script = document.getElementById(value.id);
        if (!script) {
          script = document.createElement('script');
          script.src = value.url;
          script.type = value.type ? value.text : 'text/javascript';
          script.id = value.id;
          script.async = true;
          doc.body.appendChild(script);
        }
      });

      const createRiveElement = function (responseData) {
        const canvas = document.getElementById('chateleon-canvas');
        if (!canvas) {
          const riveAnimationContainer = document.createElement('canvas');
          riveAnimationContainer.id = 'chateleon-canvas';
          doc.body.appendChild(riveAnimationContainer);
        }
        const isLoadedIntervalId = setInterval(function () {
          const riveScript = doc.getElementById('rive-dependency-script');
          try { rive; } catch { return; }
          if (!riveScript && !rive) return;
          clearInterval(isLoadedIntervalId);
          new rive.Rive({
            src: responseData,
            canvas: document.getElementById("chateleon-canvas"),
            autoplay: true,
          });
        }, 200);
      }
        console.log('Rive Dependencies Loaded Successfully');
        return createRiveElement;
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
          let riveAnimations;
          xhr.onreadystatechange = function () {
            // Call a function when the state changes.
            if (this.readyState === XMLHttpRequest.DONE) {
              // Request finished. Do processing here.
              if (this.status === 200) {
                const responseData = JSON.parse(this.responseText);
                riveAnimations = responseData.data.gifs[0].original;
                loadRiveAnimation(riveAnimations);
                const riveAnimation = document.getElementById("chateleon-canvas");
                addStyles(riveAnimation);
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

      function addStyles(riveAnimation) {
        if (riveAnimation) {
          win.chateleonIsLoaded = true;
          if (custom) {
            custom(CONTAINER_ID, trackEvent);
          } else {
            createAndAppendElementInDOM(
              riveAnimation,
              CONTAINER_ID
            );
          }
          trackServe();
        }
      }

      function createAndAppendElementInDOM(riveAnimation, conatinerId) {
        const elemDiv = doc.createElement("div");
        elemDiv.id = conatinerId;
        doc.body.appendChild(elemDiv);
        elemDiv.append(riveAnimation);
        elemDiv.style.position = "fixed";
        elemDiv.style.right = "0px";
        elemDiv.style.bottom = "0px";
        elemDiv.style.width = "260px";
        elemDiv.style.height = "150px";
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
