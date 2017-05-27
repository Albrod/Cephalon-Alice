var mastered = [0,0,0,0,0];
var totals = [0,0,0,0,0];
var categories = ["warframes", "archwings", "weapons", "archwingWeapons", "companions"];
var counters;
var fullData = {};
var masteryArr = [];

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
    if (!user) {
      // Redirect to login if not logged in.
      window.location.href = "login.html";
    }

    loadCodex();
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





function loadCodex() {
  verifyUserData();

  if (Object.keys(fullData).length > 0) {
    console.log("Sneaky auth loop averted!");
    return;
  }

  Mousetrap.bind('space', function(e) {
    toggleQuickModal();
  });
  Mousetrap.bind('enter', function(e) {
    if ($("#update-panel").hasClass('active')) {
      e.preventDefault();
      commitLibraryChanges();
    }
  });
  Mousetrap.bind('escape', function(e) {
    if ($(".search-pane").hasClass('active')) {
      e.preventDefault();
      if ($(".search-info").hasClass("active")) {
        $(".search-info").removeClass("active");
        $(".search-pane").removeClass("slideup");
        fadeHide($(".search-info"));

        $(".btn-search-find").html("Search");
      }
    }
  });
  Mousetrap.bind('left', function(e) {
    if ($(".library-pane").hasClass('active')) {
      e.preventDefault();
      loadSearchPanel();
    }
  });
  Mousetrap.bind('right', function(e) {
    if ($(".search-pane").hasClass('active')) {
      e.preventDefault();
      loadLibraryPanel();
    }
  });
  Mousetrap.bind('?', function(e) {
    toggleHelpModal();
  });

  for (var i in categories) {
    var cat = categories[i];
    var rawData = $.ajax('data/' + cat + '.json', { async: false }).responseText;
    fullData[cat] = JSON.parse(rawData);
  }

  initTypeahead();
  var load = getURLParameter("load");
  if (load === "codex") {
    loadLibraryPanel();
  } else {
    loadSearchPanel();
  }

  updateData();
  preloadLibrary();
  masteryListener();

  $(document).on("scroll", onScroll);
  $(".btn-search-find").click(function( e ) {
    e.preventDefault();
    if ($(".search-info").hasClass('active')) {
      $(".search-info").removeClass("active");
      $(".search-pane").removeClass("slideup");
      fadeHide($(".search-info"));

      $(".btn-search-find").html("Search");
    } else {
      searchLookup();
    }
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
      loadSearchPanel();
    } else if ($(this).attr("id") === "libraryTab") {
      loadLibraryPanel();
    }
  });
  $(".nav-icon").click(function(event) {
    var anchor = $(this).data("anchor");
    $('html, body').animate({
      scrollTop: $(".anchor#" + anchor).offset().top
    }, 500);
  });
  $(document).on('contextmenu', '.gilded-img', function(e) {
    e.preventDefault();
    var id = $(this).parent().attr("id");
    var name = retrieveNameByID(id);
    var entry = retrieveEntryByName(name);

    buildDetailsPanel(name, entry, "codex");
    toggleDetailsModal();
  });
}

function verifyUserData() {
  var userID = firebase.auth().currentUser.uid;
  var database = firebase.database();
  // Establish listener.
  var codexRef = database.ref('/users/' + userID);
  codexRef.once('value').then(function(snapshot) {
    var newData = snapshot.val();
    if (!newData["email"]) {
      var updates = {};
      updates["/users/" + userID + "/email"] = firebase.auth().currentUser.email;
      firebase.database().ref().update(updates);
    }
    for (entry in newData["codex"]) {
      if (entry.length !== 4) {
        console.log("Bad Data! User: " + userID + "\nData:" + entry);
      }
    }
  });
}
function verifyAllData() {
  var database = firebase.database();
  // Establish listener.
  var codexRef = database.ref('/users/');
  codexRef.once('value').then(function(snapshot) {
    var newData = snapshot.val();
    for (user in newData) {
      if (!newData[user]["email"]) {
        console.log("No Email! User: " + user + " hasn't logged in!" );
      }
      for (entry in newData[user]["codex"]) {
        if (entry.length !== 4) {
          console.log("Bad Data! User: " + user + "\nData:" + entry);
        }
      }
    }
  });
}


