import {init, MAX_marcadores, centrar } from './localizacion.js'
import {tablaMarcadores, test as posicionar} from './tablasTsv.js'
console.log("Module index.html");
document.addEventListener("DOMContentLoaded", function(event) {
    console.log("DOM fully loaded and parsed");
    var mimapa = init();
    console.log(MAX_marcadores);
    tablaMarcadores("#miTabla2");
    console.log("fin listener");
    console.log("Mi mapalistener:");
    console.log(Liblocalizacion.map);
//    Liblocalizacion.map = mimapa;
//    console.log(Liblocalizacion.map);
    console.log(mimapa);
});
