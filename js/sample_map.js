/*
 * Sample code to display maps
 * Copyright (c) 2013 Cybozu
 * 
 * Licensed under the MIT License
 */
(function(){

    "use strict";

    // Show the map using address field value when the record is displayed
    kintone.events.on('app.record.detail.show', function(event){

        var timeout = 10 * 1000; // ms
        var interval = 100;  // ms

        var check = document.getElementsByName('map_latlng');

        if(check.length == 0){

            // enable google maps to call document.write after onload event.
            var nativeWrite = document.write;
            document.write = function(html) {
                var m = html.match(/script.+src="([^"]+)"/);
                if (m) {
                    load(m[1]);
               } else {
                    nativeWrite(html);
               } 
            };

            // Load Google Map API Library
            load('https://maps-api-ssl.google.com/maps/api/js?v=3&sensor=false');

            waitLoaded();   

        }

        // Wait until Google Map loads
        function waitLoaded() {
            setTimeout(function () {
                timeout -= interval;
                if ((typeof google !== 'undefined')
                    && (typeof google.maps !== 'undefined')
                    && (typeof google.maps.version !== 'undefined')) {
                    setLocation_address();  // Show the map according to address value
                } else if (timeout > 0) {
                    waitLoaded();
                } else {
                    // abort
                }
            }, interval);
        }

	    // Show the map under Address field
	    function setLocation_address() {

	        var locationEl_address = kintone.app.record.getFieldElement('address');
	        if (locationEl_address.length == 0) { return; }

	        var check = document.getElementsByName('map_address');

	        // Check if 'map_address' element does not exist
	        if(check.length !== 0){ return; }

	        // Create div element to show the map
	        var mapEl_address = document.createElement('div');
	        mapEl_address.setAttribute('id', 'map_address');
	        mapEl_address.setAttribute('name', 'map_address');

	        // Add 'mapEl_address' element under 'Map' field
			var elMap = kintone.app.record.getSpaceElement('Map');
			elMap.appendChild(mapEl_address);

	        // Define Google Geocoder
	        var gc = new google.maps.Geocoder(); 

	        // Get value from Address field
	        var rec = kintone.app.record.get();
	        var addressValue = rec.record.address.value;

	        // Execute Geocoding API
	        gc.geocode({
	            address: addressValue,
	            language: 'en-us',
	            country: 'US'
	        }, function(results, status) {
	            if (status == google.maps.GeocoderStatus.OK) {

	                // Set size of map element
	                mapEl_address.setAttribute('style', 'width: 300px; height: 250px');

	                var point = results[0].geometry.location;
	                var address = results[0].formatted_address;

	                // Set center of the map and zoom size
	                var opts = {
	                    zoom: 15,
	                    center: point,
	                    mapTypeId: google.maps.MapTypeId.ROADMAP,
	                    scaleControl: true
	                };

	                var map_address = new google.maps.Map(document.getElementById('map_address'), opts);

	                // Set the marker
	                var marker = new google.maps.Marker({
	                    position: point,
	                    map: map_address,
	                    title: address
	                });

	            }
	        });

	    }
    });

    // Add the script to the header
    function load(src) {
        var head = document.getElementsByTagName('head')[0];         
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = src;
        head.appendChild(script);
    }

})();