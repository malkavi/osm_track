<?php
/*
 * Title:   CSV to GeoJSON
 * Notes:   Convert a comma separated CSV file of points with x & y fields to GeoJSON format, suitable for use in OpenLayers, Leaflet, etc. Only point features are supported.
 * Author:  Bryan R. McBride, GISP
 * Contact: bryanmcbride.com
 * GitHub:  https://github.com/bmcbride/PHP-Database-GeoJSON
*/

# Read the CSV file

$file = $_GET['file'];

if ($file) {
    $csvfile = 'loc_'.$file.'.tsv';
    //$csvfile = 'loc_2014_09.tsv';
} else {
    $csvfile = '../map2/textfile.txt';
}

$handle = fopen($csvfile, 'r');

# Build GeoJSON feature collection array
$geojson = array(
    'type' => 'FeatureCollection',
    'features' => array()
);

# Loop through rows to build feature arrays
$header = NULL;
$id_pos = 0;
while (($row = fgetcsv($handle, 1000, "\t")) !== FALSE) {
    if (!$header) {
        $header = $row;
    } else {
        $data = array_combine($header, $row);
        $properties = $data;
        # Remove x and y fields from properties (optional)
        unset($properties['x']);
        unset($properties['y']);
        $feature = array(
            'type' => 'Feature',
            'geometry' => array(
                'type' => 'Point',
                'coordinates' => array(
                    $data['lon'],
                    $data['lat']
                )
            ),
            'properties' => $properties,
            'id' => $id_pos
        );
        $id_pos++;
        # Add feature arrays to feature collection array
        array_push($geojson['features'], $feature);
    }
}
fclose($handle);

header('Content-type: application/json');
echo json_encode($geojson, JSON_NUMERIC_CHECK);
?>
