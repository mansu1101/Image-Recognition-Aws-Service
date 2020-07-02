const connectionManager = require("connectionManager");
exports.getEmployeeList = function(){
let db  = connectionManager.instance();
    db.collection("employee").findOne({}, function(err, result) {
        if (err) throw err;
        console.log(result);
        db.close();
    });
}

exports.registerEmployee = function(empDetails, next){
    let db  = connectionManager.instance();
    db.collection("employee").insertOne(empDetails, function(err, res) {
        if (err) throw err;
        console.log("Employee stored success!");
        db.close();
    });
}