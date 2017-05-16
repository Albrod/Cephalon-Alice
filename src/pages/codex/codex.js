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
  Mousetrap.bind('?', function(e) {
    toggleHelpModal();
  });
  for (var i in categories) {
    var cat = categories[i];
    var rawData = $.ajax('../../data/codex/' + cat + '.json', { async: false }).responseText;
    fullData[cat] = JSON.parse(rawData);
  }
  masteryListener();

  initTypeahead();

  var load = getURLParameter("load");
  if (load === "codex") {
    loadLibrary();
  } else {
    loadSearch();
  }

  $(document).on("scroll", onScroll);
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
    fadeHide($(".search-feedback"));
  });
  $(".panel-tabs").click(function(event) {
    if ($(this).attr("id") === "searchTab") {
      loadSearch();
    } else if ($(this).attr("id") === "libraryTab") {
      loadLibrary();
    }
  });
  $(".nav-icon").click(function(event) {
    var anchor = $(this).data("anchor");
    $('html, body').animate({
      scrollTop: $(".anchor#" + anchor).offset().top
    }, 500);
  });
}



function loadSearch() {
  // Hide library pane.
  fadeHide($(".library-pane"));
  $(".panel-nav li.active").removeClass("active");
  $(".library-sidebar").removeClass("active");
  $(".library-pane").removeClass("active");

  $("#searchTab").parent().addClass("active");

  fadeShow($(".search-pane"));
  $(".search-pane").addClass("active");
}

function loadLibrary() {
  // Hide search pane.
  fadeHide($(".search-pane"));
  $(".panel-nav li.active").removeClass("active");
  $(".search-pane").removeClass("active");

  $("#libraryTab").parent().addClass("active");
  $(".library-sidebar").addClass("active");

  for (var i in categories) {
    renderLibrary(categories[i]);
  }
  updateTotals();

  fadeShow($(".library-pane"));
  $("#total-counter").show();
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

  // Sort alphanumerically.
  var sortArr = fullData[cat].sort(function (a, b) {
    return a.name.localeCompare(b.name);
  });

  $.each( sortArr, function( i, obj ) {
    var id = obj.id;
    var entry = obj.name;
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

      // Check for long text.
      var wordArr = entry.split(" ");
      wordArr = wordArr.sort(function(a,b) {
        return b.length - a.length;
      });
      var size = wordArr[0].length;
      if (size > 12) {
        $('<h5>', {class: "mt-2", text: entry, style: "font-size: x-small"}).appendTo(entryDiv);
      } else {
        $('<h5>', {class: "mt-2", text: entry}).appendTo(entryDiv);
      }
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

      // Check for long text.
      var wordArr = entry.split(" ");
      wordArr = wordArr.sort(function(a,b) {
        return b.length - a.length;
      });
      var size = wordArr[0].length;
      if (size > 12) {
        $('<h5>', {class: "mt-2", text: entry, style: "font-size: x-small"}).appendTo(entryDiv);
      } else {
        $('<h5>', {class: "mt-2", text: entry}).appendTo(entryDiv);
      }
      var gildedImg = $('<img>', {class: "gilded-img", src: "../../rsc/img/gold_logo.png"}).appendTo(entryDiv);
      gildedImg.click(function( e ) {
        dirtyEntry($(this).parent());
      });
    })

    count++;
  });
  totals[cat_id - 1] = count;
  setTimeout(renderMastery(), 300);
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
  var feedback = $(".search-feedback");
  feedback.removeClass("table-success");
  feedback.removeClass("table-warning");

  // Compile changes from search.
  var val = $("#searchInput").val();
  retCode = -1;
  retVal = null;

  var entry = val.trim();
  // Search for entry in data.
  for (key in fullData) {
    var code = catName(key);
    var subData = fullData[key];
    for (key2 in subData) {
      if (subData[key2].name === entry) {
        var id = code + subData[key2].id;
        if (masteryArr.indexOf(id) >= 0) {
          retCode = 1;
        } else {
          retCode = 0;
          retVal = id;
        }
      }
    }
  }

  var feedbackStr = "";
  if (retCode === -1) {
    feedbackStr = "Please enter <i>something</i> of value, operator.";
  }
  else if (retCode === 0) {
    pushToDB([retVal], []);

    feedback.addClass("table-success");
    feedbackStr = "Success! " + entry + " added to codex, operator.";
  }
  if (retCode === 1) {
    feedback.addClass("table-warning");
    feedbackStr += "You've already mastered " + entry + ", operator.";
  }
  feedback.html(feedbackStr);

  $('#searchInput').typeahead('close');
  $("#searchInput").val("");
  fastShow(feedback);
  setTimeout(function(){
    fadeHide(feedback);
  }, 7500);
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


