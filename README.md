Track system based on another project with new modifications to use OpenLayers instead of Google Maps

Track system based on: https://github.com/jdstemmler/osmand-live-track
# OsmAnd Live Tracker
## Jayson Stemmler

### Intro
Welcome to the OsmAnd Live Tracker. This small little application works 
(primarily) by integrating with the online tracking functionality of the 
OsmAnd+ android application wich sends location data at a set interval to a 
web address. This application uses the Google Maps API to display both the 
most recent location and a history on a map.

### Disclaimer
This particular setup works well on my system. I cannot guarantee that it will 
work well on yours. All parts of this are experimental, and could potentially 
cease to function or exist at any time. Your mileage may vary.

### Usage and Operation
This package works by accepting the location through the `./tracking.php` script
 and saves the location in two different places:

* ./resources/location.latest - the most recent location sent to `tracking.php` 
  is stored in this file. It is overwritten upon each call to `tracking.php`. 
  This location is represented by a pin on the google map and is the 
  centerpoint of the map.

* ./resources/location.history - location data is appended to this file each 
  time data is sent to `tracking.php`. This historical location information 
  is shown as a simple line segment on the map.

Make sure that the `resources` folder has the appropriate write permissions 
such that the user `www_data` can create the files in the `resources` folder.

The actual data is displayed via the `index.php` file in the map directory. 
If the site is hosted at, for example, `www.example.com`, the map could be 
displayed by visiting `www.example.com/map/`. 

The historical location track will be displayed for as long as there is 
location data in the `log.body` file. To reset this file, one simply has to 
visit `www.example.com/reset_track.php` and the `log.body` file will be 
overwritten by a blank file. This effectively clears out the track.

I admit that the use is a bit "hackey" as one might say, but it is functional.
This fulfills my requirements for it at the moment, but that's not to say 
further development will not happen.

### Notes
