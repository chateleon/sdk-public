/* 
Sample script 

<script>
(function (w, d, t, s, obj, oe, st) {
  // w - window object
  // d - document object
  // t - tag
  // s - src
  // obj - sdk object
  // oe - outputElement
  // st - scriptTag
      oe = d.createElement(t);
      st = d.getElementsByTagName('script')[0];
      oe.async = 1;
      oe.src = s;
      st.parentNode.insertBefore(oe, st)
      })(window, document, 'script', '../sdk.js', 'chateleon');
</script>

// (function (win, d, t, s, obj, oe, st) {
      //   win['chateleonObject'] = obj;
      //   win[obj] = win[obj] || function() {
      //     (win[obj].q = win[obj].q || []).push(arguments)
      //   },

      //   // Sets the time (as an integer) this tag was executed.
      //   // Used for timing hits.
      //   win[obj].l = 1 * new Date();
      //   oe = d.createElement(t);
      //   st = d.getElementsByTagName('script')[0];
      //   oe.async = 1;
      //   oe.src = s;
      //   st.parentNode.insertBefore(oe, st);
      // })(window, document, 'script', '../sdk.js', 'chl');
*/

(function (win, doc) {
  win.chateleon = (function () {
    const BASE_URL = "https://sdk-api.qa.chateleon.com";
    const SERVE_PATH = "/serve";
    const TRACK_SERVE_PATH = "/track/serve";
    const TRACK_INTERACTION_PATH = "/track/interaction";
    const TOKEN_HEADER_NAME = "x-api-key";

    console.info("Chatleon SDK loaded");
    var chateleon = function (event, data, opt1, opt2) {
      let CONTAINER_ID = "chateleon-container";
      if (opt1) {
        CONTAINER_ID = ["chateleon-container", opt1].join("_");
      }
      switch (event) {
        case "move":
          moveGif(data, CONTAINER_ID);
          break;
        case "create":
          // Do an API call with the key and validate
          var xhr = new XMLHttpRequest();
          xhr.withCredentials = true; // to send cookies
          xhr.open("POST", BASE_URL + SERVE_PATH, true);
          xhr.setRequestHeader(TOKEN_HEADER_NAME, data);
          xhr.onreadystatechange = function () {
            // Call a function when the state changes.
            if (this.readyState === XMLHttpRequest.DONE) {
              // Request finished. Do processing here.
              if (this.status === 200) {
                var responseData = JSON.parse(this.responseText);
                var gifs = responseData.data.gifs;
                var gifBasedOnCurrentTime = gifs.filter(filterGifOnCurrentTime);
                if (gifBasedOnCurrentTime.length) {
                  createAndAppendElementInDOM(
                    gifBasedOnCurrentTime[0],
                    CONTAINER_ID,
                    opt2
                  );
                  trackServe();
                }
              } else {
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
        var date = new Date();
        var hour = date.getHours();
        var minute = date.getMinutes();
        var settings = _gif.settings;
        var startTime = settings.startTime;
        var endTime = settings.endTime;
        var startHourMin = startTime.split(":");
        var endHourMin = endTime.split(":");
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
        var elem = document.createElement("img");
        elem.setAttribute("src", filteredGif.original);
        elem.setAttribute("width", "100%");
        elem.onmouseover = trackEvent;
        elem.onclick = trackEvent;
        elem.style.cssText = "width:300px;z-index:100;";
        // elemDiv.appendChild(elem);
        if (data) {
          if (data.targetIframe) {
            var iframe = document.getElementById(data.targetIframe);
            var target = iframe.contentDocument.querySelector(
              data.targetContainer
            );
            if (data.prepend) {
              target.prepend(elem);
            } else {
              target.append(elem);
            }
          } else if (data.targetContainer) {
            var target = document.querySelector(data.targetContainer);
            if (data.prepend) {
              target.prepend(elem);
            } else {
              target.append(elem);
            }
          }
        } else {
          var elemDiv = doc.createElement("div");
          elemDiv.id = id;
          // data.size ? elemDiv.style.height = data.size : null;
          elemDiv.style.cssText =
            "position:absolute;width:300px;z-index:100;bottom:300; right: 300;";
          doc.body.appendChild(elemDiv);
          elemDiv.appendChild(elem);
        }
      }

      function trackServe() {
        var xhr = new XMLHttpRequest();
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
        var xhr = new XMLHttpRequest();
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
        var gifContainer = doc.querySelector("#" + id);
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
      var trackEvent = function (event) {
        // console.info("Trackevent function");
        // console.log(event);
        // Do an API call and store the tracking information
        trackInteraction(event);
      };
    };

    return chateleon;
  })();
})(window, document);
