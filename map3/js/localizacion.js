
var map, pois, marcador, vectorLayer, lastfeature, testLayer;
MAX_marcadores = 30;

function init() {
	ficheroTexto = "../map2/textfile.txt";
	//console.log("init()");
	// var icon1 = new
	// OpenLayers.Icon('http://www.openlayers.org/dev/img/marker.png', size,
	// offset);
	// var icon2 = new
	// OpenLayers.Icon('http://www.openlayers.org/dev/img/marker-gold.png',
	// size, offset);
	// var icon3 = new
	// OpenLayers.Icon('http://www.openlayers.org/dev/img/marker-green.png',
	// size, offset);

	iconoUltimaPos = 'http://dev.openlayers.org/img/marker-green.png';
	iconoPos = 'http://dev.openlayers.org/img/marker.png';
	// map = new OpenLayers.Map('map');
	// map.addLayer(new OpenLayers.Layer.OSM());
	map = new OpenLayers.Map("map", {
		// projection: 'EPSG:3857',
		layers : [ new OpenLayers.Layer.OSM(),
		
				new OpenLayers.Layer.Google("Google Physical", {
					type : google.maps.MapTypeId.TERRAIN,
					visibility : false
				}), new OpenLayers.Layer.Google("Google Streets", // the
				// default
				{
					numZoomLevels : 20,
					visibility : false
				}), new OpenLayers.Layer.Google("Google Hybrid", {
					type : google.maps.MapTypeId.HYBRID,
					numZoomLevels : 20,
					visibility : false
				}), new OpenLayers.Layer.Google("Google Satellite", {
					type : google.maps.MapTypeId.SATELLITE,
					numZoomLevels : 22,
					visibility : false
				}) ]
	});

	/*
	 * Layer style
	 */
	// we want opaque external graphics and non-opaque internal graphics
	var layer_style = OpenLayers.Util.extend({},
			OpenLayers.Feature.Vector.style['default']);
	layer_style.fillOpacity = 0.2;
	layer_style.graphicOpacity = 1;

	/*
	 * Blue style
	 */
	var style_blue = OpenLayers.Util.extend({}, layer_style);
	style_blue.strokeColor = "blue";
	style_blue.fillColor = "blue";
	style_blue.graphicName = "star";
	style_blue.pointRadius = 10;
	style_blue.strokeWidth = 3;
	style_blue.rotation = 45;
	style_blue.strokeLinecap = "butt";

	/*
	 * Green style
	 */
	var style_green = {
		strokeColor : "#00FF00",
		strokeWidth : 3,
		strokeDashstyle : "dashdot",
		pointRadius : 6,
		pointerEvents : "visiblePainted"
	};

	// Crear Marcadores de posiciones
	pois = new OpenLayers.Layer.Text("Mis puntos", {
		location : ficheroTexto,
		projection : map.displayProjection
	});

	// No se usa pero crear los Marcadores
	wktFormat = new OpenLayers.Format.Text();

	vectorLayer = new OpenLayers.Layer.Vector("Mis puntos Vector", {
		protocol : new OpenLayers.Protocol.HTTP({
			url : ficheroTexto,
			format : wktFormat
		}),
		styleMap: new OpenLayers.StyleMap({
			externalGraphic: '../markers/marker-green.png'
		}),
		strategies : [ new OpenLayers.Strategy.Fixed() ],
		eventListeners : {
			"featuresadded" : function(e) {
				if (vectorLayer.features.length > MAX_marcadores){
					while (vectorLayer.features.length > MAX_marcadores){
						marcador = vectorLayer.features[0];
						vectorLayer.removeFeatures(marcador);
					}
				}
				// group the tracks by fid and create one track for
				// every fid
				// var fid, points = [], feature;
				marcador = vectorLayer.features[vectorLayer.features.length - 1];
				//console.log(marcador);
				// marcador.marker.setUrl('Ol_icon_blue_example.png');
				marcador.style.externalGraphic = iconoUltimaPos;
				vectorLayer.redraw();
			}
		}
	});

	selectControl = new OpenLayers.Control.SelectFeature(vectorLayer, {
		onSelect : onFeatureSelect,
		onUnselect : onFeatureUnselect
	});
	map.addControl(selectControl);
	selectControl.activate();

	// Crear vector de la ruta y centrar mapa al ultimo punto
	var puntoFinal = new OpenLayers.LonLat(-71, 42);
	testLayer = new OpenLayers.Layer.PointTrack("Mi camino", {
		protocol : new OpenLayers.Protocol.HTTP({
			url : ficheroTexto,
			format : wktFormat
		}),
		strategies : [ new OpenLayers.Strategy.Fixed() ],
		dataFrom : OpenLayers.Layer.PointTrack.TARGET_NODE,
		styleFrom : OpenLayers.Layer.PointTrack.TARGET_NODE,
		projection : map.displayProjection,
		eventListeners : {
			"beforefeaturesadded" : function(e) {
				// group the tracks by fid and create one track for
				// every fid
				var fid, points = [], feature;
				var inicioCamino = 0;
				if (e.features.length>MAX_marcadores){
					/*var marcadorPT
					while (testLayer.features.length > MAX_marcadores){
						marcadorPT = testLayer.features[0];
						console.log(marcadorPT);
						console.log(e);	
						console.log(testLayer);
						testLayer.removeFeatures(marcadorPT);
					}	*/
					inicioCamino = e.features.length - MAX_marcadores;
					console.log(inicioCamino);
				}
				console.log(e.features.length);
				for ( var i = inicioCamino, len = e.features.length; i < len; i++) {
					feature = e.features[i];
					if ((fid && feature.fid !== fid) || i === len - 1) {
						points.push(feature);
						epsg4326 = new OpenLayers.Projection("EPSG:4326");
						epsg900913 = new OpenLayers.Projection("EPSG:900913");
						puntoFinal = feature.clone().geometry.transform(
								epsg900913, epsg4326);
						var lonLattemp = new OpenLayers.LonLat(puntoFinal.x,
								puntoFinal.y).transform(
								new OpenLayers.Projection("EPSG:4326"), // transform
								// from
								// WGS
								// 1984
								map.getProjectionObject() // to Spherical
						// Mercator
						// Projection
						);

						map.setCenter(lonLattemp, 16);
						this.addNodes(points, {
							silent : true
						});
						points = [];
					} else {
						points.push(feature);
					}
					fid = feature.fid;
				}
				return false;
			}
		}
	});

	// map.addLayer(vectorLayer);
	map.addLayer(testLayer);
	map.addLayer(vectorLayer);
	// map.addLayer(pois);

	// create layer switcher widget in top right corner of map.
	var layer_switcher = new OpenLayers.Control.LayerSwitcher({});
	map.addControl(layer_switcher);
	// Set start centrepoint and zoom
	var lonLat = new OpenLayers.LonLat(puntoFinal.x, puntoFinal.y).transform(
			new OpenLayers.Projection("EPSG:4326"), // transform from WGS 1984
			map.getProjectionObject() // to Spherical Mercator Projection
	);

	var zoom = 16;
	map.setCenter(lonLat, zoom);
	// marcador=pois.features[pois.features.length-1];
	// marcador.setUrl('Ol_icon_blue_example.png');
	// marcador.marker.setUrl('Ol_icon_blue_example.png');
	// updateLast();
}

function updateLasti_old() {
	marcador = pois.features[pois.features.length - 1];
	marcador.marker.setUrl('Ol_icon_blue_example.png');
}

function onFeatureSelect(feature) {

	// var feature = event.feature;
	var content = feature.attributes.title + '<br/>'
			+ feature.attributes.description;// feature.attributes.name +
	// '<br/>'+feature.attributes.description;
	popup = new OpenLayers.Popup.FramedCloud("chicken", feature.geometry
			.getBounds().getCenterLonLat(), new OpenLayers.Size(100, 100),
			content, null, true, onFeatureUnselect);
	feature.popup = popup;
	map.addPopup(popup);
	// GLOBAL variable, in case popup is destroyed by clicking CLOSE box
	lastfeature = feature;
}

function onFeatureUnselect(event) {
	var feature = lastfeature;
	if (feature.popup) {
		map.removePopup(feature.popup);
		feature.popup.destroy();
		delete feature.popup;
	}
}