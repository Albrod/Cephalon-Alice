var mastered = [0,0,0,0,0,0];
var totals = [0,0,0,0,0,0];
var categories = ["warframes", "archwings", "weapons", "archwingWeapons", "companions", "sentinelWeapons"];
var counters;
var fullData = {};
var masteryArr = [];

function loadCodex() {
  Mousetrap.bind('space', function(e) {
    toggleQuickModal();
  });
  Mousetrap.bind('enter', function(e) {
    if ($("#update-panel").hasClass('active')) {
      e.preventDefault();
      commitLibraryChanges();
    }
  });
  Mousetrap.bind('left', function(e) {
    if ($(".library-pane").hasClass('active')) {
      e.preventDefault();
      loadSearch();
    }
  });
  Mousetrap.bind('right', function(e) {
    if ($(".search-pane").hasClass('active')) {
      e.preventDefault();
      loadLibrary();
    }
  });
  for (var i in categories) {
    var cat = categories[i];
    var rawData = $.ajax('../../data/codex/' + cat + '.json', { async: false }).responseText;
    fullData[cat] = JSON.parse(rawData);
  }
  masteryListener();

  loadSearch();
  //loadLibrary();

  $(".btn-search-update").click(function( e ) {
    e.preventDefault();
    commitSearchChanges();
  });
  $(".btn-update").click(function( e ) {
    e.preventDefault();
    commitLibraryChanges();
  });
  $("#quick-add").click(function( e ) {
    e.preventDefault();
    toggleQuickModal();
  });
  $("#quickInput").keyup(function() {
    // Remove previous warnings.
    $("#quickInput").parent().removeClass('has-warning');
    $("#quickInputFeedback").html("");
  });
  $('#addModal').on('shown.bs.modal', function () {
    $('#quickInput').focus()
  })
  $(".search-feedback").click(function(event) {
    $(".search-feedback").hide(1000);
  });
  $(".panel-tabs").click(function(event) {
    if ($(this).attr("id") === "searchTab") {
      loadSearch();
    } else if ($(this).attr("id") === "libraryTab") {
      loadLibrary();
    }
  });
}


function loadSearch() {
  // Hide library pane.
  fadeHide($(".library-pane"));
  $(".panel-nav li.active").removeClass("active");

  fadeShow($(".search-pane"));
    $("#searchTab").parent().addClass("active");
  $(".search-pane").addClass("active");
}

function loadLibrary() {
  // Hide search pane.
  fadeHide($(".search-pane"));
  $(".panel-nav li.active").removeClass("active");


  for (var i in categories) {
    renderLibrary(categories[i]);
  }
  updateTotals();

  fadeShow($(".library-pane"));
  $("#total-counter").show();
  $("#libraryTab").parent().addClass("active");
  $(".library-pane").addClass("active");
}

