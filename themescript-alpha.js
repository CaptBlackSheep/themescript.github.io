//some defaults
var ts_loaded = (typeof def != "undefined");

var def = {
	notif_inner: "<div style=\"opacity: 1;top:0px;z-index:12;transition:all 0.3s linear;-webkit-transition:all 0.3s linear;-moz-transition:all 0.3s linear;-ms-transition:all 0.3s linear;-o-transition:all 0.3s linear;\"class=\"notification cmt-load\"><div class=\"left\"><i class=\"icon icon-about-white\"></i></div><div class=\"right\"><span style=\"top: 25px;\">__TEXT__</span></div></div>",
	settings_item_inner: '<div class="header"><span>Themescript</span></div><div class="left"><div class="item ts-toggle"><i class="icon icon-check-blue"></i><span>Turn on / off themescript</span></div></div>',
	toast_closed: false,
	plugin: {
		load: "Themescript activated!"
	},
	customCSSs: {
		"chilloutmixer": "https://themescript.github.io/master/master.css",
		"a-test-room-2": "https://themescript.github.io/personal/wizzikz/master.css",
		"this-is-it": "https://themescript.github.io/master/master.css"
	},
	room_names: {
		"chilloutmixer": "Chillout Mixer v3",
		"a-test-room-2": "Just a test room.",
		"this-is-it": "El Jefe"
	},
	browser: {
		hasLocalStorage: (typeof(Storage) !== "undefined")
	},
	not_settings_added_listener: false,
	settings_added_listener: false,
	settings_acc_added_listener: false,
	settings_added_select: false
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
							if(typeof def.customCSSs[parsed.data[0].meta.slug] != "undefined")
								loadCSSs(false, true);
							else
								removeCSSs(false, true);
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

//load the badges.css and master.css
if(!localStorage.hasOwnProperty("ts-toggle")) localStorage.setItem("ts-toggle","true");
loadCSSs(true, true);
function loadCSSs(loadBadges, loadMaster) {
	var loadThem = false;
	if(def.browser.hasLocalStorage) {
		if(localStorage.hasOwnProperty("ts-toggle")) {
			if(localStorage.getItem("ts-toggle") == "true") {
				loadThem = true;
			}
		}
	} else {
		loadThem = true;
	}
	if(loadThem && isInSpecialRoom()) {
		if(loadBadges) {
			if(sel("#cm_css_badges")) sel("#cm_css_badges").remove();
			xhr_get("https://themescript.github.io/badges/badges.css", function(allText){
				sel("head").innerHTML += "<style id='cm_css_badges'>"+allText+"</style>";
			}, true);
		}
		if(loadMaster) {
			var loaded_css = def.customCSSs[location.href.split("/")[location.href.split("/").length-1]];
			if(sel("#cm_css_main")) sel("#cm_css_main").remove();
			if(typeof localStorage["ts-current-css"] != "undefined")
				loaded_css = localStorage.getItem("ts-current-css");
			if(typeof loaded_css != "undefined") {
				xhr_get(loaded_css, function(allText){
					sel("head").innerHTML += "<style id='cm_css_main'>"+allText+"</style>";
				}, true);
			}
		}
	}
}
function loadMasterCSS(url) {
	xhr_get(url, function(allText){
		if(sel("#cm_css_main")) sel("#cm_css_main").remove();
		sel("head").innerHTML += "<style id='cm_css_main'>"+allText+"</style>";
	}, true);
}
function removeCSSs(loadBadges, loadMaster) {
	if(loadBadges) {
		if(sel("#cm_css_badges")) sel("#cm_css_badges").remove();
	}
	if(loadMaster) {
		if(sel("#cm_css_main")) sel("#cm_css_main").remove();
	}
}

function isInSpecialRoom() {
	return typeof def.customCSSs[location.href.split("/")[location.href.split("/").length-1]] != "undefined";
}


// adding a new item in settings
if(def.browser.hasLocalStorage) {
	//var open_settings_btn = sel("#footer-user .button.settings");
	if(!ts_loaded) {
		$("#footer-user .button:not(.settings)").on('click', function() {
			if(!def.not_settings_added_listener) {
				$("#user-menu .item.settings").on('click', function() {
					settings_click_listener();
				});
				def.not_settings_added_listener = true;
			}
		});
		$("#footer-user .button.settings").on('click', function() {
			settings_click_listener();
			if(!def.settings_acc_added_listener) {
				$("#user-settings .tab-menu .account:not(.selected)").on('click', function() {
					if(!def.settings_added_listener) {
						$("#user-settings .tab-menu .application:not(.selected)").on('click', function() {
							settings_click_listener();
						});
						def.settings_added_listener = true;
					}
					def.settings_acc_added_listener = true;
				});
			}
		});
	}
}
function settings_click_listener() {
	var settings_panel = sel("#user-settings .container");

	settings_panel.innerHTML += def.settings_item_inner;
	
	var i,option = "<option>_</option>",option_selected = "<option selected>_</option>",options_inner = "<option>--- Current room ---</option>",
		room_name_in_select = "";
	if(typeof localStorage["ts-current-css"] != "undefined")
		room_name_in_select = def.room_names[(_.invert(def.customCSSs))[localStorage["ts-current-css"]]];
	for(i in def.room_names) {
		var must_be_selected = false;
		if(room_name_in_select.length>0
			&& def.room_names[i] == room_name_in_select)
				must_be_selected = true;
		if(must_be_selected) options_inner += option_selected.replace("_", def.room_names[i]);
		else options_inner += option.replace("_", def.room_names[i]);
	}
	settings_panel.innerHTML += '<div class="right"><select class="dropdown_themes">'+options_inner+'</select></div>'
	
	var ts_select = sel(".dropdown_themes");
	//if(!def.settings_added_select) {
		ts_select.addEventListener("change", function() {
			var val = ts_select.value,ts_css;
			if(!(val == "--- Current room ---")) {
				ts_css = def.customCSSs[(_.invert(def.room_names))[val]];
				localStorage.setItem("ts-current-css", ts_css);
				loadMasterCSS(ts_css);
			} else if(val == "--- Current room ---" && isInSpecialRoom()){
				if(typeof localStorage["ts-current-css"] != "undefined")
					localStorage.removeItem("ts-current-css");
				loadCSSs(false, true);
			}
		});
		def.settings_added_select = true;
	//}
	
	var ts_toggle = sel(".ts-toggle");
	setTimeout(function(){
		if(localStorage.getItem("ts-toggle") == "true") {
			ts_toggle.className+=" selected";
		}
	},10);
	
	ts_toggle.addEventListener("click", function() {
		if(ts_toggle.className.indexOf("selected") >= 0) {
			ts_toggle.classList.remove("selected");
			localStorage.setItem("ts-toggle", "false");
			removeCSSs(true, true);
		} else {
			ts_toggle.classList.add("selected");
			localStorage.setItem("ts-toggle", "true");
			loadCSSs(true, true);
		}
	});
}
