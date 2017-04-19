/**
 * Created by taavi on 3/7/2017.
 */

var map = null;
var ZIPLayer=null;
var HighSchoolDistrictLayer=null;
var MiddleSchoolDistrictLayer= null;
var SchoolsLayer=null;
var ElemetarySchoolDistrictLayer=null;

var CountyLayer= null;
var PlacesLayer=null;
var HQLayer=null;
var TerritoryLayer=null;
var PermitsLayer=null;
var geoJson;
var zipCodeFusionTableDataGroup="zipcodeTableDataCheckboxGroup";
var placesFusionTableDataGroup='placesTableDataCheckboxGroup';
var schoolsFusionTableDataGroup='schoolsTableDataCheckboxGroup';
var HQFusionTableDataGroup='HQTableDataCheckboxGroup';
var permitsFusionTableDataGroup='permitsTableDataCheckboxGroup';
var selectedCounties=["ND-Divide", "ND-Burke", "ND-Renville", "ND-Bottineau", "ND-Rolette", "ND-Towner", "ND-Cavalier", "ND-Pembina", "MN-Kittson", "MN-Roseau", "MN-Marshall", "MN-Pennington", "MN-Red Lake", "MN-Polk", "ND-Grand Forks", "ND-Walsh", "ND-Ramsey", "ND-Nelson", "ND-Steele", "ND-Traill", "ND-Cass", "ND-Richland", "MN-Wilkin", "MN-Clay", "MN-Norman", "ND-Sargent", "ND-Ransom", "ND-Barnes", "ND-Griggs", "ND-Eddy", "ND-Benson", "ND-Pierce", "ND-McHenry", "ND-Ward", "ND-Mountrail", "ND-Williams", "ND-McKenzie", "ND-Billings", "ND-Golden Valley", "ND-Dunn", "ND-Mercer", "ND-McLean", "ND-Sheridan", "ND-Wells", "ND-Foster", "ND-Stutsman", "ND-Kidder", "ND-Burleigh", "ND-Oliver", "ND-Morton", "ND-Stark", "ND-Slope", "ND-Hettinger", "ND-Grant", "ND-Adams", "ND-Bowman", "ND-Sioux", "ND-Emmons", "ND-Logan", "ND-McIntosh", "ND-Dickey", "ND-LaMoure"];
var SELECTEDCOUNTIES=[];
var placesLayerWhereClause="";
var schoolsLayerWhereClause="";

function Get(yourUrl){
    var Httpreq = new XMLHttpRequest(); // a new request
    Httpreq.open("GET",yourUrl,false);
    Httpreq.send(null);
    return Httpreq.responseText;
}

function Post(yourUrl) {
    var Httpreq = new XMLHttpRequest(); // a new request
    Httpreq.open("POST",yourUrl,false);
    Httpreq.send(null);
    return Httpreq.responseText;
}




function formatParams( params ){
    return "?" + Object
            .keys(params)
            .map(function(key){
                return key+"="+params[key]
            })
            .join("&")
}
function downloadPlacesInfoToExcel(){
    console.log('downloading info');
    //get cities
    placesCheckedBoxes=getCheckedBoxes(placesFusionTableDataGroup);
    console.log('\''+placesCheckedBoxes.join('\',\'')+'\'');
    var columnsToDownload='\''+placesCheckedBoxes.join('\',\'')+'\'';
    var placesParams={
        sql:'SELECT'+columnsToDownload+' FROM 17zSvgPwyPd22sa3kBw9vTPA01C0M8I5fkQqYZdR5 WHERE '+placesLayerWhereClause,
        key:'AIzaSyBxU4HyG1hKhXu4cQknx6uvJfW1rVuuaNc'
    }
    var url ='https://www.googleapis.com/fusiontables/v2/query';
    var placesqueryurl=url+formatParams(placesParams);
    //console.log(JSON.parse(Get(url)));
    var placesjson=JSON.parse(Get(placesqueryurl));
    placesjson.rows.unshift(placesjson.columns);
    exportToCsv('places.csv',placesjson.rows);


}
function downloadHighschoolDistrictBoundaries(database){
    console.log('Downloading school district boundaries')
}
function downloadSchoolsInfoToExcel() {
    var url ='https://www.googleapis.com/fusiontables/v2/query';
    var schoolsChekedboxes=getCheckedBoxes(schoolsFusionTableDataGroup);
    var whereClause=buildPolygonWhere('\'Street Address, City, State\'',TerritoryLayer);
    console.log('\''+schoolsChekedboxes.join('\',\'')+'\'');
    var schoolsColumnsToDownload='\''+schoolsChekedboxes.join('\',\'')+'\'';
    //getSchools
    console.log('downloading schoolsinfo')
    var schoolsParams={
        sql:'SELECT * FROM 1erkFcYkJgIXe1efAtMzEMHF9o1f0POrt4di3PffB WHERE '+whereClause,
        key:'AIzaSyBxU4HyG1hKhXu4cQknx6uvJfW1rVuuaNc'
    }
    var schoolsqueryurl=url+formatParams(schoolsParams);
    console.log(schoolsqueryurl);
    var schoolsjson=JSON.parse(Get(schoolsqueryurl));
    schoolsjson.rows.unshift(schoolsjson.columns);
    exportToCsv('schools.csv',schoolsjson.rows);

}

