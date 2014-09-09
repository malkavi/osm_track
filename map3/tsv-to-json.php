#!/usr/bin/php
<?php

$f = fopen('../map2/textfile.txt', 'r');
$header = fgetcsv($f, 0, "\t");
$unserialize = array();
foreach ($header as $key) {
  if (strpos($key, 'php_') === 0) {
    $unserialize[] = $key;
  }
  if (strpos($key, 'key_') === 0) {
    $use_key = $key;
  }
}
$json = array();
while ($row = fgetcsv($f, 0, "\t")) {
  $data = array_combine($header, $row);
  foreach ($unserialize as $key) {
    $tmp = @unserialize($data[$key]);
    if ($tmp !== FALSE) {
      $data[$key] = $tmp;
    }
  }
  if (isset($use_key)) {
    $json[$data[$use_key]] = $data;
  }
  else {
    $json[] = $data;
  }
}
print json_encode($json);
