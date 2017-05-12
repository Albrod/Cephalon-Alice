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

    firebase.auth().createUserWithEmailAndPassword(email, password).catch(function(error) {
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
