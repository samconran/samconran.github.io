firebase.initializeApp({
    apiKey: "AIzaSyB6PSSM3Qc-PMpUUjdJMDuDiWJxWDuo6FQ",
    authDomain: "samconra-4fe40.firebaseapp.com",
    databaseURL: "https://samconra-4fe40.firebaseio.com",
    projectId: "samconra-4fe40",
    storageBucket: "samconra-4fe40.appspot.com",
    messagingSenderId: "1075634195870"
});

function load () {
  let db = firebase.database();
	return new Promise(function(res, rej) {
		db.ref('projects').on('value', function(r) {
            res(r.val()) ;
        });
    });
}

let projects = new Vue ({
  el : "#project-table",
  data : {
    projects : []
  },
  methods : {
    updateProjects : function() {
      let instance = this;
      load().then(function(r){
        instance.projects = r;
      });
    },
    link : function (e) {
      console.log(e);
    }
  }
});

projects.updateProjects();
