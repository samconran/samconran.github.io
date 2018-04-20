$(document).ready(function(){
  if($(this).width() > 991)
    $('#title').addClass('display-4')
  $('body').prop('hidden', false);
  loadData();
  renderContent('modules', data, 'module-container');
});

function saveData() {
  localStorage.setItem('modules', JSON.stringify(data));
}

function loadData() {
  var data = localStorage.getItem('modules');
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

  function getCurrent(module) {
    var c = data.modules[module].current;
    return c.score/100 * c.worth;
  }

  function calculateResults(module, needed) {
    var c = data.modules[module].current,
        current = getCurrent(module),
        result = Math.ceil((needed - current) / (100-c.worth) * 100);

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
      renderContent('add-module', {}, 'addModuleForm');
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
    $('#save-module').on('click', function(){
      data.modules[$('#moduleTitle').val()] = {
        id : truncate($('#moduleTitle').val()),
        current : {
          score: $('#currentMarks').val(),
          worth: $('#currentWorth').val()
        }
      }
      saveData();
      $('#addModule').modal('hide');
      renderContent('modules', data, 'module-container')
    });
    function truncate(s) {
      return (s.toLowerCase().replace(/\s+/g, '-'));
    }
  }
}

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
