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
                    currentPlayList: "default",
                    devices: "", //user device will be pushed in once the user loads next window.
                    roomCreated: Firebase.ServerValue.TIMESTAMP,
                    roomCreator: user,
                    playlist: "default",
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
        $scope.agent = navigator.platform;
        var agent = navigator.platform;
        console.log("agent:", agent);

        var ref = new Firebase("https://sync-player.firebaseio.com/rooms/"+$routeParams.roomname);
        var devices = $firebase(ref.child("devices"));


        //this vars/$scopes will only hold current playlist/index, this will be used when addings songs to the right playlist.
        var syncCurrentPlaylist = null;
        $scope.currentIdx = $firebase(ref.child("currentIndex")).$asObject();

        $scope.currentIdx.$watch(function(){ //watched for change in current index so it can update syncIndex
                                             //syncIndex is used in other functions
            $scope.currentIdx.$loaded().then(function (data) {
                $scope.syncIndex = data.$value;
            });
        });

        $scope.currentPlaylist = $firebase(ref.child("currentPlayList")).$asObject();
        $scope.currentPlaylist.$loaded().then(function(data){
            console.log("$scope.currentPlaylist:", data.$value);
            syncCurrentPlaylist = data.$value;
            $scope.playListArray = $firebase(ref.child("playlist").child(syncCurrentPlaylist)).$asArray();
            $scope.playListArray.$loaded().then(function(data){
                console.log("$scope.playListArray:", data.length);
                $scope.syncPlaylistArray = data;
            })
        });


//        var playlist = $firebase(ref.child("playlist"));
        var fb = $firebase(ref);

        var syncObj = fb.$asObject();

        syncObj.$bindTo($scope, "room");
        console.log("syncObj", ref);

        //youtube player vars
        $scope.playerVar = {
            autoplay: 1 //auto play video = true;
        };
        $scope.$on('youtube.player.ended', function ($event, player) { //action once video ends.
            console.log("nextIndex:", $scope.syncIndex + 1,"/");
            var nextIdx = $scope.syncIndex + 1;
            var playlist = $scope.syncPlaylistArray;
            var playlistLength = playlist.length;

            if( nextIdx == playlistLength){ //failsafe for if user is at the end of playlist

                console.log("end of playlist, starting over");
                console.log("NEXT:", $scope.syncPlaylistArray[0]);

                return $scope.newVideo(playlist[0].id, 0); //play video at the beginning of array
            }

            console.log("NEXT:", $scope.syncPlaylistArray[$scope.syncIndex + 1]);
            $scope.newVideo(playlist[nextIdx].id, nextIdx);

        });


//        console.log($firebase(devices).$asObject());
        devices.$update(agent, {
            name: agent,
            onlineSince: Firebase.ServerValue.TIMESTAMP,
            owner: "guest"//this will be dynamic once login is set up.
        });

        //this function updates playingDevice
        $scope.switchPlayDevice = function (device) {
            console.log(device);
            fb.$update({
                playingDevice: device
            })
        };

        //plays new video from search array
        $scope.newVideo = function (vidLink, idx) {
            console.log("newVideo:", vidLink, idx);
            var id = youtubeEmbedUtils.getIdFromURL(vidLink);
            fb.$update({
                nowPlaying: id,
                currentIndex: idx
            })
        };

        //this function adds song to currentPlaylist
        $scope.addToPlaylist = function (playlist, img, title, id) {
            var playlistRef = $firebase(ref.child("playlist").child(playlist));
            console.log(playlist, title);
            playlistRef.$push({
                id: id, thumb: img, title: title
            })
        };











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

