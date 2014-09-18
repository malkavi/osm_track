var map, pois, marcador, vectorLayer, lastfeature, testLayer, geoJsonSource;
MAX_marcadores = 30;
//var createPointStyleFunction;

function init() {
//	callPage('tsv-to-geojson.php');
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
      element: container
    });
	
	//console.log("init()");
	//iconoUltimaPos = 'http://dev.openlayers.org/img/marker-green.png';
	//iconoPos = 'http://dev.openlayers.org/img/marker.png';

	var osm = new ol.layer.Tile({
		source : new ol.source.OSM()
	});
	var bing = new ol.layer.Tile(
	{
		source : new ol.source.BingMaps(
				{
					key : 'Ak-dzM4wZjSqTlzveKz5u0d4IQ4bRzVI309GxmkgSVr1ewS6iPSrOvOKhA-CJlm3',
					imagerySet : 'Aerial'
				})
	});
	
	var mapQO = new ol.layer.Tile({
        style: 'Road',
        source: new ol.source.MapQuest({layer: 'osm'})
    });
    var mapQS = new ol.layer.Tile({
        style: 'Aerial',
        source: new ol.source.MapQuest({layer: 'sat'})
    });
    var mapQH = new ol.layer.Tile({
        style: 'Aerial',
        source: new ol.source.MapQuest({layer: 'hyb'})
    });
    var staT = new ol.layer.Tile({
      source: new ol.source.Stamen({
        layer: 'terrain'
      })
    });
    var staW = new ol.layer.Tile({
      source: new ol.source.Stamen({
        layer: 'watercolor'
      })
    });
    var staTL = new ol.layer.Tile({
      source: new ol.source.Stamen({
        layer: 'terrain-labels'
      })
    });
    
    var today = new Date();
    var mm = today.getMonth()+1; //January is 0!
    var yyyy = today.getFullYear();
    if(mm<10) {
        mm='0'+mm
    } 
    //var fechayearmonth = document.getElementById('yearmonth');
    document.getElementById('yearmonth').value = yyyy+'-'+mm;
    document.getElementById('yearmonth').max = yyyy+'-'+mm;
    
    cargarGeoJson(30, yyyy, mm);

