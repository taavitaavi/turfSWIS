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
var TerritoryLayer=null;
var PermitsLayer=null;
var geoJson;
var zipCodeFusionTableDataGroup="zipcodeTableDataCheckboxGroup";
var placesFusionTableDataGroup='placesTableDataCheckboxGroup';
var permitsFusionTableDataGroup='permitsTableDataCheckboxGroup';
var selectedCounties=["ND-Divide", "ND-Burke", "ND-Renville", "ND-Bottineau", "ND-Rolette", "ND-Towner", "ND-Cavalier", "ND-Pembina", "MN-Kittson", "MN-Roseau", "MN-Marshall", "MN-Pennington", "MN-Red Lake", "MN-Polk", "ND-Grand Forks", "ND-Walsh", "ND-Ramsey", "ND-Nelson", "ND-Steele", "ND-Traill", "ND-Cass", "ND-Richland", "MN-Wilkin", "MN-Clay", "MN-Norman", "ND-Sargent", "ND-Ransom", "ND-Barnes", "ND-Griggs", "ND-Eddy", "ND-Benson", "ND-Pierce", "ND-McHenry", "ND-Ward", "ND-Mountrail", "ND-Williams", "ND-McKenzie", "ND-Billings", "ND-Golden Valley", "ND-Dunn", "ND-Mercer", "ND-McLean", "ND-Sheridan", "ND-Wells", "ND-Foster", "ND-Stutsman", "ND-Kidder", "ND-Burleigh", "ND-Oliver", "ND-Morton", "ND-Stark", "ND-Slope", "ND-Hettinger", "ND-Grant", "ND-Adams", "ND-Bowman", "ND-Sioux", "ND-Emmons", "ND-Logan", "ND-McIntosh", "ND-Dickey", "ND-LaMoure"];
var SELECTEDCOUNTIES=[];

function initSidebar(){
    console.log("sidebar init");
    zipCodeDataColumnList = ['ZIP', 'state', 'Town', 'County', 'population', 'white%', 'black%', 'native%', 'hispanic%', 'spanish Speak English less than "very well" %', 'household median income', 'households', 'households with children', 'children %', 'Households with own children Under 6 years only', 'Households with own children Under 6 years and 6 to 17 years', 'Households with own children - 6 to 17 years only', '2015 units', '2014 units', '2013 units', '2015dealers', '2014 dealers','2016 units'];
    //document.getElementById('').appendChild(makeCheckBoxList(zipCodeDataColumnList,zipCodeFusionTableDataGroup));
    document.getElementById('fusionTableColumns').appendChild(makeCheckBoxList(zipCodeDataColumnList,'fusionTableColumns',zipCodeFusionTableDataGroup));

    placesDataColumnList=['Place, State Abbreviation', 'County','Total population','Household median income','White',  'Black or African American','American Indian and Alaska Native','Asian','Mexican','Under 5 years','5 to 9 years','10 to 14 years','15 to 19 years','Median age (years)'];
    document.getElementById('placesElements').appendChild(makeCheckBoxList(placesDataColumnList,'placesElements',placesFusionTableDataGroup));
    collapseLayers();
}

function colorLayer(selectElement,layer){
    console.log(selectElement.value);
    selectElement.value;
    applyPolygonStyle(map, layer, selectElement.value);
    updateLegend(selectElement.value);
}

