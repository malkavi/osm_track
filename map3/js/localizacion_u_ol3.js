var map, pois, marcador, vectorLayer, lastfeature, testLayer, geoJsonSource;
MAX_marcadores = 30;
// var createPointStyleFunction;

function init() {
	loadMap();
}

function loadMap() {
	/**
	 * Elements that make up the popup.
	 */
	var container = document.getElementById('popup');
	var content = document.getElementById('popup-content');
	var closer = document.getElementById('popup-closer');

	/**
	 * Add a click handler to hide the popup.
	 * 
	 * @return {boolean} Don't follow the href.
	 */
	closer.onclick = function() {
		container.style.display = 'none';
		closer.blur();
		return false;
	};

	/**
	 * Create an overlay to anchor the popup to the map.
	 */
	var overlay = new ol.Overlay({
		element : container
	});

	// console.log("init()");
	// iconoUltimaPos = 'http://dev.openlayers.org/img/marker-green.png';
	// iconoPos = 'http://dev.openlayers.org/img/marker.png';

	var osm = new ol.layer.Tile({
		source : new ol.source.OSM()
	});

	var osmtransp = new ol.layer.Tile(
			{
				source : new ol.source.OSM(
						{
							attributions : [
									new ol.Attribution(
											{
												html : 'All maps &copy; '
														+ '<a href="http://www.opencyclemap.org/">OpenCycleMap</a>'
											}), ol.source.OSM.ATTRIBUTION ],
							url : 'http://{a-c}.tile.opencyclemap.org/transport/{z}/{x}/{y}.png'
						})
			});

	var osmcycle = new ol.layer.Tile(
			{
				source : new ol.source.OSM(
						{
							attributions : [
									new ol.Attribution(
											{
												html : 'All maps &copy; '
														+ '<a href="http://www.opencyclemap.org/">OpenCycleMap</a>'
											}), ol.source.OSM.ATTRIBUTION ],
							url : 'http://{a-c}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png'
						})
			});

	var bing = new ol.layer.Tile(
			{
				visible: false,
				preload: Infinity,
				source : new ol.source.BingMaps(
						{
							key : 'Au0_zzMAQznXGGdheWg3ze1B7DS_NurNGTiOxdEfFJzWRJt75kAwQyukcCjv9oF_',
							imagerySet : 'AerialWithLabels'
						})
			});

	var staT = new ol.layer.Tile({
		source : new ol.source.Stamen({
			layer : 'terrain'
		})
	});
	var staW = new ol.layer.Tile({
		source : new ol.source.Stamen({
			layer : 'watercolor'
		})
	});
	var staTL = new ol.layer.Tile({
		source : new ol.source.Stamen({
			layer : 'terrain-labels'
		})
	});

	var today = new Date();
	var mm = today.getMonth() + 1; // January is 0!
	var yyyy = today.getFullYear();
	if (mm < 10) {
		mm = '0' + mm
	}
	// var fechayearmonth = document.getElementById('yearmonth');
	document.getElementById('yearmonth').value = yyyy + '-' + mm;
	document.getElementById('yearmonth').max = yyyy + '-' + mm;

	// Load first points
	cargarGeoJson(30, yyyy, mm);

	// Load Map with scale line
	var scaleLineControl = new ol.control.ScaleLine();
	// scaleLineControl.setUnits('metric');
	map = new ol.Map({
		layers : [ osm, osmtransp, osmcycle, bing, staT,
				staW, staTL, vectorLayer ],
		overlays : [ overlay ],
		target : 'map',
		controls : ol.control.defaults({
			attributionOptions : /** @type {olx.control.AttributionOptions} */
			({
				collapsible : true,
				collapsed : true
			})
		}).extend([ scaleLineControl ]),
		view : new ol.View({
			center : [ 0, 0 ],
			zoom : 14
		})
	});

	// Initialize layers
	initCapas();
	osm.setVisible(true);
	vectorLayer.setVisible(true);
	// var visibleOSM = new ol.dom.Input(document.getElementById('visibleOSM'));
	// visibleOSM.bindTo('checked', osm, 'visible');
	// var visible = new ol.dom.Input(document.getElementById('visibleBing'));
	// visible.bindTo('checked', bing, 'visible');
	var boton = document.getElementById('bttrefresh');
	boton.addEventListener('click', function() {
		actualizarPuntosMapa();
		// actualizarGeoJson(parseInt(document.getElementById('puntos').value));
	}, false);

	var capasSelect = document.getElementById('capas');
	capasSelect.addEventListener('change', function() {
		// console.log(capasSelect.selectedIndex);
		initCapas();
		vectorLayer.setVisible(true);
		switch (capasSelect.selectedIndex) {
		case 0:
			// OSM
			osm.setVisible(true);
			// actualizarGeoJson(100);
			break;
		case 1:
			// OSM transport
			osmtransp.setVisible(true);
			// actualizarGeoJson(100);
			break;
		case 2:
			// OSM cycle
			osmcycle.setVisible(true);
			// actualizarGeoJson(100);
			break;
		case 3:
			// Bing
			bing.setVisible(true);
			// osm.setVisible(false);
			break;
		case 4:
			// Stamen Terrain
			staTL.setVisible(true);
			staT.setVisible(true);
			// osm.setVisible(false);
			break;
		case 5:
			// Stamen WaterColors
			staTL.setVisible(true);
			staW.setVisible(true);
			// osm.setVisible(false);
			break;
		}
		// console.log("change");
		map.render();
	}, false);
	// console.log(capasSelect);

	// Evento click
	var highlightStyleCache = {};

    var collection = new ol.Collection();
	var featureOverlay = new ol.layer.Vector({
		map : map,
        source: new ol.source.Vector({
            features: collection,
            useSpatialIndex: false // optional, might improve performance
        }),
		style : function(feature, resolution) {
			console.log("funcion highlight");
			var text = resolution < 5000 ? feature.get('name') : '';
			if (!highlightStyleCache[text]) {
				console.log("highlight22");
				highlightStyleCache[text] = [ new ol.style.Style({
					image : new ol.style.Circle({
						radius : 15,
						fill : new ol.style.Fill({
							color : 'rgba(0, 255, 0, 0.1)'
						}),
						stroke : new ol.style.Stroke({
							color : 'green',
							width : 1
						})
					}),
					stroke : new ol.style.Stroke({
						color : '#f00',
						width : 1
					}),
					fill : new ol.style.Fill({
						color : 'rgba(255,0,0,0.1)'
					}),
					text : new ol.style.Text({
						font : '12px Calibri,sans-serif',
						text : text,
						fill : new ol.style.Fill({
							color : '#000'
						}),
						stroke : new ol.style.Stroke({
							color : '#f00',
							width : 3
						})
					})
				}) ];
			}
			return highlightStyleCache[text];
		},
		updateWhileAnimating: true, // optional, for instant visual feedback
		updateWhileInteracting: true // optional, for instant visual feedback
	});

	var highlight;
	var displayFeatureInfo = function(pixel) {

		var feature = map.forEachFeatureAtPixel(pixel,
				function(feature, layer) {
					return feature;
				});

		// console.log(feature.getId());
		// console.log(feature.get('title'));
		if (!feature.getId() && (feature.getId() != 0)) {
			// Si no es un punto pasamos
			// console.log(feature.getId());
			console.log("no es un punto");
			return;
		}

		var coordinate = feature.getGeometry().getCoordinates();
		overlay.setPosition(coordinate);

		content.innerHTML = '<p>Fecha:</p><code>' + feature.get('title')
				+ '</code>';
		// content.innerHTML = '<p>You clicked here:</p><code>Hola</code>';
		container.style.display = 'block';

		if (feature !== highlight) {
			if (highlight) {
				featureOverlay.getSource().removeFeature(highlight);
			}
			if (feature) {
				featureOverlay.getSource().addFeature(feature);
			}
			highlight = feature;
		}

	};

	map.on('click', function(evt) {
		displayFeatureInfo(evt.pixel);
	});
}