function exportToCsv(filename, rows) {
    var processRow = function (row) {
        var finalVal = '';
        for (var j = 0; j < row.length; j++) {
            var innerValue = row[j] === null ? '' : row[j].toString();
            if (row[j] instanceof Date) {
                innerValue = row[j].toLocaleString();
            };
            var result = innerValue.replace(/"/g, '""');
            if (result.search(/("|,|\n)/g) >= 0)
                result = '"' + result + '"';
            if (j > 0)
                finalVal += ',';
            finalVal += result;
        }
        return finalVal + '\n';
    };

    var csvFile = '';
    for (var i = 0; i < rows.length; i++) {
        csvFile += processRow(rows[i]);
    }

    var blob = new Blob([csvFile], { type: 'text/csv;charset=utf-8;' });
    if (navigator.msSaveBlob) { // IE 10+
        navigator.msSaveBlob(blob, filename);
    } else {
        var link = document.createElement("a");
        if (link.download !== undefined) { // feature detection
            // Browsers that support HTML5 download attribute
            var url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }
}


function initSidebar(){
    console.log("sidebar init");
    zipCodeDataColumnList = ['ZIP', 'state', 'Town', 'County', 'population', 'white%', 'black%', 'native%', 'hispanic%', 'spanish Speak English less than "very well" %', 'household median income', 'households', 'households with children', 'children %', 'Households with own children Under 6 years only', 'Households with own children Under 6 years and 6 to 17 years', 'Households with own children - 6 to 17 years only', '2016 units','2015 units', '2014 units', '2013 units', '2015dealers', '2014 dealers','Population Density','Family density','1 year units per households with children','2 year units per households with children','3 year units per households with children'];
    //document.getElementById('').appendChild(makeCheckBoxList(zipCodeDataColumnList,zipCodeFusionTableDataGroup));
    document.getElementById('fusionTableColumns').appendChild(makeCheckBoxList(zipCodeDataColumnList,'fusionTableColumns',zipCodeFusionTableDataGroup));

    placesDataColumnList=['Place, State Abbreviation', 'County','Total population','Household median income','White',  'Black or African American','American Indian and Alaska Native','Asian','Mexican','Under 5 years','5 to 9 years','10 to 14 years','15 to 19 years','Median age (years)'];
    document.getElementById('placesElements').appendChild(makeCheckBoxList(placesDataColumnList,'placesElements',placesFusionTableDataGroup));
    HQDataColumnList=['First Name','Last Name','Street Address','City','State','Phone','Email','Information'];
    document.getElementById('HQElements').appendChild(makeCheckBoxList(HQDataColumnList,'HQElements',HQFusionTableDataGroup));
    schoolsDataColumnList=['NCES School ID','Low Grade*','High Grade*','School Name','District','County Name*','Street Address, City, State','Phone','School Level','Charter','Magnet*','Title I School*','Students*','Teachers*','Student Teacher Ratio*','Free Lunch*', 'Website'];
    document.getElementById('SchoolsElements').appendChild(makeCheckBoxList(schoolsDataColumnList,'SchoolsElements',schoolsFusionTableDataGroup));
    collapseLayers();
};

function colorLayer(selectElement,layer){
    console.log(selectElement.value);

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
            'color': '#172cff'
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
    'households with children':[
{
    'min': 0,
    'max': 100,
    'color': '#3a004c'
},
{
    'min': 100,
    'max': 250,
    'color': '#ff5e30'
},
{
    'min': 250,
    'max': 500,
    'color': '#ff35c3'
},
{
    'min': 500,
    'max': 1000,
    'color': '#6184ff'
},
        {
            'min': 1000,
            'max': 2000,
            'color': '#2fffe5'
        },
{
    'min': 2000,
    'max': 5000000,
    'color': '#ff0536'
},

],
    'Population Density':[
        {
            'min': 0,
            'max': 10,
            'color': '#454545'
        },
        {
            'min': 10,
            'max': 100,
            'color': '#5ff8ff'
        },
        {
            'min': 100,
            'max': 1000,
            'color': '#ff35c3'
        },
        {
            'min': 1000,
            'max': 500000,
            'color': '#83ff64'
        },
        {
            'min': 50000,
            'max': 50000000,
            'color': '#ff2427'
        }

    ],
    'Family density':[
        {
            'min': 0,
            'max': 10,
            'color': '#454545'
        },
        {
            'min': 10,
            'max': 100,
            'color': '#5ff8ff'
        },
        {
            'min': 100,
            'max': 1000,
            'color': '#ff35c3'
        },
        {
            'min': 1000,
            'max': 500000,
            'color': '#83ff64'
        },
        {
            'min': 50000,
            'max': 50000000,
            'color': '#ff2427'
        }

    ],
    'white%':[
        {
            'min': 0,
            'max': 25,
            'color': '#454545'
        },
        {
            'min': 25,
            'max': 50,
            'color': '#ff9c40'
        },
        {
            'min': 50,
            'max': 75,
            'color': '#ff6231'
        },
        {
            'min': 75,
            'max': 101,
            'color': '#fefcff'
        }

    ],
    'black%':[
        {
            'min': 0,
            'max': 25,
            'color': '#ffffff'
        },
        {
            'min': 25,
            'max': 50,
            'color': '#ff9c40'
        },
        {
            'min': 50,
            'max': 75,
            'color': '#ff6231'
        },
        {
            'min': 75,
            'max': 101,
            'color': '#2a0014'
        }

    ],
    'native%':[
        {
            'min': 0,
            'max': 25,
            'color': '#ffffff'
        },
        {
            'min': 25,
            'max': 50,
            'color': '#adff61'
        },
        {
            'min': 50,
            'max': 75,
            'color': '#ffb26a'
        },
        {
            'min': 75,
            'max': 101,
            'color': '#ff45fa'
        }

    ],
    'hispanic%':[
        {
            'min': 0,
            'max': 25,
            'color': '#ffffff'
        },
        {
            'min': 25,
            'max': 50,
            'color': '#adff61'
        },
        {
            'min': 50,
            'max': 75,
            'color': '#ffb26a'
        },
        {
            'min': 75,
            'max': 101,
            'color': '#9bfbff'
        }

    ],
    'spanish Speak English less than \"very well\" %':[
        {
            'min': 0,
            'max': 25,
            'color': '#2fff43'
        },
        {
            'min': 25,
            'max': 50,
            'color': '#85f9ff'
        },
        {
            'min': 50,
            'max': 75,
            'color': '#ffb26a'
        },
        {
            'min': 75,
            'max': 101,
            'color': '#ff43e9'
        }

    ],
    'children %':[
        {
            'min': 0,
            'max': 0.25,
            'color': '#747474'
        },
        {
            'min': 0.25,
            'max': 0.50,
            'color': '#85f9ff'
        },
        {
            'min': 0.50,
            'max': 0.75,
            'color': '#99ff98'
        },
        {
            'min': 0.75,
            'max': 101,
            'color': '#ff6b92'
        }

    ],
    '2014 units':[
        {
            'min': 0,
            'max': 500,
            'color': '#d6a256'
        },
        {
            'min': 500,
            'max': 1000,
            'color': '#ffff00'
        },
        {
            'min': 1000,
            'max': 1500,
            'color': '#00ffff'
        },
        {
            'min': 1500,
            'max': 2000,
            'color': '#0000ff'
        },
        {
            'min': 2000,
            'max': 4000,
            'color': '#28ff3b'
        },
        {
            'min': 4000,
            'max': 200000,
            'color': '#d037ff'
        }


    ],
    '2015 units':[
        {
            'min': 0,
            'max': 500,
            'color': '#d6a256'
        },
        {
            'min': 500,
            'max': 1000,
            'color': '#ffff00'
        },
        {
            'min': 1000,
            'max': 1500,
            'color': '#00ffff'
        },
        {
            'min': 1500,
            'max': 2000,
            'color': '#0000ff'
        },
        {
            'min': 2000,
            'max': 4000,
            'color': '#28ff3b'
        },
        {
            'min': 4000,
            'max': 200000,
            'color': '#d037ff'
        }


    ],
    '2016 units':[
        {
            'min': 0,
            'max': 500,
            'color': '#d6a256'
        },
        {
            'min': 500,
            'max': 1000,
            'color': '#ffff00'
        },
        {
            'min': 1000,
            'max': 1500,
            'color': '#00ffff'
        },
        {
            'min': 1500,
            'max': 2000,
            'color': '#0000ff'
        },
        {
            'min': 2000,
            'max': 4000,
            'color': '#28ff3b'
        },
        {
            'min': 4000,
            'max': 200000,
            'color': '#d037ff'
        }


    ],
    '1 year units per households with children':[
        {
            'min': 0,
            'max': 0.3,
            'color': '#51d630'
        },
        {
            'min': 0.3,
            'max': 0.6,
            'color': '#ffabd0'
        },
        {
            'min': 0.6,
            'max': 0.9,
            'color': '#00ffff'
        },
        {
            'min': 0.9,
            'max': 1.2,
            'color': '#0000ff'
        },
        {
            'min': 1.2,
            'max': 50,
            'color': '#59a1ff'
        }



    ],
    '2 year units per households with children':[
        {
            'min': 0,
            'max': 0.3,
            'color': '#51d630'
        },
        {
            'min': 0.3,
            'max': 0.6,
            'color': '#ffabd0'
        },
        {
            'min': 0.6,
            'max': 0.9,
            'color': '#00ffff'
        },
        {
            'min': 0.9,
            'max': 1.2,
            'color': '#0000ff'
        },
        {
            'min': 1.2,
            'max': 50,
            'color': '#3bb5ff'
        }



    ],
    '3 year units per households with children':[
        {
            'min': 0,
            'max': 0.3,
            'color': '#51d630'
        },
        {
            'min': 0.3,
            'max': 0.6,
            'color': '#ffabd0'
        },
        {
            'min': 0.6,
            'max': 0.9,
            'color': '#00ffff'
        },
        {
            'min': 0.9,
            'max': 1.2,
            'color': '#7b8eff'
        },
        {
            'min': 1.2,
            'max': 1.5,
            'color': '#3bb5ff'
        }
        ,
        {
            'min': 1.5,
            'max': 1.8,
            'color': '#ff08f7'
        },
        {
            'min': 1.8,
            'max':3,
            'color': '#ff4b6b'
        },
        {
            'min': 3,
            'max':20,
            'color': '#3a004c'
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

    ],
    'High Grade*':[
        {
            'min': 1,
            'max': 6,
            'iconName':'small_purple',
            'color': '#ff98ff'

        },
        {
            'min': 6,
            'max': 9,
            'iconName': 'small_green',
            'color': '#8fea8f'
        },
        {
            'min': 9,
            'max': 13,
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
            where: generatePlacesLayerStyleWhere(column, style.min, style.max),
            polygonOptions: {
                fillColor: style.color,
                fillOpacity: style.opacity ? style.opacity : 0.3
            }

        });
    }

    layer.set('styles', styles);
}
// Apply the style to the layer & generate corresponding legend
function applyPlacesLayerMarkerStyle(map, layer, column) {
    var columnStyle = COLUMN_STYLES[column];
    var styles = [];

    for (var i in columnStyle) {
        var style = columnStyle[i];
        styles.push({
            where: generatePlacesLayerStyleWhere(column, style.min, style.max),
            markerOptions: {
                iconName: style.iconName
            }

        });
    }
    console.log(styles);
    layer.set('styles', styles);
}



// Create the where clause
function generatePlacesLayerStyleWhere(columnName, low, high) {
    var whereClause = [];
    whereClause.push("'");
    whereClause.push(columnName);
    whereClause.push("' >= ");
    whereClause.push(low);
    whereClause.push(" AND '");
    whereClause.push(columnName);
    whereClause.push("' < ");
    whereClause.push(high);
    console.log('places layer styling whereclause: '+whereClause.join(''));
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
function sendSelectionToMongoDB(database){


    console.log("geometry:");

    var polygonBounds= TerritoryLayer.getPath();

    console.log("PolygonPath");
    var LNGLATS=[];
    polygonBounds.forEach(function(xy) {
        LNGLATS.push([xy.lng(),xy.lat()]);
    });
    //close loop
    LNGLATS.push(LNGLATS[0]);
    console.log("TerritoryPolygon: "+LNGLATS);
    var params = {turfBoundaries: JSON.stringify(LNGLATS)};
    var yourUrl='http://prep.swturf.eu/'+database;
    var url = yourUrl + formatParams(params);

    return url;


}
function initMiddleSchoolDistrictLayer() {
    console.log('initschoolLayer');
    var infoWindow = new google.maps.InfoWindow();
    MiddleSchoolDistrictLayer= new google.maps.Data();
    var url=sendSelectionToMongoDB('US_MS');
    console.log(url);

    // MiddleSchoolDistrictLayer.loadGeoJson('http://prep.swturf.eu/ND_MS?turfBoundaries=[[-102.1686378,45.4498756],[-96.1686378,45.4498756],[-96.1686378,49.4498756],[-102.1686378,49.4498756],[-102.1686378,45.4498756]]');
    MiddleSchoolDistrictLayer.loadGeoJson(url);
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

}

function initHighSchoolDistrictLayer(){
    console.log("initHighSchoolDistrictLayer")
    var infoWindow = new google.maps.InfoWindow();
    HighSchoolDistrictLayer= new google.maps.Data();
    var url=sendSelectionToMongoDB('US_HS');
    console.log(url);
    //'geojson/ND_highschools.geojson'
    HighSchoolDistrictLayer.loadGeoJson(url);
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
}
function initElementarySchoolDistrictLayer(){
    console.log("initElementarySchoolDistrictLayer")
    var infoWindow = new google.maps.InfoWindow();
    ElemetarySchoolDistrictLayerr= new google.maps.Data();
    var url=sendSelectionToMongoDB('US_EL');
    console.log(url);
    ElementarySchoolDistrictLayer.loadGeoJson(url);
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


}


function initMap() {


     map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 37.0902, lng: -95.71298},
        zoom: 4
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
    var infoWindow = new google.maps.InfoWindow();
    MiddleSchoolDistrictLayer= new google.maps.Data();
    initMiddleSchoolDistrictLayer();
    HighSchoolDistrictLayer= new google.maps.Data();
    initHighSchoolDistrictLayer();
    ElementarySchoolDistrictLayer= new google.maps.Data();
    initElementarySchoolDistrictLayer();


    var whereClause=buildPolygonWhere('geometry',TerritoryLayer);
    //where: whereClause
    //19Ias72RSspPU6PIGNGwySEno7uiFvKuZ3shUfO3r
    ZIPLayer = new google.maps.FusionTablesLayer({
        query: {
            select: 'geometry',
            from: '1Eus1YAng8djJ2Jpva1pj5-l0cApi_t7qkhtx_FdH',
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

    whereClause=buildPolygonWhere('\'Street Address, City, State\'',TerritoryLayer);
    console.log("SchoolsLayerwhereclause: " +whereClause);
    SchoolsLayer = new google.maps.FusionTablesLayer({
        query: {
            select: 'Street Address, City, State',
            from: '1erkFcYkJgIXe1efAtMzEMHF9o1f0POrt4di3PffB',
            where: whereClause
        },
        map: map,
        suppressInfoWindows: true
    });

    disableLayer(document.getElementById('SchoolsLayerCheckbox'),SchoolsLayer);


    google.maps.event.addListener(SchoolsLayer, 'click', function(e) {
        schoolsCheckedBoxes = getCheckedBoxes(schoolsFusionTableDataGroup);
        console.log(schoolsCheckedBoxes);
        windowControl(e, infoWindow, map,'ZipLayer',schoolsCheckedBoxes);
    });


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
    whereClause=buildPolygonWhere('\'Location\'',TerritoryLayer);
    HQLayer = new google.maps.FusionTablesLayer({
        query: {
            select: 'Location',
            from: '1iAWgy2kduM0OP8IQO-RXwaitksNYbODJ0wNJ1J9A',
            where: whereClause
        },
        map: map,
        suppressInfoWindows: true
    });
    disableLayer(document.getElementById('HQLayerCheckbox'),HQLayer);


    google.maps.event.addListener(HQLayer, 'click', function(e) {
        HQCheckedBoxes = getCheckedBoxes(HQFusionTableDataGroup);
        windowControl(e, infoWindow, map,'ZipLayer',HQCheckedBoxes);
    });

    updateLayers();
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
    updateHQLayer();
    initMiddleSchoolDistrictLayer();
    initHighSchoolDistrictLayer();
    initElementarySchoolDistrictLayer();
    updateSchoolsLayer();
}
function updateZipLayer(){

    var whereClause=buildPolygonWhere('geometry',TerritoryLayer);

    ZIPLayer.setOptions({
        query: {
            select: 'geometry',
            from: '1Eus1YAng8djJ2Jpva1pj5-l0cApi_t7qkhtx_FdH',
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
function updateHQLayer(){
    var whereClause=buildPolygonWhere('\'Location\'',TerritoryLayer);
    pointsLayer=HQLayer;
    pointColumn='Location';
    pointsLayer.setOptions({
        query: {
            select: pointColumn,
            from: '1iAWgy2kduM0OP8IQO-RXwaitksNYbODJ0wNJ1J9A',
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
    placesLayerWhereClause=where.join(' and ');

    console.log(where.join(' and '));
    pointsLayer.setOptions({
        query: {
            select: pointColumn,
            from: '17zSvgPwyPd22sa3kBw9vTPA01C0M8I5fkQqYZdR5',
            where: placesLayerWhereClause
        }
    });
    applyPlacesLayerMarkerStyle(map,pointsLayer,'Total population');
    updateLegend('Total population');
}
function updateSchoolsLayer(){
    var whereClause=buildPolygonWhere('\'Street Address, City, State\'',TerritoryLayer);
    schoolsLayerWhereClause=whereClause;
    console.log("SCHOOLSLayerwhereClause: " +whereClause);
    pointsLayer=SchoolsLayer;

    pointColumn='Street Address, City, State';
    pointsLayer.setOptions({
        query: {
            select: pointColumn,
            from: '1erkFcYkJgIXe1efAtMzEMHF9o1f0POrt4di3PffB',
            where: whereClause
        }
    });
//    applySchoolLayerMarkerStyle(map,pointsLayer,'School Level');
    applyPlacesLayerMarkerStyle(map,pointsLayer, 'High Grade*')
    updateLegend('High Grade*');

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
            console.log(infoToGet,e.row[infoToGet].value)
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
function getSchoolEnrollment(ncessch){
//'﻿NCES School ID'
    //"ncessch": "010000500871", "schnam": "ALBERTVILLE HIGH SCH"
    var url ='https://www.googleapis.com/fusiontables/v2/query';

    //getting students count
    var schoolsParams={
        sql:'SELECT Students FROM 17FUnsz-S_NJuY--a-xOBSjHwwoB_t6ZWOEoy7jye WHERE \'﻿NCES School ID\'='+ncessch,
        key:'AIzaSyBxU4HyG1hKhXu4cQknx6uvJfW1rVuuaNc'
    }
    var schoolsqueryurl=url+formatParams(schoolsParams);
    console.log(schoolsqueryurl);
    var schoolsjson=JSON.parse(Get(schoolsqueryurl));
    console.log(schoolsjson);
    return schoolsjson.rows[0];

}
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
            console.log('the property ',column,' is not available...'); // print into console
        }

    }
    //for school layer we are displaying student count from fusion tables
    if (layer=='SchoolDistrictLayer'){
        var ncessh=e.feature.getProperty("ncessch");
        console.log('ncessh',Number(ncessh));
        var students = getSchoolEnrollment(ncessh);
        node= document.createTextNode('Students: '+students);
        infoContent.appendChild(node);
        infoContent.appendChild(document.createElement("br"));

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
