angular.module("sync-player")
    .service("appService",  ['$firebase', 'FIREBASE_URI', function ($firebase, FIREBASE_URI) {

        var ref = new Firebase(FIREBASE_URI);
        var membersRef = ref.child("users");
        var membersSync = $firebase(ref).child('users');


        this.enterSession = function (name) {
            console.log("enterSession");
            var userRef = membersRef.child(name);
            userRef.once("value", function (snapshot) {
                //gets user data

                if (snapshot.val() == null) { //if user does not exist
                    userRef.set({
                        name: name,
                        joined: Firebase.ServerValue.TIMESTAMP,
                        devices: "",
                        playlist: "",
                        playingDevice: "",
                        nowPlaying: ""
                    });
                    window.location.hash = "#/member/"+name;
                    console.log("room created");
                } else {
                    window.location.hash = "#/member/"+name;
                    return console.log("you already have account made");
                }
            }, function (errorObject) {
                console.log("The read failed: " + errorObject.code);
            });
        };

        this.savingDeviceLS = function (device, user) {
            console.log("savingLS");
            var obj = {device: device, username: user};
            var objString = JSON.stringify(obj);
            localStorage.setItem("sync-device", objString);
            addFirebaseDevice(device, user);
        };

        this.getPlayingDevice = function (user) {
            console.log("getPlayingDevice()");
            var playingDeviceRef = membersSync.child(user).child("playingDevice");
            return playingDeviceRef;
        };

        this.setPlayingDevice = function (device, user) {
            var userRef = membersRef.child(user);
            userRef.update({
                playingDevice: device
            })
        };

        this.getDevices = function (user) {
            var devices = membersSync.child(user).child("devices");
            return devices;
        };

//        this.getNowPlaying = function (user) {
//            var nowPlaying = membersSync.child(user).child("nowPlaying");
//            return console.log("nowplaying");
//        };

        this.sendAction = function(action, user) {
            var userRef = membersRef.child(user);
            console.log("sendAction");
            userRef.update({
                action: action
            })
        };

        this.syncAction = function (user) {
            var actionRef = membersSync.child(user).child("action");
            return actionRef;
        };

        this.syncVideo = function (user) {
            return membersSync.child(user).child("nowPlaying");
        };

        this.syncIndex = function (user) {
            return membersSync.child(user).child("currentIndex");
        };

        this.updateVideo = function(link, user, idx){
            console.log("updateVideo()", link);
            var userVideoRef = membersRef.child(user);
            userVideoRef.update({
                nowPlaying: link,
                currentIndex: idx
            })
        };

        function addFirebaseDevice(device, member){
            var userDevicesRef = membersRef.child(member).child("devices");
            userDevicesRef.child(device).set({
                name: device,
                status: ""
            })
        }

        this.addToPlaylist = function (img, title, id, user) {
            var playListRef = membersRef.child(user).child("playlist");
            playListRef.push({
                thumb: img, title: title, id: id
            })
        };

        this.nextSong = function (user) {
            console.log("NEXT SONG!");
            var userVideoRef = membersRef.child(user);
            var playlistRef = membersRef.child(user).child("playlist");

            playlistRef.once("value", function(dataSnapshot){
                console.log(dataSnapshot.val());
                var songs = dataSnapshot.val();
                for (var keys in songs) {
                    if (songs.hasOwnProperty(keys)) {
                        userVideoRef.update({
                            nowPlaying: songs[keys].id
                        });
                        console.log("firstSong key:", keys);
                        //deletes the random (push) id gernerated for the song.
                        var firstSongRef = membersRef.child(user).child("playlist").child(keys);
                        //pushes first song to the end of playlist
                        playlistRef.push({
                            id: songs[keys].id, thumb: songs[keys].thumb, title: songs[keys].title
                        });
                        //remove the song from the front of playlist
                        firstSongRef.remove();
                        //return out of .once so it only does this operation on the first song in playlist
                        return console.log(songs[keys].id);
                    }
                }
            })
        };

        this.syncSongArray = function (user) {
            return membersSync.child(user).child("playlist")
        };

        this.songArraySnap = function (user) {
            var songs = membersSync(user).child("playlist");

            var list = songs;

            return list;

        }

    }]);