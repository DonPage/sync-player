angular.module("sync-player", [ 'ngRoute', 'ngMaterial', 'ngRoute', 'firebase' ])
    .constant('FIREBASE_URI', 'https://sync-player.firebaseio.com')
    .config(function ($routeProvider) {
        $routeProvider
            .when("/", {
                controller: "homeController",
                templateUrl: "views/home.html"
            })
            .otherwise({
                redirectTo: "/"
            })
    })


    .controller("homeController", function ($scope, appService) {
        console.log("home");
        $scope.testing = 'got test yo';


    });