var fb_config = {
  apiKey: 'AIzaSyB7yp9ArORQ7yfStGAAm0eU5xYjxlWET6w',
  authDomain: 'black-peaks.firebaseapp.com',
  databaseURL: 'https://black-peaks.firebaseio.com',
  projectId: 'black-peaks',
  storageBucket: 'black-peaks.appspot.com',
  messagingSenderId: '476376172614'
};
firebase.initializeApp(fb_config);
var db = firebase.database(),
    user = {};

navigator.geolocation.getCurrentPosition(function(l){
  user.lat = l.coords.latitude;
  user.lon = l.coords.longitude;
});

async function readDB(p) {
  return db.ref(p).once('value').then(function(r){
    return r.val();
  });
}


  // readDB('merch').then(logText);
  //
  // function logText(r){
  //   console.log(r);
  //   let data = i;
  //   let text = 'RAW DATA:\n\n' + JSON.stringify(r);
  //
  //   if (data === 'tours') {
  //     for (let i in r){
  //       let t = r[i];
  //
  //       text += '\n\nTour Date:\n\n';
  //       text += 'Date: ' + moment(t.date).format('dddd DD/MM/YYYY, HH:mm');
  //       text += '\nVenue: ' + t.location.name;
  //       text += '\nPostcode: ' + t.location.postcode;
  //       text += '\nLattitude: ' + t.location.lat;
  //       text += '\nLongitude: ' + t.location.lon;
  //       text += '\nDistance: ' + getDistance(t.location.lat, t.location.lon, user.lat, user.lon).toFixed(2) + ' km';
  //     }
  //   } else if (data === 'merch') {
  //     for (let i in r){
  //       let t = r[i];
  //
  //       text += '\n\nMerch item:\n\n';
  //       text += 'Item name: ' + t.name;
  //     }
  //   } else if (data === 'songs') {
  //     for (let i in r){
  //       let t = r[i];
  //
  //       text += '\n\nSONG:\n\n';
  //       text += 'Name: ' + t.name;
  //       text += '\nTrack Number: ' + t.trackNumber;
  //       text += '\nYoutube Link: ' + t.ytLink;
  //       text += '\n\nLyrics:\n\n' + t.lyrics;
  //     }
  //   }
  //
  //   console.log(text);
  // }

function getDistance(lat1,lon1,lat2,lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lon2-lon1);
  var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon/2) * Math.sin(dLon/2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  var d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI/180)
}
