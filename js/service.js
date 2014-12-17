angular.module("sync-player")
    .service("appService",  ['$firebase', 'FIREBASE_URI', function ($firebase, FIREBASE_URI) {

        var ref = new Firebase(FIREBASE_URI);
        var membersRef = ref.child("users");
        var membersSync = $firebase(ref).$child('users');


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
                        playingDevice: ""
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
            var playingDeviceRef = membersSync.$child(user).$child("playingDevice");
            return playingDeviceRef;
        };

        this.setPlayingDevice = function (device, user) {
            var userRef = membersRef.child(user);
            userRef.update({
                playingDevice: device
            })
        };

        this.getDevices = function (user) {
            var devices = membersSync.$child(user).$child("devices");
            console.log(devices);
            return devices;
        };

        function addFirebaseDevice(device, member){
            var userDevicesRef = membersRef.child(member).child("devices");
            userDevicesRef.child(device).set({
                name: device,
                status: ""
            })

        }

    }]);