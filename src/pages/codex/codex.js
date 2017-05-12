function loadCodex() {
  updateDB();

  var warframeData = $.ajax('../../data/codex/warframes.json', { async: false }).responseText;
  wData = JSON.parse(warframeData);
  renderCodex("warframes", wData);
}

function renderCodex(cat, data) {
  var count = 0;
  var cat_id;
  switch (cat) {
    case 'warframes':
    cat_id = 1;
    break;
    case 'weapons':
    cat_id = 2;
    break;
    case 'companions':
    cat_id = 3;
    break;
    case 'sentinelWeapons':
    cat_id = 4;
    break;
    case 'archwings':
    cat_id = 5;
    break;
    case 'archwingWeapons':
    cat_id = 6;
    break;
  }

  $.each( data, function( id, value ) {
    var row = null;
    // Check if new row is needed.
    /*if (count % 6 === 0) {
    row = $('<div>', {class: "row mb-5"}).appendTo("#" + cat + "Div");
  } else {
  row = $("#" + cat + "Div .row:last-child");
}*/

row = $("#" + cat + "Div .row:last-child");
var entryDiv = $('<div>', {class: "col-sm-2 codex-entry", id: cat_id + id}).appendTo(row);

var entryImg = $('<img>', {class: "codex-img", src: "../../rsc/img/" + cat + "/" + value + ".png"}).appendTo(entryDiv)
$('<h5>', {class: "mt-2", text: value}).appendTo(entryDiv)

entryImg.click(function( e ) {
  var div = $(this).parent();
  if (!div.hasClass("dirty")){
    dirtyEntry(div);
  } else {
    resetEntry(div);
  }
});

count++;
});
}

// Apply gilded style and dirty bit to entryDiv
function dirtyEntry(div) {
  if (div.children(".gilded-img").length > 0) {
    // Is currently gilded
    div.children().remove(".gilded-img");
  } else {
    // Not gilded
    var gildedImg = $('<img>', {class: "gilded-img", src: "../../rsc/img/gold_logo.png"}).appendTo(div)
    gildedImg.click(function( e ) {
      resetEntry($(this).parent());
    });
  }

  div.addClass("dirty");
}
function resetEntry(div) {
  if (div.children(".gilded-img").length > 0) {
    // Is currently gilded
    div.children().remove(".gilded-img");
  } else {
    // Not gilded
    var gildedImg = $('<img>', {class: "gilded-img", src: "../../rsc/img/gold_logo.png"}).appendTo(div)
    gildedImg.click(function( e ) {
      dirtyEntry($(this).parent());
    });
  }
  div.removeClass("dirty");
}

// Bidirectional database sync.
function updateDB() {
  var userId = firebase.auth().currentUser.uid;
  var database = firebase.database();

  // Sync current data from DB.
  firebase.database().ref('/users/' + userId + '/codex').once('value').then(function(snapshot) {
    var freshData = snapshot.val();
    for (var entry in freshData) {
      var div = $("#" + entry);
      gildedImg = $('<img>', {class: "gilded-img", src: "../../rsc/img/gold_logo.png"}).appendTo(div);
      div.addClass("mastered");
      gildedImg.click(function( e ) {
        dirtyEntry($(this).parent());
      });
    }
  });

  // Push changes to DB.
  if ($(".dirty").length > 0) {
    var newCodex = {}
    $(".codex-entry .gilded-img").parent().each(function( index ) {
      newCodex[$(this).attr("id")] = true;
    });
    console.log("newCodex: " + newCodex);
    firebase.database().ref('users/' + userId + '/codex').set(newCodex);
    location.reload();
  }

}
