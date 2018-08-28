$(document).ready(function(){
  if($(this).width() > 991)
    $('#title').addClass('display-4')
  $('body').prop('hidden', false);
  loadData();
  renderContent('modules', data, 'module-container');
});

function saveData() {
  var data = {
    modules: window.data.modules
  }
  localStorage.setItem('gradesData', JSON.stringify(data));
}

function loadData() {
  var data = localStorage.getItem('gradesData');
  window.data = data ? JSON.parse(data) : {
    modules : {}
  }
}

function getResults() {
  var m = data.modules;
  var results = {};
  for(var i in m){
    results[i] = {
      current : getCurrent(i),
      needed : {
        'Pass' : calculateResults(i, 40),
        '2:2' : calculateResults(i, 50),
        '2:1' : calculateResults(i, 60),
        'First' : calculateResults(i, 70)
      }
    };
  }
  return results;

  function getCurrent(moduleName) {
    var total = 0,
        current = window.data.modules[moduleName].current;
    for (var i in current)
      total += current[i].score/100 * current[i].worth
    return total;
  }

  function calculateResults(moduleName, needed) {
    var currentMarks = window.data.modules[moduleName].current,
        currentScore = getCurrent(moduleName),
        currentWorth = 0;
    for (var i in currentMarks)
      currentWorth += parseInt(currentMarks[i].worth);
    var result = Math.ceil((needed - currentScore) / (100-currentWorth) * 100);

    return (result > 0) ? ((result <= 100) ? result : '\u2715') : '\u2713';

    // function getPercent(marks, worth) {
    //     return (marks/100)*worth
    // }
    //
    // function getRemaining(percent, worth, needed) {
    //     var raw = needed - percent;
    //     return (raw/worth) * 100;
    // }
  }
}

function renderContent (target, data, destination) {
  var source = $('#' + target).html();
  var template = Handlebars.compile(source);
  var html = template(data);
  $('#' + destination).html(html);
  if(inline[target]) inline[target]();
}

window.inline = {
  modules : function() {
    $('.addModuleBtn').on('click', function(){
      renderContent('add-module', data.tempMarks, 'addModuleForm');
      $('#addModule').modal('show');
    });
    $('.deleteModule').on('click', function() {
      var module = $(this).parent().parent().parent().parent().find('div h5 button').text();
      delete data.modules[module];
      renderContent('modules', data, 'module-container');
      saveData();
    });
    $('#getResults').on('click', function(){
      renderContent('results', getResults(), 'results-container')
    });
  },

  'add-module' : function(){

    $('#addModule-tab').on('click', function(e) {
      e.preventDefault();
      saveModuleData();
      renderContent('add-module', data.tempModule, 'addModuleForm');
      $('#'+(data.tempModule.current.length-1)+'-tab').tab('show');
    });

    $('#save-module').on('click', function(){
      saveModuleData(true);
      saveData();
      $('#addModule').modal('hide');
      renderContent('modules', data, 'module-container');
      window.data.tempModule = {};
    });

    function saveModuleData(isFinal) {
      var marks = [],
          moduleName = $('#moduleTitle').val();
      $('.mark-tab').each(function(i,v){
        marks.push({
          name: $('#'+i+'-currentName').val(),
          score: $('#'+i+'-currentMarks').val(),
          worth: $('#'+i+'-currentWorth').val()
        });
      });
      if (!isFinal) {
        marks.push({name: null, score: null, worth: null});
        window.data.tempModule = new Module(moduleName, marks)
      } else
        data.modules[moduleName] = new Module(moduleName, marks)
    }
  }
}

function Module (name, marks) {
  this.name = name;
  this.id = truncate(name);
  this.current = marks || [];
  function truncate(s) {
    return (s.toLowerCase().replace(/\s+/g, '-'));
  }
}

Handlebars.registerHelper("incr", function(value, options) {
    return parseInt(value) + 1;
});

Handlebars.registerHelper('ifPassed', function(data, options) {
  if(data == '\u2713') {
    return options.fn(this);
  } else {
    return options.inverse(this);
  }
});

Handlebars.registerHelper('ifImpossible', function(data, options) {
  if(data == '\u2715') {
    return options.fn(this);
  } else {
    return options.inverse(this);
  }
});
