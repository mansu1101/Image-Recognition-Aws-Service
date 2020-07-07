angular.module('imageRecognition', []).directive("fileHandler", [function () {
    return {
        restrict: "A",
        scope: {
            fileinput: "=",
            filepreview: "="
        },
        link: function (scope, element, attributes) {
            element.bind("change", function (changeEvent) {
                scope.fileinput = changeEvent.target.files[0];
                var reader = new FileReader();
                reader.onload = function (loadEvent) {
                    scope.$apply(function () {
                        scope.filepreview = loadEvent.target.result;
                    });
                };
                reader.readAsDataURL(scope.fileinput);
            });
        }
    }
}]).controller('MyCtrl', ['$scope', '$location', '$http', function ($scope, $location, $http) {

    const video = document.getElementById('video');

    Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri('models'),
        faceapi.nets.faceLandmark68Net.loadFromUri('models'),
        faceapi.nets.faceRecognitionNet.loadFromUri('models'),
        faceapi.nets.faceExpressionNet.loadFromUri('models')
    ]).then(startVideo)

    function startVideo() {
        navigator.getUserMedia({video: {}},
            stream => video.srcObject = stream,
            err => console.error(err)
        )
    }

    video.addEventListener('play', () => {
        const canvas = faceapi.createCanvasFromMedia(video)
        document.body.append(canvas)
        const displaySize = {width: video.width, height: video.height}
        faceapi.matchDimensions(canvas, displaySize)
        setInterval(async () => {
            const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions()
            const resizedDetections = faceapi.resizeResults(detections, displaySize)
            canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
            /* faceapi.draw.drawDetections(canvas, resizedDetections)
             faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
             faceapi.draw.drawFaceExpressions(canvas, resizedDetections)*/
        }, 100)
    })

    $scope.isCapturedImage = true;
    $scope.cpImage = function (model) {
        $scope.captureImage();
        $scope.isCapturedImage = false;
        /*console.log("Model", model)
        if (model === "myModalLabel7") {
            $('#myModalLabel6').modal('hide');
            $('#myModalLabel7').modal('show');
        } else {
            $('#myModalLabel6').modal('show');
            $('#myModalLabel7').modal('hide');
        }*/
    }
    $scope.captureImage = function () {
        console.log("Capture Image from register Image");
        var image = document.getElementById('capImg');
        image.width = video.videoWidth;
        image.height = video.videoHeight;
        var canvas = document.getElementById('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataURL = canvas.toDataURL('image/jpeg');
        video.hidden = true;
        image.hidden = false;
        image.src = dataURL;
        $scope.isCapturedImage = false;
        saveFile(dataURL);
    };

    function saveFile(base64String) {
        let file = dataURLtoFile(base64String, "image.jpeg");
        $scope.myFile = file;
    }

    function dataURLtoFile(dataurl, filename) {
        var arr = dataurl.split(','),
            mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]),
            n = bstr.length,
            u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], filename, {type: mime});
    }

    $scope.$watch("myFile", function (oldVal, newVal) {
        if (oldVal !== newVal) {
            $scope.showUnMatchMessage = false;
            $scope.isFileMatched = false;
        }
    });

    /**
     * Function to handle http success response.
     * @param response - http response.
     */
    function handleSuccessResponse(response) {
        console.log("Image fetch success!!");
        $scope.showLoadingIcon = false;
        if (response.data && response.data.image) {
            $scope.isFileMatched = true;
            $scope.employeeData = response.data.empDetails;
            console.log(" $scope.employeeData", $scope.employeeData)
            $scope.matchedFileSrc = "data:image/png;base64," + response.data.image;
            $scope.ShowSuccessMessage = "Your attendance has been submitted successfully!";
        } else {
            $scope.showUnMatchMessage = true;
            $scope.unMatchMessage = response.data;
        }
    }

    /**
     * Function to handle http error response.
     * @param error - http error.
     */
    function handleErrorResponse(error) {
        console.log("error!!");
        $scope.showLoadingIcon = false;
        $scope.showUnMatchMessage = true;
        $scope.unMatchMessage = "Your face is not registered in this system!!!";
    }

    /**
     * Function to attendance a into server, in order to match a look-alike face.
     */
    $scope.attendance = function () {
        if($scope.isRegisterSucess){
            $scope.registerImage();
        }else{
            $scope.showUnMatchMessage = false;
            $scope.isFileMatched = false;
            $scope.showLoadingIcon = true;
            var image = document.getElementById('capImg');
            image.hidden = true;
            image.src = "";
            video.hidden = false;
            $('#scanImage').modal('hide');
            console.log("Upload file is working...");
            var file = $scope.myFile;
            var fd = new FormData();
            fd.append('image', file);
            var url = $location.protocol() + '://' + $location.host() + ':' + $location.port() + '/api/attendance';
            if (file) {
                $http.post(url, fd, {
                    transformRequest: angular.identity,
                    headers: {'Content-Type': undefined}
                }).then(handleSuccessResponse).catch(handleErrorResponse);
            } else {
                $scope.showLoadingIcon = false;
                alert("Please Capture A Image!");
            }
        }


    };
    $scope.user = {
        empId: '',
        name: '',
        department: '',
        email: '',
        mobile: ''
    };
    $scope.preViewImage = false;
    $scope.scanClick = function () {
        $scope.isRegisterSucess = false;
        $scope.preViewImage = true;
    }
    $scope.isRegisterSucess = false;

    function OnRegisterImageSuccess() {
        //model hide and show the toster message
        //toaster.pop('success', "success", "Employee register successfully.");
        $('#scanImage').modal('hide');
        alert("Image captured for empId:" + $scope.user.empId);
    }
    $scope.ScanImageForAtt = function () {
    $scope.showUnMatchMessage = "";
    }
    function OnRegisterSuccess() {
        $scope.isRegisterSucess = true;
        //model hide and show the toster message
        //toaster.pop('success', "success", "Employee register successfully.");
        $('#registerModel').modal('hide');
        $('#scanImage').modal('show');
    }

    function OnRegisterFail() {
        $scope.isRegisterSucess = false;
        //model hide and show the toster message
        // toaster.pop('success', "success", "Fail to register Employee details.");
        $('#registerModel').modal('hide');
        alert("Fail to register Employee details.");
    }

    $scope.register = function () {
        if ($scope.user) {
            let url = $location.protocol() + '://' + $location.host() + ':' + $location.port() + '/api/register';
            $http.post(url, $scope.user, {
                headers: {'Content-Type': "application/json"}
            }).then(OnRegisterSuccess).catch(OnRegisterFail);
        }
    }
    $scope.registerImage = function () {
        $scope.isCapturedImage = !$scope.isCapturedImage;
        var file = $scope.myFile;
        var fd = new FormData();
        fd.append('image', file);// for multer it's required.
        fd.append('empId', $scope.user.empId);
        if ($scope.user.empId) {
            let url = $location.protocol() + '://' + $location.host() + ':' + $location.port() + '/api/registerImage';
            $http.post(url, fd, {
                transformRequest: angular.identity,
                headers: {'Content-Type': undefined}
            }).then(OnRegisterImageSuccess).catch(OnRegisterFail);
        }
    }
}]);