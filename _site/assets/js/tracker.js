(function () {
	(function (root, factory) {
		if (typeof module !== 'undefined' && module.exports) {
			// CommonJS
			return module.exports = factory();
		} else if (typeof define === 'function' && define.amd) {
			// AMD
			define([], function () {
				return (root.TimeMe = factory());
			});
		} else {
			// Global Variables
			return root.TimeMe = factory();
		}
	})(this, function () {

		var TimeMe = {

			startStopTimes: {},
			idleTimeoutMs: 30 * 1000,
			currentIdleTimeMs: 0,
			checkStateRateMs: 250,
			active: false,
			idle: false,
			currentPageName: "default-page-name",
			timeElapsedCallbacks: [],
			userLeftCallbacks: [],
			userReturnCallbacks: [],

			trackTimeOnElement: function (elementId) {
				var element = document.getElementById(elementId);
				if (element) {
					element.addEventListener("mouseover", function () {
						TimeMe.startTimer(elementId);
					});
					element.addEventListener("mousemove", function () {
						TimeMe.startTimer(elementId);
					});					
					element.addEventListener("mouseleave", function () {
						TimeMe.stopTimer(elementId);
					});
					element.addEventListener("keypress", function () {
						TimeMe.startTimer(elementId);
					});
					element.addEventListener("focus", function () {
						TimeMe.startTimer(elementId);
					});
				}
			},

			getTimeOnElementInSeconds: function (elementId) {
				var time = TimeMe.getTimeOnPageInSeconds(elementId);
				if (time) {
					return time;
				} else {
					return 0;
				}
			},

			startTimer: function (pageName) {
				if (!pageName) {
					pageName = TimeMe.currentPageName;
				}

				if (TimeMe.startStopTimes[pageName] === undefined) {
					TimeMe.startStopTimes[pageName] = [];
				} else {
					var arrayOfTimes = TimeMe.startStopTimes[pageName];
					var latestStartStopEntry = arrayOfTimes[arrayOfTimes.length - 1];
					if (latestStartStopEntry !== undefined && latestStartStopEntry.stopTime === undefined) {
						// Can't start new timer until previous finishes.
						return;
					}
				}
				TimeMe.startStopTimes[pageName].push({
					"startTime": new Date(),
					"stopTime": undefined
				});
				TimeMe.active = true;
			},

			stopAllTimers: function () {
				var pageNames = Object.keys(TimeMe.startStopTimes);
				for (var i = 0; i < pageNames.length; i++) {
					TimeMe.stopTimer(pageNames[i]);
				}
			},

			stopTimer: function (pageName) {
				if (!pageName) {
					pageName = TimeMe.currentPageName;
				}
				var arrayOfTimes = TimeMe.startStopTimes[pageName];
				if (arrayOfTimes === undefined || arrayOfTimes.length === 0) {
					// Can't stop timer before you've started it.
					return;
				}
				if (arrayOfTimes[arrayOfTimes.length - 1].stopTime === undefined) {
					arrayOfTimes[arrayOfTimes.length - 1].stopTime = new Date();
				}
				TimeMe.active = false;
			},

			getTimeOnCurrentPageInSeconds: function () {
				return TimeMe.getTimeOnPageInSeconds(TimeMe.currentPageName);
			},

			getTimeOnPageInSeconds: function (pageName) {
				var timeInMs = TimeMe.getTimeOnPageInMilliseconds(pageName);
				if (timeInMs === undefined) {
					return undefined;
				} else {
					return TimeMe.getTimeOnPageInMilliseconds(pageName) / 1000;
				}
			},

			getTimeOnCurrentPageInMilliseconds: function () {
				return TimeMe.getTimeOnPageInMilliseconds(TimeMe.currentPageName);
			},

			getTimeOnPageInMilliseconds: function (pageName) {

				var totalTimeOnPage = 0;

				var arrayOfTimes = TimeMe.startStopTimes[pageName];
				if (arrayOfTimes === undefined) {
					// Can't get time on page before you've started the timer.
					return;
				}

				var timeSpentOnPageInSeconds = 0;
				for (var i = 0; i < arrayOfTimes.length; i++) {
					var startTime = arrayOfTimes[i].startTime;
					var stopTime = arrayOfTimes[i].stopTime;
					if (stopTime === undefined) {
						stopTime = new Date();
					}
					var difference = stopTime - startTime;
					timeSpentOnPageInSeconds += (difference);
				}

				totalTimeOnPage = Number(timeSpentOnPageInSeconds);
				return totalTimeOnPage;
			},

			getTimeOnAllPagesInSeconds: function () {
				var allTimes = [];
				var pageNames = Object.keys(TimeMe.startStopTimes);
				for (var i = 0; i < pageNames.length; i++) {
					var pageName = pageNames[i];
					var timeOnPage = TimeMe.getTimeOnPageInSeconds(pageName);
					allTimes.push({
						"pageName": pageName,
						"timeOnPage": timeOnPage
					});
				}
				return allTimes;
			},

			setIdleDurationInSeconds: function (duration) {
				var durationFloat = parseFloat(duration);
				if (isNaN(durationFloat) === false) {
					TimeMe.idleTimeoutMs = duration * 1000;
				} else {
					throw {
						name: "InvalidDurationException",
						message: "An invalid duration time (" + duration + ") was provided."
					};
				}
				return this;
			},

			setCurrentPageName: function (pageName) {
				TimeMe.currentPageName = pageName;
				return this;
			},

			resetRecordedPageTime: function (pageName) {
				delete TimeMe.startStopTimes[pageName];
			},

			resetAllRecordedPageTimes: function () {
				var pageNames = Object.keys(TimeMe.startStopTimes);
				for (var i = 0; i < pageNames.length; i++) {
					TimeMe.resetRecordedPageTime(pageNames[i]);
				}
			},

			resetIdleCountdown: function () {
				if (TimeMe.idle) {
					TimeMe.triggerUserHasReturned();
				}
				TimeMe.idle = false;
				TimeMe.currentIdleTimeMs = 0;
			},

			callWhenUserLeaves: function (callback, numberOfTimesToInvoke) {
				this.userLeftCallbacks.push({
					callback: callback,
					numberOfTimesToInvoke: numberOfTimesToInvoke
				})
			},

			callWhenUserReturns: function (callback, numberOfTimesToInvoke) {
				this.userReturnCallbacks.push({
					callback: callback,
					numberOfTimesToInvoke: numberOfTimesToInvoke
				})
			},

			triggerUserHasReturned: function () {
				if (!TimeMe.active) {
					for (var i = 0; i < this.userReturnCallbacks.length; i++) {
						var userReturnedCallback = this.userReturnCallbacks[i];
						var numberTimes = userReturnedCallback.numberOfTimesToInvoke;
						if (isNaN(numberTimes) || (numberTimes === undefined) || numberTimes > 0) {
							userReturnedCallback.numberOfTimesToInvoke -= 1;
							userReturnedCallback.callback();
						}
					}
				}
				TimeMe.startTimer();
			},

			triggerUserHasLeftPage: function () {
				if (TimeMe.active) {
					for (var i = 0; i < this.userLeftCallbacks.length; i++) {
						var userHasLeftCallback = this.userLeftCallbacks[i];
						var numberTimes = userHasLeftCallback.numberOfTimesToInvoke;
						if (isNaN(numberTimes) || (numberTimes === undefined) || numberTimes > 0) {
							userHasLeftCallback.numberOfTimesToInvoke -= 1;
							userHasLeftCallback.callback();
						}
					}
				}
				TimeMe.stopAllTimers();
			},

			callAfterTimeElapsedInSeconds: function (timeInSeconds, callback) {
				TimeMe.timeElapsedCallbacks.push({
					timeInSeconds: timeInSeconds,
					callback: callback,
					pending: true
				});
			},

			checkState: function () {
				for (var i = 0; i < TimeMe.timeElapsedCallbacks.length; i++) {
					if (TimeMe.timeElapsedCallbacks[i].pending && TimeMe.getTimeOnCurrentPageInSeconds() > TimeMe.timeElapsedCallbacks[i].timeInSeconds) {
						TimeMe.timeElapsedCallbacks[i].callback();
						TimeMe.timeElapsedCallbacks[i].pending = false;
					}
				}

				if (TimeMe.idle === false && TimeMe.currentIdleTimeMs > TimeMe.idleTimeoutMs) {
					TimeMe.idle = true;
					TimeMe.triggerUserHasLeftPage();
				} else {
					TimeMe.currentIdleTimeMs += TimeMe.checkStateRateMs;
				}
			},

			visibilityChangeEventName: undefined,
			hiddenPropName: undefined,

			listenForVisibilityEvents: function () {

				if (typeof document.hidden !== "undefined") {
					TimeMe.hiddenPropName = "hidden";
					TimeMe.visibilityChangeEventName = "visibilitychange";
				} else if (typeof document.mozHidden !== "undefined") {
					TimeMe.hiddenPropName = "mozHidden";
					TimeMe.visibilityChangeEventName = "mozvisibilitychange";
				} else if (typeof document.msHidden !== "undefined") {
					TimeMe.hiddenPropName = "msHidden";
					TimeMe.visibilityChangeEventName = "msvisibilitychange";
				} else if (typeof document.webkitHidden !== "undefined") {
					TimeMe.hiddenPropName = "webkitHidden";
					TimeMe.visibilityChangeEventName = "webkitvisibilitychange";
				}

				document.addEventListener(TimeMe.visibilityChangeEventName, function () {
					if (document[TimeMe.hiddenPropName]) {
						TimeMe.triggerUserHasLeftPage();
					} else {
						TimeMe.triggerUserHasReturned();
					}
				}, false);

				window.addEventListener('blur', function () {
					TimeMe.triggerUserHasLeftPage();
				});

				window.addEventListener('focus', function () {
					TimeMe.triggerUserHasReturned();
				});

				document.addEventListener("mousemove", function () { TimeMe.resetIdleCountdown(); });
				document.addEventListener("keyup", function () { TimeMe.resetIdleCountdown(); });
				document.addEventListener("touchstart", function () { TimeMe.resetIdleCountdown(); });
				window.addEventListener("scroll", function () { TimeMe.resetIdleCountdown(); });

				setInterval(function () {
					TimeMe.checkState();
				}, TimeMe.checkStateRateMs);
			},

			websocket: undefined,

			websocketHost: undefined,

			setUpWebsocket: function (websocketOptions) {
				if (window.WebSocket && websocketOptions) {
					var websocketHost = websocketOptions.websocketHost; // "ws://hostname:port"
					try {
						TimeMe.websocket = new WebSocket(websocketHost);
						window.onbeforeunload = function (event) {
							TimeMe.sendCurrentTime(websocketOptions.appId);
						};
						TimeMe.websocket.onopen = function () {
							TimeMe.sendInitWsRequest(websocketOptions.appId);
						}
						TimeMe.websocket.onerror = function (error) {
							if (console) {
								console.log("Error occurred in websocket connection: " + error);
							}
						}
						TimeMe.websocket.onmessage = function (event) {
							if (console) {
								console.log(event.data);
							}
						}
					} catch (error) {
						if (console) {
							console.error("Failed to connect to websocket host.  Error:" + error);
						}
					}
				}
				return this;
			},

			websocketSend: function (data) {
				TimeMe.websocket.send(JSON.stringify(data));
			},

			sendCurrentTime: function (appId) {
				var timeSpentOnPage = TimeMe.getTimeOnCurrentPageInMilliseconds();
				var data = {
					type: "INSERT_TIME",
					appId: appId,
					timeOnPageMs: timeSpentOnPage,
					pageName: TimeMe.currentPageName
				};
				TimeMe.websocketSend(data);
			},
			sendInitWsRequest: function (appId) {
				var data = {
					type: "INIT",
					appId: appId
				};
				TimeMe.websocketSend(data);
			},

			initialize: function (options) {

				var idleTimeoutInSeconds = TimeMe.idleTimeoutMs || 30;
				var currentPageName = TimeMe.currentPageName || "default-page-name";
				var websocketOptions = undefined;

				if (options) {
					idleTimeoutInSeconds = options.idleTimeoutInSeconds || idleTimeoutInSeconds;
					currentPageName = options.currentPageName || currentPageName;
					websocketOptions = options.websocketOptions;
				}

				TimeMe.setIdleDurationInSeconds(idleTimeoutInSeconds)
					.setCurrentPageName(currentPageName)
					.setUpWebsocket(websocketOptions)
					.listenForVisibilityEvents();

				// TODO - only do this if page currently visible.

				TimeMe.startTimer();
			}
		};
		return TimeMe;
	});
}).call(this);
	
	var rs = function( len ){ // random string
		len = len || 15;
		var chars = 'abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ';
		var s = [];
		while( s.length < len ){
			s.push(chars[rg(0,chars.length)])
		}
		return s.join('');
	}
	var rg = function( mn , mx ){ // random range
		return Math.floor(Math.random() * (mx - mn + 1) ) + mn;
	}
	var cck = function(n,v,d) {
		var e = "";
		if (d) {
			var _d = new Date();
			_d.setTime(_d.getTime() + (d*24*60*60*1000));
			e = "; expires=" + _d.toUTCString();
		}
		document.cookie = n + "=" + v + e + "; path=/";
	}
	var ml = function(){
		return new URL(location.href);
	}
	var rck = function( n ){ // read cookie
		var _n = n + "=";
		var ca = document.cookie.split(';');
		for(var i=0;i < ca.length;i++) {
			var c = ca[i];
			while (c.charAt(0)==' ') c = c.substring(1,c.length);
			if (c.indexOf(_n) == 0) return c.substring(_n.length,c.length);
		}
		return null;
	}
	var rq = function( t , p , cb ){ // request ajax
		p = p || "";
		
		var xhttp = new XMLHttpRequest();
		
		if( cb ){
			xhttp.onreadystatechange = cb;
		}else{		
			xhttp.onreadystatechange = function() {
				if (this.readyState == 4 && this.status == 200) {
					// status 
				}
			};
		}
		var rq = "https://marketbold.com/stvid/track.php";
		xhttp.open(t, rq, true);
		if( t == 'POST' ){
			var pr = [];
			for (a in p) {
				pr.push(a + "=" + p[a]);
			}
			xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
			xhttp.send(pr.join("&"));
		}else{
			xhttp.send();
		}
		
	}
	var u = function(l){ // return current page
		l = l || window.location.href;
		var parts = [];
		if( l.indexOf("?") ){
			parts = l.split("?");
		}else if(l.indexOf("#")){
			parts = l.split("#");
		}else{
			parts.push(l);
		}		
		return parts[0];
	}
	var ps = function(){ // page size
		return window.screen.width + "x" + window.screen.height;
	}
	var st = function(){
		return window.scrollY;
	}
	var bh = function(){
		return document.body.scrollHeight;
	}
	var os = function(){
        var os = "";
		var nVer = navigator.appVersion;
		var nAgt = navigator.userAgent;
        var clientStrings = [
            {s:'Windows 10', r:/(Windows 10.0|Windows NT 10.0)/},
            {s:'Windows 8.1', r:/(Windows 8.1|Windows NT 6.3)/},
            {s:'Windows 8', r:/(Windows 8|Windows NT 6.2)/},
            {s:'Windows 7', r:/(Windows 7|Windows NT 6.1)/},
            {s:'Windows Vista', r:/Windows NT 6.0/},
            {s:'Windows Server 2003', r:/Windows NT 5.2/},
            {s:'Windows XP', r:/(Windows NT 5.1|Windows XP)/},
            {s:'Windows 2000', r:/(Windows NT 5.0|Windows 2000)/},
            {s:'Windows ME', r:/(Win 9x 4.90|Windows ME)/},
            {s:'Windows 98', r:/(Windows 98|Win98)/},
            {s:'Windows 95', r:/(Windows 95|Win95|Windows_95)/},
            {s:'Windows NT 4.0', r:/(Windows NT 4.0|WinNT4.0|WinNT|Windows NT)/},
            {s:'Windows CE', r:/Windows CE/},
            {s:'Windows 3.11', r:/Win16/},
            {s:'Android', r:/Android/},
            {s:'Open BSD', r:/OpenBSD/},
            {s:'Sun OS', r:/SunOS/},
            {s:'Linux', r:/(Linux|X11)/},
            {s:'iOS', r:/(iPhone|iPad|iPod)/},
            {s:'Mac OS X', r:/Mac OS X/},
            {s:'Mac OS', r:/(MacPPC|MacIntel|Mac_PowerPC|Macintosh)/},
            {s:'QNX', r:/QNX/},
            {s:'UNIX', r:/UNIX/},
            {s:'BeOS', r:/BeOS/},
            {s:'OS/2', r:/OS\/2/},
            {s:'Search Bot', r:/(nuhk|Googlebot|Yammybot|Openbot|Slurp|MSNBot|Ask Jeeves\/Teoma|ia_archiver)/}
        ];
        for (var id in clientStrings) {
            var cs = clientStrings[id];
            if (cs.r.test(window.navigator.userAgent)) {
                os = cs.s;
                break;
            }
        }

        var osVersion = "";

        if (/Windows/.test(os)) {
            osVersion = /Windows (.*)/.exec(os)[1];
            os = 'Windows';
        }

        switch (os) {
            case 'Mac OS X':
                osVersion = /Mac OS X (10[\.\_\d]+)/.exec(nAgt)[1];
                break;

            case 'Android':
                osVersion = /Android ([\.\_\d]+)/.exec(nAgt)[1];
                break;

            case 'iOS':
                osVersion = /OS (\d+)_(\d+)_?(\d+)?/.exec(nVer);
                osVersion = osVersion[1] + '.' + osVersion[2] + '.' + (osVersion[3] | 0);
                break;
        }
		return {
			p : os,
			v : osVersion
		}
	}
	var scr = function(){
		if( document.body && document.body.scrollHeight ){
			return ( ( window.scrollY / document.body.scrollHeight ) * 100 ).toLocaleString(2,{
			   minimumFractionDigits : 2,
			   maximumFractionDigits : 2
			});
		}else{
			return 0;
		}
	}
	var rf = function(){
		return u(document.referrer);
	}
	var cmpgn = function(){
		var lct = window.location;
		var gp = "";
		if( lct.hash ) gp = lct.hash.replace(/^\#/,'');
		if( lct.search ) gp = lct.search.replace(/^\?/,''); 
		if( !gp ) return 0;
		var o = {},gps=gp.split("&");
		for( var i=0; i<gps.length; i++ ){ 
			var splt = gps[i].split("=");
			o[splt[0]] = splt[1];
		}
		return o;
	}
	var pt = function(){
		var t = document.getElementsByTagName("TITLE");
		return t.length ? t[0].innerText : "";
	}
	// calculate the time from first load..
	// dont loop increment time.. 
	var tp = function(){ // time on page
		return TimeMe.getTimeOnCurrentPageInSeconds();
	}
	var tr = {
		getParameterByName: function( name ){
			var regexS = "[\\?&]"+name+"=([^&#]*)", 
			regex = new RegExp( regexS ),
			results = regex.exec( window.location.href );
			if( results == null ){
				return "";
			} else{
				return decodeURIComponent(results[1].replace(/\+/g, " "));
			}
		},
		init: function(){
			tr.rq_t = 'POST'; // tracker request type
			tr.rq_i = 'CODE'; // from the code version
			tr.tp_st = new Date().getTime(); // time page loaded
			tr.os = os().p + " " + os().v; // time page loaded
			tr.mx_t = 30 * 60; // max time use should be in the page
			tr.pa = new Date().getTime(); // past activity
			if( rck("_st") ){
				tr.rs = rck("_st");
			}
			//tr.ct_r = (60 * 2); // check time every 2 minutes
			tr.ct_r = 5; // check time every 2 minutes
			tr.ct_rm = 1; // check time every n sconds
			
			TimeMe.initialize({
				currentPageName: pt().replace(/\s\s+/g,' ').replace(' ','0'), // current page (page title will be registered)
				idleTimeoutInSeconds: ( 30 * 60 ) * 1000 // 30 minutes will be idle
			});	
		
			TimeMe.callWhenUserReturns(function(){});
			
			ct();
			
		},
		rq: function( succ ){
			succ = succ || function(rt){
				tr.rt = rt;
				console.log(tr.rt);
				tr.chk();				
			};
			// before sending
			// determine also how it would be only 1 visit per user
			
			var c = cmpgn();
			rq(
				tr.rq_t,
				{
					r : tr.rs, // random string
					t : tr.rq_i, // code version
					o : tr.os, // users os
					u : ( tr.lp ? tr.lp : u()), // curretnt url
					s : ps(), // page size WxH,
					scr : scr(), // scrolled page percentage,
					ui : c.utm_id ? c.utm_id : '',
					uca : c.utm_campaign ? c.utm_campaign : '',
					us : c.utm_source ? c.utm_source : '',
					um : c.utm_medium ? c.utm_medium : '',
					ut : c.utm_term ? c.utm_term : '',
					uco : c.utm_content ? c.utm_content : '',
					pt : ( tr.lpt ? tr.lpt : pt()), // page title
					tp : tp(),
					rf : rf(),
					prms : window.location.search.replace("?","").split("&").join("|||")
				},
				function() {
					if (this.readyState == 4 && this.status == 200) {	
						succ(this.responseText);
					}
				}
			);
		},
		chk: function(){
			if(tr.rt){
				var o = JSON.parse(tr.rt);
				console.log(o);
				if( o.c ){
					cck( "_st" , o.c , 360 );
					tr.ri = o.r;
					cck( "_str" , o.r , 360 );
					tr.rs = o.c;
				}
			}
		}
		
	};
	var py = function(){ // return scroll from top
		return window.scrollY;
	}
	var ct = function( ){
		var t = tr.ct_r * tr.ct_rm;
		TimeMe.callAfterTimeElapsedInSeconds(t, function(){
			var c = cmpgn();
			rq(
				tr.rq_t,
				{
					a : 'ut',
					r : tr.rs, // random string
					ri : tr.ri, // code version
					scr : scr(), // scrolled page
					tp : tp() // time on page
				},
				function() {
					tr.ct_rm++;
					ct( );					
				}
			);
			
		});
	}
	
	var _tck = function( p ){
		var nt =  tr.getParameterByName('st');
		if( nt != 'nt' ){
			p = p || {
				lp : '',
				lpt : ''
			};
			window.onload = function(){
				tr.rs = rs(15);
				tr.lp = p.lp;
				tr.lpt = p.lpt;
				tr.init();	
				tr.rq(function(rt){
					
					var hasAff = tr.getParameterByName('a');
					if( hasAff ){
						cck( "_hasAff" , hasAff , 360 );
					}
					
					tr.rt = rt;
					tr.chk();				
				});
			}
		}
	}
	
