<!DOCTYPE html>
<html<?php // echo 'lang="ja" manifest="cache.appcache"'; ?>>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=utf-8" />
<title>WebMapビューアforスマートフォン</title>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0">
<meta name="apple-mobile-web-app-capable" content="yes">
<link rel="stylesheet" href="http://code.jquery.com/mobile/1.0/jquery.mobile-1.0.min.css">
<script src="http://code.jquery.com/jquery-1.6.4.min.js"></script>
<script src="http://code.jquery.com/mobile/1.0.1/jquery.mobile-1.0.1.min.js"></script>
<link rel="stylesheet" href="css/style.mobile.css" type="text/css">
<link rel="stylesheet" href="css/style.mobile-jq.css" type="text/css">
<script type="text/javascript" src="http://maps.google.com/maps/api/js?sensor=false&v=3.8"></script>

<script type="text/javascript" src="proj4js/lib/proj4js-combined.js"></script>
<script type="text/javascript" src="proj4js/lib/defs/EPSG_WGS.js"></script>
<script type="text/javascript" src="proj4js/lib/defs/EPSG900913.js"></script>
<script type="text/javascript" src="proj4js/lib/defs/EPSG_Tokyo.js"></script>
<script type="text/javascript" src="proj4js/lib/defs/EPSG_JGD2000.js"></script>

<script src="../openlayers/OpenLayers.mobile.js"></script>
<script src="../openlayers/CyberJapanMapTMS.js"></script>

<script src="js/mobile-base.js"></script>
<script src="js/mobile-jq.js"></script>

<script type="text/javascript">
//var appCache = window.applicationCache;
//appCache.addEventListener("updateready", function() {
//	if (confirm('アプリケーションの新しいバージョンが利用可能です。更新しますか？')) {
//		appCache.swapCache();
//		location.reload();
//	}
//}, false);
</script>
</head>
<body>
<h1 id="title">OpenLayers with jQuery Mobile</h1>
<div id="tags">
	mobile, jquery
</div>
<p id="shortdesc">
	Using jQuery Mobile to display an OpenLayers map.
</p>

<div data-role="page" id="mappage">
	<div data-role="content">
		<div id="map"></div>
	</div>

	<div data-role="footer">
		<a href="#searchpage" data-icon="search" data-role="button">Search</a>
		<a href="#" id="locate" data-icon="locate" data-role="button">Locate</a>
		<a href="#layerspage" data-icon="layers" data-role="button">Layers</a>
	</div>
	<div id="navigation" data-role="controlgroup" data-type="vertical">
		<a href="#" data-role="button" data-icon="plus" id="plus" data-iconpos="notext"></a>
		<a href="#" data-role="button" data-icon="minus" id="minus" data-iconpos="notext"></a>
	</div>
</div>

<div data-role="page" id="searchpage">
	<div data-role="header">
		<h1>Search</h1>
	</div>
	<div data-role="fieldcontain">
		<input type="search" name="query" id="query" value="" placeholder="Search for places" autocomplete="off"/>
	</div>
	<ul data-role="listview" data-inset="true" id="search_results"></ul>
</div>

<div data-role="page" id="layerspage">
	<div data-role="header">
		<h1>Layers</h1>
	</div>
	<div data-role="content">
		<ul data-role="listview" data-inset="true" data-theme="d" data-dividertheme="c" id="layerslist">
		</ul>
	</div>
</div>

<div id="popup" data-role="dialog">
	<div data-position="inline" data-theme="d" data-role="header">
		<h1>Details</h1>
	</div>
	<div data-theme="c" data-role="content">
		<ul id="details-list" data-role="listview">
		</ul>
	</div>
</div>
</body>
</html>
