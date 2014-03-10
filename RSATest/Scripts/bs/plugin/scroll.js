bs['plugin+']( 'class', 'scroll', function( $fn ){ console.log( 'scroll' );
	var rAF = window.requestAnimationFrame	||
	window.webkitRequestAnimationFrame	||
	window.mozRequestAnimationFrame		||
	window.oRequestAnimationFrame		||
	window.msRequestAnimationFrame		||
	function(callback){ window.setTimeout(callback, 1000 / 60); };
	var utils = (function(){
		var me = {};
		me.extend = function(target, obj){
			for ( var i in obj ){
				target[i] = obj[i];
			}
		};
		me.momentum = function(current, start, time, lowerMargin, wrapperSize){
			var distance = current - start,speed = Math.abs(distance) / time,destination,duration,deceleration = 0.0006;

			destination = current + ( speed * speed ) / ( 2 * deceleration ) * ( distance < 0 ? -1 : 1 );
			duration = speed / deceleration;
	
			if( destination < lowerMargin ){
				destination = wrapperSize ? lowerMargin - ( wrapperSize / 2.5 * ( speed / 8 ) ) : lowerMargin;
				distance = Math.abs(destination - current);
				duration = distance / speed;
			} else if( destination > 0 ){
				destination = wrapperSize ? wrapperSize / 2.5 * ( speed / 8 ) : 0;
				distance = Math.abs(current) + destination;
				duration = distance / speed;
			}
			
			return {
				destination: Math.round(destination),
				duration: duration
			};
		};

		me.extend(me, {
			hasTransform: bs.DETECT.transition,
			hasPerspective: bs.DETECT.transform3D,
			hasTouch: 'ontouchstart' in window,
			hasPointer: navigator.msPointerEnabled,
			hasTransition: bs.DETECT.transition
		});
	
		// This should find all Android browsers lower than build 535.19 (both stock browser and webview)
		me.isBadAndroid = /Android/.test(window.navigator.appVersion) && !(/Chrome\/\d/.test(window.navigator.appVersion));
		me.offset = function(el){
			var left = -el.offsetLeft,
				top = -el.offsetTop;
			while (el = el.offsetParent){
				left -= el.offsetLeft;
				top -= el.offsetTop;
			}
			return {left: left, top: top};
		};
		me.preventDefaultException = function(el, exceptions){
			for ( var i in exceptions ){
				if( exceptions[i].test(el[i]) ){
					return true;
				}
			}
			return false;
		};
		me.extend(me.eventType = {}, {
			touchstart: 1, touchmove: 1, touchend: 1,
			mousedown: 2, mousemove: 2, mouseup: 2,
			MSPointerDown: 3, MSPointerMove: 3, MSPointerUp: 3
		});
	
		me.extend(me.ease = {}, {
			quadratic: {
				style: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
				fn: function(k){return k * ( 2 - k );}
			},
			circular: {
				style: 'cubic-bezier(0.1, 0.57, 0.1, 1)',	// Not properly "circular" but this looks better, it should be (0.075, 0.82, 0.165, 1)
				fn: function(k){return Math.sqrt( 1 - ( --k * k ) );}
			},
			back: {
				style: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
				fn: function(k){
					var b = 4;
					return ( k = k - 1 ) * k * ( ( b + 1 ) * k + b ) + 1;
				}
			},
			bounce: {
				style: '',
				fn: function(k){
					if( ( k /= 1 ) < ( 1 / 2.75 ) ){
						return 7.5625 * k * k;
					} else if( k < ( 2 / 2.75 ) ){
						return 7.5625 * ( k -= ( 1.5 / 2.75 ) ) * k + 0.75;
					} else if( k < ( 2.5 / 2.75 ) ){
						return 7.5625 * ( k -= ( 2.25 / 2.75 ) ) * k + 0.9375;
					} else {
						return 7.5625 * ( k -= ( 2.625 / 2.75 ) ) * k + 0.984375;
					}
				}
			},
			elastic: {
				style: '',
				fn: function(k){
					var f = 0.22,e = 0.4;
					if( k === 0 ){ return 0; }
					if( k == 1 ){ return 1; }
					return ( e * Math.pow( 2, - 10 * k ) * Math.sin( ( k - f / 4 ) * ( 2 * Math.PI ) / f ) + 1 );
				}
			}
		});
		me.tap = function(e, eventName){
			var ev = document.createEvent('Event');
			ev.initEvent(eventName, true, true);
			ev.pageX = e.pageX;
			ev.pageY = e.pageY;
			e.target.dispatchEvent(ev);
		};
		me.click = function(e){
			var target = e.target,
				ev;
			if(target.tagName != 'SELECT' && target.tagName != 'INPUT' && target.tagName != 'TEXTAREA'){
				ev = document.createEvent('MouseEvents');
				ev.initMouseEvent('click', true, true, e.view, 1,
					target.screenX, target.screenY, target.clientX, target.clientY,
					e.ctrlKey, e.altKey, e.shiftKey, e.metaKey,
					0, null);
	
				ev._constructed = true;
				target.dispatchEvent(ev);
			}
		};
		return me;
	})();
	
	var s,key,rTagName;
	bs.Css( '.BSSCRW' ).S( 'overflow', 'hidden' );
	(function(){
		var t0, i;
		t0 = 'startX,startY,scrollX,scrollY,freeScroll,tab,click,snap,mouseWheel,enabled,'+
		'directionLockThreshold,momentum,bounce,bounceTime,bounceEasing,resizePolling,invertWheelDirection,keyBindings,'+
		'preventDefault,preventDefaultException,eventPassthrough,HWCompositing,useTransition,useTransform,'+
		'scrollbars,indicators,shrinkScrollbars',
		t0 = t0.split(','),
		key = {}, i = t0.length;
		while( i-- ) key[t0[i]] = 1;
	})(),
	rTagName = /^(INPUT|TEXTAREA|BUTTON|SELECT)$/,
	$fn.NEW = function( $key ){
		console.log( 'init' );

		this.__wrapper = bs.Dom( $key ).S( 'class+', 'BSSCRW', 'this' );
		/// 포지션 검사해야함
	
		this.wrapper = bs.Dom( $key )[0];
		this.scroller = this.wrapper.children[0];
		
		/// 레퍼의 자식 검사
		this.scrollerStyle = this.scroller.style;		// cache style for better performance
		this.__scroller = bs.Dom( this.scroller );
		this.__scroller.S( '@SCROLL', this );
		this.__scroller.S( 'class+', 'BSSCROLLER' );
		
		///옵션은 this.oXxxx
		this.options = {		
			resizeIndicator: true,		
			mouseWheelSpeed: 20,
			snapThreshold: 0.334,
		
			scrollY: true,
			directionLockThreshold: 5,
			momentum: true,
	
			bounce: true,
			bounceTime: 600,
			bounceEasing: '',
	
			preventDefault: true,
			preventDefaultException: { tagName: rTagName },
	
			HWCompositing: true,
			useTransition: true,
			useTransform: true
		};
		this.options.startX = this.__scroller.S( 'left' ) || this.__scroller.S( 'left', 0 );
		this.options.startY = this.__scroller.S( 'left' ) || this.__scroller.S( 'left', 0 );
		this.__scroller.S( 'transitionend', [this, this._transitionEnd] );
		this.__wrapper.S( 'down', this );
		bs.WIN.on( 'move', this );
		bs.WIN.on( 'up', this );
	},
	$fn.S = function(){
		var t0, i, j, k, v;
		if( arguments[0] === null ){
			this.destroy();
		}
		i = 0, j = arguments.length;
		while( i < j ){
			if( !key[k = arguments[i++]] ) throw k;
			if( k == 'play' ) t0 = 1;
			else this.options[k] = arguments[i++];
		}

		// Normalize options
		this.translateZ = this.options.HWCompositing && utils.hasPerspective ? ' translateZ(0)' : '';
		this.options.useTransition = utils.hasTransition && this.options.useTransition;
		this.options.useTransform = utils.hasTransform && this.options.useTransform;
		this.options.eventPassthrough = this.options.eventPassthrough === true ? 'vertical' : this.options.eventPassthrough;
		this.options.preventDefault = !this.options.eventPassthrough && this.options.preventDefault;
	
		// If you want eventPassthrough I have to lock one of the axes
		this.options.scrollY = this.options.eventPassthrough == 'vertical' ? false : this.options.scrollY;
		this.options.scrollX = this.options.eventPassthrough == 'horizontal' ? false : this.options.scrollX;
		
		// With eventPassthrough we also need lockDirection mechanism
		this.options.freeScroll = this.options.freeScroll && !this.options.eventPassthrough;
		this.options.directionLockThreshold = this.options.eventPassthrough ? 0 : this.options.directionLockThreshold;
		this.options.bounceEasing = typeof this.options.bounceEasing == 'string' ? utils.ease[this.options.bounceEasing] || utils.ease.circular : this.options.bounceEasing;
		this.options.resizePolling = this.options.resizePolling === undefined ? 60 : this.options.resizePolling;	
		if( this.options.tap === true ) this.options.tap = 'tap';
		if( this.options.shrinkScrollbars == 'scale' ) this.options.useTransition = false;
		this.options.invertWheelDirection = this.options.invertWheelDirection ? -1 : 1;

		this.x = 0;
		this.y = 0;
		this.directionX = 0;
		this.directionY = 0;
		this._events = {};

		if( this.options.scrollbars || this.options.indicators ) this._initIndicators();
		if( this.options.mouseWheel ) this._initWheel();
		if( this.options.snap ) this._initSnap();
		if( this.options.keyBindings ) this._initKeys();
	
		this.refresh();
	
		this.scrollTo(this.options.startX, this.options.startY);
		this.utils = utils;
		///if( t0 ) this.enable();	
		this.enable();	
	},
	$fn.destroy = function(){
		this.__wrapper.S( 'down', null );
		bs.WIN.on( 'move', null );
		bs.WIN.on( 'up', null );
		this._execEvent('destroy');
		this.END();
	},
	$fn._transitionEnd = function(e){
		console.log( '_transitionEnd' );
		if( e.target != this.scroller || !this.isInTransition ){
			return;
		}

		this._transitionTime();
		if( !this.resetPosition(this.options.bounceTime) ){
			this.isInTransition = false;
			this._execEvent('scrollEnd');
		}
	},
	$fn.down = function(e){
		console.log( 'down' );

		if( !this.enabled || (this.initiated && utils.eventType[e.type] !== this.initiated) ) return;
		if( this.options.preventDefault && !utils.isBadAndroid && !utils.preventDefaultException(e.target, this.options.preventDefaultException) ) e.prevent();
		var pos;
		this.initiated	= utils.eventType[e.type];
		this.moved		= false;
		this.distX		= 0;
		this.distY		= 0;
		this.directionX = 0;
		this.directionY = 0;
		this.directionLocked = 0;	
		this._transitionTime();
		this.startTime = Date.now();

		if( this.options.useTransition && this.isInTransition ){
			this.isInTransition = false;
			pos = this.getComputedPosition();
			this._translate(Math.round(pos.x), Math.round(pos.y));
			this._execEvent('scrollEnd');
		} else if( !this.options.useTransition && this.isAnimating ){
			this.isAnimating = false;
			this._execEvent('scrollEnd');
		}

		this.startX    = this.x;
		this.startY    = this.y;
		this.absStartX = this.x;
		this.absStartY = this.y;
		this.pointX    = e.x;
		this.pointY    = e.y;
		this._execEvent('beforeScrollStart');
	},
	$fn.move = function(e){
		if( !this.enabled || utils.eventType[e.type] !== this.initiated ) return;
		if( this.options.preventDefault ) e.prevent();
	
		var deltaX		= e.x - this.pointX,
			deltaY		= e.y - this.pointY,
			timestamp	= Date.now(),
			newX, newY, absDistX, absDistY;

		this.pointX		= e.x;
		this.pointY		= e.y;
		this.distX		+= deltaX;
		this.distY		+= deltaY;
		absDistX		= Math.abs(this.distX);
		absDistY		= Math.abs(this.distY);
		
		// We need to move at least 10 pixels for the scrolling to initiate
		if( timestamp - this.endTime > 300 && (absDistX < 10 && absDistY < 10) ) return;

		// If you are scrolling in one direction lock the other
		if( !this.directionLocked && !this.options.freeScroll ){
			if( absDistX > absDistY + this.options.directionLockThreshold ){
				this.directionLocked = 'h';		// lock horizontally
			} else if( absDistY >= absDistX + this.options.directionLockThreshold ){
				this.directionLocked = 'v';		// lock vertically
			} else {
				this.directionLocked = 'n';		// no lock
			}
		}
		
		if( this.directionLocked == 'h' ){
			if( this.options.eventPassthrough == 'vertical' ){
				e.prevent();
			} else if( this.options.eventPassthrough == 'horizontal' ){
				this.initiated = false;
				return;
			}

			deltaY = 0;
		} else if( this.directionLocked == 'v' ){
			if( this.options.eventPassthrough == 'horizontal' ){
				e.prevent();
			} else if( this.options.eventPassthrough == 'vertical' ){
				this.initiated = false;
				return;
			}

			deltaX = 0;
		}

		deltaX = this.hasHorizontalScroll ? deltaX : 0;
		deltaY = this.hasVerticalScroll ? deltaY : 0;	

		newX = this.x + deltaX;
		newY = this.y + deltaY;

		// Slow down if outside of the boundaries
		if( newX > 0 || newX < this.maxScrollX ){
			newX = this.options.bounce ? this.x + deltaX / 3 : newX > 0 ? 0 : this.maxScrollX;
		}
		if( newY > 0 || newY < this.maxScrollY ){
			newY = this.options.bounce ? this.y + deltaY / 3 : newY > 0 ? 0 : this.maxScrollY;
		}

		this.directionX = deltaX > 0 ? -1 : deltaX < 0 ? 1 : 0;
		this.directionY = deltaY > 0 ? -1 : deltaY < 0 ? 1 : 0;

		if( !this.moved ) this._execEvent('scrollStart');
		this.moved = true;
		this._translate(newX, newY);
		if( timestamp - this.startTime > 300 ){
			this.startTime = timestamp;
			this.startX = this.x;
			this.startY = this.y;
		}
	},
	$fn.up = function(e){
		console.log( 'up' );
		if( !this.enabled || utils.eventType[e.type] !== this.initiated ) return;
		if( this.options.preventDefault && !utils.preventDefaultException(e.target, this.options.preventDefaultException) ) e.prevent();

		var momentumX,momentumY,
			duration = Date.now() - this.startTime,
			newX = Math.round(this.x), newY = Math.round(this.y),
			distanceX = Math.abs(newX - this.startX), distanceY = Math.abs(newY - this.startY),
			time = 0, easing = '';

		this.isInTransition = 0;
		this.initiated = 0;
		this.endTime = Date.now();

		// reset if we are outside of the boundaries
		if( this.resetPosition(this.options.bounceTime) ) return;
		this.scrollTo(newX, newY);	// ensures that the last position is rounded

		// we scrolled less than 10 pixels
		if( !this.moved ){
			if( this.options.tap ) utils.tap(e, this.options.tap);
			if( this.options.click ) utils.click(e);
			this._execEvent('scrollCancel');
			return;
		}
		if( this._events.flick && duration < 200 && distanceX < 100 && distanceY < 100 ){
			this._execEvent('flick');
			return;
		}
		// start momentum animation if needed
		if( this.options.momentum && duration < 300 ){
			momentumX = this.hasHorizontalScroll ? utils.momentum(this.x, this.startX, duration, this.maxScrollX, this.options.bounce ? this.wrapperWidth : 0) : { destination: newX, duration: 0 };
			momentumY = this.hasVerticalScroll ? utils.momentum(this.y, this.startY, duration, this.maxScrollY, this.options.bounce ? this.wrapperHeight : 0) : { destination: newY, duration: 0 };
			newX = momentumX.destination;
			newY = momentumY.destination;
			time = Math.max(momentumX.duration, momentumY.duration);
			this.isInTransition = 1;
		}

		if( this.options.snap ){
			var snap = this._nearestSnap(newX, newY);
			this.currentPage = snap;
			time = this.options.snapSpeed || Math.max(
					Math.max(
						Math.min(Math.abs(newX - snap.x), 1000),
						Math.min(Math.abs(newY - snap.y), 1000)
					), 300);
			newX = snap.x;
			newY = snap.y;

			this.directionX = 0;
			this.directionY = 0;
			easing = this.options.bounceEasing;
		}
		if( newX != this.x || newY != this.y ){
			// change easing function when scroller goes out of the boundaries
			if( newX > 0 || newX < this.maxScrollX || newY > 0 || newY < this.maxScrollY ){
				easing = utils.ease.quadratic;
			}
			this.scrollTo(newX, newY, time, easing);
			return;
		}
		this._execEvent('scrollEnd');
	},
	$fn.resize = function(e){
		var that = this;
		clearTimeout(this.resizeTimeout);
		this.resizeTimeout = setTimeout(function(){
			that.refresh();
		}, this.options.resizePolling);
	},
	$fn.resetPosition = function(time){
		var x = this.x,
			y = this.y;

		time = time || 0;

		if( !this.hasHorizontalScroll || this.x > 0 ) x = 0;
		else if( this.x < this.maxScrollX ) x = this.maxScrollX;

		if( !this.hasVerticalScroll || this.y > 0 ) y = 0;
		else if( this.y < this.maxScrollY ) y = this.maxScrollY;

		if( x == this.x && y == this.y ) return false;
		this.scrollTo(x, y, time, this.options.bounceEasing);
		return true;
	},
	$fn.disable = function(){
		this.enabled = false;
	},
	$fn.enable = function(){
		this.enabled = true;
	},
	$fn.refresh = function(){
		var rf = this.wrapper.offsetHeight;		// Force reflow
		this.wrapperWidth	= this.wrapper.clientWidth;
		this.wrapperHeight	= this.wrapper.clientHeight;
		this.scrollerWidth	= this.scroller.offsetWidth;
		this.scrollerHeight	= this.scroller.offsetHeight;
		this.maxScrollX		= this.wrapperWidth - this.scrollerWidth;
		this.maxScrollY		= this.wrapperHeight - this.scrollerHeight;
		this.hasHorizontalScroll	= this.options.scrollX && this.maxScrollX < 0;
		this.hasVerticalScroll		= this.options.scrollY && this.maxScrollY < 0;

		if( !this.hasHorizontalScroll ){
			this.maxScrollX = 0;
			this.scrollerWidth = this.wrapperWidth;
		}
		if( !this.hasVerticalScroll ){
			this.maxScrollY = 0;
			this.scrollerHeight = this.wrapperHeight;
		}

		this.endTime = 0;
		this.directionX = 0;
		this.directionY = 0;
		this.wrapperOffset = utils.offset(this.wrapper);
		this._execEvent('refresh');
		this.resetPosition();
	},	
	$fn.on = function(type, fn){
		if( !this._events[type] ){
			this._events[type] = [];
		}
		this._events[type].push(fn);
	},	
	$fn._execEvent = function(type){
		if( !this._events[type] ) return;				
		var i = 0,
			l = this._events[type].length;
		if( !l ) return;
		for ( ; i < l; i++ ){
			this._events[type][i].call(this);
		}
	},
	$fn.scrollBy = function(x, y, time, easing){
		x = this.x + x;
		y = this.y + y;
		time = time || 0;

		this.scrollTo(x, y, time, easing);
	},
	$fn.scrollTo = function(x, y, time, easing){
		easing = easing || utils.ease.circular;
		this.isInTransition = this.options.useTransition && time > 0;
		if( !time || (this.options.useTransition && easing.style) ){
			this._transitionTimingFunction(easing.style);
			this._transitionTime(time);
			this._translate(x, y);
		} else {
			this._animate(x, y, time, easing.fn);
		}
	},
	$fn.scrollToElement = function(el, time, offsetX, offsetY, easing){
		el = el.nodeType ? el : this.scroller.querySelector(el);
		if( !el )return;
		var pos = utils.offset(el);
		pos.left -= this.wrapperOffset.left;
		pos.top  -= this.wrapperOffset.top;

		// if offsetX/Y are true we center the element to the screen
		if( offsetX === true ) offsetX = Math.round(el.offsetWidth / 2 - this.wrapper.offsetWidth / 2);
		if( offsetY === true ) offsetY = Math.round(el.offsetHeight / 2 - this.wrapper.offsetHeight / 2);
		pos.left -= offsetX || 0;
		pos.top  -= offsetY || 0;
		pos.left = pos.left > 0 ? 0 : pos.left < this.maxScrollX ? this.maxScrollX : pos.left;
		pos.top  = pos.top  > 0 ? 0 : pos.top  < this.maxScrollY ? this.maxScrollY : pos.top;
		time = time === undefined || time === null || time === 'auto' ? Math.max(Math.abs(this.x-pos.left), Math.abs(this.y-pos.top)) : time;
		this.scrollTo(pos.left, pos.top, time, easing);
	},
	$fn._transitionTime = function(time){
		time = time || 0;
		this.__scroller.S( 'transitionDuration', time + 'ms' );	
		if( !time && utils.isBadAndroid ) this.__scroller.S( 'transitionDuration', '0.001s' );
		if( this.indicators ){
			for ( var i = this.indicators.length; i--; ){
				this.indicators[i].transitionTime(time);
			}
		}
	},
	$fn._transitionTimingFunction = function(easing){
		this.__scroller.S( 'transitionTimingFunction', easing );
		if( this.indicators ){
			for ( var i = this.indicators.length; i--; ){
				this.indicators[i].transitionTimingFunction(easing);
			}
		}
	},
	$fn._translate = function(x, y){
		if( this.options.useTransform ){
			this.__scroller.S( 'transform', 'translate(' + x + 'px,' + y + 'px)' + this.translateZ );
		} else {
			x = Math.round(x);
			y = Math.round(y);
			this.__scroller.S( 'left', x, 'top', y );
		}
		this.x = x;
		this.y = y;
		if( this.indicators ){
			for ( var i = this.indicators.length; i--; ){
				this.indicators[i].updatePosition();
			}
		}
	},
	$fn.getComputedPosition = function(){
		var matrix = window.getComputedStyle(this.scroller, null),
			x, y;

		if( this.options.useTransform ){
			matrix = matrix[bs.DETECT.stylePrefix+'Transform'||bs.DETECT.stylePrefix+'transform'].split(')')[0].split(', ');
			x = +(matrix[12] || matrix[4]);
			y = +(matrix[13] || matrix[5]);
		} else {
			x = +matrix.left.replace(/[^-\d.]/g, '');
			y = +matrix.top.replace(/[^-\d.]/g, '');
		}
		return { x: x, y: y };
	},
	$fn._initIndicators = function(){
		var interactive = this.options.interactiveScrollbars,
			defaultScrollbars = typeof this.options.scrollbars != 'object',
			customStyle = typeof this.options.scrollbars != 'string',
			indicators = [],
			indicator;

		var that = this;
		this.indicators = [];
		if( this.options.scrollbars ){ 
			if( this.options.scrollY ){ // Vertical scrollbar
				indicator = {
					el: createDefaultScrollbar('v', interactive, this.options.scrollbars),
					interactive: interactive,
					defaultScrollbars: true,
					customStyle: customStyle,
					resize: this.options.resizeIndicator,
					shrink: this.options.shrinkScrollbars,
					fade: this.options.fadeScrollbars,
					listenX: false
				};
				this.wrapper.appendChild(indicator.el);
				indicators.push(indicator);
			}
			if( this.options.scrollX ){ // Horizontal scrollbar
				indicator = {
					el: createDefaultScrollbar('h', interactive, this.options.scrollbars),
					interactive: interactive,
					defaultScrollbars: true,
					customStyle: customStyle,
					resize: this.options.resizeIndicator,
					shrink: this.options.shrinkScrollbars,
					fade: this.options.fadeScrollbars,
					listenY: false
				};
				this.wrapper.appendChild(indicator.el);
				indicators.push(indicator);
			}
		}

		if( this.options.indicators ){ // TODO: check concat compatibility
			indicators = indicators.concat(this.options.indicators);
		}
		for ( var i = indicators.length; i--; ){
			this.indicators.push( new Indicator(this, indicators[i]) );
		}			
		function _indicatorsMap (fn){ // TODO: check if we can use array.map (wide compatibility and performance issues)
			for ( var i = that.indicators.length; i--; ){
				fn.call(that.indicators[i]);
			}
		}
		if( this.options.fadeScrollbars ){
			this.on('scrollEnd', function(){
				_indicatorsMap(function(){
					this.fade();
				});
			});
			this.on('scrollCancel', function(){
				_indicatorsMap(function(){
					this.fade();
				});
			});
			this.on('scrollStart', function(){
				_indicatorsMap(function(){
					this.fade(1);
				});
			});
			this.on('beforeScrollStart', function(){
				_indicatorsMap(function(){
					this.fade(1, true);
				});
			});
		}
		this.on('refresh', function(){
			_indicatorsMap(function(){
				this.refresh();
			});
		});
		this.on('destroy', function(){
			_indicatorsMap(function(){
				this.destroy();
			});
			delete this.indicators;
		});
	},
	$fn._initWheel = function(){
		this.__wrapper.S( 'wheel', [this, this._wheel], 'mousewheel', [this, this._wheel], 'DOMMouseScroll', [this, this._wheel] );
		this.on('destroy', function(){
			this.__wrapper.S( 'wheel', null, 'mousewheel', null, 'DOMMouseScroll', null );
		});
	},
	$fn._wheel = function(e){
		if( !this.enabled ) return;

		e.preventDefault();
		e.stopPropagation();

		var wheelDeltaX, wheelDeltaY, newX, newY,
			that = this;

		if( this.wheelTimeout === undefined ) that._execEvent('scrollStart');

		// Execute the scrollEnd event after 400ms the wheel stopped scrolling
		clearTimeout(this.wheelTimeout);
		this.wheelTimeout = setTimeout(function(){
			that._execEvent('scrollEnd');
			that.wheelTimeout = undefined;
		}, 400);

		if( 'deltaX' in e ){
			wheelDeltaX = -e.deltaX;
			wheelDeltaY = -e.deltaY;
		} else if( 'wheelDeltaX' in e ){
			wheelDeltaX = e.wheelDeltaX / 120 * this.options.mouseWheelSpeed;
			wheelDeltaY = e.wheelDeltaY / 120 * this.options.mouseWheelSpeed;
		} else if( 'wheelDelta' in e ){
			wheelDeltaX = wheelDeltaY = e.wheelDelta / 120 * this.options.mouseWheelSpeed;
		} else if( 'detail' in e ){
			wheelDeltaX = wheelDeltaY = -e.detail / 3 * this.options.mouseWheelSpeed;
		} else {
			return;
		}

		wheelDeltaX *= this.options.invertWheelDirection;
		wheelDeltaY *= this.options.invertWheelDirection;
		if( !this.hasVerticalScroll ){
			wheelDeltaX = wheelDeltaY;
			wheelDeltaY = 0;
		}
		if( this.options.snap ){
			newX = this.currentPage.pageX;
			newY = this.currentPage.pageY;
			if( wheelDeltaX > 0 ) newX--;
			else if( wheelDeltaX < 0 ) newX++;

			if( wheelDeltaY > 0 ) newY--;
			else if( wheelDeltaY < 0 ) newY++;
			this.goToPage(newX, newY);
			return;
		}

		newX = this.x + Math.round(this.hasHorizontalScroll ? wheelDeltaX : 0);
		newY = this.y + Math.round(this.hasVerticalScroll ? wheelDeltaY : 0);

		if( newX > 0 ) newX = 0;
		else if( newX < this.maxScrollX ) newX = this.maxScrollX;
		
		if( newY > 0 ) newY = 0;
		else if( newY < this.maxScrollY ) newY = this.maxScrollY;
		this.scrollTo(newX, newY, 0);
	},
	$fn._initSnap = function(){
		this.currentPage = {};
		if( typeof this.options.snap == 'string' ){
			this.options.snap = this.scroller.querySelectorAll(this.options.snap);
		}
		
		this.on('refresh', function(){
			var i = 0, l, m = 0, n,
				cx, cy, x = 0, y,
				stepX = this.options.snapStepX || this.wrapperWidth,
				stepY = this.options.snapStepY || this.wrapperHeight,
				el;
			this.pages = [];

			if( !this.wrapperWidth || !this.wrapperHeight || !this.scrollerWidth || !this.scrollerHeight ) return;

			if( this.options.snap === true ){
				cx = Math.round( stepX / 2 );
				cy = Math.round( stepY / 2 );

				while ( x > -this.scrollerWidth ){
					
					this.pages[i] = [];
					l = 0;
					y = 0;

					while ( y > -this.scrollerHeight ){

						this.pages[i][l] = {
							x: Math.max(x, this.maxScrollX),
							y: Math.max(y, this.maxScrollY),
							width: stepX,
							height: stepY,
							cx: x - cx,
							cy: y - cy
						};
						y -= stepY;
						l++;
					}
					x -= stepX;
					i++;
				}
			} else {
											
				el = this.options.snap;
				l = el.length;
				n = -1;

				for ( ; i < l; i++ ){
					if( i === 0 || el[i].offsetLeft <= el[i-1].offsetLeft ){
						m = 0;
						n++;
					}

					if( !this.pages[m] ) this.pages[m] = [];

					x = Math.max(-el[i].offsetLeft, this.maxScrollX);
					y = Math.max(-el[i].offsetTop, this.maxScrollY);
					cx = x - Math.round(el[i].offsetWidth / 2);
					cy = y - Math.round(el[i].offsetHeight / 2);

					this.pages[m][n] = {
						x: x,
						y: y,
						width: el[i].offsetWidth,
						height: el[i].offsetHeight,
						cx: cx,
						cy: cy
					};

					if( x > this.maxScrollX ) m++;
				}
			}

			this.goToPage(this.currentPage.pageX || 0, this.currentPage.pageY || 0, 0);

			// Update snap threshold if needed
			if( this.options.snapThreshold % 1 === 0 ){
				this.snapThresholdX = this.options.snapThreshold;
				this.snapThresholdY = this.options.snapThreshold;
			} else {
				this.snapThresholdX = Math.round(this.pages[this.currentPage.pageX][this.currentPage.pageY].width * this.options.snapThreshold);
				this.snapThresholdY = Math.round(this.pages[this.currentPage.pageX][this.currentPage.pageY].height * this.options.snapThreshold);
			}
		});

		this.on('flick', function(){
			var time = this.options.snapSpeed || Math.max(
					Math.max(
						Math.min(Math.abs(this.x - this.startX), 1000),
						Math.min(Math.abs(this.y - this.startY), 1000)
					), 300);

			this.goToPage(
				this.currentPage.pageX + this.directionX,
				this.currentPage.pageY + this.directionY,
				time
			);
		});
	},
	$fn._nearestSnap = function(x, y){
		if( !this.pages.length ) return { x: 0, y: 0, pageX: 0, pageY: 0 };

		var i = 0,
			l = this.pages.length,
			m = 0;

		// Check if we exceeded the snap threshold
		if( Math.abs(x - this.absStartX) < this.snapThresholdX &&
			Math.abs(y - this.absStartY) < this.snapThresholdY ){
			return this.currentPage;
		}

		if( x > 0 ) x = 0;
		else if( x < this.maxScrollX ) x = this.maxScrollX;

		if( y > 0 ) y = 0;
		else if( y < this.maxScrollY ) y = this.maxScrollY;

		for ( ; i < l; i++ ){
			if( x >= this.pages[i][0].cx ){
				x = this.pages[i][0].x;
				break;
			}
		}	
		l = this.pages[i].length;
		for ( ; m < l; m++ ){
			if( y >= this.pages[0][m].cy ){
				y = this.pages[0][m].y;
				break;
			}
		}
		if( i == this.currentPage.pageX ){
			i += this.directionX;
			if( i < 0 ) i = 0;
			else if( i >= this.pages.length ) i = this.pages.length - 1;
			x = this.pages[i][0].x;
		}
		if( m == this.currentPage.pageY ){
			m += this.directionY;
			if( m < 0 ) m = 0;
			else if( m >= this.pages[0].length ) m = this.pages[0].length - 1;
			y = this.pages[0][m].y;
		}
		return {x: x, y: y, pageX: i, pageY: m};
	},
	$fn.goToPage = function(x, y, time, easing){
		easing = easing || this.options.bounceEasing;
		if( x >= this.pages.length ) x = this.pages.length - 1;
		else if( x < 0 ) x = 0;

		if( y >= this.pages[x].length ) y = this.pages[x].length - 1;
		else if( y < 0 ) y = 0;

		var posX = this.pages[x][y].x,
			posY = this.pages[x][y].y;

		time = time === undefined ? this.options.snapSpeed || Math.max(
			Math.max(
				Math.min(Math.abs(posX - this.x), 1000),
				Math.min(Math.abs(posY - this.y), 1000)
			), 300) : time;

		this.currentPage = {x: posX, y: posY, pageX: x, pageY: y};
		this.scrollTo(posX, posY, time, easing);
	},
	$fn.next = function(time, easing){
		var x = this.currentPage.pageX,
			y = this.currentPage.pageY;

		x++;
		if( x >= this.pages.length && this.hasVerticalScroll ){
			x = 0;
			y++;
		}
		this.goToPage(x, y, time, easing);
	},
	$fn.prev = function(time, easing){
		var x = this.currentPage.pageX,
			y = this.currentPage.pageY;
		x--;

		if( x < 0 && this.hasVerticalScroll ){
			x = 0;
			y--;
		}
		this.goToPage(x, y, time, easing);
	},
	$fn._initKeys = function(){
		// default key bindings
		var keys = {
			pageUp: 33,
			pageDown: 34,
			end: 35,
			home: 36,
			left: 37,
			up: 38,
			right: 39,
			down: 40
		};
		var i;

		// if you give me characters I give you keycode
		if( typeof this.options.keyBindings == 'object' ){
			for ( i in this.options.keyBindings ){
				if( typeof this.options.keyBindings[i] == 'string' ){
					this.options.keyBindings[i] = this.options.keyBindings[i].toUpperCase().charCodeAt(0);
				}
			}
		} else {
			this.options.keyBindings = {};
		}

		for ( i in keys ){
			this.options.keyBindings[i] = this.options.keyBindings[i] || keys[i];
		}

		bs.WIN.on( 'keydown', '@bsscrollkeydown', this );
		this.on('destroy', function(){
			bs.WIN.on( 'keydown', '@bsscrollkeydown', null );
		});
	},
	$fn.keydown = function(e){
		if( !this.enabled ) return;
		var snap = this.options.snap,	// we are using this alot, better to cache it
			newX = snap ? this.currentPage.pageX : this.x,
			newY = snap ? this.currentPage.pageY : this.y,
			now = Date.now(),
			prevTime = this.keyTime || 0,
			acceleration = 0.250,
			pos;

		if( this.options.useTransition && this.isInTransition ){
			pos = this.getComputedPosition();
			this._translate(Math.round(pos.x), Math.round(pos.y));
			this.isInTransition = false;
		}

		this.keyAcceleration = now - prevTime < 200 ? Math.min(this.keyAcceleration + acceleration, 50) : 0;
		switch ( e.keyCode ){
			case this.options.keyBindings.pageUp:
				if( this.hasHorizontalScroll && !this.hasVerticalScroll ){
					newX += snap ? 1 : this.wrapperWidth;
				} else {
					newY += snap ? 1 : this.wrapperHeight;
				}
				break;
			case this.options.keyBindings.pageDown:
				if( this.hasHorizontalScroll && !this.hasVerticalScroll ){
					newX -= snap ? 1 : this.wrapperWidth;
				} else {
					newY -= snap ? 1 : this.wrapperHeight;
				}
				break;
			case this.options.keyBindings.end:
				newX = snap ? this.pages.length-1 : this.maxScrollX;
				newY = snap ? this.pages[0].length-1 : this.maxScrollY;
				break;
			case this.options.keyBindings.home:
				newX = 0;
				newY = 0;
				break;
			case this.options.keyBindings.left:
				newX += snap ? -1 : 5 + this.keyAcceleration>>0;
				break;
			case this.options.keyBindings.up:
				newY += snap ? 1 : 5 + this.keyAcceleration>>0;
				break;
			case this.options.keyBindings.right:
				newX -= snap ? -1 : 5 + this.keyAcceleration>>0;
				break;
			case this.options.keyBindings.down:
				newY -= snap ? 1 : 5 + this.keyAcceleration>>0;
				break;
			default:
				return;
		}

		if( snap ){
			this.goToPage(newX, newY);
			return;
		}
		if( newX > 0 ){
			newX = 0;
			this.keyAcceleration = 0;
		} else if( newX < this.maxScrollX ){
			newX = this.maxScrollX;
			this.keyAcceleration = 0;
		}
		if( newY > 0 ){
			newY = 0;
			this.keyAcceleration = 0;
		} else if( newY < this.maxScrollY ){
			newY = this.maxScrollY;
			this.keyAcceleration = 0;
		}

		this.scrollTo(newX, newY, 0);
		this.keyTime = now;
	},
	$fn._animate = function(destX, destY, duration, easingFn){
		var that = this,
			startX = this.x,
			startY = this.y,
			startTime = Date.now(),
			destTime = startTime + duration;

		function step (){
			var now = Date.now(),
				newX, newY,
				easing;

			if( now >= destTime ){
				that.isAnimating = false;
				that._translate(destX, destY);

				if( !that.resetPosition(that.options.bounceTime) ) that._execEvent('scrollEnd');
				return;
			}

			now = ( now - startTime ) / duration;
			easing = easingFn(now);
			newX = ( destX - startX ) * easing + startX;
			newY = ( destY - startY ) * easing + startY;
			that._translate(newX, newY);

			if( that.isAnimating ) rAF(step);
		}
		this.isAnimating = true;
		step();
	}
	
	function createDefaultScrollbar (direction, interactive, type){
		if( type !== true ) return;
		
		var __scrollbar = bs.Dom( '<div></div>' ),
			__indicator = bs.Dom( '<div></div>' ),
			scrollbar = __scrollbar[0],
			indicator = __indicator[0];

		bs.Css( '.BSSCRBar' ).S( 'position', 'absolute', 'z-index', 9999, 'overflow', 'hidden' );
		bs.Css( '.BSSCRIn' ).S( 'box-sizing', 'border-box', 'position', 'absolute', 'background', 'rgba(0,0,0,0.5)', 'border', '1px solid rgba(255,255,255,0.9)', 'border-radius', 3 );	

		if( direction == 'h' ){
			__scrollbar.S( 'class', 'iScrollHorizontalScrollbar BSSCRBar' );
			__scrollbar.S( 'height', 7, 'left', 2, 'right', 2, 'bottom', 0 );
			__indicator.S( 'height', '100%' );
		} else {
			__scrollbar.S( 'class', 'iScrollVerticalScrollbar BSSCRBar' );
			__scrollbar.S( 'width', 7, 'bottom', 2, 'top', 2, 'right', 1 );
			__indicator.S( 'width', '100%' );
		}

		if( !interactive ) __scrollbar.S( 'pointerEvents', 'none' );	
		__indicator.S( 'class', 'iScrollIndicator BSSCRIn' );
		__scrollbar.S( '>', indicator );

		return scrollbar;
	}
	
	function Indicator (scroller, options){
		this.wrapper = typeof options.el == 'string' ? document.querySelector(options.el) : options.el;
		this.__wrapper = bs.Dom( this.wrapper );
		this.indicator = this.wrapper.children[0];
		this.__indicator = bs.Dom( this.indicator );
		this.scroller = scroller;
		this.options = {
			listenX: true,
			listenY: true,
			interactive: false,
			resize: true,
			defaultScrollbars: false,
			shrink: false,
			fade: false,
			speedRatioX: 0,
			speedRatioY: 0
		};
		for ( var i in options ){
			this.options[i] = options[i];
		}
		this.sizeRatioX = 1;
		this.sizeRatioY = 1;
		this.maxPosX = 0;
		this.maxPosY = 0;
		if( this.options.interactive ){
			this.__indicator.S( 'down', this );
			bs.WIN.on( 'up', '@Indicatorup', this );
		}
		if( this.options.fade ){
			this.__scroller.S( 'transform', this.scroller.translateZ, 'transitionDuration', (utils.isBadAndroid ? '0.001s' : '0ms'), 'opacity', 0 );
		}
	}
	
	Indicator.prototype = {
		destroy: function(){
			if( this.options.interactive ){
				this.__indicator.S( 'down', null );
				bs.WIN.on( 'up', '@Indicatorup', null );
			}
			if( this.options.defaultScrollbars ){
				this.wrapper.parentNode.removeChild(this.wrapper);
			}
		},
		down: function(e){
			e.prevent();
			this.transitionTime();
			this.initiated = true;
			this.moved = false;
			this.lastPointX	= e.x;
			this.lastPointY	= e.y;
			this.startTime	= Date.now();
			bs.WIN.on( 'move', '@Indicatormove', this );
			this.scroller._execEvent('beforeScrollStart');
		},
		move: function(e){
			var deltaX, deltaY, newX, newY,
				timestamp = Date.now();
	
			if( !this.moved ) this.scroller._execEvent('scrollStart');
			this.moved = true;
	
			deltaX = e.x - this.lastPointX;
			this.lastPointX = point.pageX;	
			deltaY = e.y - this.lastPointY;
			this.lastPointY = point.pageY;	
			newX = this.x + deltaX;
			newY = this.y + deltaY;
			this._pos(newX, newY);
			e.prevent();
		},
		up: function(e){
			if( !this.initiated ) return;
			this.initiated = false;
			e.prevent();
			bs.WIN.on( 'move', '@Indicatormove', null );
	
			if( this.scroller.options.snap ){
				var snap = this.scroller._nearestSnap(this.scroller.x, this.scroller.y);
				var time = this.options.snapSpeed || Math.max(
						Math.max(
							Math.min(Math.abs(this.scroller.x - snap.x), 1000),
							Math.min(Math.abs(this.scroller.y - snap.y), 1000)
						), 300);
	
				if( this.scroller.x != snap.x || this.scroller.y != snap.y ){
					this.scroller.directionX = 0;
					this.scroller.directionY = 0;
					this.scroller.currentPage = snap;
					this.scroller.scrollTo(snap.x, snap.y, time, this.scroller.options.bounceEasing);
				}
			}
	
			if( this.moved ) this.scroller._execEvent('scrollEnd');
		},
	
		transitionTime: function(time){
			time = time || 0;
			this.__indicator.S( 'transitionDuration', time + 'ms' );

			if( !time && utils.isBadAndroid ) this.__indicator.S( 'transitionDuration', '0.001s' );	
		},
		transitionTimingFunction: function(easing){
			this.__indicator.S( 'transitionTimingFunction', easing );
		},
		refresh: function(){
			this.transitionTime();
	
			if( this.options.listenX && !this.options.listenY ){
				this.__indicator.S( 'display', this.scroller.hasHorizontalScroll ? 'block' : 'none' );
			} else if( this.options.listenY && !this.options.listenX ){
				this.__indicator.S( 'display', this.scroller.hasVerticalScroll ? 'block' : 'none' );
			} else {
				this.__indicator.S( 'display', this.scroller.hasHorizontalScroll || this.scroller.hasVerticalScroll ? 'block' : 'none' );
			}
	
			if( this.scroller.hasHorizontalScroll && this.scroller.hasVerticalScroll ){
				
				this.__wrapper.S( 'class+', 'iScrollBothScrollbars');
				this.__wrapper.S( 'class-', 'iScrollLoneScrollbar');

				if( this.options.defaultScrollbars && this.options.customStyle ){
					if( this.options.listenX ) this.__wrapper.S( 'right', 8 );
					else this.__wrapper.S( 'bottom', 8 );
				}
			} else {
				this.__wrapper.S( 'class-', 'iScrollBothScrollbars');
				this.__wrapper.S( 'class+', 'iScrollLoneScrollbar');	
	
				if( this.options.defaultScrollbars && this.options.customStyle ){
					if( this.options.listenX ) this.__wrapper.S( 'right', 2 );
					else this.__wrapper.S( 'bottom', 2 );
				}
			}
	
			var r = this.wrapper.offsetHeight;	// force refresh
	
			if( this.options.listenX ){
				this.wrapperWidth = this.wrapper.clientWidth;
				if( this.options.resize ){
					this.indicatorWidth = Math.max(Math.round(this.wrapperWidth * this.wrapperWidth / (this.scroller.scrollerWidth || this.wrapperWidth || 1)), 8);
					this.__indicator.S( 'width', this.indicatorWidth );
				} else {
					this.indicatorWidth = this.indicator.clientWidth;
				}
	
				this.maxPosX = this.wrapperWidth - this.indicatorWidth;
	
				if( this.options.shrink == 'clip' ){
					this.minBoundaryX = -this.indicatorWidth + 8;
					this.maxBoundaryX = this.wrapperWidth - 8;
				} else {
					this.minBoundaryX = 0;
					this.maxBoundaryX = this.maxPosX;
				}
	
				this.sizeRatioX = this.options.speedRatioX || (this.scroller.maxScrollX && (this.maxPosX / this.scroller.maxScrollX));	
			}
	
			if( this.options.listenY ){
				this.wrapperHeight = this.wrapper.clientHeight;
				if( this.options.resize ){
					this.indicatorHeight = Math.max(Math.round(this.wrapperHeight * this.wrapperHeight / (this.scroller.scrollerHeight || this.wrapperHeight || 1)), 8);
					this.__indicator.S( 'height', this.indicatorHeight );
				} else {
					this.indicatorHeight = this.indicator.clientHeight;
				}
				this.maxPosY = this.wrapperHeight - this.indicatorHeight;
	
				if( this.options.shrink == 'clip' ){
					this.minBoundaryY = -this.indicatorHeight + 8;
					this.maxBoundaryY = this.wrapperHeight - 8;
				} else {
					this.minBoundaryY = 0;
					this.maxBoundaryY = this.maxPosY;
				}
	
				this.maxPosY = this.wrapperHeight - this.indicatorHeight;
				this.sizeRatioY = this.options.speedRatioY || (this.scroller.maxScrollY && (this.maxPosY / this.scroller.maxScrollY));
			}
	
			this.updatePosition();
		},
		updatePosition: function(){
			var x = this.options.listenX && Math.round(this.sizeRatioX * this.scroller.x) || 0,
				y = this.options.listenY && Math.round(this.sizeRatioY * this.scroller.y) || 0;
	
			if( !this.options.ignoreBoundaries ){
				if( x < this.minBoundaryX ){
					if( this.options.shrink == 'scale' ){
						this.width = Math.max(this.indicatorWidth + x, 8);
						this.__indicator.S( 'width', this.width );
					}
					x = this.minBoundaryX;
				} else if( x > this.maxBoundaryX ){
					if( this.options.shrink == 'scale' ){
						this.width = Math.max(this.indicatorWidth - (x - this.maxPosX), 8);
						this.__indicator.S( 'width', this.width );
						x = this.maxPosX + this.indicatorWidth - this.width;
					} else {
						x = this.maxBoundaryX;
					}
				} else if( this.options.shrink == 'scale' && this.width != this.indicatorWidth ){
					this.width = this.indicatorWidth;
					this.__indicator.S( 'width', this.width );
				}
	
				if( y < this.minBoundaryY ){
					if( this.options.shrink == 'scale' ){
						this.height = Math.max(this.indicatorHeight + y * 3, 8);
						this.__indicator.S( 'height', this.height );
					}
					y = this.minBoundaryY;
				} else if( y > this.maxBoundaryY ){
					if( this.options.shrink == 'scale' ){
						this.height = Math.max(this.indicatorHeight - (y - this.maxPosY) * 3, 8);
						this.__indicator.S( 'height', this.height );
						y = this.maxPosY + this.indicatorHeight - this.height;
					} else {
						y = this.maxBoundaryY;
					}
				} else if( this.options.shrink == 'scale' && this.height != this.indicatorHeight ){
					this.height = this.indicatorHeight;
					this.__indicator.S( 'height', this.height );
				}
			}
	
			this.x = x;
			this.y = y;
	
			if( this.scroller.options.useTransform ){
				this.__indicator.S( 'transform', 'translate(' + x + 'px,' + y + 'px)' + this.scroller.translateZ );
			} else {
				this.__indicator.S( 'left', x, 'top', y );
			}
		},
	
		_pos: function(x, y){
			if( x < 0 ) x = 0;
			else if( x > this.maxPosX ) x = this.maxPosX;
	
			if( y < 0 ) y = 0;
			else if( y > this.maxPosY ){
				y = this.maxPosY;
			}
	
			x = this.options.listenX ? Math.round(x / this.sizeRatioX) : this.scroller.x;
			y = this.options.listenY ? Math.round(y / this.sizeRatioY) : this.scroller.y;
	
			this.scroller.scrollTo(x, y);
		},
	
		fade: function(val, hold){
			if( hold && !this.visible ) return;
			clearTimeout(this.fadeTimeout);
			this.fadeTimeout = null;
	
			var time = val ? 250 : 500,
				delay = val ? 0 : 300;
	
			val = val ? '1' : '0';
			this.__scroller.S( 'transitionDuration', time + 'ms' );
			this.fadeTimeout = setTimeout((function(val){
				this.__scroller.S( 'opacity', val );
				this.visible = +val;
			}).bind(this, val), delay);
		}
	}
	
	
}, 1 );
	
	
	