function initCapas() {
	map.getLayers().forEach(function(layer) {
		layer.setVisible(false);
	});
}

function actualizarGeoJson(num_marcadores, year, month) {
	map.removeLayer(vectorLayer);
	console.log(num_marcadores);
	cargarGeoJson(num_marcadores, year, month);
	map.addLayer(vectorLayer);
}

function cargarGeoJson(num_marcadores, year, month) {
	// Points
	var createPointStyleFunction = function(feature, resolution) {
		//return function(feature, resolution) {
			var geometry = feature.getGeometry();
			var style = [new ol.style.Style({
				image : new ol.style.Circle({
					radius : 10,
					fill : new ol.style.Fill({
						color : 'rgba(255, 0, 0, 0.1)'
					}),
					stroke : new ol.style.Stroke({
						color : 'red',
						width : 1
					})
				}),
				fill : new ol.style.Fill({
					color : 'rgba(255,255,255,0.4)'
				}),
				stroke : new ol.style.Stroke({
					color : '#3399CC',
					width : 1.25
				})
			// text : createTextStyle(feature, resolution, myDom.points)
			})];
			//console.log("WTF");
/*			console.log(geometry);
			geometry.forEachSegment(function(start, end) {
			    console.log("forEachSegment");
                var dx = end[0] - start[0];
                var dy = end[1] - start[1];
                var rotation = Math.atan2(dy, dx);
                // arrows
                styles.push(new ol.style.Style({
                  geometry: new ol.geom.Point(end),
                  image: new ol.style.Icon({
                    src: 'markers/arrow.png',
                    anchor: [0.75, 0.5],
                    rotateWithView: false,
                    rotation: -rotation
                  })
                }));
            });*/
			
			return style;
		};
//	};
	
	// Line
	var createLineStyleFunction = function() {
		return function(feature, resolution) {
			var geometry = feature.getGeometry();
			var styles = [
                // linestring
                new ol.style.Style({
                  stroke: new ol.style.Stroke({
                    color: '#ffcc33',
                    width: 2
                  })
                })
            ];
			console.log(geometry);
			console.log("para cada segmento algo!");
			geometry.forEachSegment(function(start, end) {
			    console.log("forEachSegment");
                var dx = end[0] - start[0];
                var dy = end[1] - start[1];
                var rotation = Math.atan2(dy, dx);
                // arrows
                styles.push(new ol.style.Style({
                  geometry: new ol.geom.Point(end),
                  image: new ol.style.Icon({
                    src: 'markers/arrow.png',
                    anchor: [0.75, 0.5],
                    rotateWithView: false,
                    rotation: -rotation
                  })
                }));
            });
			
			return style;
		};
	};

	MAX_marcadores = num_marcadores;
	geoJsonSource = new ol.source.Vector({
//		projection : 'EPSG:3857',
		url : 'tsv-to-geojson.php?file=' + year + '_' + month,
		format: new ol.format.GeoJSON()
	// url : today
	});
	vectorLayer = new ol.layer.Vector({
		source : geoJsonSource,
		style : createPointStyleFunction
	});
	var key = geoJsonSource
			.on(
					'change',
					function() {
						if (geoJsonSource.getState() == 'ready') {
							geoJsonSource.unByKey(key);
							// do something with the source
							console.log("algo ");
							// var features = geoJsonSource.getFeatures();
							var id_pos = 0;
							var id_pos_validos = 0;
							if (vectorLayer.getSource().getFeatures().length < MAX_marcadores) {
								MAX_marcadores = vectorLayer.getSource()
										.getFeatures().length;
								console.log("algo2 ");
							}
							//console.log(vectorLayer.getSource().getFeatures().length);
							//console.log(MAX_marcadores);
							while (vectorLayer.getSource().getFeatures().length > MAX_marcadores) {
								// var marcador =
								// vectorLayer.getSource().getFeatures()[vectorLayer.getSource().getFeatures().length
								// - 1];
								var marcador = vectorLayer.getSource()
										.getFeatureById(id_pos);
//    							console.log(marcador);
    							id_pos++;
    							if (marcador != null) {
    							    id_pos_validos++;
    								vectorLayer.getSource().removeFeature(marcador);
								} else {
								    console.log("algo null");
								    console.log(id_pos);
								}
							}
							
							var id_pos_final = id_pos_validos + MAX_marcadores - 1;
							//console.log(id_pos);
							//console.log(MAX_marcadores);
							//console.log(vectorLayer.getSource().getFeatures().length);
							//console.log(id_pos_final);
							marcador = vectorLayer.getSource().getFeatureById(id_pos_final);
							//marcador = vectorLayer.getSource().getFeatureById(id_pos + MAX_marcadores - 1);
                            console.log(marcador);
							/* Ponerle un estilo al ultimo */
							style = new ol.style.Style({
								image : new ol.style.Icon(({
									anchor : [ 0.5, 1 ],
									anchorXUnits : 'fraction',
									anchorYUnits : 'fraction',
									src : 'markers/marker-green.png' // icons[
								// Math.floor(rnd
								// *
								// (icons.length-1)
								// ) ]
								}))
							/*
							 * image : new ol.style.Circle({ radius : 10, fill :
							 * new ol.style.Fill({ color : 'rgba(0, 255, 0,
							 * 0.1)' }), stroke : new ol.style.Stroke({ color :
							 * 'green', width : 1 }) }), stroke: new
							 * ol.style.Stroke({ color: '#f00', width: 1 }),
							 * fill: new ol.style.Fill({ color:
							 * 'rgba(255,0,0,0.1)' })
							 */
							});
							marcador.setStyle(style);
							/**/

							map.getView().setCenter(
									marcador.getGeometry().getCoordinates());
							var features = [];// new Array(MAX_marcadores);
							var i;
							
							var startPoint = vectorLayer.getSource()
									.getFeatureById(id_pos).getGeometry()
									.getCoordinates();
							id_pos++;
							var endPoint = vectorLayer.getSource()
									.getFeatureById(id_pos).getGeometry()
									.getCoordinates();
							id_pos++;
							features.push(new ol.Feature({
								'geometry' : new ol.geom.LineString([
										startPoint, endPoint ])
							}));
							for (i = 0; i < MAX_marcadores - 1; ++i) {
								startPoint = endPoint;
								marcador = vectorLayer.getSource()
										.getFeatureById(id_pos);
								if (marcador != null) {
    								endPoint = marcador.getGeometry()
    										.getCoordinates();
    								// features[i] = new ol.Feature({
    								features.push(new ol.Feature({
    									'geometry' : new ol.geom.LineString([
    											startPoint, endPoint ])
    								}));
								} else {
								    console.log("marcador null");
								    console.log(i);
								    console.log(id_pos);
								}
								// startPoint = endPoint;
								// endPoint =
								// vectorLayer.getSource().getFeatureById(id_pos).getGeometry().getCoordinates();
								id_pos++;
							}
							// console.log(features);
							geoJsonSource.addFeatures(features);
							// console.log(marcador.getGeometry().getCoordinates());
						}
					});
}

function actualizarPuntosMapa() {
	var ym = document.getElementById('yearmonth').value;
	var yearmonth = ym.split("-");
	var yyyy = yearmonth[0];
	var mm = yearmonth[1];
	// console.log(ym);

	var puntosMapa = document.getElementById('puntos');
	actualizarGeoJson(parseInt(puntosMapa.value), yyyy, mm);
}
