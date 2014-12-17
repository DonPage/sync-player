angular.module("sync-player", [ 'ngRoute', 'ngMaterial', 'ngRoute', 'firebase' ])
    .constant('FIREBASE_URI', 'https://sync-player.firebaseio.com')
    .config(function ($routeProvider) {
        $routeProvider
            .when("/", {
                controller: "homeController",
                templateUrl: "views/home.html"
            })
            .when("/member/:username", {
                controller: "memberController",
                templateUrl: "views/member.html"
            })
            .otherwise({
                redirectTo: "/"
            })
    })


    .controller("homeController", function ($scope, appService) {

        $scope.login = function (username) {
            console.log(username);
            if (!username) {
                return;
            } else {
                appService.enterSession(username);
            }
        }
    })

    .controller("memberController", function ($scope, appService, $routeParams) {
        var nowPlayingdevice = "";
        $scope.agent = navigator.platform;
        appService.savingDeviceLS(navigator.platform, $routeParams.username);

        $scope.playOn = function (device) {
            console.log(device);
            appService.setPlayingDevice(device, $routeParams.username);
        };

        $scope.playingDevice = appService.getPlayingDevice($routeParams.username);

        $scope.deviceArray = appService.getDevices($routeParams.username);

        $scope.nowPlaying = function (value) {
            console.log("value:", value);
        };



    });