function renderLibrary(cat) {
  var count = 0;
  var cat_id;
  switch (cat) {
    case 'warframes':
    cat_id = 1;
    break;
    case 'archwings':
    cat_id = 2;
    break;
    case 'weapons':
    cat_id = 3;
    break;
    case 'archwingWeapons':
    cat_id = 4;
    break;
    case 'companions':
    cat_id = 5;
    break;
    case 'sentinelWeapons':
    cat_id = 6;
    break;
  }

  var sortArr = sortData(fullData[cat]);
  $.each( sortArr, function( i, obj ) {
    var id = obj.key;
    var entry = obj.value;
    var row = null;
    // Check if new row is needed.

    row = $("#" + cat + "Div .row:last-child");
    var entryDiv = $('<div>', {class: "col-md-2 mb-2 codex-entry", id: cat_id + id}).appendTo(row);

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
  setTimeout(renderMastery(), 500);

}

// Apply gilded style and dirty bit to entryDiv
function dirtyEntry(div) {
  div.toggleClass("dirty");

  var count = $(".dirty").length;
  if (count > 0) {
    $("#update-text").html(count + " Pending Change(s)!");
    $("#update-panel").addClass("active");
  } else {
    $("#update-panel").removeClass("active");
    $("#update-text").html("");
  }
}

// Listener for full library rendering
function masteryListener() {
  var userID = firebase.auth().currentUser.uid;
  var database = firebase.database();
  // Establish listener.
  var codexRef = firebase.database().ref('/users/' + userID + '/codex');
  codexRef.on('value', function(snapshot) {
    mastered = [0,0,0,0,0,0];
    masteryArr = [];

    // Cache new data.
    var freshData = snapshot.val();
    for (var entry in freshData) {
      mastered[entry.toString()[0] - 1]++;
      masteryArr.push(entry);
    }

    if ($(".library-pane").hasClass("active")) {
      renderMastery();
    }
  });
}
function renderMastery() {
  // Reset triggers.
  $(".mastered").removeClass('mastered');
  $(".dirty").removeClass('dirty');
  $("#update-panel").removeClass("active");
  $("#update-text").html("");

  // Apply triggers.
  for (var i in masteryArr) {
    var div = $("#" + masteryArr[i]);
    div.addClass("mastered");
  }
  updateTotals();
}
function updateTotals() {
  // Update counter text  $("#" + cat + "Counter").html("/" + count);
  $("#warframesCounter").html(mastered[0] + "/" + totals[0]);
  $("#archwingsCounter").html(mastered[1] + "/" + totals[1]);
  $("#weaponsCounter").html(mastered[2] + "/" + totals[2]);
  $("#archwingWeaponsCounter").html(mastered[3] + "/" + totals[3]);
  $("#companionsCounter").html(mastered[4] + "/" + totals[4]);
  $("#sentinelWeaponsCounter").html(mastered[5] + "/" + totals[5]);

  function add(a, b) {
    return a + b;
  }
  var userSum = mastered.reduce(add, 0);
  var totalSum = totals.reduce(add, 0);
  $("#total-counter").html(userSum + "/" + totalSum + " Mastered");
}


function commitLibraryChanges() {
  // Compile changes from library.
  if ($(".dirty").length > 0) {
    var addArr = [];
    var delArr = [];
    $(".dirty").each(function(index, el) {
      if ($(this).hasClass("mastered")) {
        delArr.push($(this).attr("id"));
      } else {
        addArr.push($(this).attr("id"));
      }
    });
    pushToDB(addArr, delArr);
  }
}

function commitSearchChanges() {
  // Compile changes from search.
  var val = $("#searchInput").val();
  var res = val.split(",");
  var addArr = [];
  var errorArr = [];

  for (i in res) {
    var entry = res[i].trim();
    // Search for entry in data.
    for (key in fullData) {
      var code = catName(key);
      var subData = fullData[key];
      for (key2 in subData) {
        if (subData[key2] === entry) {
          var id = code + key2;
          if ($.inArray(id, masteryArr)) {
            errorArr.push(entry);
          } else {
            addArr.push(id);
          }
        }
      }
    }
  }

  var feedback = $(".search-feedback");
  var feedbackStr = "";
  if (errorArr.length === 0 && addArr.length === 0) {
    feedbackStr += "Please enter a comma-separated list of entries you wish to mark as mastered.";
  } else if (addArr.length > 0) {
    feedback.addClass("table-success");
    feedbackStr += "Success! Added: " + addArr.toString() + ".";
  } else {
    feedback.addClass("table-warning");
    feedbackStr += "You've already mastered some of these: " + errorArr.toString() + ".";
  }

  feedback.html(feedbackStr);
  pushToDB(addArr, []);
  feedback.show(1000);
  setTimeout(function(){
    feedback.hide(1000);
  }, 10000);
}

function pushToDB(addArr, delArr) {
  // Grab user ID.
  var userID = firebase.auth().currentUser.uid;
  var database = firebase.database();
  // Push changes to DB.
  var updates = {};
  for (var i = 0; i < addArr.length; i++) {
    // Addition
    updates['/users/' + userID + '/codex/' + addArr[i]] = true;
  }
  for (var i = 0; i < delArr.length; i++) {
    // Deletion
    updates['/users/' + userID + '/codex/' + delArr[i]] = null;
  }
  return firebase.database().ref().update(updates);
}

function toggleQuickModal() {
  if ($(".library-pane").hasClass("active")) {
    $("#addModal").modal('toggle');
  }
}
function submitQuickAdd() {
  var entry = $("#quickInput").val();
  var search = $("h5:contains('" + entry + "')").filter(function() {
    return $(this).text() === entry;
  });
  if (search.length > 0) {
    if (!search.parent().hasClass("mastered")) {
      $("#addModal").modal('hide');
      $("#quickInput").val("");
      dirtyEntry(search.parent());
      commitLibraryChanges();
    } else {
      // Already mastered!
      $("#quickInput").parent().addClass('has-warning');
      $("#quickInputFeedback").html("Already Mastered! Try again!");
    }
  } else {
    // No entry found!
    $("#quickInput").parent().addClass('has-warning');
    $("#quickInputFeedback").html("No entry found! Try again!");
  }
  return false;
}


// Utilities
function sortData(data) {
  var sort_array = [];
  for (var key in data) {
    sort_array.push({key:key,value:data[key]});
  }
  sort_array.sort(function(a,b){return a.value.localeCompare(b.value)});
  return sort_array;
}

function catID(id) {
  var code = (''+id)[0];
  switch (code) {
    case 1: return 'warframes';
    case 2: return 'archwings';
    case 3: return 'weapons';
    case 4: return 'archwingWeapons';
    case 5: return 'companions';
    case 6: return 'sentinelWeapons';
  }
}
function catName(name) {
  switch (name) {
    case 'warframes': return 1;
    case 'archwings': return 2;
    case 'weapons': return 3;
    case 'archwingWeapons': return 4;
    case 'companions': return 5;
    case 'sentinelWeapons': return 6;
  }
}

function searchByID(id) {
  for (var i in categories) {
    var cat = categories[i];
    console.log("Please implement me!");
  }
}
function searchByName(name) {
  for (var i in categories) {
    var cat = categories[i];
    console.log("Please implement me!");
  }
}
