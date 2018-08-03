export {init, MAX_marcadores, map, centrar};

import Overlay from '../node_modules/ol/Overlay.js';
import Map from '../node_modules/ol/Map.js';
import Collection from '../node_modules/ol/Collection.js';
import {Tile as TileLayer, Vector as VectorLayer} from '../node_modules/ol/layer.js';
import {OSM, BingMaps, Stamen, Vector as VectorSource} from '../node_modules/ol/source.js';
import GeoJSON from '../node_modules/ol/format/GeoJSON.js';
import View from '../node_modules/ol/View.js';
import source from '../node_modules/ol/source.js';
import {defaults as defaultControls, Attribution, ScaleLine} from '../node_modules/ol/control.js';
import {Circle as CircleStyle, Fill, Stroke, Style, Text, Icon} from '../node_modules/ol/style.js';
import Feature from '../node_modules/ol/Feature.js';
import {LineString, Point} from '../node_modules/ol/geom.js';
import {unByKey} from '../node_modules/ol/Observable.js';

import {transform} from '../node_modules/ol/proj.js';


let map;
let pois, marcador, vectorLayer, lastfeature, testLayer, geoJsonSource;
let MAX_marcadores = 30;

//loadMap();

function init() {
	return loadMap();
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
	var overlay = new Overlay({
		element : container
	});

	// console.log("init()");
	// iconoUltimaPos = 'http://dev.openlayers.org/img/marker-green.png';
	// iconoPos = 'http://dev.openlayers.org/img/marker.png';

	var osm = new TileLayer({
		source : new OSM()
	});

	var osmtransp = new TileLayer(
			{
				source : new OSM(
						{
							attributions : [
									new Attribution(
											{
												html : 'All maps &copy; '
														+ '<a href="http://www.opencyclemap.org/">OpenCycleMap</a>'
											}), OSM.ATTRIBUTION ],
							url : 'http://{a-c}.tile.opencyclemap.org/transport/{z}/{x}/{y}.png'
						})
			});

	var osmcycle = new TileLayer(
			{
				source : new OSM(
						{
							attributions : [
									new Attribution(
											{
												html : 'All maps &copy; '
														+ '<a href="http://www.opencyclemap.org/">OpenCycleMap</a>'
											}), OSM.ATTRIBUTION ],
							url : 'http://{a-c}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png'
						})
			});

	var bing = new TileLayer(
			{
				visible: false,
				preload: Infinity,
				source : new BingMaps(
						{
							key : 'Au0_zzMAQznXGGdheWg3ze1B7DS_NurNGTiOxdEfFJzWRJt75kAwQyukcCjv9oF_',
							imagerySet : 'AerialWithLabels'
						})
			});

	var staT = new TileLayer({
		source : new Stamen({
			layer : 'terrain'
		})
	});
	var staW = new TileLayer({
		source : new Stamen({
			layer : 'watercolor'
		})
	});
	var staTL = new TileLayer({
		source : new Stamen({
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
	var scaleLineControl = new ScaleLine();
	// scaleLineControl.setUnits('metric');
	map = new Map({
		layers : [ osm, osmtransp, osmcycle, bing, staT,
				staW, staTL, vectorLayer ],
		overlays : [ overlay ],
		target : 'map',
		controls : defaultControls({
			attributionOptions : /** @type {olx.control.AttributionOptions} */
			({
				collapsible : true,
				collapsed : true
			})
		}).extend([ scaleLineControl ]),
		view : new View({
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

    var collection = new Collection();
	var featureOverlay = new VectorLayer({
		map : map,
        source: new VectorSource({
            features: collection,
            useSpatialIndex: false // optional, might improve performance
        }),
		style : function(feature, resolution) {
//			console.log("funcion highlight");
			var text = resolution < 5000 ? feature.get('name') : '';
			if (!highlightStyleCache[text]) {
				console.log("highlight22");
				highlightStyleCache[text] = [ new Style({
					image : new CircleStyle({
						radius : 15,
						fill : new Fill({
							color : 'rgba(0, 255, 0, 0.1)'
						}),
						stroke : new Stroke({
							color : 'green',
							width : 1
						})
					}),
					stroke : new Stroke({
						color : '#f00',
						width : 1
					}),
					fill : new Fill({
						color : 'rgba(255,0,0,0.1)'
					}),
					text : new Text({
						font : '12px Calibri,sans-serif',
						text : text,
						fill : new Fill({
							color : '#000'
						}),
						stroke : new Stroke({
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
		if (feature === undefined) {
			return;
		}
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
	global.map = map;
	return map;
}

function initCapas() {
	map.getLayers().forEach(function(layer) {
//		console.log(layer);
		if (layer instanceof TileLayer) {
			layer.setVisible(false);
		}
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
	var createPointStyleFunction = function(feature) {
		//return function(feature, resolution) {
			var geometry = feature.getGeometry();
			var style = [new Style({
				image : new CircleStyle({
					radius : 10,
					fill : new Fill({
						color : 'rgba(255, 0, 0, 0.1)'
					}),
					stroke : new Stroke({
						color : 'red',
						width : 1
					})
				}),
				fill : new Fill({
					color : 'rgba(255,255,255,0.4)'
				}),
				stroke : new Stroke({
					color : '#3399CC',
					width : 1.25
				})
			// text : createTextStyle(feature, resolution, myDom.points)
			})];
		return style;
	};

	// Line
	var createLineStyleFunction = function(feature) {
			var geometry = feature.getGeometry();
            if (geometry instanceof LineString) {
		var style = [
                    // linestring
                    new Style({
                        stroke: new Stroke({
                            color: 'red',
                            width: 2
                        })
                    })
                ];
//	        console.log("para cada segmento algo!");
                geometry.forEachSegment(function(start, end) {
//	            console.log("forEachSegment");
                    var dx = end[0] - start[0];
                    var dy = end[1] - start[1];
                    var rotation = Math.atan2(dy, dx);
                // arrows
                    style.push(new Style({
                      geometry: new Point(end),
                      image: new Icon({
                        src: 'markers/redarrow.png',
                        anchor: [0.75, 0.5],
                        rotateWithView: false,
                        rotation: -rotation
                      })
                    }));
                });
	    } else {
		var style = [
                    new Style({
			    image : new CircleStyle({
				radius : 10,
				fill : new Fill({
				color : 'rgba(255, 0, 0, 0.1)'
			    }),
			    stroke : new Stroke({
			    color : 'red',
		 	    width : 1
			})
		    }),
			fill : new Fill({
			color : 'rgba(255,255,255,0.4)'
		    }),
		    stroke : new Stroke({
			color : '#3399CC',
			width : 1.25
 		    })
                })];
            }

	    return style;
	};

	MAX_marcadores = num_marcadores;
	geoJsonSource = new VectorSource({
//		projection : 'EPSG:3857',
		url : 'tsv-to-geojson.php?file=' + year + '_' + month,
		format: new GeoJSON()
	// url : today
	});
	vectorLayer = new VectorLayer({
		source : geoJsonSource,
		//style : createPointStyleFunction
		style : createLineStyleFunction
	});
	var key = geoJsonSource
			.on(
					'change',
					function() {
						if (geoJsonSource.getState() == 'ready') {
//							geoJsonSource.unByKey(key);
							unByKey(key);
							// do something with the source
							//console.log("algo ");
							// var features = geoJsonSource.getFeatures();
							var id_pos = 0;
							var id_pos_validos = 0;
//							var id_pos_validos = vectorLayer.getSource().getFeatures().length;
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
								//		.getFeatureById(vectorLayer.getSource().getFeatures().length - 1);
								//		.getFeatures()[vectorLayer.getSource().getFeatures().length - 1];
										.getFeatureById(id_pos);
//    								console.log(marcador);
    								id_pos++;
    								if (marcador != null) {
    							    		id_pos_validos++;
    									vectorLayer.getSource().removeFeature(marcador);
								} else {
								    //console.log("algo null");
								    //console.log(id_pos);
								}
//								console.log(id_pos);
//								console.log(vectorLayer.getSource().getFeatures().length);
							}
							
							var id_pos_final = id_pos_validos + MAX_marcadores - 1;
//							var id_pos_final = id_pos_validos - 1;
//							console.log(id_pos);
//							console.log(MAX_marcadores);
//							console.log(vectorLayer.getSource().getFeatures().length);
//							console.log(id_pos_final);
//                                                      console.log(vectorLayer.getSource().getFeatures()[id_pos_final]);
							marcador = vectorLayer.getSource().getFeatureById(id_pos_final);
//                                                        marcador = vectorLayer.getSource().getFeatures()[id_pos_final];
							//marcador = vectorLayer.getSource().getFeatureById(id_pos + MAX_marcadores - 1);
                                                        console.log(marcador);
							/* Ponerle un estilo al ultimo */
							var style = new Style({
								image : new Icon(({
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
							console.log(marcador.getGeometry().getCoordinates());
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
							features.push(new Feature({
								'geometry' : new LineString([
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
    								features.push(new Feature({
    									'geometry' : new LineString([
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

function centrar(lon, lat) {
	var latLon = transform([lat, lon], "EPSG:4326", "EPSG:3857");
	global.map.getView().setCenter(latLon);
}

//export {init, MAX_marcadores, map, centrar};
