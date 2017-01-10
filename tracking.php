<?php

include "app_settings.php";

$data['lat'] = $_GET['lat'];
$data['lon'] = $_GET['lon'];
$data['timestamp'] = $_GET['timestamp'];
//$data['hdop'] = $_GET['hdop'];
//$data['altitude'] = $_GET['altitude'];
//$data['speed'] = $_GET['speed'];
//$data['leg'] = $_GET['leg'];
$data['key'] = $_GET['key'];
$tasker = $_GET['tasker'];

if ($data['key'] != $tracking_key){
    echo "tracking key invalid";
    return;
}

if ( !$data['lon'] || !$data['lat'] || !$data['timestamp'] ) {
    echo "Faltan parametros";
    return;
}

$lat = $data['lat'];
$lon = $data['lon'];
//$loc = $data['leg'];

if ($tasker) {
   $lat = strtok($data['lat'],',');
   $lon = strtok(',');
   $data['lat'] = $lat;
   $data['lon'] = $lon;
}

/*if ($loc) {
    $file = "./resources/$loc.latest";
    $hist = "./resources/$loc.history";
} else {
    $file = "./resources/location.latest";
    $hist = "./resources/location.history";
}

$f = fopen($file, 'w');
fwrite($f, serialize($data));
fclose($f);*/

/*$body = fopen($hist, 'a');
fwrite($body, "new google.maps.LatLng(${lat}, ${lon}),\n");
fclose($body);*/

$epochFecha = intval($data['timestamp'] / 1000);
$fecha = date('d/m/Y H:i:s', $epochFecha);
/*$body = fopen("./map2/textfile.txt", 'a');
fwrite($body, "${lat}\t${lon}\t${fecha}\tEpoch: ${epochFecha}\thttp://dev.openlayers.org/img/marker.png\t16,16\t-8,-16\n");
fclose($body);*/

//Nuevo sustituo por meses, para liberar carga
$ficherofecha = date('Y_m', $epochFecha);
$nombreficheromensual = "./map3/loc_${ficherofecha}.tsv";
$data = "${lat}\t${lon}\t${fecha}\tEpoch: ${epochFecha}\thttp://dev.openlayers.org/img/marker.png\t16,16\t-8,-16\n";
if (!file_exists($nombreficheromensual)) {
    file_put_contents($nombreficheromensual, "lat\tlon\ttitle\tdescription\ticon\ticonSize\ticonOffset\n", FILE_APPEND);    
}
file_put_contents($nombreficheromensual, $data, FILE_APPEND);

?>

<b>saving location <?=$lat?>, <?=$lon?> to file</b>
