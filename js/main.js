angular.module("sync-player", [ 'ngRoute', 'ngMaterial', 'ngRoute', 'firebase', 'youtube-embed' ])
    .constant('FIREBASE_URI', 'https://sync-player.firebaseio.com')
    .config(function ($routeProvider) {
        $routeProvider
            .when("/", {
                controller: "homeController",
                templateUrl: "views/home.html"
            })
            .when("/room/:roomname", {
                controller: "roomController",
                templateUrl: "views/room.html"
            })
            .otherwise({
                redirectTo: "/"
            })
    })


    .controller("homeController", function ($scope, $firebase) {

        var ref = new Firebase("https://sync-player.firebaseio.com/rooms");
        var fb = $firebase(ref);

        var syncObj = fb.$asObject();
        var list = fb.$asArray();

        $scope.createRoom = function(room, user){
            console.log(room);

            if(!room){
                return;
            }//else

            console.log(syncObj);
            console.log(list);

            var rec = list.$getRecord(room);
            console.log("rec:",rec);
            if(rec === null){
                fb.$set(room, {
                    currentIndex: 0,
                    currentPlayList: "none",
                    devices: "", //user device will be pushed in once the user loads next window.
                    roomCreated: Firebase.ServerValue.TIMESTAMP,
                    roomCreator: user,
                    playlist: "",
                    nowPlaying: "",
                    playingDevice: ""
                });
                window.location.hash = "#/room/"+room;
                return console.log("room created!");
            }

        }
    })

    //This controller is old code from firebase 0.6.0. $child was removed in newest versions,
    //going to have to approach this a different way.
    .controller("memberControllerOLDCODE", function ($scope, appService, $routeParams, youtubeEmbedUtils) {

        $scope.syncPlayIndex = appService.syncIndex($routeParams.roomname);

        $scope.songArray = appService.syncSongArray($routeParams.roomname);

//        $scope.songArraySnap = appService.snapSongArray($routeParams.roomname);

        $scope.agent = navigator.platform;
        appService.savingDeviceLS(navigator.platform, $routeParams.roomname);

        $scope.playOn = function (device) {
            console.log(device);
            appService.setPlayingDevice(device, $routeParams.roomname);
        };

        $scope.playingDevice = appService.getPlayingDevice($routeParams.roomname);

        $scope.deviceArray = appService.getDevices($routeParams.roomname);

        $scope.nowPlaying = function (value) {
            console.log("value:", value);
        };

        //this sync the video link
        $scope.playingVideo = appService.syncVideo($routeParams.roomname);

        $scope.playerVar = {
            autoplay: 1, //auto play video = true;
            events: {
                'onStateChange': updateState
            }
        };


        $scope.newVideo = function (link, idx) { //updates video link to the database.

            console.log("newVideo()",link, idx);
//            console.log("playlist:", $scope.songArraySnap);
            var getID = youtubeEmbedUtils.getIdFromURL(link);

            appService.updateVideo(getID, $routeParams.roomname, idx);
        };

        $scope.currentAction = appService.syncAction($routeParams.roomname);

        $scope.action = function (action) {
            console.log("player:", player);
            appService.sendAction(action, $routeParams.roomname);
//            updateState();
            if (action == 'play') {
                $scope.playerVar.playVideo();
            } else {
                $scope.playerVar.pauseVideo();
            }
        };

        function updateState(event) {
            console.log("updateState", event);


//            $scope.$on("youtube.player.playing", function($event, player){
//                console.log("youtube.player.playing");
//
//                if ($scope.currentAction.$value == 'play') {
//                    console.log("PLAY");
//                    player.playVideo();
//                } else {
//                    console.log("ELSE PAUSE");
//                    player.stopVideo();
//                }
//            });

//            if ($scope.currentAction.$value == 'play') {
//                console.log("PLAY");
//                $scope.mainPlayer.playVideo();
//            } else {
//                console.log("ELSE PAUSE");
//                $scope.mainPlayer.stopVideo();
//            }
        }


        $scope.addToPlaylist = function (img, title, id) {
            console.log(img, title, id);
            appService.addToPlaylist(img, title, id, $routeParams.roomname);

        };

        $scope.$on('youtube.player.ended', function ($event, player) {
            // play it again
            appService.nextSong($routeParams.roomname);

//            player.playVideo();
        });


    })

    .controller("roomController", function($scope, $routeParams, youtubeEmbedUtils, $firebase){
        console.log("roomname:", $routeParams.roomname);

        //this just labels the current users device. Will be changed later once real account signup is working.
        var agent = navigator.platform;
        console.log("agent:", agent);

        var ref = new Firebase("https://sync-player.firebaseio.com/rooms/"+$routeParams.roomname);
        var devices = $firebase(ref.child("devices"));
        var fb = $firebase(ref);

        var syncObj = fb.$asObject();
        syncObj.$bindTo($scope, "room");
        console.log("syncObj", ref);


//        console.log($firebase(devices).$asObject());
        devices.$update(agent, {
            name: agent,
            onlineSince: Firebase.ServerValue.TIMESTAMP,
            owner: "guest"//this will be dynamic once login is up.
        });








    })

    .controller("searchController", function ($scope, $routeParams, $http) {
        var resultsArray = [];
        $scope.resultArray = "";

        $scope.searchYoutube = function (q) {
            console.log("search youtube:", q);

            $http.get("https://www.googleapis.com/youtube/v3/search" +
                "?part=snippet" +
                "&q="+ q +"" +
                "&maxResults=50"+
                "&key=AIzaSyAOs-x4CHR-D4ohbrNImXJIvCBCGYiXH6s")
                .success(function(data){
                    $scope.resultArray = data.items;
                    console.log("RESULTS array",$scope.resultArray);

                })
                .error(function(data){
                    console.log("YT ERROR:", data);
                });
        }
    });

