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
      window.location.href = "../login/login.html";
    }).catch(function(error) {
      console.log(errorCode + " | " + errorMessage );
    });
  });

  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      // User logged in callback
      if (window.location.pathname.includes("login.html")) {
        // Enter site if logged in.
        window.location.href = "../codex/codex.html";
      }

      // Page load functions
      if (window.location.pathname.includes("codex.html")) {
        loadCodex();
      }

    } else {
      // No user is signed in.
      if (!window.location.pathname.includes("login.html")) {
        // Make sure we're not looping on login page.
        window.location.href = "../login/login.html";
      }
    }
    if (window.location.pathname.includes("login.html")) {
      loadLogin();
    }
  });

  $(document).on('click', 'a', function(event){
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
  }, 500);
}
function fadeShow(ele) {
  setTimeout(function(){
    ele.css("display", "");
    setTimeout(function(){
      ele.css("opacity", "");
    }, 500);
  }, 500);
}
