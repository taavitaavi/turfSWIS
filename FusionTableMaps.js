/**
 * Created by taavi on 3/7/2017.
 */
function initMap() {
    var map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 47.4498756, lng: -99.1686378},
        zoom: 7
    });
    var infoWindow = new google.maps.InfoWindow();
    var ZIPLayer = new google.maps.FusionTablesLayer({
        query: {
            select: 'geometry',
            from: '1ncnLYkOUgr9qkI7RYNcmvJH0ThkqdcaSpRAIBvIf',
            where: " 'state' LIKE 'ND'"
        },
        map: map,
        suppressInfoWindows: true
    });
    google.maps.event.addListener(ZIPLayer, 'click', function(e) {
        windowControl(e, infoWindow, map);
    });
    //google.maps.event.addDomListener(window, 'load', initialize);
}
function windowControl(e, infoWindow, map) {
    columnArray=['ZIP', 'county', 'population'];
    infoWindowHtml = buildInfoContent(e,columnArray);
    infoWindow.setOptions({
        content: infoWindowHtml,
        position: e.latLng,
        pixelOffset: e.pixelOffset
    });

    infoWindow.open(map);
}
function buildInfoContent(e,columnArray) {
    infoContent="";
    for (var column = 0; column < columnArray.length; column++){
        infoContent+=columnArray[column]+": "+e.row[columnArray[column]].value+"<br>";

    }
    return infoContent;
}