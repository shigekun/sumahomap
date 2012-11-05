
var selectedFeature = null;

// UserAgent から端末の種類を判別
var ua = navigator.userAgent;
var device;
if (ua.search(/iPhone/) != -1 || ua.search(/iPod/) != -1) {
	device = "iPhone";
} else if (ua.search(/Android/) != -1) {
	device = "Android";
}


// fix height of content
function fixContentHeight() {
	var footer = $("div[data-role='footer']:visible"),
		content = $("div[data-role='content']:visible:visible"),
		viewHeight = $(window).height(),
		contentHeight = viewHeight - footer.outerHeight();

	if ((content.outerHeight() + footer.outerHeight()) !== viewHeight) {
		contentHeight -= (content.outerHeight() - content.height() + 1);
		content.height(contentHeight);
	}

	// 端末の向きを算出
	var isPortrait = window.innerHeight > window.innerWidth;	// 460,320 or 480,300

	// 端末の種類からページの高さを算出
	if (device == "Android") {
		h = Math.round(window.outerHeight / window.devicePixelRatio);
	} else if (device == "iPhone") {
		bar = (isPortrait ? 480 : screen.width) - window.innerHeight - (20 + (isPortrait ? 44 : 32));
		h = window.innerHeight + bar + (window.navigator.standalone ? (isPortrait ? 45 : 37) : 0 );
	} else {
		h = window.innerHeight;
	}
	content.height(h - footer.outerHeight());

//	jQuery("#navigation").css("top", ""+(window.innerHeight - (isPortrait ? "200" : "200")) + "px" );
	jQuery("#navigation").css("top", ""+(window.innerHeight - 170 ) + "px" );


	if (window.map && window.map instanceof OpenLayers.Map) {
		map.updateSize();
	} else {
		// initialize map
		init();
		initLayerList();

		var control = map.getControlsBy("id", "locate-control")[0];
		if (control.active) {
			control.getCurrentLocation();
		} else {
			control.activate();
		}
	}

	// ページをスクロール
	setTimeout(function() {
		scrollTo(0, 1);
	}, 100);

}

// one-time initialisation of button handlers 

$("#plus").live('click', function(){
	map.zoomIn();
});

$("#minus").live('click', function(){
	map.zoomOut();
});

$("#locate").live('click',function(){
	var control = map.getControlsBy("id", "locate-control")[0];
	if (control.active) {
		control.getCurrentLocation();
	} else {
		control.activate();
	}
});

//fix the content height AFTER jQuery Mobile has rendered the map page
$('#mappage').live('pageshow',function (){
	fixContentHeight();
});
	
$(window).bind("orientationchange resize pageshow tap", fixContentHeight);



$('#popup').live('pageshow',function(event, ui){
	var li = "";
	for(var attr in selectedFeature.attributes){
		li += "<li><div style='width:25%;float:left'>" + attr + "</div><div style='width:75%;float:right'>" 
		+ selectedFeature.attributes[attr] + "</div></li>";
	}
	$("ul#details-list").empty().append(li).listview("refresh");
});

/////////////////////////////////////////////////////////////
// BingREST
function bingSearchAjax(url) {
	jQuery.ajax({
		type : "GET",
		dataType : "jsonp",
		url : url,
		data : {}
	});
}
function bingCallbackFunc(res) {
//console.log(res);
	if (res &&
		res.resourceSets &&
		res.resourceSets.length > 0 &&
		res.resourceSets[0].resources &&
		res.resourceSets[0].resources.length > 0) {

		$.each(res.resourceSets[0].resources, function() {
			var place = this;
			var txt1 = place.address.adminDistrict || "";
			var txt2 = place.address.locality || "";
			var txt3 = place.address.addressLine || "";
			$('<li>')
				.hide()
				.append($('<h2 />', {
					text: place.name
				}))
				.append($('<p />', {
					html: '' + txt1 + txt2 + txt3
				}))
				.appendTo('#search_results')
				.click(function() {
					$.mobile.changePage('#mappage');
					var lonlat = new OpenLayers.LonLat(place.point.coordinates[1], place.point.coordinates[0]);
					map.setCenter(lonlat.transform(gg, sm));
				})
				.show();
		});
		$('#search_results').listview('refresh');
		$.mobile.hidePageLoadingMsg();

	} else {
		//console.log("Bing Search:Not Found.");
	}
}
$('#searchpage').live('pageshow',function(event, ui){
	$('#query').bind('change', function(e){
		$('#search_results').empty();
		if ($('#query')[0].value === '') {
			return;
		}
		$.mobile.showPageLoadingMsg();

		// Prevent form send
		e.preventDefault();

		var searchUrl = 'https://dev.virtualearth.net/REST/v1/Locations?output=json&jsonp=bingCallbackFunc&q='
				+ encodeURI($('#query')[0].value)
				+ '&key='+BingApiKey+'&c=ja-jp';
		bingSearchAjax(searchUrl);
	});
	// only listen to the first event triggered
	$('#searchpage').die('pageshow', arguments.callee);
});


function initLayerList() {
	$('#layerspage').page();
	$('<li>', {
			"data-role": "list-divider",
			text: "Base Layers"
		})
		.appendTo('#layerslist');
	var baseLayers = map.getLayersBy("isBaseLayer", true);
	$.each(baseLayers, function() {
		if ( this.displayInLayerSwitcher ) addLayerToList(this);
	});

	$('<li>', {
			"data-role": "list-divider",
			text: "Overlay Layers"
		})
		.appendTo('#layerslist');
	var overlayLayers = map.getLayersBy("isBaseLayer", false);
	$.each(overlayLayers, function() {
		if ( this.displayInLayerSwitcher ) addLayerToList(this);
	});
	$('#layerslist').listview('refresh');
	
	map.events.register("addlayer", this, function(e) {
		addLayerToList(e.layer);
	});
}

function addLayerToList(layer) {
	var item = $('<li>', {
			"data-icon": "check",
			"class": layer.visibility ? "checked" : ""
		})
		.append($('<a />', {
			text: layer.name
		})
			.click(function() {
				$.mobile.changePage('#mappage');
				if (layer.isBaseLayer) {
					layer.map.setBaseLayer(layer);
				} else {
					layer.setVisibility(!layer.getVisibility());
				}
			})
		)
		.appendTo('#layerslist');
	layer.events.on({
		'visibilitychanged': function() {
			$(item).toggleClass('checked');
		}
	});
}

// Start with the map page
window.location.replace(window.location.href.split("#")[0] + "#mappage");
