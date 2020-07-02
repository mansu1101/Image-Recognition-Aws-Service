const config = require("./config");
let MongoClient = require('mongodb').MongoClient,
    instance = undefined;

function getConnection(next) {
    if (instance) {
        return next(null, instance);
    } else {
        MongoClient.connect(config.mongoUrl, function (err, db) {
            if (err) {
                throw err;
                next(err, null);
            } else {
                console.log("Database created!");
                instance = db;
                next(null, instance);
            }
        });
    }
}
getConnection((err, db) => {
    if(err){
        console.log("Error while creating the database:", err);
    }else{
        return db;
    }
});
exports.instance = function () {
    console.log("returning instance");
   return instance.db(config.dbName);
}
