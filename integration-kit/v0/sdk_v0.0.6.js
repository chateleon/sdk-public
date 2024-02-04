(function (win, doc) {
  const loadCustomScript = function (config) {
    (function (win, d, t, s, obj, oe, st) {
      win["chateleonCustomObject"] = obj;
      oe = d.createElement(t);
      st = d.getElementsByTagName("script")[0];
      oe.async = 1;
      oe.src = s;
      oe.id = "chateleon-custom-script";
      st.parentNode.insertBefore(oe, st);
    })(window, document, "script", config.filePath, "chateleonCustom");

    var customScript = document.querySelector("#chateleon-custom-script");
    customScript.addEventListener("load", function () {
      chateleonCustom(config);
    });
  };

  const Chateleon = function (params) {
    let chateleonContainer = document.createElement("div");
    chateleonContainer.id = params.id
      ? ["chateleon-container", params.id].join("-")
      : "chateleon-container";

    const config = {
      id: params.id,
      apiId: params.apiId,
      event: params.event,
      iframeData: params.iframeData || null,
      isCustom: params.isCustom || false,
      filePath: params.path,
      customImpl: params.customImpl,
    };

    if (params.isCustom) {
      loadCustomScript(params);
      return {
        subscribe: () => {},
        unsubscribe: () => {},
      };
    }

    const BASE_URL = "https://sdk-staging.chateleon.com";
    const SERVE_PATH = "/serve";
    const TRACK_SERVE_PATH = "/track/serve";
    const TRACK_INTERACTION_PATH = "/track/interaction";
    const TOKEN_HEADER_NAME = "x-api-key";

    var MASCOT_CONTAINER_ID = config.id
      ? ["chateleon-container", config.id].join("-")
      : "chateleon-container";
    var mascotContainer;
    let gif;

    console.info("Chatleon SDK loaded");

    const subscribe = function (callback) {
      if (config.isCustom) {
        console.warn(
          "The method subscribe is not allowed here. Please use it inside the custom file."
        );
        return;
      }

      var that = this;
      switch (config.event) {
        case "move":
          moveGif(config.apiId, MASCOT_CONTAINER_ID);
          break;
        case "create":
          // Do an API call with the key and validate
          var xhr = new XMLHttpRequest();
          xhr.withCredentials = true; // to send cookies
          xhr.open("POST", BASE_URL + SERVE_PATH, true);
          xhr.setRequestHeader(TOKEN_HEADER_NAME, config.apiId);
          xhr.onreadystatechange = function () {
            // Call a function when the state changes.
            if (this.readyState === XMLHttpRequest.DONE) {
              // Request finished. Do processing here.
              if (this.status === 200) {
                var responseData = JSON.parse(this.responseText);
                var gifs = responseData.data.gifs;

                if (params.animationType === "multiple") {
                  for (let i = 0; i < params.meta.length; i++) {
                    let MASCOT = params.meta[i];
                    let MASCOT_CONTAINER_ID = params.meta[i].id
                      ? params.meta[i].id
                      : config.id;
                    let DURATION = params.meta[i].duration
                      ? params.meta[i].duration
                      : null;
                    MASCOT.id = MASCOT.id ? MASCOT.id : "mascot";

                    var responseData = JSON.parse(this.responseText);
                    var gifs = responseData.data.gifs;

                    if (gifs.length) {
                      if (config.customImpl) {
                        config.customImpl(
                          gifs[i],
                          MASCOT_CONTAINER_ID,
                          trackEvent
                        );
                      } else {
                        animation(gifs, MASCOT, DURATION);
                      }
                      trackServe();
                      console.log(
                        "Subscribed the " +
                          `${MASCOT.id}` +
                          " " +
                          MASCOT.order +
                          "!!!"
                      );
                    }
                  }
                  return callback(mascotContainer, that);
                } else {
                  var gifBasedOnCurrentTime = gifs.filter(
                    filterGifOnCurrentTime
                  );
                  if (gifBasedOnCurrentTime.length) {
                    if (config.customImpl) {
                      config.customImpl(
                        gifBasedOnCurrentTime[0],
                        MASCOT_CONTAINER_ID,
                        trackEvent
                      );
                    } else {
                      mascotContainer = createMascotContainer(
                        gifs[0],
                        MASCOT_CONTAINER_ID,
                        config.iframeData
                      );
                    }

                    trackServe();
                    console.log("Subscribed the mascot!!!");

                    return callback(mascotContainer, that);
                  }
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
          console.warn("Chateleon Warning : Invalid event " + config.event);
      }
    };

    const unsubscribe = function () {
      const container = doc.getElementById(MASCOT_CONTAINER_ID);
      container.remove();
      console.log("Unsubscribed the mascot!!!");
    };

    const filterGifOnCurrentTime = function (_gif) {
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
    };

    const animation = function (gifs, MASCOT, DURATION) {
      MASCOT.id = MASCOT.id ? MASCOT.id : "mascot";

      let mascotId = `${MASCOT.id}` + MASCOT.order;
      let Gifs;
      const mascotUrlMap = {};

      for (var i = 0; i < gifs.length; i++) {
        mascotUrlMap[`${MASCOT.id}${i + 1}`] = gifs[i].original;
      }

      const metaList = params.meta;
      for (var meta of metaList) {
        var url = mascotUrlMap[`${mascotId}`];
        meta.url = url;
      }
      const GifUrl = [];

      GifUrl.push(MASCOT.url);
      for (var i = 0; i < metaList.length; i++) {
        Gifs = GifUrl.map((url) => {
          const img = new Image();
          img.src = metaList[i].url;
          return img;
        });
      }

      const gifPromises = Gifs.map(
        (gif) =>
          new Promise((resolve) => {
            gif.onload = () => {
              resolve();
            };
          })
      );

      Promise.all(gifPromises).then(() => {
        var start = new Date().getTime(),
          time = 0;
        function instance() {
          time += 10;
          var diff = new Date().getTime() - start - time;
          let timeout = window.setTimeout(instance, 100 - diff);
          mascotContainer = animate(MASCOT, gifs, params);
          clearTimeout(timeout);
        }
        setTimeout(instance, DURATION);
      });
    };

    const animate = function (mascot, gifs, configs) {
      mascot.id = mascot.id ? mascot.id : "mascot";
      let mascotId = `${mascot.id}` + mascot.order;

      let END_DURATION = mascot.endDuration ? mascot.endDuration : null;
      const mascotUrlMap = {};

      for (var i = 0; i < gifs.length; i++) {
        mascotUrlMap[`${mascot.id}${i + 1}`] = gifs[i].original;
      }

      const metaList = configs.meta;
      for (var meta of metaList) {
        var url = mascotUrlMap[`${mascotId}`];
        meta.url = url;
      }

      let img = document.createElement("img");
      img.id = mascotId;
      img.setAttribute("src", mascot.url);
      img.onload = () => {
        img.setAttribute("loading", "lazy");
        img.setAttribute("alt", "chameleon");
        img.onmouseover = trackEvent;
        img.onclick = trackEvent;
        // img.className = 'h-64 w-full';

        img.style.position = configs.position.type
          ? configs.position.type
          : "absolute";
        img.style.height = mascot.dimensions.height
          ? mascot.dimensions.height
          : 100 + "%";
        img.style.width = mascot.dimensions.width
          ? mascot.dimensions.width
          : 100 + "%";
        img.style.zIndex = mascot.dimensions.zIndex
          ? mascot.dimensions.zIndex
          : 500;
        img.style.position = mascot.position.type
          ? mascot.position.type
          : "absolute";
        img.style.bottom = mascot.position.bottom
          ? mascot.position.bottom
          : 0 + "%";
        img.style.right = mascot.position.right
          ? mascot.position.right
          : 0 + "%";

        // chateleonContainer.style.cssText = 'position:absolute;width:300px;z-index:100;bottom:300; right: 300;';
        chateleonContainer.style.position = configs.position.type
          ? configs.position.type
          : "absolute";
        chateleonContainer.style.right = configs.position.right
          ? configs.position.right
          : 50 + "%";
        chateleonContainer.style.bottom = configs.position.bottom
          ? configs.position.bottom
          : 50 + "%";
        chateleonContainer.style.width = configs.dimensions.width
          ? configs.dimensions.width
          : 300 + "px";
        chateleonContainer.style.height = configs.dimensions.height
          ? configs.dimensions.height
          : 180 + "px";
        chateleonContainer.style.zIndex = mascot.dimensions.zIndex
          ? mascot.dimensions.zIndex
          : 500;

        doc.body.appendChild(chateleonContainer);
        chateleonContainer.appendChild(img);

        if (params.animationType === "multiple") {
          if (mascot.isLoop === false) {
            gif = document.getElementById(mascotId);
          } else {
            if (gif) {
              gif.parentNode.removeChild(gif);
            }
          }
        }
      };
    };

    const createMascotContainer = function (filteredGif, id, data) {
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

      return elemDiv;
    };

    const trackServe = function () {
      var xhr = new XMLHttpRequest();
      xhr.withCredentials = true; // to send cookies
      xhr.open("POST", BASE_URL + TRACK_SERVE_PATH, true);
      xhr.setRequestHeader(TOKEN_HEADER_NAME, config.apiId);
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
    };

    const trackInteraction = function (eventData) {
      var xhr = new XMLHttpRequest();
      xhr.withCredentials = true; // to send cookies
      xhr.open("POST", BASE_URL + TRACK_INTERACTION_PATH, true);
      xhr.setRequestHeader("Content-type", "application/json");
      xhr.setRequestHeader(TOKEN_HEADER_NAME, config.apiId);
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
    };

    const moveGif = function (data, id) {
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
    };

    const trackEvent = function (event) {
      console.info("Trackevent function");
      console.log(event);
      // Do an API call and store the tracking information
      trackInteraction(event);
    };

    return {
      subscribe: subscribe,
      unsubscribe: unsubscribe,
    };
  };

  win.Chateleon = Chateleon;
})(window, document);
