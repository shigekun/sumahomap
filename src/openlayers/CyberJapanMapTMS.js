/**
 *
 * このプログラムは、国土地理院の許可を得て、電子国土Webシステムの背景地図等データ提供サーバへ直接アクセスします。
 * (国土地理院背景地図等データ利用許諾番号)2012-027号
 * 利用に当たっては国土地理院背景地図等データ利用規約に従って下さい。
 * http://portal.cyberjapan.jp/portalsite/kiyaku/index.html#haikei
 * 
 * このプログラムのソースコードは、国土地理院によって提供されたものではありません。
 * 
 * Copyright 2012, CHUO GEOMATICS CO., LTD. All Rights Reserved.
 * http://www.chuogeomatics.jp/
 * 
 * @requires OpenLayers/Layer/TMS.js
 */

/**
 * Class: CyberJapanMapTMS
 * Example:
 * (code)
 *     var layer = new CyberJapanMapTMS(
 *         "My Layer", // name for display in LayerSwitcher
 *         "http://cyberjapandata.gsi.go.jp/sqras/all/", // service endpoint
 *         {dataSet: [null,null,null,null,null,"JAIS","JAIS","JAIS","JAIS","BAFD1000K","BAFD1000K","BAFD1000K","BAFD200K","BAFD200K","BAFD200K","DJBMM","DJBMM","DJBMM"]} // required properties
 *     );
 * (end)
 * 
 * Inherits from:
 *  - <OpenLayers.Layer.TMS>
 */
CyberJapanMapTMS = OpenLayers.Class(OpenLayers.Layer.TMS, {

	attribution : '<a href=\"http://portal.cyberjapan.jp/\"><img src=\"http://cyberjapan.jp/images/icon01.gif\" alt=\"電子国土\"></a>',
	isBaseLayer : true,
	opacity : 1,
	dataSet : [null,null,null,null,null,"JAIS","JAIS","JAIS","JAIS","BAFD1000K","BAFD1000K","BAFD1000K","BAFD200K","BAFD200K","BAFD200K","DJBMM","DJBMM","DJBMM","FGD"],
	type : "png",
	noImgSrc : null,

    /**
     * Property: serverResolutions
     * {Array} the resolutions provided by the Bing servers.
     */
    serverResolutions: [
        156543.03390625, 78271.516953125, 39135.7584765625,
        19567.87923828125, 9783.939619140625, 4891.9698095703125,
        2445.9849047851562, 1222.9924523925781, 611.4962261962891,
        305.74811309814453, 152.87405654907226, 76.43702827453613,
        38.218514137268066, 19.109257068634033, 9.554628534317017,
        4.777314267158508, 2.388657133579254, 1.194328566789627,
        0.5971642833948135, 0.29858214169740677, 0.14929107084870338,
        0.07464553542435169
    ],

    /**
     * Constructor: OpenLayers.Layer.TMS
     * 
     * Parameters:
     * name - {String} Title to be displayed in a <OpenLayers.Control.LayerSwitcher>
     * url - {String} Service endpoint (without the version number).  E.g.
     *     "http://tms.osgeo.org/".
     * options - {Object} Additional properties to be set on the layer.  The
     *     <dataSet> properties must be set here.
     */
    initialize: function(name, url, options) {

		var noImgSrc = options.noImgSrc || this.noImgSrc;
		this.tileSize = new OpenLayers.Size(256,256);
		this.tileOrigin = new OpenLayers.LonLat(-20037508.34,20037508.34);
		this.tileOptions = {
			eventListeners: {
				"loadend": function(evt) {
				},
				"loaderror": function(evt) {
					if (noImgSrc) evt.object.setImgSrc(noImgSrc);
				}
			}
		};

        var newArguments = [];
        newArguments.push(name, url, options);
        OpenLayers.Layer.TMS.prototype.initialize.apply(this, newArguments);
    },

    /**
     * APIMethod: clone
     * Create a complete copy of this layer.
     *
     * Parameters:
     * obj - {Object} Should only be provided by subclasses that call this
     *     method.
     * 
     * Returns:
     * {<OpenLayers.Layer.TMS>} An exact clone of this <OpenLayers.Layer.TMS>
     */
    clone: function (obj) {
        
        if (obj == null) {
            obj = new CyberJapanMapTMS(this.name,
                                           this.url,
                                           this.getOptions());
        }

        //get all additions from superclasses
        obj = OpenLayers.Layer.TMS.prototype.clone.apply(this, [obj]);

        // copy/set any non-init, non-simple values here

        return obj;
    },    
    
    /**
     * Method: getURL
     * 
     * Parameters:
     * bounds - {<OpenLayers.Bounds>}
     * 
     * Returns:
     * {String} A string with the layer's url and parameters and also the 
     *          passed-in bounds and appropriate tile size specified as 
     *          parameters
     */
    getURL: function (bounds) {
        bounds = this.adjustBounds(bounds);
        var res = this.getServerResolution();
        var x = Math.round((bounds.left - this.tileOrigin.lon) / (res * this.tileSize.w));
        //var y = Math.round((bounds.bottom - this.tileOrigin.lat) / (res * this.tileSize.h));
        var y = Math.round((this.tileOrigin.lat - bounds.top) / (res * this.tileSize.h));
        var z = this.getServerZoom();
        var path;// = this.serviceVersion + "/" + this.layername + "/" + z + "/" + x + "/" + y + "." + this.type; 

        var zoom = z;
        var tx = x + "";
        var ty = y + "";
        var txp = 7 - tx.length;
        var typ = 7 - ty.length;
        if( txp > 0 ) {
          tx = "0000000".substr(0,txp) + tx;
        }
        if( typ > 0 ) {
          ty = "0000000".substr(0,typ) + ty;
        }
        var arr_dataset = [
          null,null,null,null,null,"JAIS","JAIS","JAIS","JAIS","BAFD1000K","BAFD1000K","BAFD1000K","BAFD200K","BAFD200K","BAFD200K","DJBMM","DJBMM","DJBMM"
        ];
        arr_dataset = this.dataSet;
        if( arr_dataset[zoom] ) {
          path = arr_dataset[zoom] + "/latest/" + zoom + "/";
          // インデクス
          for( var n = 0; n < 6; n++ ) {
            path = path + tx.charAt(n) + ty.charAt(n) + "/";
          }
          path = path + tx + ty + "." + this.type;
        } else {
          return false;
		}

        var url = this.url;
        if (OpenLayers.Util.isArray(url)) {
            url = this.selectUrl(path, url);
        }
        return url + path;
    },

    CLASS_NAME: "CyberJapanMapTMS"
});
