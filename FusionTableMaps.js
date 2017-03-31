/**
 * Created by taavi on 3/7/2017.
 */

var map = null;
var ZIPLayer=null;
var SchoolDistrictLayer=null;
var CountyLayer= null;
var geoJson;
var fusionTableDataGroup="fusionTableData";

function initSidebar(){
    console.log("sidebar init");
    columnlist = ['ZIP', 'state', 'Town', 'County', 'population', 'white%', 'black%', 'native%', 'hispanic%', 'spanish Speak English less than "very well" %', 'household median income', 'households', 'households with children', 'children %', 'Households with own children Under 6 years only', 'Households with own children Under 6 years and 6 to 17 years', 'Households with own children - 6 to 17 years only', '2015 units', '2014 units', '2013 units', '2015dealers', '2014 dealers', '3 years units per capita'];
    //document.getElementById('').appendChild(makeCheckBoxList(columnlist,fusionTableDataGroup));
    document.getElementById('fusionTableColumns').appendChild(makeCheckBoxList(columnlist,'fusionTableColumns',fusionTableDataGroup));
    collapseLayers();
}




function makeCheckBoxList(array,id,group) {
    var parent=document.getElementById(id);

    var myDiv = document.createElement("div");
    myDiv.className="list";
    for (var i = 0; i < array.length; i++) {
        var checkBox = document.createElement("input");
        var label = document.createElement("label");
        checkBox.type = "checkbox";
        checkBox.value = array[i];
        checkBox.name=group;
        checkBox.checked=true;
        myDiv.appendChild(checkBox);
        myDiv.appendChild(label);
        label.appendChild(document.createTextNode(array[i]));
        myDiv.appendChild(document.createElement("br"));
    }
    parent.appendChild(myDiv);
    return myDiv;
}

function collapseLayers(){
    var elements = document.getElementsByTagName("div");
   // console.log(elements)

// collapse all sections
    for (var i = 0; i < elements.length; i++) {
        if (elements[i].className == "elements") {
            elements[i].style.display="none";
        } else if (elements[i].className == "label") {
            elements[i].onclick=switchDisplay;
        }
    }


}

function layerCheckBoxlistener(checkbox,layer){

    if(checkbox.checked == true){
        enableLayer(checkbox,layer);
    }else{
        disableLayer(checkbox,layer);

    }

}
function disableLayer(checkbox,layer){

    console.log("disableLayer");
    layer.setMap(null);
    var parent = checkbox.parentNode.parentNode;
    var target = parent.getElementsByTagName("div")[0];
    //var target = parent.getElementsByClassName("label");
    //console.log(target);
    target.style.display="none";


}

function enableLayer(checkbox,layer){
    console.log("enableLayer");
    layer.setMap(map);
    var parent = checkbox.parentNode.parentNode;
    var target = parent.getElementsByTagName("div")[0];
    //var target = parent.getElementsByClassName("label");
    //console.log(target);
    target.style.display="block";
}

//collapse or expand depending on state
function switchDisplay() {

    var parent = this.parentNode;
    var target = parent.getElementsByTagName("div")[1];

    if (target.style.display == "none") {
        target.style.display="block";
    } else {
        target.style.display="none";
    }
    return false;
}





//////////Initializing map
function initMap() {
     map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 47.4498756, lng: -99.1686378},
        zoom: 7
    });

    var infoWindow = new google.maps.InfoWindow();
    ZIPLayer = new google.maps.FusionTablesLayer({
        query: {
            select: 'geometry',
            from: '1ncnLYkOUgr9qkI7RYNcmvJH0ThkqdcaSpRAIBvIf',
            where: " 'state' LIKE 'ND'"
        },
        map: map,
        suppressInfoWindows: true
    });
    disableLayer(document.getElementById('FusionTableLayerCheckbox'),ZIPLayer);
    checkedBoxes = getCheckedBoxes(fusionTableDataGroup);
    google.maps.event.addListener(ZIPLayer, 'click', function(e) {
        WindowControl(e, infoWindow, map,'ZipLayer',checkedBoxes);
    });
    //google.maps.event.addDomListener(window, 'load', initialize);

    CountyLayer = new google.maps.FusionTablesLayer({
        query: {
            select: 'geometry',
            from: '1xdysxZ94uUFIit9eXmnw1fYc6VcQiXhceFd_CVKa',
            where: " 'State Abbr' LIKE 'ND'"
        },
        map: map,
        suppressInfoWindows: true
    });
    disableLayer(document.getElementById('CountyLayerCheckBox'),CountyLayer);



    google.maps.event.addListener(CountyLayer, 'click', function(e) {
        WindowControl(e, infoWindow, map,'CountyLayer');
    });


    SchoolDistrictLayer= new google.maps.Data();
    SchoolDistrictLayer.loadGeoJson('ND_highschools.geojson');
    SchoolDistrictLayer.setStyle({
        strokeColor: 'red',
        msoSchemeFillColor:'red',
        strokeWeight: 1
    });
    columnArray=["schnam", "gslo", "gshi","stAbbrev"];
    google.maps.event.addListener(SchoolDistrictLayer, 'click', function(e) {
        WindowControl(e, infoWindow, map,'SchoolDistrictLayer',columnArray);
    });
    SchoolDistrictLayer.addListener('mouseover', function(event) {
        SchoolDistrictLayer.revertStyle();
        SchoolDistrictLayer.overrideStyle(event.feature, {strokeWeight: 3});
    });
    SchoolDistrictLayer.addListener('mouseout', function(event) {
        SchoolDistrictLayer.revertStyle();
    });

    //google.maps.event.addDomListener(window, 'load', initialize)
}


function WindowControl(e, infoWindow, map, layer,columnArray) {
  /*  columnArray=['ZIP', 'state','County', 'population'];

    console.log(checkedBoxes);
    console.log(columnArray);*/

    infoWindowHtml = buildInfoContent(e,columnArray,layer);
    infoWindow.setOptions({
        content: infoWindowHtml,
        position: e.latLng,
        pixelOffset: e.pixelOffset
    });

    infoWindow.open(map);
}

function getInfo (e, layer, infoToGet) {
    var info='';
    switch (layer) {
        case 'ZipLayer':
            //console.log('layer is ziplayer');
            info = e.row[infoToGet].value;
            break;
        case 'SchoolDistrictLayer':
            info = e.feature.getProperty(infoToGet);
            break;
    }
    return info;
};
function buildInfoContent(e, columnArray,layer) {
    infoContent=document.createElement("div");
    for (var column = 0; column < columnArray.length; column++){

           try {
               var info= getInfo(e,layer,columnArray[column]);
               node= document.createTextNode(columnArray[column]+': '+info);
            infoContent.appendChild(node);
            infoContent.appendChild(document.createElement("br"));
        }
        catch(e){
            console.log('the property is not available...'); // print into console
        }
    }
    return infoContent;
}

// Pass the checkbox name to the function
function getCheckedBoxes(group) {
    var checkboxes = document.getElementsByName(group);
    var checkboxesChecked = [];
    // loop over them all
    for (var i = 0; i < checkboxes.length; i++) {
        // And stick the checked ones onto an array...
        if (checkboxes[i].checked) {
            checkboxesChecked.push(checkboxes[i].value);
        }
    }
    // Return the array if it is non-empty, or null
    return checkboxesChecked.length > 0 ? checkboxesChecked : null;
}