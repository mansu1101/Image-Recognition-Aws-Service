// Import dependencies.
var multer = require("multer")();
var express = require("express");
var bodyParser = require('body-parser');
var path = require("path");
var awsService = require("./awsService");
const employeeService = require("./employeeService");

module.exports = function (app) {
    // Load the UI files.
    app.use(express.static(path.resolve(__dirname + "/../" + "/client")));
    app.use(bodyParser.json());

    // Register /api/recognize endpoint for HTTP POST method.
    app.post("/api/attendance", multer.single("image"), (req, res) => {
        employeeService.submitAttendance(req.file, (error, response) => {
            if (error) {
                res.status(500).json({error: error});
            } else {
                res.status(200).json(response);
            }
        });
    });
    app.get("/api/empList", (req, res) => {
        employeeService.getEmployeeList((error, response) => {
            if (error) {
                res.status(500).json({error: error});
            } else {
                res.status(200).json(response);
            }
        });
    });
    app.post("/api/register", (req, res) => {
        employeeService.registerEmployee(req.body, (error, response) => {
            if (error) {
                res.status(500).json({error: error});
            } else {
                res.status(200).json(response);
            }
        });
    });
    app.post("/api/registerImage", multer.single("image"), (req, res) => {
        employeeService.registerEmployeeImage({data : req.body, image :req.file}, (error, response) => {
            if (error) {
                res.status(500).json({error: error});
            } else {
                res.status(200).json(response.result);
            }
        });
    });
};