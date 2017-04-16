
var MongoClient = require('mongodb').MongoClient;

var myCollection;
var db = MongoClient.connect('mongodb://mongodb_oXf:7D9SHU2BHbsNbw3ahnypzPD52Wc3d37Q@virt63753.loopback.zonevs.eu:5678/mongodb_z5u',
    function(err, db) {
        if(err)
            throw err;
        console.log("connected to the mongoDB !");
        myCollection = db.collection('test_collection');

        myCollection.insert({name: "doduck", description: "learn more than everyone"}, function(err, result) {
            if(err)
                throw err;

            console.log("entry saved");
        });

    });
function initNodeJs() {
    console.log('nodejs init');

}
