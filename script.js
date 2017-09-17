var config = {
    apiKey: "AIzaSyA1HRMl5QSjlgzyQdHNR7N9I5ZnayeQjQ0",
    authDomain: "mousepointer-69d16.firebaseapp.com",
    databaseURL: "https://mousepointer-69d16.firebaseio.com",
    projectId: "mousepointer-69d16",
    storageBucket: "",
    messagingSenderId: "690384379284"
  };

firebase.initializeApp(config);
var database = firebase.database();

var app = new Vue({
  el: '#app',
  data: {
    peer: null,
    database: window.database,
    remotePeers: [],
    connections: [],
    userKey: '',
    mousePositions: {},
  },
  mounted() {
    var vm = this;

    vm.createPeer();

    // Get all the userIDs of all other people on the page
    vm.database.ref('users').on('value', function(snapshot) {
      var users = snapshot.val();
      vm.connectToUsers(users);
    });

    // Remove the userID in firebase before a user is closing the page
    window.addEventListener("beforeunload", function (event) {
      event.preventDefault();
      window.database.ref('users/' + vm.userKey).remove();
      return 'Logget ut';
    });
  },
  methods: {
    createPeer() {
      var vm = this;

      // Create new user in firebase and set as userKey
      vm.userKey = vm.database.ref('users').push('').key;

      vm.peer = new Peer(vm.userKey, {key: 'emk6lwq175xhto6r'});


      // Start listening for mousepointer data
      vm.peer.on('connection', function(conn) {

        conn.on('data', function(data){
          var userID = conn.peer;
          // Vue stuff to make sure the object property is still reactive
          vm.$set(vm.mousePositions, userID, data);
        });

        conn.on('close', function(data){
          var userID = conn.peer;
          // Vue stuff to make sure the object property is still reactive
          vm.$delete(vm.mousePositions, userID);
        });

      });
    },
    connectToUsers(users) {
      var vm = this;

      // Loop trough other users and make a connection to each of them.
      for (var key in users) {
        if (users.hasOwnProperty(key)) {
          vm.connectToUser(key);
        }
      };
    },
    connectToUser(userID) {
      var vm = this;
      if(userID != vm.userKey) {
        var connection = vm.peer.connect(userID);
        vm.remotePeers.push(connection.peer);
        vm.connections.push(connection);

        connection.on('open', function(){
          document.addEventListener("mousemove", function (e) {
            setTimeout(function () {
              var userID = vm.userKey;
              var X = e.clientX;
              var Y = e.clientY;
              connection.send({x: X, y: Y, userID: userID});
            }, 50);
          });
        });
      };
    },
  },
});
