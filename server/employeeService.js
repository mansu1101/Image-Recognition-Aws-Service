const connectionManager = require("./connectionManager");
let awsService = require("./awsService")

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

exports.registerEmployeeImage = function (empData, next) {
    awsService.registerFace(empData.image, (err, data) => {
        if (!err) {
            console.log("S3 upload successful - ", data); // successful response
            let db = connectionManager.instance();
            let query = {
                empId: parseInt(empData.data.empId)
            };
            db.collection("employee").update(query,
                {$set: {faceId: data.key}}, function (error, result) {
                    next(error, result);
                })
        } else {
            console.error("S3 upload error - ", err); // successful response
        }
    });
}

exports.submitAttendance = function (file, next) {
    awsService.matchFaces(file, function (err, data) {
        if (!err) {
            console.log("face matched successfully")
            let db = connectionManager.instance();
            db.collection("employee").find({faceId: data.faceId}).toArray(function (error, result) {
                if (result && result.length && result[0].empId) {
                    let date = new Date();
                    let attendanceData = {
                        empId: result[0].empId,
                        status: 1,
                        date: date,
                    }
                    db.collection("attendance").insertOne(attendanceData, function (err, res) {
                        console.log("attendance submitted successfully");
                        next(null, {image : data.matchedFace, empDetails: result[0]});
                    })
                } else {
                    next("No employee with faceId", null)
                }
            })
        } else {
            next("your face does not matched to any face", null);
        }
    })
}