var COLUMN_STYLES = {
    'household median income': [
        {
            'min': 0,
            'max': 30000,
            'color': '#FE7276'
        },
        {
            'min': 30000,
            'max': 45000,
            'color': '#fec74c'
        },
        {
            'min': 45000,
            'max': 60000,
            'color': '#2bff25'
        },
        {
            'min': 60000,
            'max': 13000000,
            'color': '#0d77ff'
        }
    ],
    'population':[
        {
            'min': 0,
            'max': 1000,
            'color': '#ffeed6'
        },
        {
            'min': 1000,
            'max': 5000,
            'color': '#ff5e30'
        },
        {
            'min': 5000,
            'max': 10000,
            'color': '#ff35c3'
        },
        {
            'min': 10000,
            'max': 50000,
            'color': '#6184ff'
        },
        {
            'min': 50000,
            'max': 500000,
            'color': '#1fff70'
        }

    ],
    'Total population':[
        {
            'min': 0,
            'max': 1000,
            'iconName':'small_purple',
            'color': '#ff98ff'

        },
        {
            'min': 1000,
            'max': 5000,
            'iconName': 'small_green',
            'color': '#8fea8f'
        },
        {
            'min': 5000,
            'max': 10000,
            'iconName': 'ltblu_blank',
            'color': '#55d8d8'
        },
        {
            'min': 10000,
            'max': 50000,
            'iconName': 'red_blank',
            'color': '#fc6355'
        },
        {
            'min': 50000,
            'max': 20000000,
            'iconName': 'orange_blank',
            'color': '#ff9d00'
        }

    ]

};
// Apply the style to the layer & generate corresponding legend
function applyPolygonStyle(map, layer, column) {
    var columnStyle = COLUMN_STYLES[column];
    var styles = [];

    for (var i in columnStyle) {
        var style = columnStyle[i];
        styles.push({
            where: generateStyleWhere(column, style.min, style.max),
            polygonOptions: {
                fillColor: style.color,
                fillOpacity: style.opacity ? style.opacity : 0.3
            }

        });
    }

    layer.set('styles', styles);
}
// Apply the style to the layer & generate corresponding legend
function applyMarkerStyle(map, layer, column) {
    var columnStyle = COLUMN_STYLES[column];
    var styles = [];

    for (var i in columnStyle) {
        var style = columnStyle[i];
        styles.push({
            where: generateStyleWhere(column, style.min, style.max),
            markerOptions: {
                iconName: style.iconName
            }

        });
    }

    layer.set('styles', styles);
}
// Create the where clause
function generateStyleWhere(columnName, low, high) {
    var whereClause = [];
    whereClause.push("'");
    whereClause.push(columnName);
    whereClause.push("' >= ");
    whereClause.push(low);
    whereClause.push(" AND '");
    whereClause.push(columnName);
    whereClause.push("' < ");
    whereClause.push(high);
    console.log('styling whereclause: '+whereClause);
    return whereClause.join('');
}

// Initialize the legend
function addLegend(map) {
    var legendWrapper = document.createElement('div');
    legendWrapper.id = 'legendWrapper';
    legendWrapper.index = 1;
    map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(
        legendWrapper);

    legendContent(legendWrapper, 'household median income');
}
// Update the legend content
function updateLegend(column) {
    var legendWrapper = document.getElementById('legendWrapper');
    var legend = document.getElementById('legend');
    legendWrapper.removeChild(legend);
    legendContent(legendWrapper, column);
}
// Generate the content for the legend
function legendContent(legendWrapper, column) {
    var legend = document.createElement('div');
    legend.id = 'legend';

    var title = document.createElement('p');
    title.innerHTML = column;
    legend.appendChild(title);

    var columnStyle = COLUMN_STYLES[column];
    for (var i in columnStyle) {
        var style = columnStyle[i];

        var legendItem = document.createElement('div');

        var color = document.createElement('span');
        color.setAttribute('class', 'color');
        console.log("legend element color: "+style.color);
        color.style.backgroundColor = style.color;
        legendItem.appendChild(color);

        var minMax = document.createElement('span');
        minMax.innerHTML = style.min + ' - ' + style.max;
        legendItem.appendChild(minMax);

        legend.appendChild(legendItem);
    }

    legendWrapper.appendChild(legend);
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

function arrayToUPPERCASE(array){
    for(var i = 0; i < array.length; i++){
        array[i] = array[i].toUpperCase();
    }
    return array
}
function buildPolygonWhere(fusionTablecolumn,polygon){
    var whereClause='ST_INTERSECTS('+fusionTablecolumn+', '+'POLYGON(';
    var polygonBounds= polygon.getPath();
    console.log("PolygonPath");
    var LATLNGS=[];
    polygonBounds.forEach(function(xy) {
            LATLNGS.push("LATLNG("+xy.lat()+","+xy.lng()+")");
    });
    LATLNGS=LATLNGS.join(", ");
    whereClause=whereClause+LATLNGS+"))";
    return whereClause;

}

function initMap() {
    //keep uppercase copy of selected territories

     map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 47.4498756, lng: -99.1686378},
        zoom: 7
    });

    var center=map.getCenter();
    addLegend(map);
    var territoryPolygonBoundaries=[
        {lat: center.lat()-2,lng: center.lng()-3},
        {lat: center.lat()-2,lng: center.lng()+3},
        {lat: center.lat()+2,lng: center.lng()+3},
        {lat: center.lat()+2,lng: center.lng()-3}];

// Construct a draggable red triangle with geodesic set to true.

   TerritoryLayer= new google.maps.Polygon({
        map: map,
        paths: territoryPolygonBoundaries,
        strokeColor: '#FF0000',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#FF0000',
        fillOpacity: 0.35,
        draggable: true,
        geodesic: true,
        editable:true
    });

    disableLayer(document.getElementById('TerritoryLayerCheckbox'),TerritoryLayer);
    google.maps.event.addListener(TerritoryLayer, 'click', function (event) {
        console.log('Polygonclick')
    });


