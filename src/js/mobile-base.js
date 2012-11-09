// API key for http://openlayers.org. Please get your own at
// http://bingmapsportal.com/ and use that instead.
var BingApiKey = "AidaT_YkS7MBWtFjranDbqav15ydZ-UVQoRw8b1TFpbkVy-8817h21KvOubelesx";	// yasue

// initialize map when page ready
var map;
var gg = new OpenLayers.Projection("EPSG:4612");
var sm = new OpenLayers.Projection("EPSG:900913");

var maxResolution = 156543.03390625;
var mapBounds = new OpenLayers.Bounds(-20037508.34, -20037508.34, 20037508.34, 20037508.34);
var mapMinZoom = 1;
var mapMaxZoom = 21;
var lon = 139.74288;
var lat = 35.67973;
var zoom = 13;

var init = function () {


	// Google Road
	var layer_google = new OpenLayers.Layer.Google( "Google Maps",
		{ type: google.maps.MapTypeId.ROADMAP, sphericalMercator: true, isBaseLayer: true, visibility: true} );
	// Google Satellite
	var layer_google_satellite = new OpenLayers.Layer.Google( "Google衛星写真",
		{ type: google.maps.MapTypeId.SATELLITE, sphericalMercator: true, isBaseLayer: true, visibility: true} );
	// Google TERRAIN
	var layer_google_terrain = new OpenLayers.Layer.Google( "Google地形",
		{ type: google.maps.MapTypeId.TERRAIN, sphericalMercator: true, isBaseLayer: true, visibility: true} );
	// Google HYBRID
	var layer_google_hybrid = new OpenLayers.Layer.Google( "Google衛星+地図",
		{ type: google.maps.MapTypeId.HYBRID, sphericalMercator: true, isBaseLayer: true, visibility: true} );

	// OpenStreetMap
	var mapnik = new OpenLayers.Layer.OSM();

	// Bing Map
	// www.bingmapsportal.com
	var bing_road = new OpenLayers.Layer.Bing({
		key: BingApiKey,
		type: "Road",
		name: "BingMap",
		culture: "ja-JP"
	});
	var bing_aerial = new OpenLayers.Layer.Bing({
		key: BingApiKey,
		type: "Aerial",
		name: "Bing衛星写真",
		culture: "ja-JP"
	});
	var bing_hybrid = new OpenLayers.Layer.Bing({
		key: BingApiKey,
		type: "AerialWithLabels",
		name: "Bing衛星+地図",
		culture: "ja-JP"
	});

	var layer_img25000 = new OpenLayers.Layer.WMS( "数値地図25000画像",
		"/demo/sv02tilecache/tilecache.cgi?",
		{ layers: 'img25000', format: 'image/png' },
		{
			isBaseLayer: false
			,visibility: false
			,opacity: 0.5
			,minResolution: maxResolution / ( 1 << (17) )
			,maxResolution: maxResolution / ( 1 << (10) )
		}
	);
	var layer_kibandem_color = new OpenLayers.Layer.WMS( "段彩陰影10m",
		"/demo/sv02tilecache/tilecache.cgi?",
		{ layers: 'kibandem_color', format: 'image/png' },
		{
			isBaseLayer: false
			,visibility: false
			,opacity: 0.5
			,maxExtent: mapBounds
			,maxResolution: maxResolution
		}
	);
	// 基盤地図情報25000 WMS配信サービス
	var kibanwms = new OpenLayers.Layer.WMS(
		"基盤地図情報25000(WMS)",
		"http://www.finds.jp/ws/tmcwms.php?",
		{
			layers: "KBN25000ANF-900913",
			format: "image/png"
		},
		{
			attribution: '<a target=\"_blank\" href="http://www.finds.jp/wsdocs/kibanwms/index.html">基盤地図情報(平20業使、第449号)</a>'
			,isBaseLayer: true
			,maxExtent: mapBounds
			,maxResolution: maxResolution
		}
	);

	var arr_dataset = [
		null,null,null,null,null,"JAIS","JAIS","JAIS","JAIS","BAFD1000K","BAFD1000K","BAFD1000K","BAFD200K","BAFD200K","BAFD200K","DJBMM","DJBMM","DJBMM","FGD"
	];
	var cyberJapanMapBaseLayer = new CyberJapanMapTMS( "電子国土背景地図",
		"http://cyberjapandata.gsi.go.jp/sqras/all/",
		{
			tileSize: new OpenLayers.Size(256,256),
			tileOrigin: new OpenLayers.LonLat(mapBounds.left,mapBounds.top),
			dataSet: arr_dataset,
			isBaseLayer: true, opacity: 1,
			attribution: '<a href=\"http://portal.cyberjapan.jp/\"><img src=\"http://cyberjapan.jp/images/icon01.gif\" alt=\"電子国土\"></a>'
		}
	);

	// Elevation Annotation Layer
	// allow testing of specific renderers via "?renderer=Canvas", etc
	var renderer = OpenLayers.Util.getParameters(window.location.href).renderer;
	renderer = (renderer) ? [renderer] : OpenLayers.Layer.Vector.prototype.renderers;

	var elevationLayer = new OpenLayers.Layer.Vector("標高値", {
		styleMap: new OpenLayers.StyleMap({'default':{
			strokeColor: "#00FF00",
			strokeOpacity: 1,
			strokeWidth: 0,
			fillColor: "#FF5500",
			fillOpacity: 0.5,
			pointRadius: "${pointRadius}",
			pointerEvents: "visiblePainted",
			// label with \n linebreaks
			label : "${annot}",

			fontColor: "${favColor}",
			fontSize: "12px",
			fontFamily: "Courier New, monospace",
			fontWeight: "bold",
			labelAlign: "${align}",
			labelXOffset: "${xOffset}",
			labelYOffset: "${yOffset}",
			labelOutlineColor: "white",
			labelOutlineWidth: 5
		}}),
		renderers: renderer
	});
	elevationLayer.displayInLayerSwitcher = true;

	var lonlat = new OpenLayers.LonLat(lon, lat);
	lonlat = lonlat.transform(gg, sm);

	var geolocate = new OpenLayers.Control.Geolocate({
		id: 'locate-control',
		geolocationOptions: {
			enableHighAccuracy: true,
			maximumAge: 0,
			timeout: 7000
		}
	});
	// create map
	map = new OpenLayers.Map({
		div: "map",
		theme: null,
		projection: new OpenLayers.Projection("EPSG:900913"),
		displayProjection: new OpenLayers.Projection("EPSG:4612"),  // 地図の表示
		units: "m",
		maxResolution: maxResolution,
		maxExtent: mapBounds,
		numZoomLevels: mapMaxZoom-mapMinZoom+1 ,
		controls: [
			new OpenLayers.Control.Attribution(),
			new OpenLayers.Control.TouchNavigation({
				dragPanOptions: {
					enableKinetic: true
				}
			}),
			geolocate
		],
		layers: [
			layer_google, 
			layer_google_satellite, 
			layer_google_terrain, 
			layer_google_hybrid,
			bing_road,
			bing_aerial,
			bing_hybrid,
			mapnik,
			cyberJapanMapBaseLayer,
			layer_img25000,
			layer_kibandem_color,
			kibanwms,
			elevationLayer
		],
		center: lonlat,
		zoom: zoom
	});

	var style = {
		fillOpacity: 0.1,
		fillColor: '#000',
		strokeColor: '#f00',
		strokeOpacity: 0.6
	};
	geolocate.events.register("locationupdated", this, function(e) {
	});

	// 標高表示
	var elevationFeature = null;
	var pre_ajax_time = new Date().getTime();
	var pre_position = {lon:0,lat:0};
	var last_position = {lat:0,lat:0};
	var last_lonlat = {lon:0,lat:0};
	var func_getelevation = function() {
		var cur_time = new Date().getTime();
		last_position = map.getCenter();
		last_lonlat = new OpenLayers.LonLat(last_position.lon, last_position.lat);
		last_lonlat = last_lonlat.transform(new OpenLayers.Projection("EPSG:900913"),new OpenLayers.Projection("EPSG:4612"));
		//console.dir(last_lonlat);
		if ( cur_time - pre_ajax_time > 1000 && pre_position.lon != last_position.lon && pre_position.lat != last_position.lat ) {
			pre_position = last_position;
			pre_ajax_time = cur_time;
			jQuery.ajax({
				type : "GET",
				dataType : "json",
				url : "http://www2.chuogeomatics.jp/demo/webapp/getelevation.php?lng="+last_lonlat.lon+"&lat="+last_lonlat.lat,
				data : {},
				success : function(data, textStatus, XMLHttpRequest) {
					//console.dir(data.result);
					if ( data.result.length == 0 ) {
					} else if ( data.result.SQLError ) {
					} else {
						console.log(data.result[0].val);
//							jQuery("#elevation").html( parseInt(data.result[0].val*10)/10.0 + "m" ).css("top",jQuery("#map").position().top+last_position.y-20).css("left",jQuery("#map").position().left+last_position.x+3);

						if ( elevationFeature ) elevationLayer.removeFeatures(elevationFeature);

						var xy = new OpenLayers.LonLat(last_lonlat.lon, last_lonlat.lat);
						xy.transform(new OpenLayers.Projection("EPSG:4612"),new OpenLayers.Projection("EPSG:900913"));
						var t_unit = "m";
						if ( data.result[0].src == "dem10m" ) t_unit = "M";
						// create a point feature
						var point = new OpenLayers.Geometry.Point(xy.lon, xy.lat);
						elevationFeature = new OpenLayers.Feature.Vector(point);
						elevationFeature.attributes = {
							annot: parseInt(data.result[0].val*10)/10.0 + t_unit,
							favColor: 'red',
							align: "cb",
							xOffset: 0,
							yOffset: 3,
							pointRadius: 2
						};
						elevationLayer.addFeatures([elevationFeature]);


					}
				},
				error : function(XMLHttpRequest, textStatus, errorThrown) {
					console.log("Error:"+textStatus);
					console.dir(XMLHttpRequest);
				}
			});
			pre_position.lon = last_position.lon;
			pre_position.lat = last_position.lat;
		}
	};
	setInterval(func_getelevation,3000);

};
