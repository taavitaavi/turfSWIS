console.log('May Node be with you')
const express = require('express');
var url = require('url');
var jsonfile = require('jsonfile')
var fs = require('fs')
const app = express();
const bodyParser= require('body-parser');
app.use(express.static(__dirname));
app.use(bodyParser.json())

const MongoClient=require('mongodb').MongoClient;

MongoClient.connect('mongodb://mongodb_oXf:7D9SHU2BHbsNbw3ahnypzPD52Wc3d37Q@virt63753.loopback.zonevs.eu:5678/mongodb_z5u',function(err,database){
        if (err) return console.log(err)
        db = database;

        app.listen(3009,function(){
                console.log('listening on 3009');
                });
});

app.put('/quotes', (req, res) => {
  // Handle put request 
  db.collection('quotes')
  .findOneAndUpdate({name: 'Yoda'}, {
    $set: {
      name: req.body.name,
      quote: req.body.quote
    }
  }, {
    sort: {_id: -1},
    upsert: true
  }, (err, result) => {
    if (err) return res.send(err)
    res.send(result)
  })
  console.log('updated yoda text');
})



app.get('/', (req, res) => {
	console.log('sending main.html')
  res.sendFile(__dirname + '/main.html')
  // Note: __dirname is directory that contains the JavaScript source 
	db.collection('quotes').find().toArray((err, result) => {
    if (err) return console.log(err)
    console.log('resulting quotes: ');
    console.log({quotes:result})
  })

});

app.post('/quotes', (req, res) => {
    console.log('received quotes post request')
})
function getSchoolsFromDatabase(database,req,res) {
    console.log('getting info from: ',database);
    var url_parts = url.parse(req.url, true);
    var query = url_parts.query;
    console.log(query.turfBoundaries);
    var boundaries=[];
    var obj=JSON.parse(query.turfBoundaries);
    //console.log(obj[0]);

    for (i = 0; i < obj.length; i++) {
        var lng=obj[i][0];
        var lat=obj[i][1];
        var lnglat=[lng,lat];
        console.log(lnglat);
        boundaries.push(lnglat)
    }

    var geojsonPoly = {
        type: 'Polygon',
        coordinates: [boundaries]
    };
    var queryresult={ "type": "FeatureCollection",
        "crs": { "type": "name", "properties": { "name":
            "urn:ogc:def:crs:OGC:1.3:CRS84" } }};

    console.log(geojsonPoly);
    db.collection(database).find( { geometry :
        { $geoWithin :
            { $geometry : geojsonPoly } } }, { _id: 0 } ).toArray((err,
        result) => {
        if (err) return console.log(err)
        console.log('resulting ');
    //console.log(result);
    queryresult.features=result;

    res.send(queryresult)
});

}

app.get('/ND_MS', (req, res) => {
        console.log('got /ND_MS  get request');
    getSchoolsFromDatabase('ND_MS',req,res);

});

app.get('/US_HS', (req, res) => {
    console.log('got /US_HS  get request');
getSchoolsFromDatabase('US_HS',req,res);

});
app.get('/US_MS', (req, res) => {
    console.log('got /US_MS  get request');
getSchoolsFromDatabase('US_MS',req,res);

});

app.get('/US_EL', (req, res) => {
    console.log('got /US_EL  get request');
getSchoolsFromDatabase('US_EL',req,res);

});