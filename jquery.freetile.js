/*!
 * Freetile.js v0.3.1
 * A dynamic layout plugin for jQuery.
 */
//
//  Copyright (c) 2010-2013, Ioannis (Yannis) Chatzikonstantinou, All rights reserved.
//  http://www.yconst.com
//
//  Redistribution and use in source and binary forms, with or without modification,
//  are permitted provided that the following conditions are met:
//      - Redistributions of source code must retain the above copyright
//  notice, this list of conditions and the following disclaimer.
//      - Redistributions in binary form must reproduce the above copyright
//  notice, this list of conditions and the following disclaimer in the documentation
//  and/or other materials provided with the distribution.
//
//  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY
//  EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
//  WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
//  IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
//  INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
//  NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
//  PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
//  WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
//  ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY
//  OF SUCH DAMAGE.

(function( $ ){

    "use strict";

    //
    // Entry Point
    // _________________________________________________________

    $.fn.freetile = function( method )
    {
        // Method calling logic
        if ( typeof Freetile[ method ] === 'function' )
        {
          return Freetile[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
        }
        else if ( typeof method === 'object' || ! method )
        {
          return Freetile.init.apply( this, arguments );
        }
        else
        {
          $.error( 'Method ' +  method + ' does not exist on jQuery.Freetile' );
        }

        return this;
    };

    var Freetile =
    {
        //
        // "Public" Methods
        // _________________________________________________________

        // Method 1.
        // Smart and generic method that selects between
        // initialize, re-layout or append.
        init : function(options)
        {
            var container = this,
                o = Freetile.setupOptions(container, options),
                c = Freetile.newContent(o.contentToAppend);

            // Setup container bindings for resize and custom events
            if (!o.tiled) Freetile.setupContainerBindings(container, o);

            // If there is content to append and container has been already
            // tiled, continue in append mode.
            if (o.tiled && c)
            {
                container.append(c);
                c.filter(o.selector || '*').filter(o.loadCheckSelector).imagesLoaded(function()
                {
                    Freetile.positionAll(container, o);
                });
            // Otherwise continue by first just positioning the elements
            // and then doing a re-layout if any images are not yet loaded.
            }
            else
            {
                container.children(o.loadCheckSelector).imagesLoaded(function()
                {
                    Freetile.positionAll(container, o);
                });
            }
            return container;
        },

        // Method 2.
        // Similar to method 1 but only does something if there is
        // content to append.
        append : function(options)
        {
            var container = this,
                o = Freetile.setupOptions(container, options),
                c = Freetile.newContent(o.contentToAppend);

            // If there is content to append and container has been already
            // tiled, continue in append mode.
            if (o.tiled && c)
            {
                container.append(c);
                c.filter(o.loadCheckSelector).imagesLoaded(function()
                {
                    Freetile.positionAll(container, o);
                });
            }
            return container;
        },

        // Method 3.
        // Layout all elements just once. Single shot. 
        // Nothing else is done.
        layout : function(options)
        {
            var container = this,
                o = Freetile.setupOptions(container, options);

            // Position Elements
            Freetile.positionAll(container, o);
            return container;
        },

        // Method 4.
        // Removes all bindings
        destroy: function()
        {
            var container = this,
                options = container.data('FreetileData');

            // remove all child element's inline style
            Freetile.resetElementsStyle(container, options);
            // remove container inline style
            $(container).attr("style", "");
            // unbind window resize
            $(window).off("resize", this.windowResizeCallback);
            // unbind custom event
            container.off(options.customEvents, this.customEventsCallback);
            return true;
        },

        //
        // "Internal" Methods
        // _________________________________________________________

        // Setup Options Object
        // _________________________________________________________

        setupOptions : function(container, options)
        {
            // Get the data object from the container. If it doesn't exist it probably means
            // it's the first time Freetile is called..
            var containerData = container.data('FreetileData');

            // Generate the options object.
            var newOptions = $.extend(true,
                {},
                this.defaults,
                containerData,
                this.reset,
                options
            );

            // At this point we have a nice options object which is a special blend
            // of user-defined options, stored preferences and defaults. Let's save it.
            container.data('FreetileData', newOptions);

            // Temporary variable to denote whether the container has already been
            // processed before.
            newOptions.tiled = (containerData !== undefined);

            // The real 'animate' property is dependent, apart from user preference,
            // on whether this is the first time that Freetile is being called (should
            // be false) and whether we are appending content (should be false too).
            // !! animate and _animate are different variables!
            // _animate is an internal variable that indicates whether animation is
            // POSSIBLE & REQUESTED !!
            newOptions._animate = newOptions.animate && newOptions.tiled && $.isEmptyObject(newOptions.contentToAppend);
            this.reset.callback = newOptions.persistentCallback && newOptions.callback ? newOptions.callback : function() {};
            return newOptions;
        },

        // Window resize callback to be proxied in the
        // setupContainerBindings function below
        // _________________________________________________________

        windowResizeCallback: function(container, curWidth, curHeight)
        {
            clearTimeout(container.data("FreetileTimeout"));
            container.data("FreetileTimeout", setTimeout(function()
            {
                var win = $(window),
                    newWidth = win.width(),
                    newHeight = win.height();

                //Call function only if the window *actually* changes size!
                if (newWidth != curWidth || newHeight != curHeight)
                {
                    curWidth = newWidth,
                    curHeight = newHeight;
                    container.freetile('layout');
                }
            }, 400) );
        },

        // Custom event callback to be proxied to the binding step below
        // this = container
        // _________________________________________________________

        customEventsCallback: function(container)
        {
            clearTimeout(container.data("FreetileTimeout"));
            container.data("FreetileTimeout", setTimeout(function() { container.freetile('layout'); }, 400) );
        },

        // Setup bindings to resize and custom events.
        // _________________________________________________________

        setupContainerBindings : function(container, o)
        {
            // Bind to window resize.
            if (o.containerResize)
            {
                var win = $(window),
                    curWidth = win.width(),
                    curHeight = win.height();

                win.resize($.proxy(this.windowResizeCallback, container, container, curWidth, curHeight));
            }
            // Bind to custom events.
            if (o.customEvents)
            {
                container.bind(o.customEvents, $.proxy(this.customEventsCallback, container, container));
            }
            return container;
        },

        // Get content to be appended.
        // _________________________________________________________

        newContent : function(content)
        {
            if ( (typeof content === 'object' && !$.isEmptyObject(content))
                || (typeof content === 'string' && $(content).length ) )
            {
                return $(content);
            }
            return false;
        },

        // Position a single element.
        // _________________________________________________________

        calculatePositions : function(container, elements, o) // Container, elements, options
        {
            // Position index:
            // |    |   |       Old columns
            // |      |         New column
            // ^        ^
            // Start    End

            elements.each(function(i)
            {
                // Variable declaration.
                var $this = $(this),
                    j = 0;

                o.ElementWidth = $this.outerWidth(true);
                o.ElementHeight = $this.outerHeight(true);
                o.ElementTop = 0;
                o.ElementIndex = i;
                o.IndexStart = 0;
                o.IndexEnd = 0;
                o.BestScore = 0;
                o.TestedTop = 0;
                o.TestedLeft = 0;


                // 1.   Determine Element Position
                // ___________________________________________________

                // Find out the true top position of element
                // for position 0 (in case it spans multiple elements)
                o.TestedTop = o.currentPos[0].top;
                for (j = 1; j < o.currentPos.length && o.currentPos[j].left < o.ElementWidth; j++)
                {
                    o.TestedTop = Math.max(o.TestedTop, o.currentPos[j].top);
                }
                o.ElementTop = o.TestedTop;
                o.IndexEnd = j;
                o.BestScore = o.scoreFunction(o);

                // Element is now successfully placed at position 0.
                // As a next step, investigate the rest of available positions
                // as to whether they are better.
                for (var i = 1; (i < o.currentPos.length) && (o.currentPos[i].left + o.ElementWidth <= o.containerWidth); i++)
                {
                    o.TestedLeft = o.currentPos[i].left;
                    o.TestedTop = o.currentPos[i].top;
                    for (j = i + 1; (j < o.currentPos.length) && (o.currentPos[j].left - o.currentPos[i].left < o.ElementWidth); j++)
                    {
                        o.TestedTop = Math.max(o.TestedTop, o.currentPos[j].top);
                    }
                    var NewScore = o.scoreFunction(o);
                    if (NewScore > o.BestScore)
                    {
                        o.IndexStart = i;
                        o.IndexEnd = j;
                        o.ElementTop = o.TestedTop;
                        o.BestScore = NewScore;
                    }
                }
                // At this point 1 <= o.IndexEnd <= Len.


                // 2.   Apply Element Position
                // ___________________________________________________

                // Current Position
                var curpos = $this.position(),

                // New Position
                    pos =
                    {
                        left: o.currentPos[o.IndexStart].left + o.xPadding,
                        top: o.ElementTop + o.yPadding
                    };

                // Position the element only if it's position actually changes.
                // This check is useful when we are re-arranging an already packed arrangement.
                // Some elements may still need to be in the same positions.
                if (curpos.top != pos.top || curpos.left != pos.left)
                {
                    var aniObj = {el : $this, f : 'css', d : 0};

                    if (o._animate && !$this.hasClass('noanim'))
                    {
                        // Current offset
                        var curoffset = $this.offset(),

                        // Easily find new offset without lots of calculations
                        offset =
                        {
                            left: pos.left + (curoffset.left - curpos.left),
                            top: pos.top + (curoffset.top - curpos.top)
                        };

                        // Animate only if:
                        // 1. Animate option is possible and enabled
                        // 2. The element is allowed to animate (doesn't have the 'noanim' class)
                        // 3. The y-offset position of the element is within the viewport.
                        // Callback counter will be
                        // updated on animation end.
                        if ((curoffset.top + o.ElementHeight > o.viewportY && curoffset.top < o.viewportYH ||
                             offset.top + o.ElementHeight > o.viewportY && offset.top < o.viewportYH))
                        {

                            aniObj.f = 'animate'
                            aniObj.d = o.currentDelay;

                            ++(o.iteration);
                            // Increase the animation delay value.
                            o.currentDelay += o.elementDelay;
                        }
                    }
                    aniObj.style = pos;
                    o.styleQueue.push(aniObj);
                }
                // Update the callback counter.
                 --(o.iteration);

                // 3.   Reconstruct Columns
                // ___________________________________________________

                // a.   Store the height of the last element of the span.
                //      If a new insertion point is to be inserted at the end of the
                //      new element span, it should have this height.
                var LastSpanTop = o.currentPos[o.IndexEnd - 1].top,
                    LastSpanRight = o.currentPos[o.IndexEnd]? o.currentPos[o.IndexEnd].left : o.containerWidth,
                    ElementRight = o.currentPos[o.IndexStart].left + o.ElementWidth;

                // b.   Update height in insertion column.
                o.currentPos[o.IndexStart].top = o.ElementTop + o.ElementHeight;

                // c. If there are columns after the insertion point,
                //    remove them, up until the last occupied column.
                //    also: If there is leftover (i.e. ElementLeft + ElementWidth < ContainerWidth)
                //    add an insertion point at X: ElementLeft + ElementWidth, Y:LastSpanTop
                if (ElementRight < LastSpanRight)
                {
                    o.currentPos.splice(o.IndexStart + 1, o.IndexEnd - o.IndexStart - 1, {left: ElementRight, top: LastSpanTop} );
                }
                else
                {
                    o.currentPos.splice(o.IndexStart + 1, o.IndexEnd - o.IndexStart - 1);
                }
            });
        },

        prepareElements: function(container, elements, o) // Container, elements, options
        {
            // Set elements display to block (http://jsfiddle.net/vH2g9/1/)
            // and position to absolute first. (http://bit.ly/hpo7Nv)
            elements.each(function()
            {
                var $this = $(this);
                if ($this.is(':visible'))
                {
                    $this.css({'display' : 'block'});
                }
            }).css({'position' : 'absolute'});
        },

        // Process styleQueue
        // This is set up like jQuery masonry, rather than directly applying
        // styles in the positioning loop. It yields a big performance gain.
        // _________________________________________________________

        applyStyles : function(o)
        {
            var obj;
            for (var i=0, len = o.styleQueue.length; i < len; i++)
            {
                obj = o.styleQueue[i];

				// always use csstransforms if available
				if(o.csstransforms3d) {
					var translate3d = "translate3d(" + obj.style.left + "px," + obj.style.top + "px,0)";

					obj.el.css("-moz-transform", translate3d);
					obj.el.css("-webkit-transform", translate3d);
					obj.el.css("-o-transform", translate3d);
					obj.el.css("-ms-transform", translate3d);
					obj.el.css("transform", translate3d);

					// invoke the callback when the transition ends
					if (o.animationOptions.complete != null) {
						obj.el.on('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function (e) {
							$(this).off("webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend");
							o.animationOptions.complete.call(o)
						});
					}
				}
				else{
					if (obj.f == 'animate')
					{
						obj.el.delay(obj.d).animate(obj.style, $.extend( true, {}, o.animationOptions));
					}
					else
					{
						obj.el.css(obj.style);
					}
				}
            }
        },

        // Main layout algorithm
        // _________________________________________________________

        positionAll : function(container, o)
        {
            //
            // 1. Initialize
            //

            // Get elements
            if ($.isEmptyObject(o.contentToAppend))
            {
                var Elements = o.selector ? container.children(o.selector) : container.children();
            }
            else
            {
                var Elements = o.selector ? o.contentToAppend.filter(o.selector) : o.contentToAppend;
            }

            // Count elements.
            o.ElementsCount = Elements.length;

            // If container is empty, set height to zero, call callback and return.
            if (!o.ElementsCount)
            {
                container.data("FreetilePos", null);
                if (typeof(o.callback == "function"))
                {
                    o.callback(o);
                }
                container[o._animate && o.containerAnimate ? 'animate' : 'css']({ 'height' : '0px'});
                return container;
            }

            // Store the container's visibility properties.
            var disp = container.css('display') || '';
            var vis = container.css('visibility') || '';

            // Temporarily show the container...
            container.css({ display: 'block', width: '', visibility: 'hidden' });

            // Calculate container width
            o.containerWidth = container.width();

            // Get saved positions of elements if they exist and if we are appending
            // new content.
            var savedPos = container.data("FreetilePos");
            o.currentPos = !$.isEmptyObject(o.contentToAppend) && savedPos ? savedPos : [{left: 0, top: 0}];

            // Calculate container padding for correct element positioning
            o.xPadding = parseInt(container.css("padding-left"), 10);
            o.yPadding = parseInt(container.css("padding-top"), 10);

            // Set viewport y-offset and height
            o.viewportY = $(window).scrollTop();
            o.viewportYH = o.viewportY + $(window).height();

            // Initialize some variables in the options object
            o.iteration = Elements.length;
            o.currentDelay = 0;
            o.styleQueue = [];

            // Set Callback. (will be cleared on next run)
            o.animationOptions.complete = function() { if (--(o.iteration) <= 0) o.callback(o); } ;

            //
            // 2. Position Elements and apply styles.
            //

            Freetile.prepareElements(container, Elements, o);
            Freetile.calculatePositions(container, Elements, o);
            Freetile.applyStyles(o);

            //
            // 3. Finalize
            //

            // Define container-specific CSS and force width if forceWidth is true,
            // taking into account containerWidthStep if present, to specify a different
            // width-stepping than the width of the elements.
            // Also restore original position information.
            var CalculatedCSS = {};

            if (disp) CalculatedCSS.display = disp;
            if (vis) CalculatedCSS.visibility = vis;

            // If container position is static make it relative to properly position elements.
            if (container.css('position') == 'static')
            {
                CalculatedCSS.position = 'relative';
            }

            // If forceWidth is true, apply new width to the container
            // using step specified in containerWidthStep.
            if (o.forceWidth && o.containerWidthStep > 0)
            {
                CalculatedCSS.width = o.containerWidthStep * (parseInt(container.width() / o.containerWidthStep, 10))
            }

            // Apply initial CSS properties.
            container.css(CalculatedCSS);

            // Re-use CalculatedCSS to apply height.
            var Tops = $.map(o.currentPos, function(n, i) {return n.top;});
            CalculatedCSS = {height: Math.max.apply(Math, Tops)};


			// always use csstransforms if available
			if(o.csstransforms3d){
				var translate3d = "translate3d(" + CalculatedCSS.left + "px," + CalculatedCSS.top + "px,0)";

				container.css("-moz-transform", translate3d);
				container.css("-webkit-transform", translate3d);
				container.css("-o-transform", translate3d);
				container.css("-ms-transform", translate3d);
				container.css("transform", translate3d);

				// invoke the callback when the transition ends
				if (o.animationOptions.complete != null) {
					container.on('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function (e) {
						$(this).off("webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend");
						o.animationOptions.complete.call(o)
					});
				}
			}
			else {
				// Apply or animate.
				if (o._animate && o.containerAnimate) {
					container.stop().animate(CalculatedCSS, $.extend(true, {}, o.animationOptions));
				}
				else {
					container.css(CalculatedCSS);
				}
			}

            // Callback
            if (o.iteration <= 0) o.callback(o);

            // Save current positions
            container.data("FreetilePos", o.currentPos);

            // Mark elements as tiled.
            Elements.addClass("tiled");
            return container;
        },

        // Resetting the main layout algorythm and removing all
        // inline styles
        // _________________________________________________________
        resetElementsStyle: function(container, o){
            var Elements;
            // Get elements
            if ($.isEmptyObject(o.contentToAppend))
            {
                Elements = o.selector ? container.children(o.selector) : container.children();
            }
            else
            {
                Elements = o.selector ? o.contentToAppend.filter(o.selector) : o.contentToAppend;
            }

            Elements.each(function(){
                $(this).attr("style", "");
            });
        },

        // Defaults
        defaults :
        {
            selector : '*',
            animate : false,
            elementDelay : 0,
            containerResize : true,
            containerAnimate : false,
            customEvents : '',
            persistentCallback : false,
            forceWidth : false,
            containerWidthStep : 1,
            loadCheckSelector : ':not(.ignore-load-check)',
			csstransforms3d: false,

            scoreFunction: function(o)
            {
                // Minimum Available Variable set
                // o.IndexStart, o.IndexEnd, o.TestedLeft, o.TestedTop, o.ElementWidth, o.ElementHeight

                // The following rule would add a bit of bias to the left.
                //return -(o.TestedTop) * 8 - (o.TestedLeft);

                // Simple least-height heuristic rule (default)
                return -(o.TestedTop);
            }
        },

        // Overriding options.
        reset :
        {
            animationOptions : { complete: function() {} },
            callback : function() {},
            contentToAppend : {}
        }
    };
})( jQuery );


