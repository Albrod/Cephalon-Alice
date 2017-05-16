var functions = require('firebase-functions');
var fs = require('fs');

const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

// Query Codex
// Returns -1 for not found, 0 for not mastered, and 1 for mastered.
exports.queryCodex = functions.https.onRequest((req, res) => {
  console.log("Starting query!");
  // Grab the query parameters.
  const name = req.query.name;
  const userID = req.query.id;
  console.log("Name = " + name + " | user = " + userID);

  var categories = ["warframes", "archwings", "weapons", "archwingWeapons", "companions"];
  // Get ID of entry.
  var entryID = -1;

  console.log("Pulling index!");
  admin.database().ref('/data/index').once('value').then(snapshot => {
    var freshData = snapshot.val();
    var entry = freshData[name];
    if (entry) {
      entryID = entry.id;
    }
  });

  console.log("Entry: " + entryID);
  if (entryID === -1) {
    res.status(200).send("-1");
  }

  console.log("Accessing mastery info!");
  admin.database().ref('/users/' + userID + '/codex').once('value').then(snapshot => {
    console.log("Checking BD.");
    var freshData = snapshot.val();
    for (var entryDB in freshData) {
      if (entryID === entryDB) {
        console.log("Mastered!");
        res.status(200).send("1");
      }
    }
    console.log("Not mastered!");
    res.status(200).send("0");
  });
});
