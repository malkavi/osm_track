<?php

$fl = file_get_contents('/tmp/location.latest');
$data = unserialize($fl);

foreach ($data as $key => $value) {
   echo "Key: $key; Value: $value<br />\n";
}

?>