/*!
 * imagesLoaded PACKAGED v3.0.2
 * JavaScript is all like "You images are done yet or what?"
 */

(function(e){"use strict";function t(){}function n(e,t){if(r)return t.indexOf(e);for(var n=t.length;n--;)if(t[n]===e)return n;return-1}var i=t.prototype,r=Array.prototype.indexOf?!0:!1;i._getEvents=function(){return this._events||(this._events={})},i.getListeners=function(e){var t,n,i=this._getEvents();if("object"==typeof e){t={};for(n in i)i.hasOwnProperty(n)&&e.test(n)&&(t[n]=i[n])}else t=i[e]||(i[e]=[]);return t},i.getListenersAsObject=function(e){var t,n=this.getListeners(e);return n instanceof Array&&(t={},t[e]=n),t||n},i.addListener=function(e,t){var i,r=this.getListenersAsObject(e);for(i in r)r.hasOwnProperty(i)&&-1===n(t,r[i])&&r[i].push(t);return this},i.on=i.addListener,i.defineEvent=function(e){return this.getListeners(e),this},i.defineEvents=function(e){for(var t=0;e.length>t;t+=1)this.defineEvent(e[t]);return this},i.removeListener=function(e,t){var i,r,s=this.getListenersAsObject(e);for(r in s)s.hasOwnProperty(r)&&(i=n(t,s[r]),-1!==i&&s[r].splice(i,1));return this},i.off=i.removeListener,i.addListeners=function(e,t){return this.manipulateListeners(!1,e,t)},i.removeListeners=function(e,t){return this.manipulateListeners(!0,e,t)},i.manipulateListeners=function(e,t,n){var i,r,s=e?this.removeListener:this.addListener,o=e?this.removeListeners:this.addListeners;if("object"!=typeof t||t instanceof RegExp)for(i=n.length;i--;)s.call(this,t,n[i]);else for(i in t)t.hasOwnProperty(i)&&(r=t[i])&&("function"==typeof r?s.call(this,i,r):o.call(this,i,r));return this},i.removeEvent=function(e){var t,n=typeof e,i=this._getEvents();if("string"===n)delete i[e];else if("object"===n)for(t in i)i.hasOwnProperty(t)&&e.test(t)&&delete i[t];else delete this._events;return this},i.emitEvent=function(e,t){var n,i,r,s=this.getListenersAsObject(e);for(i in s)if(s.hasOwnProperty(i))for(n=s[i].length;n--;)r=t?s[i][n].apply(null,t):s[i][n](),r===!0&&this.removeListener(e,s[i][n]);return this},i.trigger=i.emitEvent,i.emit=function(e){var t=Array.prototype.slice.call(arguments,1);return this.emitEvent(e,t)},"function"==typeof define&&define.amd?define(function(){return t}):e.EventEmitter=t})(this),function(e){"use strict";var t=document.documentElement,n=function(){};t.addEventListener?n=function(e,t,n){e.addEventListener(t,n,!1)}:t.attachEvent&&(n=function(t,n,i){t[n+i]=i.handleEvent?function(){var t=e.event;t.target=t.target||t.srcElement,i.handleEvent.call(i,t)}:function(){var n=e.event;n.target=n.target||n.srcElement,i.call(t,n)},t.attachEvent("on"+n,t[n+i])});var i=function(){};t.removeEventListener?i=function(e,t,n){e.removeEventListener(t,n,!1)}:t.detachEvent&&(i=function(e,t,n){e.detachEvent("on"+t,e[t+n]);try{delete e[t+n]}catch(i){e[t+n]=void 0}});var r={bind:n,unbind:i};"function"==typeof define&&define.amd?define(r):e.eventie=r}(this),function(e){"use strict";function t(e,t){for(var n in t)e[n]=t[n];return e}function n(e){return"[object Array]"===a.call(e)}function i(e){var t=[];if(n(e))t=e;else if("number"==typeof e.length)for(var i=0,r=e.length;r>i;i++)t.push(e[i]);else t.push(e);return t}function r(e,n){function r(e,n,o){if(!(this instanceof r))return new r(e,n);"string"==typeof e&&(e=document.querySelectorAll(e)),this.elements=i(e),this.options=t({},this.options),"function"==typeof n?o=n:t(this.options,n),o&&this.on("always",o),this.getImages(),s&&(this.jqDeferred=new s.Deferred);var h=this;setTimeout(function(){h.check()})}function a(e){this.img=e}r.prototype=new e,r.prototype.options={},r.prototype.getImages=function(){this.images=[];for(var e=0,t=this.elements.length;t>e;e++){var n=this.elements[e];"IMG"===n.nodeName&&this.addImage(n);for(var i=n.querySelectorAll("img"),r=0,s=i.length;s>r;r++){var o=i[r];this.addImage(o)}}},r.prototype.addImage=function(e){var t=new a(e);this.images.push(t)},r.prototype.check=function(){function e(e,r){return t.options.debug&&h&&o.log("confirm",e,r),t.progress(e),n++,n===i&&t.complete(),!0}var t=this,n=0,i=this.images.length;if(this.hasAnyBroken=!1,!i)return this.complete(),void 0;for(var r=0;i>r;r++){var s=this.images[r];s.on("confirm",e),s.check()}},r.prototype.progress=function(e){this.hasAnyBroken=this.hasAnyBroken||!e.isLoaded,this.emit("progress",this,e),this.jqDeferred&&this.jqDeferred.notify(this,e)},r.prototype.complete=function(){var e=this.hasAnyBroken?"fail":"done";if(this.isComplete=!0,this.emit(e,this),this.emit("always",this),this.jqDeferred){var t=this.hasAnyBroken?"reject":"resolve";this.jqDeferred[t](this)}},s&&(s.fn.imagesLoaded=function(e,t){var n=new r(this,e,t);return n.jqDeferred.promise(s(this))});var f={};return a.prototype=new e,a.prototype.check=function(){var e=f[this.img.src];if(e)return this.useCached(e),void 0;if(f[this.img.src]=this,this.img.complete&&void 0!==this.img.naturalWidth)return this.confirm(0!==this.img.naturalWidth,"naturalWidth"),void 0;var t=this.proxyImage=new Image;n.bind(t,"load",this),n.bind(t,"error",this),t.src=this.img.src},a.prototype.useCached=function(e){if(e.isConfirmed)this.confirm(e.isLoaded,"cached was confirmed");else{var t=this;e.on("confirm",function(e){return t.confirm(e.isLoaded,"cache emitted confirmed"),!0})}},a.prototype.confirm=function(e,t){this.isConfirmed=!0,this.isLoaded=e,this.emit("confirm",this,t)},a.prototype.handleEvent=function(e){var t="on"+e.type;this[t]&&this[t](e)},a.prototype.onload=function(){this.confirm(!0,"onload"),this.unbindProxyEvents()},a.prototype.onerror=function(){this.confirm(!1,"onerror"),this.unbindProxyEvents()},a.prototype.unbindProxyEvents=function(){n.unbind(this.proxyImage,"load",this),n.unbind(this.proxyImage,"error",this)},r}var s=e.jQuery,o=e.console,h=o!==void 0,a=Object.prototype.toString;"function"==typeof define&&define.amd?define(["eventEmitter","eventie"],r):e.imagesLoaded=r(e.EventEmitter,e.eventie)}(window);
