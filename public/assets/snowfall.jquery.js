/*  Snowfall jquery plugin

    ====================================================================
    LICENSE
    ====================================================================
    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

       Unless required by applicable law or agreed to in writing, software
       distributed under the License is distributed on an "AS IS" BASIS,
       WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
       See the License for the specific language governing permissions and
       limitations under the License.
    ====================================================================

    Version 1.51 Dec 2nd 2012
    // fixed bug where snow collection didn't happen if a valid doctype was declared.

    Version 1.5 Oct 5th 2011
    Added collecting snow! Uses the canvas element to collect snow. In order to initialize snow collection use the following

    $(document).snowfall({collection : 'element'});

    element = any valid jquery selector.

    The plugin then creates a canvas above every element that matches the selector, and collects the snow. If there are a varrying amount of elements the
    flakes get assigned a random one on start they will collide.

    Version 1.4 Dec 8th 2010
    Fixed issues (I hope) with scroll bars flickering due to snow going over the edge of the screen.
    Added round snowflakes via css, will not work for any version of IE. - Thanks to Luke Barker of http://www.infinite-eye.com/
    Added shadows as an option via css again will not work with IE. The idea behind shadows, is to show flakes on lighter colored web sites - Thanks Yutt

    Version 1.3.1 Nov 25th 2010
    Updated script that caused flakes not to show at all if plugin was initialized with no options, also added the fixes that Han Bongers suggested

    Developed by Jason Brown for any bugs or questions email me at loktar69@hotmail
    info on the plugin is located on Somethinghitme.com

    values for snow options are

    flakeCount,
    flakeColor,
    flakeIndex,
    minSize,
    maxSize,
    minSpeed,
    maxSpeed,
    round,      true or false, makes the snowflakes rounded if the browser supports it.
    shadow      true or false, gives the snowflakes a shadow if the browser supports it.

    Example Usage :
    $(document).snowfall({flakeCount : 100, maxSpeed : 10});

    -or-

    $('#element').snowfall({flakeCount : 800, maxSpeed : 5, maxSize : 5});

    -or with defaults-

    $(document).snowfall();

    - To clear -
    $('#element').snowfall('clear');
*/

// requestAnimationFrame polyfill from https://github.com/darius/requestAnimationFrame
if (!Date.now)
  Date.now = function () {
    return new Date().getTime();
  };

(function () {
  "use strict";

  var vendors = ["webkit", "moz"];
  for (var i = 0; i < vendors.length && !window.requestAnimationFrame; ++i) {
    var vp = vendors[i];
    window.requestAnimationFrame = window[vp + "RequestAnimationFrame"];
    window.cancelAnimationFrame =
      window[vp + "CancelAnimationFrame"] ||
      window[vp + "CancelRequestAnimationFrame"];
  }
  if (
    /iP(ad|hone|od).*OS 6/.test(window.navigator.userAgent) || // iOS6 is buggy
    !window.requestAnimationFrame ||
    !window.cancelAnimationFrame
  ) {
    var lastTime = 0;
    window.requestAnimationFrame = function (callback) {
      var now = Date.now();
      var nextTime = Math.max(lastTime + 16, now);
      const timer = setTimeout(function () {
        callback((lastTime = nextTime));
        clearTimeout(timer);
      }, nextTime - now);
    };
  }
})();