function preloadLibrary() {
  for (var i in categories) {
    renderLibrary(categories[i]);
  }
  updateTotals();
}

function loadSearchPanel() {
  // Hide library pane.
  fadeHide($(".library-pane"));
  $("#total-counter").hide();
  $(".library-pane").removeClass("active");

  $(".panel-nav li.active").removeClass("active");
  $(".library-sidebar").removeClass("active");
  $("#searchTab").parent().addClass("active");

  fadeShow($(".search-pane"));
  $(".search-pane").addClass("active");
}

function searchLookup() {
  var val = $("#searchInput").val().toLowerCase();
  var entry = retrieveEntryByName(val);

  if (entry) {
    buildDetailsPanel(val,entry,"search");

    $(".search-info").addClass("active");
    $(".search-pane").addClass("slideup");
    fadeShow($(".search-info"));

    $(".btn-search-find").html("Close");
  } else {
    var feedback = $(".search-feedback");
    feedback.removeClass("table-success");
    feedback.removeClass("table-warning");

    feedback.addClass("table-warning");
    feedback.html("Please enter a <i>real</i> item, operator.");
    fadeShow(feedback);
    setTimeout(function(){
      fadeHide(feedback);
    }, 7500);
  }
}

function submitInfo() {
  fadeHide($(".btn-details-submit"));
  commitInfoChanges();
}

function loadLibraryPanel() {
  renderImages();
  renderMastery();

  // Hide search pane.
  fadeHide($(".search-pane"));
  $(".search-pane").removeClass("active");

  if ($(".search-info").hasClass('active')) {
    $(".search-info").removeClass("active");
    $(".search-pane").removeClass("slideup");
    $(".search-info .table-warning").removeClass('table-warning');
    $(".search-info .table-success").removeClass('table-success');
    fadeHide($(".search-info"));

    $(".btn-search-find").html("Search");
  }

  $(".panel-nav li.active").removeClass("active");
  $(".library-sidebar").addClass("active");
  $("#libraryTab").parent().addClass("active");

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

  var sortArr = Object.keys(fullData[cat]).sort(function (a, b) {
    return a.localeCompare(b);
  });

  $.each( sortArr, function( i, obj ) {
    var obj2 = fullData[cat][obj];
    var id = obj2.id;
    var entry = obj;
    var row = null;
    // Check if new row is needed.

    row = $("#" + cat + "Div .row:last-child");
    var entryDiv = $('<div>', {class: "col-md-2 mb-2 codex-entry", id: id}).appendTo(row);

    var entryImg = null;
    var image_url = "rsc/img/items/" + entry.toLowerCase() + ".png";
    $.get(image_url).done(function() {
      entryImg = $('<img>', {class: "codex-img"}).appendTo(entryDiv);
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
        $('<h5>', {class: "mt-2", text: entry, style: "font-size: 8px"}).appendTo(entryDiv);
      } else {
        $('<h5>', {class: "mt-2", text: entry}).appendTo(entryDiv);
      }
      var gildedImg = $('<img>', {class: "gilded-img"}).appendTo(entryDiv);
      gildedImg.click(function( e ) {
        dirtyEntry($(this).parent());
      });
    }).fail(function() {
      entryImg = $('<img>', {class: "codex-img", src: "rsc/img/silver_logo.png"}).appendTo(entryDiv);
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
      var gildedImg = $('<img>', {class: "gilded-img", src: "rsc/img/gold_logo.png"}).appendTo(entryDiv);
      gildedImg.click(function( e ) {
        dirtyEntry($(this).parent());
      });
    })

    count++;
  });
  totals[cat_id - 1] = count;
  setTimeout(renderMastery(), 300);
}

