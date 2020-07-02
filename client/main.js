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
    $scope.testme = "Yee you can see me";
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
        if (response.data && response.data.matchedFace) {
            $scope.isFileMatched = true;
            $scope.matchedFileSrc = response.data.matchedFace;
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
        $scope.unMatchMessage = "Unknown Error occurred while matching the face !!!";
    }

    /**
     * Function to upload a file into server, in order to match a look-alike face.
     */
    $scope.uploadFile = function () {
        $scope.showUnMatchMessage = false;
        $scope.isFileMatched = false;
        $scope.showLoadingIcon = true;
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

    };
    $scope.user = {
        empId: '',
        name: '',
        department: '',
        email: '',
        mobile: ''
    };

    function OnRegisterSuccess() {
        //model hide and show the toster message
        //toaster.pop('success', "success", "Employee register successfully.");
        $('#registerModel').modal('hide');
        $('#scanImage').modal('show');
    }

    function OnRegisterFail() {
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
        console.log("Rigter image:::",$scope.myFile);
        var file = $scope.myFile;
        var fd = new FormData();
        fd.append('image', file);
        $scope.user.empId = 1;
        let request = {
            fd: fd,
            empId: $scope.user.empId
        }

        if ($scope.user.empId) {
            let url = $location.protocol() + '://' + $location.host() + ':' + $location.port() + '/api/registerImage';
            $http.post(url, request, {
                headers: {'Content-Type': "application/json"}
            }).then(OnRegisterSuccess).catch(OnRegisterFail);
        }
    }
}]);