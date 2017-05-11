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

  // Page load functions
  if (window.location.pathname.includes("login.html")) {
    loadLogin();
  }

  $(".btn-logout").click(function( e ) {
    e.preventDefault();
    firebase.auth().signOut().then(function() {
      window.location.href = "../login/login.html";
    }).catch(function(error) {
      console.log(errorCode + " | " + errorMessage );
    });
  });
});