/*	// Points
	createPointStyleFunction = function() {
		return function(feature, resolution) {
			var style = new ol.style.Style({
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
				fill: new ol.style.Fill({
                    color: 'rgba(255,255,255,0.4)'
                }),
                stroke: new ol.style.Stroke({
                    color: '#3399CC',
                    width: 1.25
                })
//				text : createTextStyle(feature, resolution, myDom.points)
			});
			return [ style ];
		};
	};

	geoJsonSource = new ol.source.GeoJSON({
				projection : 'EPSG:3857',
				url : 'tsv-to-geojson.php'
	});

	vectorLayer = new ol.layer.Vector({
		source : geoJsonSource,
		style : createPointStyleFunction()
	});
	                                                                                        
	var key = geoJsonSource.on('change', function() {
		if (geoJsonSource.getState() == 'ready') {
			geoJsonSource.unByKey(key);
			// do something with the source
			console.log("algo ");
			//var features = geoJsonSource.getFeatures();
			var id_pos = 0;
			while (vectorLayer.getSource().getFeatures().length > MAX_marcadores){
//				var marcador = vectorLayer.getSource().getFeatures()[vectorLayer.getSource().getFeatures().length - 1];
				var marcador = vectorLayer.getSource().getFeatureById(id_pos);
				id_pos++;
//				console.log(marcador);
				vectorLayer.getSource().removeFeature(marcador);
			}
			marcador = vectorLayer.getSource().getFeatureById(id_pos + MAX_marcadores - 1);
			map.getView().setCenter(marcador.getGeometry().getCoordinates());
			var features = [];//new Array(MAX_marcadores);
			var i;
			var startPoint = vectorLayer.getSource().getFeatureById(id_pos).getGeometry().getCoordinates();
			id_pos++;
            var endPoint = vectorLayer.getSource().getFeatureById(id_pos).getGeometry().getCoordinates();
            id_pos++;
            features.push(new ol.Feature({
                'geometry': new ol.geom.LineString([startPoint, endPoint])
            }));
			for (i = 0; i < MAX_marcadores-2; ++i) {
			    startPoint = endPoint;
                endPoint = vectorLayer.getSource().getFeatureById(id_pos).getGeometry().getCoordinates();
    			//features[i] = new ol.Feature({
    			features.push(new ol.Feature({
                    'geometry': new ol.geom.LineString([startPoint, endPoint])
                }));
                //startPoint = endPoint;
                //endPoint = vectorLayer.getSource().getFeatureById(id_pos).getGeometry().getCoordinates();
                id_pos++;
			}
			//console.log(features);
			geoJsonSource.addFeatures(features);
//			console.log(marcador.getGeometry().getCoordinates());
		}
	});*/

    var scaleLineControl = new ol.control.ScaleLine();
    //scaleLineControl.setUnits('metric');
	map = new ol.Map({
		layers : [ osm, bing, mapQO, mapQS, mapQH, staT, staW, staTL, vectorLayer ],
		overlays: [overlay],
		target : 'map',
		controls: ol.control.defaults({
            attributionOptions: /** @type {olx.control.AttributionOptions} */ ({
              collapsible: false
            })
        }).extend([
            scaleLineControl
        ]),
		view : new ol.View({
			center : [ 0, 0 ],
			zoom : 14
		})
	});
	initCapas();
	osm.setVisible(true);
	vectorLayer.setVisible(true);
	//var visibleOSM = new ol.dom.Input(document.getElementById('visibleOSM'));
    //visibleOSM.bindTo('checked', osm, 'visible');
    //var visible = new ol.dom.Input(document.getElementById('visibleBing'));
    //visible.bindTo('checked', bing, 'visible');
    var boton = document.getElementById('bttrefresh');
    boton.addEventListener('click', function(){
        actualizarPuntosMapa();
        //actualizarGeoJson(parseInt(document.getElementById('puntos').value));
    }, false);
    
    var capasSelect = document.getElementById('capas');
    capasSelect.addEventListener('change', function() {
        //console.log(capasSelect.selectedIndex);
        initCapas();
        vectorLayer.setVisible(true);
        switch (capasSelect.selectedIndex) {
            case 0:
                //OSM
                osm.setVisible(true);
                //actualizarGeoJson(100);
                break;
            case 1:
                //Bing
                bing.setVisible(true);
                //osm.setVisible(false);
                break;
            case 2:
                //MapQuest OSM
                mapQO.setVisible(true);
                //osm.setVisible(false);
                break;
            case 3:
                //MapQuest Sat
                mapQS.setVisible(true);
                //osm.setVisible(false);
                break;
            case 4:
                //MapQuest HYB
                mapQH.setVisible(true);
                //osm.setVisible(false);
                break;
            case 5:
                //Stamen Terrain
                staTL.setVisible(true);
                staT.setVisible(true);
                //osm.setVisible(false);
                break;
            case 6:
                //Stamen WaterColors
                staTL.setVisible(true);
                staW.setVisible(true);
                //osm.setVisible(false);
                break;
        }
        //console.log("change");
		map.render();
    }, false);
	//console.log(capasSelect);
	
	//var unitsSelect = new ol.dom.Input(document.getElementById('units'));
    //unitsSelect.bindTo('value', scaleLineControl, 'units');

	/*var swipe = document.getElementById('swipe');

	bing.on('precompose', function(event) {
		var ctx = event.context;
		var width = ctx.canvas.width * (swipe.value / 100);

		ctx.save();
		ctx.beginPath();
		ctx.rect(width, 0, ctx.canvas.width - width, ctx.canvas.height);
		ctx.clip();
	});

	bing.on('postcompose', function(event) {
		var ctx = event.context;
		ctx.restore();
	});

	swipe.addEventListener('input', function() {
		map.render();
	}, false);*/
	
	//Evento click
	var highlightStyleCache = {};
	
	var featureOverlay = new ol.FeatureOverlay({
		map: map,
		style: function(feature, resolution) {
			console.log("funcion highlight");
			var text = resolution < 5000 ? feature.get('name') : '';
			if (!highlightStyleCache[text]) {
				console.log("highlight22");
				highlightStyleCache[text] = [new ol.style.Style({
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
					stroke: new ol.style.Stroke({
						color: '#f00',
						width: 1
					}),
					fill: new ol.style.Fill({
						color: 'rgba(255,0,0,0.1)'
					}),
					text: new ol.style.Text({
						font: '12px Calibri,sans-serif',
						text: text,
						fill: new ol.style.Fill({
							color: '#000'
						}),
						stroke: new ol.style.Stroke({
							color: '#f00',
							width: 3
						})
					})
				})];
			}
			return highlightStyleCache[text];
		}
	});
	
	var highlight;
	var displayFeatureInfo = function(pixel) {
	
    	var feature = map.forEachFeatureAtPixel(pixel, function(feature, layer) {
    		return feature;
    	});
    	
    	//console.log(feature.getId());
    	//console.log(feature.get('title'));
    	if (!feature.getId() && (feature.getId() != 0)){
    	    //Si no es un punto pasamos
    	    //console.log(feature.getId());
    	    console.log("no es un punto");
    	    return;
    	}
    
    	var coordinate = feature.getGeometry().getCoordinates();
        overlay.setPosition(coordinate);
    
        content.innerHTML = '<p>Fecha:</p><code>' + feature.get('title') + '</code>';
        //content.innerHTML = '<p>You clicked here:</p><code>Hola</code>';
        container.style.display = 'block';
    	    
    	
    	if (feature !== highlight) {
    		if (highlight) {
    			featureOverlay.removeFeature(highlight);
    		}
    		if (feature) {
    			featureOverlay.addFeature(feature);
    		}
    		highlight = feature;
    	}
	
	};
	
	map.on('click', function(evt) {
		displayFeatureInfo(evt.pixel);
	});
}

