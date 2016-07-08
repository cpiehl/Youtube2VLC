// ==UserScript==
// @name     Youtube2VLC
// @version      0.2
// @include  https://www.youtube.com/*
// @include  https://www.reddit.com/*
// @require  http://ajax.googleapis.com/ajax/libs/jquery/1.11.2/jquery.min.js
// @resource KODI_ICON kodi.png
// @resource VLC_ICON vlc-metro.png
// @resource ARCH_ICON archlinux.png
// @resource ANDROID_ICON android.png
// @grant    GM_getResourceURL
// @grant	 GM_xmlhttpRequest
// ==/UserScript==

(function(){

String.format = function() {
  var s = arguments[0];
  for (var i = 0; i < arguments.length - 1; i++) {
    var reg = new RegExp("\\{" + i + "\\}", "gm");
    s = s.replace(reg, arguments[i + 1]);
  }

  return s;
}

var win_kodi_url = 'http://192.168.1.100:8085/jsonrpc'
var win_kodi_json = '{"jsonrpc":"2.0","id":1,"method":"Player.Open","params":"{"item":{"file":"plugin%3A%2F%2Fplugin.video.youtube%2F%3Faction%3Dplay_video%26videoid%3D=%s"}}}';
var lunix_vlc_url = "http://192.168.1.101:8080/requests/status.xml?command=in_enqueue&input=%s";
var win_vlc_url = "http://192.168.1.100:8080/requests/status.xml?command=in_enqueue&input=%s";
var autoremote_key = "noneofyourbusiness"
var autoremote_url = "https://autoremotejoaomgcd.appspot.com/sendmessage?key=" + autoremote_key + "&message=%s";

var f = [
	["KODI_ICON", "Send to Kodi", win_kodi_url, win_kodi_json],
	["VLC_ICON", "Send to VLC", win_vlc_url, ""],
	["ARCH_ICON", "Send to LUNIX", lunix_vlc_url, ""],
	["ANDROID_ICON", "Send to Phone", autoremote_url, ""]
];

$.expr[':'].isYoutube = function(a) {
    return $(a).prop('href').match(/^http[s]?:\/\/(www\.)?youtube.com\/watch\?v=/);
};

function addButtons(e) {
	// get only text links containing http[s]://www.youtube.com/watch\?=
	jQuery('a:not(.yt2vlc):not(:has(img)):not(:empty):isYoutube', e).each ( function () {

		var jThis = $(this);
		var URL = jThis.prop("href");
		f.forEach( function(dest) {
			d = document.createElement('div');
			var sURL = dest[2].replace("%s", encodeURIComponent(URL))
			var videoID = URL.substr(URL.indexOf("=") + 1)
			var sData = dest[3].replace("%s", videoID)
			$(d).addClass('yt2vlc')
				.html('<img src="' + GM_getResourceURL(dest[0]) + '" height=20 width=20 title="' + dest[1] + '">')
				//~ .prependTo($(jThis.parent()))
				.insertBefore($(jThis))
				.click(function(event){
					sendPOST(sURL, sData);
					//~ alert(sData)
					event.stopPropagation();
				})
				.css("display", "inline")
			;
		});
		jThis.addClass("yt2vlc");
	} );
}

function sanitizeString(str){
    str = str.replace(/[^a-z0-9áéíóúñü \/:=?.,_-]/gim,"");
    return str.trim();
}

function sendPOST(sURL, sData) {
	GM_xmlhttpRequest({
		method: "POST",
		url: sURL,
		headers: {
			"Content-Type": "application/json",
			"User-Agent": "Mozilla/5.0",    // If not specified, navigator.userAgent will be used.
			"Accept": "text/xml",           // If not specified, browser defaults will be used.
			"Authorization": "Basic " + btoa(":cheese12")
		},
		data: sData
	});
}

addButtons();
// Perform the substitution whenever a new node is added to support AJAX sites
document.body.addEventListener("DOMNodeInserted",function(e){
	addButtons(e.target);
});

})();
