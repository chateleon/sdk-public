
(function (win, doc) {
  win.chateleon = (function () {
    // BASE_URL should be replaced using a script like github workflow
    const BASE_URL = "https://sdk-api.qa.chateleon.com";
    const SERVE_PATH = "/serve";
    const TRACK_SERVE_PATH = "/track/serve";
    const TRACK_INTERACTION_PATH = "/track/interaction";
    const TOKEN_HEADER_NAME = "x-api-key";

    console.info("Chatleon SDK loaded");
    const chateleon = function (event, data, opt1, opt2, custom) {
      var CONTAINER_ID = "chateleon-container";
      if (opt1) {
        CONTAINER_ID = ["chateleon-container", opt1].join("_");
      }
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
                const gifs = responseData.data.gifs;
                const gifBasedOnCurrentTime = gifs.filter(
                  filterGifOnCurrentTime
                );
                if (gifBasedOnCurrentTime.length) {
                  win.chateleonIsLoaded = true;
                  if (custom) {
                    custom(gifBasedOnCurrentTime[0], CONTAINER_ID, trackEvent);
                  } else {
                    createAndAppendElementInDOM(
                      gifBasedOnCurrentTime[0],
                      CONTAINER_ID,
                      opt2
                    );
                  }

                  trackServe();
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

      function filterGifOnCurrentTime(_gif) {
        const date = new Date();
        const hour = date.getHours();
        const minute = date.getMinutes();
        const settings = _gif.settings;
        const startTime = settings.startTime;
        const endTime = settings.endTime;
        const startHourMin = startTime.split(":");
        const endHourMin = endTime.split(":");
        if (
          _gif.active &&
          hour >= parseInt(startHourMin[0]) &&
          hour <= parseInt(endHourMin[0]) &&
          minute >= parseInt(startHourMin[1]) &&
          minute <= parseInt(endHourMin[1])
        ) {
          return _gif;
        }
      }

      function createAndAppendElementInDOM(filteredGif, id, data) {
        const elem = document.createElement("img");
        elem.setAttribute("src", filteredGif.original);
        elem.setAttribute("width", "100%");
        elem.onmouseover = trackEvent;
        elem.onclick = trackEvent;
        elem.style.cssText = "width:300px;z-index:100;";
        // elemDiv.appendChild(elem);
        if (data) {
          if (data.targetIframe) {
            const iframe = document.getElementById(data.targetIframe);
            const target = iframe.contentDocument.querySelector(
              data.targetContainer
            );
            if (data.prepend) {
              target.prepend(elem);
            } else {
              target.append(elem);
            }
          } else if (data.targetContainer) {
            const target = document.querySelector(data.targetContainer);
            if (data.prepend) {
              target.prepend(elem);
            } else {
              target.append(elem);
            }
          }
        } else {
          const elemDiv = doc.createElement("div");
          elemDiv.id = id;
          // data.size ? elemDiv.style.height = data.size : null;
          elemDiv.style.cssText =
            "position:absolute;width:300px;z-index:100;bottom:300; right: 300;";
          doc.body.appendChild(elemDiv);
          elemDiv.appendChild(elem);
        }
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
