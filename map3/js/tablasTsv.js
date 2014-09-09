function tablaMarcadores(elemento) {
	d3.text("../map2/textfile.txt", function(datasetText) {
		var rows = d3.tsv.parseRows(datasetText);
		// console.log(rows);
		var tbl = d3.select(elemento).append("table").attr("id","miTabla4");;

		// Quitar las celdas que no quiero
		var cabeceras = rows[0].slice(0, 4);
		cabeceras.push("Ir");
		var celdas = rows.slice(1);
		if (celdas.length>MAX_marcadores){
			celdas =celdas.slice(celdas.length-MAX_marcadores);
		}
		//var latitud = new Array(celdas.length);
		//var longitud = new Array(celdas.length);
		//var pos = 0;
		//var posi = 0;
		//var celdasCopy = celdas;
		for ( var j = 0; j < celdas.length; j++) {
			celdas[j] = celdas[j].slice(0, 4);
			celdas[j].push("<a href=\"javascript:test(" + celdas[j][0] + ','
					+ celdas[j][1] + ")\">Posicion</a>");
			// celdas[j].push(('<div><a href=
			// "http://google.com">holita</a></div>'));
			// celdas[j].push("<a
			// href=\"www.google.es\">\"asda\"</a>");
			//longitud[pos] = celdas[j][0];
			//latitud[pos] = celdas[j][1];
			//pos++;
			//celdasCopy[(celdas.length-1)-j]= celdas[j];
		}
		var celdasCopy = celdas.slice();
//		console.log(celdasCopy.length);
//		console.log(celdas.length);
		for ( var j = 0; j < celdas.length; j++) {
			celdas[(celdas.length-1)-j]= celdasCopy[j];
//			console.log(j);
//			console.log((celdas.length-1)-j);
		}
		//celdas = celdasCopy;

		/*
		 * celdas.forEach(function(d) { d=d.slice(0,4); console.log(d); });
		 */

		// headers
		tbl.append("thead").append("tr").selectAll("th").data(cabeceras)
				.enter().append("th").text(function(d) {
					return d.charAt(0).toUpperCase() + d.substr(1);
				});

		// data
		tbl.append("tbody").selectAll("tr").data(celdas).enter().append("tr")

		// .append("a").attr("href", "javascript:test(" + 43 + ',' + 2 + ")")

		.selectAll("td").data(function(d) {
			// console.log(d[0]);
			// console.log(d[1]);
			// console.log("urrrr");
			// Por cada linea
			// .append("a").attr("href",
			// "javascript:test(" + longitud[posi] + ',' + latitud[posi] + ")")

			return d;
		}).enter().append("td").append("a").html(function(d) {
			// console.log("arg");
			//console.log(latitud[posi]);
			// console.log(d);
			// Por cada celda de todas las lineas
			return d;
		});

	});
}
// .attr('class','clickable').

function test(lon, lat) {
	// Funciona OK
	// console.log(lon);
	// console.log(lat);
	var lonLat = new OpenLayers.LonLat(lat, lon).transform(
			new OpenLayers.Projection("EPSG:4326"), // transform from WGS 1984
			map.getProjectionObject() // to Spherical Mercator Projection
	);

	var zoom = 16;
	map.setCenter(lonLat, zoom);
}

function tablaMarcadores2() {
	d3.text("textfile.txt", function(data) {
		var parsedCSV = d3.tsv.parseRows(data);

		var container = d3.select("#miTabla").append("table")

		.selectAll("tr").data(parsedCSV).enter().append("tr")

		.selectAll("td").data(function(d) {
			return d;
		}).enter().append("td").text(function(d) {
			return d;
		});
	});
}