//some defaults
var def = {
	notif_inner: "<div style=\"opacity: 1;top:0px;z-index:12;transition:all 0.3s linear;-webkit-transition:all 0.3s linear;-moz-transition:all 0.3s linear;-ms-transition:all 0.3s linear;-o-transition:all 0.3s linear;\"class=\"notification cmt-load\"><div class=\"left\"><i class=\"icon icon-about-white\"></i></div><div class=\"right\"><span style=\"top: 25px;\">__TEXT__</span></div></div>",
	toast_closed: false,
	plugin: {
		load: "Themescript activated!"
	},
	customCSSs: {
		"chilloutmixer": "https://wizzikz.github.io/master/master.css",
		"a-test-room-2": "https://wizzikz.github.io/personal/wizzikz/master.css"
	}
};
//xhr function
function createXHR()
{
	if (typeof XMLHttpRequest!= "undefined") {
		return new XMLHttpRequest();
	} else if (typeof ActiveXObject!="undefined") {
		if (typeof arguments.callee.activeXString!= "string") {
			var versions = ["MSXML2.XMLHttp.6.0", "MSXML2.XMLHttp.3.0",
							"MSXML2.XMLHttp"];
							
			for (var i = 0, len = versions.length; i < len; i++) {
				try {
					var xhr = new ActiveXObject(versions[i]);
					arguments.callee.activeXString = versions[i];
					return xhr;
				} catch (ex){
					//skip
				}
			}
		}
		
		return new ActiveXObject(arguments.callee.activeXString);
	} else {
		throw new Error("No XHR, no theme.");
	}
}

function xhr_get(url, func, bool) {
	var xhr = createXHR();
	xhr.onreadystatechange = function()
	{
		if(xhr.readyState == 4) {
			if((xhr.status >= 200 && xhr.status < 300)
					|| xhr.status == 304) {
				var allText = xhr.responseText;
				func(allText);
			} else {
				throw new Error("The XHR failed :(  [status:"+xhr.status+"]");
			}
		}
	}
	xhr.open("get", url, bool);
	xhr.send(null);
}

//selecting the elements (also, $ works for all elements, but this one just for the first one)
function sel(str) {
	return document.querySelector(str);
}
//creating the elements
function createEl(str) {
	return document.createElement(str);
}

//getting the settings
	sel("#toast-notifications").innerHTML 
		+= def.notif_inner.replace("__TEXT__",def.plugin.load);
	setTimeout(function(){
		if(!def.toast_closed) hideToast();
	},4000);
	$(".notification.cmt-load").click(function(){
		hideToast();
	});

function hideToast()
{
	var el = sel(".notification.cmt-load");
	el.style.opacity = "0";
	setTimeout(function(){
		el.parentElement.removeChild(el);
		def.toast_closed = true;
	},500);
}

(function() {
    var proxied = window.XMLHttpRequest.prototype.send;
    window.XMLHttpRequest.prototype.send = function() {
        var pointer = this;
        var intervalId = window.setInterval(function(){
                if(pointer.readyState != 4){
                        return;
                }
                if( IsJsonString(pointer.responseText) ) {
			var parsed = $.parseJSON( pointer.responseText );
			if(parsed.hasOwnProperty("data")) {
				if(parsed.data.length>0) {
					if(parsed.data[0].hasOwnProperty("meta")) {
						if(parsed.data[0].meta.hasOwnProperty("slug")) {
							if(sel("#cm_css_main")) sel("#cm_css_main").remove();
							if(typeof def.customCSSs[location.href.split("/")[location.href.split("/").length-1]] != "undefined") {
								if(sel("#cm_css_main")) sel("#cm_css_main").remove();
								xhr_get(def.customCSSs[location.href.split("/")[location.href.split("/").length-1]], function(allText){
									sel("head").innerHTML += "<style id='cm_css_main'>"+allText+"</style>";
								}, true);
							}
						}
					}
				}
			}
		}
		clearInterval(intervalId);
	}, 1);
	return proxied.apply(this, [].slice.call(arguments));
    };
})();

function IsJsonString(str) {
	try {
		JSON.parse(str);
	} catch (e) {
		return false;
	}
	return true;
}

//load the badges.css
if(sel("#cm_css_badges")) sel("#cm_css_badges").remove();
xhr_get("https://wizzikz.github.io/badges/badges.css", function(allText){
	sel("head").innerHTML += "<style id='cm_css_badges'>"+allText+"</style>";
}, true);
if(typeof def.customCSSs[location.href.split("/")[location.href.split("/").length-1]] != "undefined") {
	if(sel("#cm_css_main")) sel("#cm_css_main").remove();
	xhr_get(def.customCSSs[location.href.split("/")[location.href.split("/").length-1]], function(allText){
		sel("head").innerHTML += "<style id='cm_css_main'>"+allText+"</style>";
	}, true);
}