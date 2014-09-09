<!DOCTYPE html>

<?php

$loc = $_GET['leg'];
if ($loc) {
    $file = file_get_contents("../resources/$loc.latest");
    $hist = file_get_contents("../resources/$loc.history");
} else {
    $file = file_get_contents("../resources/location.latest");
    $hist = file_get_contents("../resources/location.history");
}

$data = unserialize($file);

$lat = $data['lat'];
$lon = $data['lon'];
$tstamp = $data['timestamp'];

include "../app_settings.php";

?>

 <html>
  <head>
   <title>OsmAnd Location</title>
   <meta charset="UTF-8">
   <meta name="viewport" content="width=device-width">
   <script type="text/javascript" src="http://maps.google.com/maps/api/js?&sensor=false"></script>
   <script type="text/javascript">
    function initialize() {
     var latlng = new google.maps.LatLng(<?=$lat?>, <?=$lon?>);
     var mapOptions = {
         zoom: 15,
         center: latlng,
         mapTypeId: google.maps.MapTypeId.HYBRID
     };
     var container = document.getElementById("mapContainer");
     var map = new google.maps.Map(container, mapOptions);

     var marker1 = new google.maps.Marker({
         position: latlng,
         map: map});
     marker1.setMap(map);
     var pathCoordinates = [<?php 
                             if ($hist){
                              echo $hist;
                             } else {
                              echo "new google.maps.LatLng($lat, $lon)";
                             }
                            ?>];

     var mapPath = new google.maps.Polyline({
         path: pathCoordinates,
         geodesic: true,
         strokeColor: '#FF0000',
         strokeOpacity: 1.0,
         strokeWeight: 3
        });

     mapPath.setMap(map);
    }
   </script>
  </head>

  <body onload="initialize()">
   <div id="textContainer" style="width:500px">
     <b>
     Last Location Update:
      <?php
        echo date('Y-m-d H:i:s', substr($tstamp,0,-3));
	echo "<br>Lat: $lat, Lon: $lon";
      ?>
     </b>
   </div>
   <div id="mapContainer" style="width:500px;height:600px"></div>
 </body>
</html>