window.Snowfall = function ($) {
  $.snowfall = function (element, options) {
    var flakes = [],
      defaults = {
        flakeCount: 10,
        minSpeed: 1,
        minSize: 8,
        maxSize: 25,
        flakeColor: "#fff",
        flakePosition: "absolute",
        flakeIndex: 999999,
        round: false,
        shadow: false,
        collection: false,
        collectionHeight: 40,
        deviceorientation: false,
      },
      options = $.extend(defaults, options),
      random = function random(min, max) {
        return Math.round(min + Math.random() * (max - min));
      };
    if (!window.snowfallData) {
      window.snowfallData = [this];
    } else {
      window.snowfallData.push(this);
    }

    // Snow flake object
    function Flake(_x, _y, _size, _speed, _noRotate) {
      // Flake properties
      this.x = _x;
      this.y = _y;
      this.rotate = 0;
      // true is +，false is -
      this.rotateIncreaseFlag = true;
      this.rotateXAngle = Math.PI / 2;
      this.rotateYAngle = 0;
      this.size = _size;
      this.speed = _speed;
      this.step = 0;
      this.noRotate = _noRotate;
      this.stepSize = random(1, 10) / 100;
      this.stop = false;

      if (options.collection) {
        this.target = canvasCollection[random(0, canvasCollection.length - 1)];
      }

      var flakeMarkup = null;

      if (options.image) {
        flakeMarkup = document.createElement("img");
        flakeMarkup.setAttribute("noLazyLoad", "true");
        flakeMarkup.src = options.image;
      } else {
        flakeMarkup = document.createElement("div");
        flakeMarkup.innerText = options.icon;
        $(flakeMarkup).css({
          transform: "rotate(" + Math.random() * 360 + "deg)",
        });
      }

      $(flakeMarkup)
        .attr({
          class: "snowfall-flakes",
        })
        .css({
          width: this.size,
          height: this.size,
          position: options.flakePosition,
          top: 0,
          left: 0,
          fontSize: options.image ? 0 : this.size + "px",
          zIndex: options.flakeIndex,
        });

      if ($(element).get(0).tagName === $(document).get(0).tagName) {
        $("body").append($(flakeMarkup));
        element = $("body");
      } else {
        $(element).append($(flakeMarkup));
      }

      this.element = flakeMarkup;

      // Update function, used to update the snow flakes, and checks current snowflake against bounds
      this.update = function () {
        this.y += this.speed;
        let rotateXAxle = "";
        let rotateYAxle = "";
        if (this.y > elHeight - (this.size + 20)) {
          this.reset();
        }
        if (this.rotateIncreaseFlag) {
          if (this.rotate < 60) {
            this.rotate += 3;
          }
          if (this.rotateXAngle > 0) {
            this.rotateXAngle -= Math.PI * 0.025;
            rotateXAxle = Math.abs(Math.sin(this.rotateXAngle));
          }
          if (this.rotateYAngle < Math.PI / 2) {
            this.rotateYAngle += Math.PI * 0.025;
            rotateYAxle = Math.abs(Math.sin(this.rotateYAngle));
          }
          if (
            this.rotate >= 60 ||
            this.rotateXAngle <= 0 ||
            this.rotateYAngle >= Math.PI / 2
          ) {
            this.rotateIncreaseFlag = false;
          }
        } else {
          if (this.rotate > 0) {
            this.rotate -= 3;
          }
          if (this.rotateXAngle < Math.PI / 2) {
            this.rotateXAngle += Math.PI * 0.025;
            rotateXAxle = Math.abs(Math.sin(this.rotateXAngle));
          }
          if (this.rotateYAngle > 0) {
            this.rotateYAngle -= Math.PI * 0.025;
            rotateYAxle = Math.abs(Math.sin(this.rotateYAngle));
          }
          if (
            this.rotate <= 0 ||
            this.rotateXAngle >= Math.PI / 2 ||
            this.rotateYAngle <= 0
          ) {
            this.rotateIncreaseFlag = true;
          }
        }

        const rotate = this.noRotate
          ? ""
          : `rotate3d(${rotateXAxle}, ${rotateYAxle}, 0, ${this.rotate}deg)`;
        this.element.style.transform = `translate(${this.x}px,${this.y}px) ${rotate}`;

        this.step += this.stepSize;
        if (!this.stop) {
          if (doRatio === false) {
            this.x += Math.cos(this.step);
          } else {
            this.x += doRatio + Math.cos(this.step);
          }
        }

        // Pileup check
        if (options.collection && this.target) {
          if (
            this.x > this.target.x &&
            this.x < this.target.width + this.target.x &&
            this.y > this.target.y &&
            this.y < this.target.height + this.target.y
          ) {
            var ctx = this.target.element.getContext("2d"),
              curX = this.x - this.target.x,
              curY = this.y - this.target.y,
              colData = this.target.colData;

            if (
              colData[parseInt(curX)][
                parseInt(curY + this.speed + this.size)
              ] !== undefined ||
              curY + this.speed + this.size > this.target.height
            ) {
              if (curY + this.speed + this.size > this.target.height) {
                while (
                  curY + this.speed + this.size > this.target.height &&
                  this.speed > 0
                ) {
                  this.speed = Math.floor(this.speed * 0.5);
                }

                ctx.fillStyle = defaults.flakeColor;

                if (
                  !colData[parseInt(curX)][
                    parseInt(curY + this.speed + this.size)
                  ]
                ) {
                  colData[parseInt(curX)][
                    parseInt(curY + this.speed + this.size)
                  ] = 1;
                  ctx.fillRect(
                    curX,
                    curY + this.speed + this.size,
                    this.size,
                    this.size,
                  );
                  this.stopAnimation();
                } else {
                  colData[parseInt(curX)][parseInt(curY + this.speed)] = 1;
                  ctx.fillRect(curX, curY + this.speed, this.size, this.size);
                  this.stopAnimation();
                }
              }
            }
          }
        }

        if (
          this.x + this.size > elWidth - widthOffset ||
          this.x < widthOffset
        ) {
          this.reset();
        }
      };

      // Resets the snowflake once it reaches one of the bounds set
      this.reset = function () {
        this.y = 0;
        this.x = random(widthOffset, elWidth - widthOffset);
        this.stepSize = random(1, 10) / 100;
        this.size = random(options.minSize * 100, options.maxSize * 100) / 100;
        this.element.style.width = this.size + "px";
        this.element.style.height = this.size + "px";
        this.speed = random(options.minSpeed, options.maxSpeed);
        this.stop = false;
      };

      this.stopAnimation = function () {
        this.stop = true;
      };
    }

    // local vars
    var i = 0,
      elHeight = $(element).height(),
      elWidth = $(element).width(),
      widthOffset = 0,
      snowTimeout = 0;

    // Collection Piece ******************************
    if (options.collection !== false) {
      var testElem = document.createElement("canvas");
      if (!!(testElem.getContext && testElem.getContext("2d"))) {
        var canvasCollection = [],
          elements = $(options.collection);
        collectionHeight = options.collectionHeight;

        for (var i = 0; i < elements.length; i++) {
          var bounds = elements[i].getBoundingClientRect(),
            $canvas = $("<canvas/>", {
              class: "snowfall-canvas",
            }),
            collisionData = [];

          if (bounds.top - collectionHeight > 0) {
            $("body").append($canvas);

            $canvas
              .css({
                position: options.flakePosition,
                left: bounds.left + "px",
                top: bounds.top - collectionHeight + "px",
              })
              .prop({
                width: bounds.width,
                height: collectionHeight,
              });

            for (var w = 0; w < bounds.width; w++) {
              collisionData[w] = [];
            }

            canvasCollection.push({
              element: $canvas.get(0),
              x: bounds.left,
              y: bounds.top - collectionHeight,
              width: bounds.width,
              height: collectionHeight,
              colData: collisionData,
            });
          }
        }
      } else {
        // Canvas element isnt supported
        options.collection = false;
      }
    }
    // ************************************************

    // This will reduce the horizontal scroll bar from displaying, when the effect is applied to the whole page
    if ($(element).get(0).tagName === $(document).get(0).tagName) {
      widthOffset = 25;
    }

    // Bind the window resize event so we can get the innerHeight again
    $(window).bind("resize", function () {
      elHeight = $(element)[0].clientHeight;
      elWidth = $(element)[0].offsetWidth;
    });

    // initialize the flakes
    for (i = 0; i < options.flakeCount; i += 1) {
      flakes.push(
        new Flake(
          random(widthOffset, elWidth - widthOffset),
          random(0, elHeight),
          random(options.minSize * 100, options.maxSize * 100) / 100,
          random(options.minSpeed, options.maxSpeed),
          options.noRotate,
        ),
      );
    }

    // This adds the style to make the snowflakes round via border radius property
    if (options.round) {
      $(".snowfall-flakes").css({
        "-moz-border-radius": options.maxSize,
        "-webkit-border-radius": options.maxSize,
        "border-radius": options.maxSize,
      });
    }

    // This adds shadows just below the snowflake so they pop a bit on lighter colored web pages
    if (options.shadow) {
      $(".snowfall-flakes").css({
        "-moz-box-shadow": "1px 1px 1px #555",
        "-webkit-box-shadow": "1px 1px 1px #555",
        "box-shadow": "1px 1px 1px #555",
      });
    }

    // On newer Macbooks Snowflakes will fall based on deviceorientation
    var doRatio = false;
    if (options.deviceorientation) {
      $(window).bind("deviceorientation", function (event) {
        doRatio = event.originalEvent.gamma * 0.1;
      });
    }
    let stop = false;
    // this controls flow of the updating snow
    const snow = () => {
      for (i = 0; i < flakes.length; i += 1) {
        flakes[i].update();
      }
      if (stop) return;
      requestAnimationFrame(function () {
        snow();
      });
    };

    snow();

    // clears the snowflakes
    this.clear = function () {
      $(".snowfall-canvas").off();
      $(".snowfall-canvas").remove();
      $(element).children(".snowfall-flakes").off();
      $(element).children(".snowfall-flakes").remove();
      $(window).off();
      flakes = [];
      stop = true;
    };
  };

  // Initialize the options and the plugin
  $.fn.snowfall = function (options) {
    if (typeof options == "object" || options == undefined) {
      return this.each(function (i) {
        new $.snowfall(this, options);
      });
    } else if (typeof options == "string") {
      if (!window.snowfallData) return;
      window.snowfallData.forEach((snow) => {
        if (snow && snow.clear) {
          snow.clear();
        }
      });
    }
  };
};