/*
     fusionTableColumn="State-County".toUpperCase();
    var whereClause= '\''+fusionTableColumn+'\'' +' IN ('+'\''+SELECTEDCOUNTIES.join('\',\'')+'\''+')';
    console.log("ZipLayer whereclause",whereClause)*/
    var whereClause=buildPolygonWhere('geometry',TerritoryLayer);


    var infoWindow = new google.maps.InfoWindow();
    //where: whereClause
    //19Ias72RSspPU6PIGNGwySEno7uiFvKuZ3shUfO3r
    ZIPLayer = new google.maps.FusionTablesLayer({
        query: {
            select: 'geometry',
            from: '1G_ZgBLUpZvL9riid44RvVkKyJpdF9rGeyDB1d8aW',
            where: whereClause
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
            where: whereClause
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
        //console.log(selectedCounties);
        var info = e.row["State-County"].value;
        countyColumnArray=["State-County"];
        windowControl(e, infoWindow, map,'CountyLayer',countyColumnArray);
    });



    HighSchoolDistrictLayer= new google.maps.Data();
    HighSchoolDistrictLayer.loadGeoJson('geojson/ND_highschools.geojson');
    HighSchoolDistrictLayer.setStyle({
        strokeColor: 'red',
        msoSchemeFillColor:'red',
        strokeWeight: 1
    });
    schoolDistrictColumnArray=["schnam", "gslo", "gshi","stAbbrev"];
    google.maps.event.addListener(HighSchoolDistrictLayer, 'click', function(e) {
        windowControl(e, infoWindow, map,'SchoolDistrictLayer',schoolDistrictColumnArray);
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
    schoolDistrictColumnArray=["schnam", "gslo", "gshi","stAbbrev"];
    google.maps.event.addListener(MiddleSchoolDistrictLayer, 'click', function(e) {
        windowControl(e, infoWindow, map,'SchoolDistrictLayer',schoolDistrictColumnArray);
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
    schoolDistrictColumnArray=["schnam", "gslo", "gshi","stAbbrev"];
    google.maps.event.addListener(ElementarySchoolDistrictLayer, 'click', function(e) {
        windowControl(e, infoWindow, map,'SchoolDistrictLayer',schoolDistrictColumnArray);
    });
    ElementarySchoolDistrictLayer.addListener('mouseover', function(event) {
        ElementarySchoolDistrictLayer.revertStyle();
        ElementarySchoolDistrictLayer.overrideStyle(event.feature, {strokeWeight: 3});
    });
    ElementarySchoolDistrictLayer.addListener('mouseout', function(event) {
        ElementarySchoolDistrictLayer.revertStyle();
    });
    //google.maps.event.addDomListener(window, 'load', initialize)

    whereClause=buildPolygonWhere('\'Place, State Abbreviation\'',TerritoryLayer);
    console.log("placesLayerwhereClause: " +whereClause);
    PlacesLayer = new google.maps.FusionTablesLayer({
        query: {
            select: 'Place, State Abbreviation',
            from: '17zSvgPwyPd22sa3kBw9vTPA01C0M8I5fkQqYZdR5',
            where: whereClause
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


function updateLayers() {
    console.log('updatelayers');
    //var whereClause=buildPolygonWhere('geometry',TerritoryLayer);
    console.log('update zip layer');
    updateZipLayer();
    console.log('update countylayer');
    updateCountyLayer();
    console.log('update placesLayer');
    updatePlacesLayer();

}
function updateZipLayer(){

    var whereClause=buildPolygonWhere('geometry',TerritoryLayer);

    ZIPLayer.setOptions({
        query: {
            select: 'geometry',
            from: '19Ias72RSspPU6PIGNGwySEno7uiFvKuZ3shUfO3r',
            where: whereClause
        }
    });
}
function updateCountyLayer(){
    var whereClause=buildPolygonWhere('geometry',TerritoryLayer);

    CountyLayer.setOptions({
        query: {
            select: 'geometry',
            from: '1Rua8uTZiN5t1WE3PDHTfkOX0NSHaKOSeV8xKEJa-',
            where: whereClause
        }
    });
}
function updatePlacesLayer() {

    var whereClause=buildPolygonWhere('\'Place, State Abbreviation\'',TerritoryLayer);
    console.log("placesLayerwhereClause: " +whereClause);
    pointsLayer=PlacesLayer;
    pointColumn='Place, State Abbreviation';

    var minTownSize=document.getElementById("minTownSizeTextInput").value;
    var townSizeFilter="'Total population' >" + minTownSize.toString();
    var minTownIncome=document.getElementById("minTownIncomeTextInput").value;
    var townIncomeFilter="'Household median income' >" + minTownIncome.toString();
    where=[];
    where.push(whereClause);
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
    applyMarkerStyle(map,pointsLayer,'Total population');
    updateLegend('Total population');
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
        case 'CountyLayer':
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