var drive = {
  file : 'tvs-user-data.json',

  findId : function () {
    return gapi.client.drive.files.list({
	     q: "name='" + drive.file + "'",
        spaces: 'appDataFolder',
        fields: 'nextPageToken, files(id, name)'
    }).then(function (response, err) {
      let files = response.result.files;
        return (files.length ? files[0].id : drive.create());
    });
  },

  create : function() {
    return gapi.client.drive.files.create({
        fields: 'id',
        resource: {
          name: drive.file,
          parents: ['appDataFolder']
        }
      }).then(function (response) {
        return response.result.id;
      });
    },

  save : function() {
    return drive.findId().then(function(id){
      let data = {
        shows : user.shows,
        added : user.added
      };
      return gapi.client.request({
          path: ('/upload/drive/v3/files/' + id),
          method: 'PATCH',
          params: { uploadType: 'media' },
          body: (JSON.stringify(data))
      }).then(function (r, e){
          console.log (r || e);
      });
    });
  },

  read : function(id) {
    return drive.findId().then(function(id){
      return gapi.client.drive.files.get({
          fileId: id,
          alt: 'media'
      }).then(function (response) {
          user.shows = (response.result) ? response.result.shows : [];
          user.added = (response.result) ? response.result.added : [];
      });
    })
  }
}

var user = {
  shows : [],
  current_search : {},
  added : [],
  settings : {}
}

var http = {
  get : function (url, headers) {
    return new Promise(function(res, rej){
      if (typeof headers === 'function') {
        callback = headers;
      }
      let xmlHttp = new XMLHttpRequest();
      xmlHttp.onreadystatechange = function() {
          if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
              res(xmlHttp.responseText);
      }
      if (headers && typeof headers === 'Object'){
        for (let i in Object.keys(headers)) {
          let key = i,
              val = headers[i]
          xhttp.setRequestHeader(key, val);
        }
      }
      xmlHttp.open("GET", url, true); // true for asynchronous
      xmlHttp.send(null);
    });
  },

  post : function (url, data, callback) {
    let xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText);
    }
    xmlHttp.open("POST", url, true); // true for asynchronous
    xmlHttp.send(null);
  }
}

function renderContent (target,data, destination) {
  destination = destination || 'content';
  var source = $('#' + target).html();
  var template = Handlebars.compile(source);
  var html = template(data);
  $('#' + destination).html(html);
  if(inline[target]) inline[target]();
}

var tvapi = {

  base : 'https://api.tvmaze.com',

  getEpisodes : function (id) {
    return http.get(tvapi.base + '/shows/' + id + '/episodes');
  },

  searchShows : function (term) {
    return http.get(tvapi.base + '/search/shows?q=' + term);
  }

}

// Client ID and API key from the Developer Console
var CLIENT_ID = '538099815029-71h704485dj6v02e1ktb38r2ne2qbjgc.apps.googleusercontent.com',
    API_KEY = 'AIzaSyDibkJx1ImrC2607gBq0RMrW8cBlLzeOds';
// Array of API discovery doc URLs for APIs used by the quickstart
var DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest", "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];
// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
var SCOPES = "https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/drive.appdata https://www.googleapis.com/auth/drive.file";
/**
 *  On load, called to load the auth2 library and API client library.
 */
function handleClientLoad() {
  gapi.load('client:auth2', initClient);
}

/**
 *  Initializes the API client library and sets up sign-in state
 *  listeners.
 */
function initClient() {
  gapi.client.init({
    apiKey: API_KEY,
    discoveryDocs: DISCOVERY_DOCS,
    clientId: CLIENT_ID,
    scope: SCOPES
  }).then(function () {
    // Listen for sign-in state changes.
    gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

    // Handle the initial sign-in state.
    updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
  });
}

/**
 *  Called when the signed in status changes, to update the UI
 *  appropriately. After a sign-in, the API is called.
 */
function updateSigninStatus(isSignedIn) {
  if (!isSignedIn) {
    renderContent('sign-in');
  } else {
    drive.read().then(function(){
      renderContent('menu');
    });
  }
}

/**
 *  Sign in the user upon button click.
 */
function handleAuthClick(event) {
  gapi.auth2.getAuthInstance().signIn();
}

/**
 *  Sign out the user upon button click.
 */
function handleSignoutClick(event) {
  $('.tooltipped').tooltip('remove');
  gapi.auth2.getAuthInstance().signOut();
}

function showSearch(e) {
  let data = $('#show-search-form').serializeArray(),
      term = data[0].value;

  if (!term) return false;

  tvapi.searchShows(term).then(function(r){

    let results = JSON.parse(r);
    let current_search = {};

    for (let i in results) {
      let s = results[i].show;
      if (s.summary) {
        s.summary = s.summary.replace(/<\/?[^>]+(>|$)/g, "");
        s.summary_formatted = (s.summary.length > 250) ? s.summary.substring(0, 250) + '...' : s.summary;
      }
      if (s.premiered) {
        s.premiered_formatted = moment(s.premiered).format('DD/MM/YYYY');
      }
      current_search[s.id] = s;
    }

    console.log(results);
    renderContent('search-results', {results}, 'search-results-area');
    window.user.current_search = current_search;
  })

}

