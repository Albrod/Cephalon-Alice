var totals = [0,0,0,0,0,0];
var counters;
function loadCodex() {
  var warframeData = $.ajax('../../data/codex/warframes.json', { async: false }).responseText;
  wData = JSON.parse(warframeData);
  renderCodex("warframes", wData);

  updateDB();
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

  var sortArr = sortData(data);
  $.each( sortArr, function( i, obj ) {
    var id = obj.key;
    var entry = obj.value;
    var row = null;
    // Check if new row is needed.

    row = $("#" + cat + "Div .row:last-child");
    var entryDiv = $('<div>', {class: "col-sm-2 codex-entry", id: cat_id + id}).appendTo(row);

    var entryImg = null;
    var image_url = "../../rsc/img/" + cat + "/" + entry + ".png";
    $.get(image_url).done(function() {
      entryImg = $('<img>', {class: "codex-img", src: image_url}).appendTo(entryDiv);
      entryImg.click(function( e ) {
        var div = $(this).parent();
        dirtyEntry(div);
      });

      $('<h5>', {class: "mt-2", text: entry}).appendTo(entryDiv)
      var gildedImg = $('<img>', {class: "gilded-img", src: "../../rsc/img/gold_logo.png"}).appendTo(entryDiv);
      gildedImg.click(function( e ) {
        dirtyEntry($(this).parent());
      });
    }).fail(function() {
      entryImg = $('<img>', {class: "codex-img", src: "../../rsc/img/silver_logo.png"}).appendTo(entryDiv);
      entryImg.click(function( e ) {
        var div = $(this).parent();
        dirtyEntry(div);
      });

      $('<h5>', {class: "mt-2", text: entry}).appendTo(entryDiv);
      var gildedImg = $('<img>', {class: "gilded-img", src: "../../rsc/img/gold_logo.png"}).appendTo(entryDiv);
      gildedImg.click(function( e ) {
        dirtyEntry($(this).parent());
      });
    })

    count++;
  });
  totals[cat_id - 1] = count;
}

// Apply gilded style and dirty bit to entryDiv
function dirtyEntry(div) {
  div.children(".gilded-img").toggleClass('gilded');
  div.toggleClass("dirty");
}

// Bidirectional database sync.
function updateDB() {
  var userId = firebase.auth().currentUser.uid;
  var database = firebase.database();

  // Sync current data from DB.
  firebase.database().ref('/users/' + userId + '/codex').once('value').then(function(snapshot) {
    var freshData = snapshot.val();
    var counters = [0,0,0,0,0,0];
    for (var entry in freshData) {
      counters[entry.toString()[0] - 1]++;

      var div = $("#" + entry);
      div.children(".gilded-img").addClass('gilded');
      div.addClass("mastered");
    }

    // Update counter text  $("#" + cat + "Counter").html("/" + count);
    $("#warframesCounter").html(counters[0] + "/" + totals[0]);
    $("#weaponsCounter").html(counters[1] + "/" + totals[1]);
    $("#companionsCounter").html(counters[2] + "/" + totals[2]);
    $("#sentinelWeaponsCounter").html(counters[3] + "/" + totals[3]);
    $("#archwingsCounter").html(counters[4] + "/" + totals[4]);
    $("#archwingWeaponsCounter").html(counters[5] + "/" + totals[5]);
  });

  // Push changes to DB.
  if ($(".dirty").length > 0) {
    var newCodex = {}
    $(".codex-entry .gilded-img.gilded").parent().each(function( index ) {
      newCodex[$(this).attr("id")] = true;
    });
    console.log("newCodex: " + newCodex);
    firebase.database().ref('users/' + userId + '/codex').set(newCodex);
    location.reload();
  }

}

function sortData(data) {
  var sort_array = [];
  for (var key in data) {
    sort_array.push({key:key,value:data[key]});
  }
  sort_array.sort(function(a,b){return a.value.localeCompare(b.value)});
  return sort_array;
}