function AjaxCaller(){
	var xmlhttp=false;
	try{
		xmlhttp = new ActiveXObject("Msxml2.XMLHTTP");
	}catch(e){
		try{
			xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
		}catch(E){
			xmlhttp = false;
		}
	}

	if(!xmlhttp && typeof XMLHttpRequest!='undefined'){
		xmlhttp = new XMLHttpRequest();
	}
	return xmlhttp;
}

function callPage(url){
	ajax=AjaxCaller(); 
	ajax.open("GET", url, true); 
	ajax.onreadystatechange=function(){
		if(ajax.readyState==4){
			if(ajax.status==200){
				console.log("pagina leida");
				geoJsonLeido = ajax.responseText;
				//console.log(geoJsonLeido);
				loadMap();
			}
		}
	}
	ajax.send(null);
}

function initCapas(){
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
	var createPointStyleFunction = function() {
		return function(feature, resolution) {
			var style = new ol.style.Style({
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
				fill: new ol.style.Fill({
                    color: 'rgba(255,255,255,0.4)'
                }),
                stroke: new ol.style.Stroke({
                    color: '#3399CC',
                    width: 1.25
                })
//				text : createTextStyle(feature, resolution, myDom.points)
			});
			return [ style ];
		};
	};
    
    MAX_marcadores = num_marcadores;
    geoJsonSource = new ol.source.GeoJSON({
		projection : 'EPSG:3857',
		url : 'tsv-to-geojson.php?file='+year+'_'+month
		//url : today
    });
    vectorLayer = new ol.layer.Vector({
		source : geoJsonSource,
		style : createPointStyleFunction()
	});
	var key = geoJsonSource.on('change', function() {
		if (geoJsonSource.getState() == 'ready') {
			geoJsonSource.unByKey(key);
			// do something with the source
			console.log("algo ");
			//var features = geoJsonSource.getFeatures();
			var id_pos = 0;
			if (vectorLayer.getSource().getFeatures().length < MAX_marcadores) {
			    MAX_marcadores = vectorLayer.getSource().getFeatures().length;
			}
			while (vectorLayer.getSource().getFeatures().length > MAX_marcadores){
//				var marcador = vectorLayer.getSource().getFeatures()[vectorLayer.getSource().getFeatures().length - 1];
				var marcador = vectorLayer.getSource().getFeatureById(id_pos);
				id_pos++;
//				console.log(marcador);
				vectorLayer.getSource().removeFeature(marcador);
			}
			//console.log(id_pos);
			//console.log(id_pos + MAX_marcadores - 1);
			marcador = vectorLayer.getSource().getFeatureById(id_pos + MAX_marcadores - 1);
			
			/*Ponerle un estilo al ultimo*/
			style = new ol.style.Style({
                image: new ol.style.Icon(({
                    anchor: [0.5, 1],
                    anchorXUnits: 'fraction',
                    anchorYUnits: 'fraction',
                    src: 'markers/marker-green.png' //icons[ Math.floor(rnd * (icons.length-1) ) ]
                }))
                /*image : new ol.style.Circle({
					radius : 10,
					fill : new ol.style.Fill({
						color : 'rgba(0, 255, 0, 0.1)'
					}),
					stroke : new ol.style.Stroke({
						color : 'green',
						width : 1
					})
				}),
				stroke: new ol.style.Stroke({
					color: '#f00',
					width: 1
				}),
				fill: new ol.style.Fill({
					color: 'rgba(255,0,0,0.1)'
				})*/
            });
            marcador.setStyle(style);
			/**/
			
			map.getView().setCenter(marcador.getGeometry().getCoordinates());
			var features = [];//new Array(MAX_marcadores);
			var i;
			var startPoint = vectorLayer.getSource().getFeatureById(id_pos).getGeometry().getCoordinates();
			id_pos++;
            var endPoint = vectorLayer.getSource().getFeatureById(id_pos).getGeometry().getCoordinates();
            id_pos++;
            features.push(new ol.Feature({
                'geometry': new ol.geom.LineString([startPoint, endPoint])
            }));
			for (i = 0; i < MAX_marcadores-2; ++i) {
			    startPoint = endPoint;
                endPoint = vectorLayer.getSource().getFeatureById(id_pos).getGeometry().getCoordinates();
    			//features[i] = new ol.Feature({
    			features.push(new ol.Feature({
                    'geometry': new ol.geom.LineString([startPoint, endPoint])
                }));
                //startPoint = endPoint;
                //endPoint = vectorLayer.getSource().getFeatureById(id_pos).getGeometry().getCoordinates();
                id_pos++;
			}
			//console.log(features);
			geoJsonSource.addFeatures(features);
//			console.log(marcador.getGeometry().getCoordinates());
		}
	});
}

function actualizarPuntosMapa() {
    var ym = document.getElementById('yearmonth').value;
    var yearmonth = ym.split("-");
    var yyyy = yearmonth[0];
    var mm = yearmonth[1];
    //console.log(ym);
    
    var puntosMapa = document.getElementById('puntos');
    actualizarGeoJson(parseInt(puntosMapa.value), yyyy, mm);
}