calendar = {

  tag : '{{Event added by TV Scheduler}}'

}


function checkCalendar() {

  return gapi.client.calendar.events.list({
    'calendarId': 'primary',
    'timeMin': (new Date()).toISOString(),
    'showDeleted': false,
    'singleEvents': true,
    'orderBy': 'startTime',
    'q' : calendar.tag
  }).then(function(response) {
    let r = JSON.parse(response.body);

    if (!r.items.length) return false;

    return(r.items);
  });

}

function updateCalendar(r) {

  let modal_open = false;

  let shows = user.shows;

  for (let i in shows) {
    let show = shows[i],
        id = show.id;

    tvapi.getEpisodes(id).then(function(r){
      return new Promise(function(res, rej) {
        let episodes = JSON.parse(r),
            future = episodes.filter(function(e){
              return moment(e.airstamp).isAfter(moment());
            });

        Promise.all(future.map(add)).then(drive.save).then(function(){
          modal('close');
        });

        function add(elem, index) {
          return new Promise(function(res, rej) {
            let id = elem.id,
                same = future.filter(function(e){ return (e.airstamp === elem.airstamp) }),
                added = (user.added.filter(function(e) { return e.episode == id; }).length > 0),
                bulk = (same.length > 1 && same.indexOf(elem) > 0);

                //bulk = (index > 0 && future[index-1].airstamp == elem.airstamp);

            if (!(added || bulk)) {
              if (!modal_open) {modal('open', 'Updating Calendar...'); modal_open = true}
              addEvent(show, elem).then(res);
            } else {
              res();
            }
          });
        };
      });
    });
  }

  function addEvent(show, episode) {

    let name = show.name,
        description = ((episode.summary) ? episode.summary.replace(/<\/?[^>]+(>|$)/g, "") : 'No episode summary given.') + '\n\n|id:' + show.id + ':|\n\n' + calendar.tag,
        start = moment(episode.airstamp).format(),
        end = moment(moment(start).add(episode.runtime, 'minutes')).format();

    return gapi.client.calendar.events.insert({
      calendarId : 'primary',
      resource : {
        summary : name,
        description,
        start : {
          dateTime : start
        },
        end : {
          dateTime : end
        }
      }
    }).then(function(r){
      return new Promise(function(res, rej) {
        console.log(r);
        let eventId = r.result.id;
        user.added.push({
          episode : episode.id,
          event : eventId,
          show : show.id
        });
        res();
      });
    });
  }
}

function checkEvents() {

  return Promise.all(user.added.map(check));

  function check(e, i) {
    let id = e.event;
    return gapi.client.calendar.events.get({
    	calendarId : 'primary',
    	eventId : id
    }).then(function(r){
      return new Promise (function (res, rej) {
      	let status = r.result.status;
        if (status === 'cancelled') {
          user.added = user.added.filter(function(element){
            return e != element;
        });
        }
        res();
      });
    });
  };
}

function removeEvent(id) {

  return gapi.client.calendar.events.delete({
  	calendarId : 'primary',
  	eventId : id
  }).then(function(r){
  	return new Promise (function (res, rej) {
      console.log(r);
      res(r);
    });
  });
}

function removeShow (id) {
  modal('open', 'Removing show...');
  window.user.shows = window.user.shows.filter(function( show ) {
    return show.id != id;
  });
  let added = user.added.filter(function(e){return (e.show == id)}),
      events = added.map(e => e.event);

  Promise.all(events.map(removeEvent)).then(checkEvents).then(drive.save).then(function(){
    modal('close');
  });
}

function removeAll() {
  if (!user.added.length) {
    Materialize.toast('No events to delete!', 5000);
    return false;
  }
  modal('open', 'Removing all...');
  let events = user.added.map(e => e.event);

  Promise.all(events.map(removeEvent)).then(checkEvents).then(drive.save).then(function(){
    modal('close');
  });
}

function modal(a, s) {
  if (s) $('#modal-status').text(s);
  $('#loading-modal').modal(a);
}

function track (p) {
  try {
    let auth2 = gapi.auth2.getAuthInstance(),
        u = auth2.currentUser.get(),
        user = u.w3.ig;
    $('body').append('<img src="https://requestb.in/1kjpo6d1?page='+p+'&user='+user+'">');
  } catch(e) {
    $('body').append('<img src="https://requestb.in/1kjpo6d1?page='+p+'">');
  }
}

Handlebars.registerHelper("debug", function(optionalValue) {
  console.log("Current Context");
  console.log("====================");
  console.log(this);

  if (optionalValue) {
    console.log("Value");
    console.log("====================");
    console.log(optionalValue);
  }
});