function toggleHelpModal() {
  $("#helpModal").modal('toggle');
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

// Typeahead
function initTypeahead() {
  var warframesHound = new Bloodhound({
    datumTokenizer: function (d) { return Bloodhound.tokenizers.whitespace(d.name); },
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    prefetch: {
      cache: false,
      url: '../../data/codex/warframes.json',
      filter: function(list) {
        return $.map(list, function(item) {
          return {
            name: item.name
          };
        });
      }
    }
  });
  var archwingsHound = new Bloodhound({
    datumTokenizer: function (d) { return Bloodhound.tokenizers.whitespace(d.name); },
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    prefetch: {
      cache: false,
      url: '../../data/codex/archwings.json',
      filter: function(list) {
        return $.map(list, function(item) {
          return {
            name: item.name
          };
        });
      }
    }
  });
  var weaponsHound = new Bloodhound({
    datumTokenizer: function (d) { return Bloodhound.tokenizers.whitespace(d.name); },
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    prefetch: {
      cache: false,
      url: '../../data/codex/weapons.json',
      filter: function(list) {
        return $.map(list, function(item) {
          return {
            name: item.name
          };
        });
      }
    }
  });
  var archwingWeaponsHound = new Bloodhound({
    datumTokenizer: function (d) { return Bloodhound.tokenizers.whitespace(d.name); },
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    prefetch: {
      cache: false,
      url: '../../data/codex/archwingWeapons.json',
      filter: function(list) {
        return $.map(list, function(item) {
          return {
            name: item.name
          };
        });
      }
    }
  });
  var companionsHound = new Bloodhound({
    datumTokenizer: function (d) { return Bloodhound.tokenizers.whitespace(d.name); },
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    prefetch: {
      cache: false,
      url: '../../data/codex/companions.json',
      filter: function(list) {
        return $.map(list, function(item) {
          return {
            name: item.name
          };
        });
      }
    }
  });
  var sentinelWeaponsHound = new Bloodhound({
    datumTokenizer: function (d) { return Bloodhound.tokenizers.whitespace(d.name); },
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    prefetch: {
      cache: false,
      url: '../../data/codex/sentinelWeapons.json',
      filter: function(list) {
        return $.map(list, function(item) {
          return {
            name: item.name
          };
        });
      }
    }
  });


  $('#searchInput').typeahead({
    name: 'searchAhead',
    hint: true,
    highlight: true,
    minLength: 1
  },{
    name: 'warframes',
    source: warframesHound,
    display: function (d) { return d.name; },
    templates: {
      header: '<h5 class="mt-2">Warframes</h5>'
    }
  },{
    name: 'archwings',
    source: archwingsHound,
    display: function (d) { return d.name; },
    templates: {
      header: '<h5 class="mt-2">Archwings</h5>'
    }
  },{
    name: 'weapons',
    source: weaponsHound,
    display: function (d) { return d.name; },
    templates: {
      header: '<h5 class="mt-2">Weapons</h5>'
    }
  },{
    name: 'archwingWeapons',
    source: archwingWeaponsHound,
    display: function (d) { return d.name; },
    templates: {
      header: '<h5 class="mt-2">Archwing Weapons</h5>'
    }
  },{
    name: 'companions',
    source: companionsHound,
    display: function (d) { return d.name; },
    templates: {
      header: '<h5 class="mt-2">Companions</h5>'
    }
  },{
    name: 'sentinelWeapons',
    source: sentinelWeaponsHound,
    display: function (d) { return d.name; },
    templates: {
      header: '<h5 class="mt-2">Sentinel Weapons</h5>'
    }
  });
}