function renderImages() {
  $(".codex-img").each(function() {
    var name = $(this).next().html();
    name = name.replace("&amp;", "&");
    $(this).attr("src", "rsc/img/items/" + name.toLowerCase() + ".png");
  });
  $(".gilded-img").each(function() {
    $(this).attr("src", "rsc/img/gold_logo.png");
  });
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

// Check if DB data is outdated.
function updateData() {
  var database = firebase.database();
  database.ref('/data/version').once('value').then(snapshot => {
    var dbVersion = snapshot.val();
    var localVersion = $.ajax('version', { async: false }).responseText.trim();
    if (dbVersion === localVersion) {
      console.log("DB up-to-date. No refresh needed.");
    } else {
      var updates = {};
      var dbData = {};
      for (var i in fullData) {
        var catData = fullData[i];
        for (var j in catData) {
          var innerData = {"id": catData[j].id};

          dbData[j.toLowerCase()] = innerData;
        }
        // Push changes to DB.
      }
      updates['/data/index'] = dbData;
      updates['/data/version'] = localVersion;
      firebase.database().ref().update(updates);
    }
  });
}

// Listener for full library rendering
function masteryListener() {
  var userID = firebase.auth().currentUser.uid;
  var database = firebase.database();
  // Establish listener.
  var codexRef = database.ref('/users/' + userID + '/codex');
  codexRef.on('value', function(snapshot) {
    mastered = [0,0,0,0,0];
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

  function add(a, b) {
    return a + b;
  }
  var userSum = mastered.reduce(add, 0);
  var totalSum = totals.reduce(add, 0);
  $("#total-counter").html(userSum + "/" + totalSum + " Mastered");
}

function buildDetailsPanel(name, entry, mode) {
  var hook = $("." + mode + "-details-hook");
  hook.html("");

  // Load image
  $(".details-img").attr("src","rsc/img/items/" + name.toLowerCase() + ".png");

  var table = $("<table>", {class:"table table-hover table-bordered table-striped"});
  $("." + mode + "-details-hook").append(table);

  // Load name
  var thead = $("<thead>", {class:"thead-inverse"}).html('<tr><th class="search-info-name"></th></tr>');
  table.append(thead);
  $(".search-info-name").html(name);

  var tbody = $("<tbody>");
  table.append(tbody);

  // Load mastery
  var masteryRow = $("<tr>");
  var masteryCell = $("<td>").html('<span class="details-mastery"></span><button class="btn btn-sm btn-primary float-right btn-details-submit" type="submit">Add</button>')
  masteryRow.append(masteryCell);
  tbody.append(masteryRow);
  var id = entry.id;
  $(".btn-details-submit").data('id', id);

  var masterySpan = $(".details-mastery");
  if (masteryArr.indexOf(id) >= 0) {
    masterySpan.html("<strong>Mastered</strong>: Yes");
    masterySpan.parent().addClass('table-success');
    fadeHide($(".btn-details-submit"));
  } else {
    masterySpan.html("<strong>Mastered</strong>: No");
    masterySpan.parent().addClass('table-warning');
    fadeShow($(".btn-details-submit"));
  }

  // Load slot and type
  if (entry.slot) {
    var catRow = $("<tr>");
    var catCell = $("<td>");
    var catSpan = $("<span>", {class:"details-category"});

    if (entry.type) {
      catSpan.html("Slot: " + entry.slot + "<br />Type: " + entry.type);
    } else {
      catSpan.html("Slot: " + entry.slot);
    }

    catCell.append(catSpan);
    catRow.append(catCell);
    tbody.append(catRow);
  }

  // Load source
  if (entry.source) {
    var sourceRow = $("<tr>");
    var sourceCell = $("<td>");
    var sourceSpan = $("<span>", {class:"details-source"});
    var source = "";

    if ((typeof entry.source) == "object") {
      $.each(entry.source, function(key, val) {
        source += "<div class=\"details-source-div\">" + key + "<p class=\"details-source-p\">";
        $.each(val, function() {
          source += this + "<br/>";
        });
        source += "</p></div>"
      });
      source += "<br /><small>Asterisks denote vaulted relics.</small>"
    } else {
      source = entry.source;
    }
    sourceSpan.html("<strong>Source</strong>: <p class=\"details-source-p\">" + source + "</p>");

    sourceCell.append(sourceSpan);
    sourceRow.append(sourceCell);
    tbody.append(sourceRow);
  }

  $(".btn-details-submit").click(function(event) {
    submitInfo();
    $("#searchInput").blur();
  });
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

function commitInfoChanges() {
  // Compile changes from search.
  var btn = $(".btn-details-submit");
  var id = btn.data("id");
  pushToDB([id], []);

  btn.parent().removeClass('table-warning');
  btn.parent().addClass('table-success');
  $(".details-mastery").html("<strong>Mastered</strong>: Yes");
}

function commitSearchChanges() {
  var feedback = $(".search-feedback");
  feedback.removeClass("table-success");
  feedback.removeClass("table-warning");

  // Compile changes from search.
  var val = $("#searchInput").val();
  retCode = -1;
  retVal = null;

  var entry = val.trim().toLowerCase();
  // Search for entry in data.
  for (key in fullData) {
    var code = catName(key);
    var subData = fullData[key];
    for (key2 in subData) {
      if (subData[key2].toLowerCase() === entry) {
        var id = subData[key2].id;
        if (masteryArr.indexOf(id) >= 0) {
          retCode = 1;
        } else {
          retCode = 0;
          retVal = id;
        }
        entry = subData[key2].name;
        break;
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

  var input = $("#searchInput");
  input.typeahead('close');
  input.typeahead('val', '');
  input.val("");
  input.blur();

  fadeShow(feedback);
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
function toggleDetailsModal() {
  if ($(".library-pane").hasClass("active")) {
    $("#detailsModal").modal('toggle');
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
function categoryFromID(id) {
  var code = (''+id)[0];
  switch (code) {
    case "1": return 'warframes';
    case "2": return 'archwings';
    case "3": return 'weapons';
    case "4": return 'archwingWeapons';
    case "5": return 'companions';
  }
}
function categoryFromName(name) {
  switch (name) {
    case 'warframes': return 1;
    case 'archwings': return 2;
    case 'weapons': return 3;
    case 'archwingWeapons': return 4;
    case 'companions': return 5;
  }
}

// Typeahead
function initTypeahead() {
  var warframesHound = new Bloodhound({
    datumTokenizer: function (d) { return Bloodhound.tokenizers.whitespace(d.name); },
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    prefetch: {
      cache: false,
      url: 'data/warframes.json',
      filter: function(list) {
        return $.map(list, function(obj,item) {
          return {
            name: item
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
      url: 'data/archwings.json',
      filter: function(list) {
        return $.map(list, function(obj,item) {
          return {
            name: item
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
      url: 'data/weapons.json',
      filter: function(list) {
        return $.map(list, function(obj,item) {
          return {
            name: item
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
      url: 'data/archwingWeapons.json',
      filter: function(list) {
        return $.map(list, function(obj,item) {
          return {
            name: item
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
      url: 'data/companions.json',
      filter: function(list) {
        return $.map(list, function(obj,item) {
          return {
            name: item
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
  });
}

function retrieveEntryByName(name) {
  for (key in fullData) {
    var catData = fullData[key];
    for (key2 in catData) {
      if (key2.toLowerCase() === name.toLowerCase()) {
        return catData[key2];
      }
    }
  }
}
function retrieveNameByID(id) {
  for (key in fullData) {
    var catData = fullData[key];
    for (key2 in catData) {
      var fullID = catData[key2].id;
      if (fullID === id) {
        return key2;
      }
    }
  }
}

function onScroll(event){
  var scrollPos = $(document).scrollTop() + 50;
  $('.library-sidebar img').each(function () {
    var refElement = $("#" + $(this).data("anchor") + "Div");
    if (refElement.position().top <= scrollPos && refElement.position().top + refElement.height() > scrollPos) {
      $('.library-sidebar img').removeClass("active");
      $(this).addClass("active");
    }
    else{
      $(this).removeClass("active");
    }
  });
}
