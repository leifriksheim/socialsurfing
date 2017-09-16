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
  mounted() {
    var vm = this;
    var database = window.database;

    vm.userKey = database.ref('users').push('').key;
    vm.createUser();

    // Get all the userID of all other people on the page
    database.ref('users').on('value', function(snapshot) {
      vm.otherUsers = snapshot.val();
    });

    // Remove the user before a user is closing the page
    window.addEventListener("beforeunload", function (event) {
      event.preventDefault();
      window.database.ref('users/' + vm.userKey).remove();
      return 'Logget ut';
    });
  },
  data: {
    peer: null,
    connection: null,
    userKey: '',
    otherUsers: [],
    mousePositions: {},
  },
  methods: {
    createUser() {
      var vm = this;

      vm.peer = new Peer(vm.userKey, {key: 'emk6lwq175xhto6r'});

      // Start sending mousepointer data
      vm.peer.on('connection', function(conn) {
        conn.on('data', function(data){
          var userID = data.userID;
          vm.$set(vm.mousePositions, userID, data);
          console.log(vm.mousePositions);
        });
      });
    },
  },
  watch: {
    otherUsers(users) {
      var vm = this;
      
      for (var key in users) {
        if (users.hasOwnProperty(key)) {

          if(key != vm.userKey) {
            vm.connection = this.peer.connect(key);
            vm.connectedToUser = true;

            vm.connection.on('open', function(){
              document.addEventListener("mousemove", function (e) {
                setTimeout(function () {
                  var userID = vm.userKey;
                  var X = e.clientX;
                  var Y = e.clientY;
                  vm.connection.send({x: X, y: Y, userID: userID});
                }, 50);
              });
            });
          }

        }
      };
    },
  },
});
