var config = {
  apiKey: "AIzaSyAOfePZ6ZL_QAc7Pa77owUMXcatvIYjk8s",
  authDomain: "cephalon-4092a.firebaseapp.com",
  databaseURL: "https://cephalon-4092a.firebaseio.com",
  projectId: "cephalon-4092a",
  storageBucket: "cephalon-4092a.appspot.com",
  messagingSenderId: "443121088884"
};
var firebase;

$(function() {
  // Initialize Firebase
  firebase.initializeApp(config);

  $(".btn-logout").click(function( e ) {
    e.preventDefault();
    firebase.auth().signOut().then(function() {
      window.location.href = "login.html";
    }).catch(function(error) {
      console.log(errorCode + " | " + errorMessage );
    });
  });

  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        // Enter site if logged in.
        window.location.href = "codex.html";
    }

    loadLogin();
  });

  $(document).on('click', 'a.anchor', function(event){
    event.preventDefault();

    $('html, body').animate({
      scrollTop: $( $.attr(this, 'href') ).offset().top
    }, 500);
  });
});

function fadeHide(ele) {
  ele.css("opacity", "0");
  setTimeout(function(){
    ele.css("display", "none");
  }, 250);
}
function fadeShow(ele) {
  setTimeout(function(){
    ele.css("display", "");
    setTimeout(function(){
      ele.css("opacity", "");
    }, 250);
  }, 250);
}
function getURLParameter(name) {
  return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [null, ''])[1].replace(/\+/g, '%20')) || null;
}


function loadLogin() {
  $(".btn-signin").click(function( e ) {
    e.preventDefault();
    var email = $("#inputEmail").val();
    var password = $("#inputPassword").val();

    // Cleanup previous warnings.
    $(".has-danger").removeClass("has-danger");
    $(".has-warning").removeClass("has-warning");
    $("#emailFeedback").html("");
    $("#passwordFeedback").html("");

    firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      console.log(errorCode + " | " + errorMessage );
      switch (errorCode) {
        case 'auth/invalid-email':
        case 'auth/user-disabled':
        case 'auth/user-not-found':
        $("#inputEmail").parent().addClass("has-danger");
        $("#emailFeedback").html(errorMessage);
        break;
        case 'auth/wrong-password':
        $("#inputPassword").parent().addClass("has-danger");
        $("#passwordFeedback").html(errorMessage);
        break;
      }
    });
  });
  $(".btn-register").click(function( e ) {
    e.preventDefault();
    var email = $("#inputEmail").val();
    var password = $("#inputPassword").val();

    // Cleanup previous warnings.
    $(".has-danger").removeClass("has-danger");
    $(".has-warning").removeClass("has-warning");
    $("#emailFeedback").html("");
    $("#passwordFeedback").html("");

    firebase.auth().createUserWithEmailAndPassword(email, password).then(function(user) {
      var user = firebase.auth().currentUser;
      registerUser(user); // Optional
    },  function (error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      console.log(errorCode + " | " + errorMessage );
      switch (errorCode) {
        case 'auth/email-already-in-use':
        case 'auth/invalid-email':
        $("#inputEmail").parent().addClass("has-danger");
        $("#emailFeedback").html(errorMessage);
        break;
        case 'auth/weak-password':
        $("#inputPassword").parent().addClass("has-danger");
        $("#passwordFeedback").html(errorMessage);
        break;
      }
    });
  });
}

function registerUser (user) {
  var email = user.email;
  var uid = user.uid;

  var updates = {};
  updates['/users/' + uid + '/email'] = email;
  firebase.database().ref().update(updates);
}
