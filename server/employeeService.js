const connectionManager = require("./connectionManager");
exports.getEmployeeList = function (next) {
    let db = connectionManager.instance();
    db.collection("employee").find({}).toArray(function (err, res) {
        if (err) {
            next(err, null);
        } else {
            console.log("employee list success!")
            next(null, res);
        }
    });
}

exports.registerEmployee = function (empDetails, next) {
    let db = connectionManager.instance();
    db.collection("employee").insertOne(empDetails, function (err, res) {
        if (err) {
            next(err, null);
        } else {
            console.log("Employee stored success!");
            next(null, res.result);
        }
    });
}