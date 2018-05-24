(function() {
    'use strict';

    // Download files attached to kintone
    function getFile(url) {
        var df = new $.Deferred();
        var xhr = new XMLHttpRequest();

        xhr.open('GET', url, true);
        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        xhr.responseType = 'blob';

        xhr.onload = function(e) {
            if (this.status === 200) {
                df.resolve(this.response);
            }
        };

        xhr.send();
        return df.promise();
    }

    // Convert geograhic information to percentages
    function toPercentage(ref, geo) {
        if (ref === 'N' || ref === 'E') {
            return geo[0] + geo[1] / 60 + geo[2] / 3600;
        } else if (ref === 'S' || ref === 'W') {
            return -(geo[0] + geo[1] / 60 + geo[2] / 3600);
        }
    }

    // Get coordinate information from EXIF
    function getExif(imageData) {
        var df = new $.Deferred();
        loadImage.parseMetaData(imageData, function(data) {
            // In case there is no EXIF data
            if (data.exif === undefined) {
                return df.resolve();
            }

            var gpsLatitude = data.exif.get('GPSLatitude');
            var gpsLatitudeRef = data.exif.get('GPSLatitudeRef');
            var gpsLongitude = data.exif.get('GPSLongitude');
            var gpsLongitudeRef = data.exif.get('GPSLongitudeRef');

            var latitude = toPercentage(gpsLatitudeRef, gpsLatitude);
            var longitude = toPercentage(gpsLongitudeRef, gpsLongitude);

            var position = {'longitude': longitude, 'latitude': latitude};

            df.resolve(position);
        });
        return df.promise();
    }

    // Transforms a coordinate from latlong to Web Mercator
    function convertCoordinate(longitude, latitude) {
        return ol.proj.transform([longitude, latitude], 'EPSG:4326', 'EPSG:3857');
    }

    // Create a layer to display a marker
    function makeMarkerOverlay(coordinate) {
        var imgElement = document.createElement('img');
        var imgSrc = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAAZCAYAAADe1WXtAAAABHNCSVQICAgIfAhkiAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAHwSURBVEiJpdW9a9NRFMbxT9qmNWmSRqlFhE6CLuIL1DcUHDqJm/0HBEUk3RQXpW7dXdysWlAEHQSlo4IoIohQKFJQxKWIIlTb5pc2anMdkmBbmleHZ3vul3Pvc865QggaCfu6uIOtTfkbGboYTRIN8yvJd5xoG4psmqk9LH0gBMJTQh+FJOPobAmKo718zbFcrACr+kI4TpThHQYbQhHr4WqG6MkG2FqtEsb5nWQJZ2pCMZDh5RBLc3WAa/WGsIMozV0k1kExnGR+jOKfJoFVLRBGKKT4jL0hBLq51kfhRZ2D04Qblfes5blNKcFynItwYTf5Ug3zc0KyolSlslrgIQpxxiCWYWaC0mbGUUIHASFDeFwD+Kjcbh/RWX3Tw1mixTYrzRP6iXBsXfppHl6m2M6bXqLYx4PNWmpnguhTi+m/L99iEf2bNn8P108RtQI9Qj5Ort5Ebenl27MmgfcoZZhFR93Zx8gu8o2GYIGQLYdzqKmFkuHtTVbrQXOsZJhsZUvtT1P4UQM4/S+cbS3t0xSTOVY2AkuEA+Q7Od/Okt6eID+7ATpRDmcGsba+k26unCRfBc6XRzXCwba+k0q18RRzUxXoOZZT3Kp3piG0Aj49SP41IcFPZP8bWmmxVwOsxDjbjL8pKPZ3c79eOGv1F5xHWAKxXNwiAAAAAElFTkSuQmCC';
        imgElement.setAttribute('src', imgSrc);

        var markerOverlay = new ol.Overlay({
            element: imgElement,
            position: coordinate,
            positioning: 'center-center'
        });

        return markerOverlay;
    }

    // Display the map and the marker
    function setPin(space, fileKeyList) {
        var map = new ol.Map({
            target: 'map',
            layers: [
                new ol.layer.Tile({
                    source: new ol.source.OSM()
                })
            ],
            view: new ol.View({
                zoom: 15
            })
        });

        Promise.all(fileKeyList.map(function(fileKey) {
            var fileUrl = '/k/v1/file.json?fileKey=' + fileKey;
            return getFile(fileUrl);
        })).then(function(imageBlobList) {
            return Promise.all(imageBlobList.map(function(imageBlob) {
                return getExif(imageBlob);
            }));
        }).then(function(positionList) {
            var existPosition = false;

            var minLongitude = 180, minLatitude = 90;
            var maxLongitude = -180, maxLatitude = -90;
            for (var i = 0; i < positionList.length; i++) {
                var position = positionList[i];
                // In case there is no EXIF data
                if (position === undefined || position.longitude === undefined || position.latitude === undefined) {
                    continue;
                }
                existPosition = true;

                var longitude = position.longitude;
                var latitude = position.latitude;
                var coordinate = convertCoordinate(longitude, latitude);
                var marker = makeMarkerOverlay(coordinate);
                map.addOverlay(marker);

                if (longitude < minLongitude) {
                    minLongitude = longitude;
                }
                if (latitude < minLatitude) {
                    minLatitude = latitude;
                }
                if (longitude > maxLongitude) {
                    maxLongitude = longitude;
                }
                if (latitude > maxLatitude) {
                    maxLatitude = latitude;
                }
            }

            if (existPosition === false) {
                $(space).text('Unable to display the map due to no location information');
                $(space).css('text-align', 'center').css('padding', '20px');
            } else if ((minLongitude === maxLongitude) && (minLatitude === maxLatitude)) {
                map.getView().setCenter(convertCoordinate(minLongitude, minLatitude));
            } else {
                // If there are multiple coordinates, calculate the center of the coordinates
                var extent = ol.proj.transformExtent([minLongitude, minLatitude, maxLongitude, maxLatitude],
                  'EPSG:4326', 'EPSG:3857');
                map.getView().fit(extent, map.getSize());
            }
        }).catch(function(error) {
            console.log('ERROR', error);
        });
    }

    kintone.events.on('app.record.detail.show', function(event) {
        var record = event.record;

        var space = kintone.app.record.getSpaceElement('map');
        $(space).append('<div id="map" style="width:400px; height:400px"></div>');

        var fileKeyList = [];
        for (var i = 0; i < record.pic.value.length; i++) {
            var fileKey = record.pic.value[i].fileKey;
            fileKeyList.push(fileKey);
        }

        setPin(space, fileKeyList);
    });

    kintone.events.on('app.record.index.show', function(event) {
        // If the map is already loaded, remove the map first
        if ($('div#map').length > 0) {
            $('div#map').remove();
        }

        var space = kintone.app.getHeaderSpaceElement();
        $(space).append('<div id="map" style="width:90%; height:400px"></div>');
        $('div#map').css('margin', '5px auto');

        var fileKeyList = [];
        for (var i = 0; i < event.records.length; i++) {
            var record = event.records[i];
            for (var j = 0; j < record.pic.value.length; j++) {
                var fileKey = record.pic.value[j].fileKey;
                fileKeyList.push(fileKey);
            }
        }

        setPin(space, fileKeyList);
    });

})();

