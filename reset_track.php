<?php

include "app_settings.php";

if ($_GET['reset_key'] != $reset_key) {
    echo "keys do not match";
    return;
}

$loc = $_GET['leg'];

if ($loc) {
    $file = "./resources/$loc.latest";
    $hist = "./resources/$loc.history";
} else {
    $file = "./resources/location.latest";
    $hist = "./resources/location.history";
}

$f = fopen($file, 'w');
fclose($file);

$kml = fopen($hist, 'w');
fclose($kml);

echo "$hist and $file successfully reset";

?>
