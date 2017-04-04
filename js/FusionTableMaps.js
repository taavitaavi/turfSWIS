/**
 * Created by taavi on 3/7/2017.
 */

var map = null;
var ZIPLayer=null;
var HighSchoolDistrictLayer=null;
var MiddleSchoolDistrictLayer=null;
var ElemetarySchoolDistrictLayer=null;
var CountyLayer= null;
var PlacesLayer=null;
var geoJson;
var zipCodeFusionTableDataGroup="zipcodeTableDataCheckboxGroup";
var placesFusionTableDataGroup='placesTableDataCheckboxGroup'
var selectedCounties=["ND-Divide", "ND-Burke", "ND-Renville", "ND-Bottineau", "ND-Rolette", "ND-Towner", "ND-Cavalier", "ND-Pembina", "MN-Kittson", "MN-Roseau", "MN-Marshall", "MN-Pennington", "MN-Red Lake", "MN-Polk", "ND-Grand Forks", "ND-Walsh", "ND-Ramsey", "ND-Nelson", "ND-Steele", "ND-Traill", "ND-Cass", "ND-Richland", "MN-Wilkin", "MN-Clay", "MN-Norman", "ND-Sargent", "ND-Ransom", "ND-Barnes", "ND-Griggs", "ND-Eddy", "ND-Benson", "ND-Pierce", "ND-McHenry", "ND-Ward", "ND-Mountrail", "ND-Williams", "ND-McKenzie", "ND-Billings", "ND-Golden Valley", "ND-Dunn", "ND-Mercer", "ND-McLean", "ND-Sheridan", "ND-Wells", "ND-Foster", "ND-Stutsman", "ND-Kidder", "ND-Burleigh", "ND-Oliver", "ND-Morton", "ND-Stark", "ND-Slope", "ND-Hettinger", "ND-Grant", "ND-Adams", "ND-Bowman", "ND-Sioux", "ND-Emmons", "ND-Logan", "ND-McIntosh", "ND-Dickey", "ND-LaMoure"];
var selectedStates=[];
function initSidebar(){
    console.log("sidebar init");
    zipCodeDataColumnList = ['ZIP', 'state', 'Town', 'County', 'population', 'white%', 'black%', 'native%', 'hispanic%', 'spanish Speak English less than "very well" %', 'household median income', 'households', 'households with children', 'children %', 'Households with own children Under 6 years only', 'Households with own children Under 6 years and 6 to 17 years', 'Households with own children - 6 to 17 years only', '2015 units', '2014 units', '2013 units', '2015dealers', '2014 dealers', '3 years units per capita'];
    //document.getElementById('').appendChild(makeCheckBoxList(zipCodeDataColumnList,zipCodeFusionTableDataGroup));
    document.getElementById('fusionTableColumns').appendChild(makeCheckBoxList(zipCodeDataColumnList,'fusionTableColumns',zipCodeFusionTableDataGroup));

    placesDataColumnList=['Place, State Abbreviation', 'County','Total population','Household median income','White',  'Black or African American','American Indian and Alaska Native','Asian','Mexican','Under 5 years','5 to 9 years','10 to 14 years','15 to 19 years','Median age (years)'];
    document.getElementById('placesElements').appendChild(makeCheckBoxList(placesDataColumnList,'placesElements',placesFusionTableDataGroup));
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

function updateTextInput() {

    updatePlacesLayer(PlacesLayer, 'Place, State Abbreviation')
}
function updateSliderValue(val,sliderID) {
    document.getElementById(sliderID).value=val;
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

    collapseLayers();
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

function generateZipLayerWhere(){

}
function initMap() {
     map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 47.4498756, lng: -99.1686378},
        zoom: 7
    });

    var infoWindow = new google.maps.InfoWindow();
    ZIPLayer = new google.maps.FusionTablesLayer({
        query: {
            select: 'geometry',
            from: '17naQUI2JRzbFLXfuQr-rCSUdE98HuuK0RQtl_M29',
            where: " 'state' LIKE 'ND'"
        },
        map: map,
        suppressInfoWindows: true
    });
    disableLayer(document.getElementById('FusionTableLayerCheckbox'),ZIPLayer);

    google.maps.event.addListener(ZIPLayer, 'click', function(e) {
        zipCodeCheckedBoxes = getCheckedBoxes(zipCodeFusionTableDataGroup);
        windowControl(e, infoWindow, map,'ZipLayer',zipCodeCheckedBoxes);
    });
    //google.maps.event.addDomListener(window, 'load', initialize);

    CountyLayer = new google.maps.FusionTablesLayer({
        query: {
            select: 'geometry',
            from: '1Rua8uTZiN5t1WE3PDHTfkOX0NSHaKOSeV8xKEJa-',
            where: ""
        },
        styles: [{
            polygonOptions: {
                fillColor: '#7cfff1',
                fillOpacity: 0.3
            }
        }],
        map: map,
        suppressInfoWindows: true
    });
    disableLayer(document.getElementById('CountyLayerCheckBox'),CountyLayer);
    google.maps.event.addListener(CountyLayer, 'click', function(e) {

    //check if county is already in selection
        if (selectedCounties.includes(e.row["State-County"].value)){
            var index = selectedCounties.indexOf(e.row["State-County"].value);
            if (index > -1) {
                selectedCounties.splice(index, 1);
            }
        }
        else{
            selectedCounties.push( e.row["State-County"].value);
        }
        fusionTableColumn="State-County";
        var whereClause= '\''+fusionTableColumn+'\'' +' IN ('+'\''+selectedCounties.join('\',\'')+'\''+')';
        CountyLayer.set("styles",[{
            polygonOptions: {
                fillColor: '#00FF00',
                fillOpacity: 0.3
            }
        }, {
            where: whereClause,
            polygonOptions: {
                fillColor: '#0000FF'
            }
        }]);

        //console.log(selectedCounties);
        var info = e.row["State-County"].value;

        //windowControl(e, infoWindow, map,'CountyLayer');
    });



    HighSchoolDistrictLayer= new google.maps.Data();
    HighSchoolDistrictLayer.loadGeoJson('geojson/ND_highschools.geojson');
    HighSchoolDistrictLayer.setStyle({
        strokeColor: 'red',
        msoSchemeFillColor:'red',
        strokeWeight: 1
    });
    columnArray=["schnam", "gslo", "gshi","stAbbrev"];
    google.maps.event.addListener(HighSchoolDistrictLayer, 'click', function(e) {
        windowControl(e, infoWindow, map,'SchoolDistrictLayer',columnArray);
    });
    HighSchoolDistrictLayer.addListener('mouseover', function(event) {
        HighSchoolDistrictLayer.revertStyle();
        HighSchoolDistrictLayer.overrideStyle(event.feature, {strokeWeight: 3});
    });
    HighSchoolDistrictLayer.addListener('mouseout', function(event) {
        HighSchoolDistrictLayer.revertStyle();
    });

    MiddleSchoolDistrictLayer= new google.maps.Data();
    MiddleSchoolDistrictLayer.loadGeoJson('geojson/ND_middleschools.geojson');
    MiddleSchoolDistrictLayer.setStyle({
        strokeColor: 'red',
        msoSchemeFillColor:'red',
        strokeWeight: 1
    });
    columnArray=["schnam", "gslo", "gshi","stAbbrev"];
    google.maps.event.addListener(MiddleSchoolDistrictLayer, 'click', function(e) {
        windowControl(e, infoWindow, map,'SchoolDistrictLayer',columnArray);
    });
    MiddleSchoolDistrictLayer.addListener('mouseover', function(event) {
        MiddleSchoolDistrictLayer.revertStyle();
        MiddleSchoolDistrictLayer.overrideStyle(event.feature, {strokeWeight: 3});
    });
    MiddleSchoolDistrictLayer.addListener('mouseout', function(event) {
        MiddleSchoolDistrictLayer.revertStyle();
    });

    ElementarySchoolDistrictLayer= new google.maps.Data();
    ElementarySchoolDistrictLayer.loadGeoJson('geojson/ND_elementaryschools.geojson');
    ElementarySchoolDistrictLayer.setStyle({
        strokeColor: 'red',
        msoSchemeFillColor:'red',
        strokeWeight: 1
    });
    columnArray=["schnam", "gslo", "gshi","stAbbrev"];
    google.maps.event.addListener(ElementarySchoolDistrictLayer, 'click', function(e) {
        windowControl(e, infoWindow, map,'SchoolDistrictLayer',columnArray);
    });
    ElementarySchoolDistrictLayer.addListener('mouseover', function(event) {
        ElementarySchoolDistrictLayer.revertStyle();
        ElementarySchoolDistrictLayer.overrideStyle(event.feature, {strokeWeight: 3});
    });
    ElementarySchoolDistrictLayer.addListener('mouseout', function(event) {
        ElementarySchoolDistrictLayer.revertStyle();
    });
    //google.maps.event.addDomListener(window, 'load', initialize)


    PlacesLayer = new google.maps.FusionTablesLayer({
        query: {
            select: 'Place, State Abbreviation',
            from: '17zSvgPwyPd22sa3kBw9vTPA01C0M8I5fkQqYZdR5',
            where: " 'State Abbreviation' LIKE 'ND' and 'Total population' > 1000"
        },
        map: map,
        suppressInfoWindows: true
    });
    disableLayer(document.getElementById('PlacesLayerCheckbox'),PlacesLayer);


    google.maps.event.addListener(PlacesLayer, 'click', function(e) {
        placesCheckedBoxes = getCheckedBoxes(placesFusionTableDataGroup);
        console.log(placesCheckedBoxes);
        windowControl(e, infoWindow, map,'ZipLayer',placesCheckedBoxes);
    });
}



function updatePlacesLayer() {
    pointsLayer=PlacesLayer;
    pointColumn='Place, State Abbreviation';
    var stateFilter= "'State Abbreviation' LIKE 'ND'";
    var minTownSize=document.getElementById("minTownSizeTextInput").value;
    var townSizeFilter="'Total population' >" + minTownSize.toString();
    var minTownIncome=document.getElementById("minTownIncomeTextInput").value;
    var townIncomeFilter="'Household median income' >" + minTownIncome.toString();
    where=[];
    where.push(stateFilter);
    where.push(townSizeFilter);
    where.push(townIncomeFilter);

    console.log(where.join(' and '));
    pointsLayer.setOptions({
        query: {
            select: pointColumn,
            from: '17zSvgPwyPd22sa3kBw9vTPA01C0M8I5fkQqYZdR5',
            where: where.join(' and ')
        }
    });
}

function windowControl(e, infoWindow, map, layer, columnArray) {
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