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

        $scope.login = function (username) {
            console.log(username);
            if(!username){
                return;
            } else {
                
            }


        }


    });