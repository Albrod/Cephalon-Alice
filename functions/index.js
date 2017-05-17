var functions = require('firebase-functions');
var fs = require('fs');

const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

// Query Codex
// Returns -1 for not found, 0 for not mastered, and 1 for mastered.
exports.queryCodex = functions.https.onRequest((req, res) => {
  const discordID = req.query.id;
  // Check user registration.
  admin.database().ref('/registry/' + discordID).once('value').then(snapshot => {
    var userID = snapshot.val();
    if (userID) {
      const name = req.query.name.toLowerCase();
      console.log("User " + userID + " accepted! Starting query for " + name + "!");

      // Get ID of entry.
      var entryID = -1;
      admin.database().ref('/data/index').once('value').then(snapshot => {
        var freshData = snapshot.val();
        var entry = freshData[name];
        if (entry) {
          entryID = entry.id;
        }

        console.log("Entry: " + entryID);
        if (entryID === -1) {
          res.status(200).send("-1");
          return -1;
        }

        // Find entry in mastery ref
        admin.database().ref('/users/' + userID + '/codex').once('value').then(snapshot => {
          var freshData2 = snapshot.val();
          for (var entryDB in freshData2) {
            if (entryID === entryDB) {
              console.log("Mastered!");
              res.status(200).send("1");
              return 1;
            }
          }
          console.log("Not mastered!");
          res.status(200).send("0");
        });
      });
    } else {
      console.log("Not registered!");
      res.status(200).send("null");
    }
  });
});

// Add to Codex
// Returns -1 for not found, 0 for added, and 1 for already mastered.
exports.addToCodex = functions.https.onRequest((req, res) => {
  const discordID = req.query.id;
  // Check user registration.
  admin.database().ref('/registry/' + discordID).once('value').then(snapshot => {
    var userID = snapshot.val();
    if (userID) {
      console.log("Starting submission!");
      // Grab the query parameters.
      const name = req.query.name.toLowerCase();
      console.log("Name = " + name + " | user = " + userID);

      // Get ID of entry.
      var entryID = -1;

      admin.database().ref('/data/index').once('value').then(snapshot => {
        var freshData = snapshot.val();
        var entry = freshData[name];
        if (entry) {
          entryID = entry.id;
        }

        console.log("Entry: " + entryID);
        if (entryID === -1) {
          res.status(200).send("-1");
          return -1;
        }

        admin.database().ref('/users/' + userID + '/codex').once('value').then(snapshot => {
          var freshData2 = snapshot.val();
          for (var entryDB in freshData2) {
            if (entryID === entryDB) {
              console.log("Mastered!");
              res.status(200).send("1");
              return 1;
            }
          }

          var updates = {};
          updates['/users/' + userID + '/codex/' + entryID] = true;
          console.log("Submitting!");
          admin.database().ref().update(updates);

          res.status(200).send("0");
        });
      });
    } else {
      console.log("Not registered!");
      res.status(200).send("null");
    }
  });
});

// Register user
exports.registerUser = functions.https.onRequest((req, res) => {
  console.log("Starting registration!");
  // Grab the query parameters.
  const discordID = req.query.discord;
  const email = req.query.email;
  if (email) {
    admin.auth().getUserByEmail(email)
    .then(function(userRecord) {
      var userID = userRecord.uid;
      var updates = {};
      updates['/registry/' + discordID] = userID;
      console.log("Submitting!");
      admin.database().ref().update(updates);

      res.status(200).send("0");
    })
    .catch(function(error) {
      console.log("Error fetching user data:", error);
    });
  } else {
    var updates = {};
    updates['/registry/' + discordID] = null;
    console.log("Submitting!");
    admin.database().ref().update(updates);

    res.status(200).send("0");
  }
});
