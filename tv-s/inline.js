var inline = {};

inline['sign-in'] = function() {
  track('sign-in');
  var auth = $('#googleAuth');

  $(auth).on('click', handleAuthClick);

  $(auth).mouseover(function(e) {
    let src = $(this).attr('src');
    $(this).attr('src', src.replace('normal', 'focus'));
  }).mouseout(function(e){
    let src = $(this).attr('src');
    $(this).attr('src', src.replace('focus', 'normal'));
  }).mousedown(function(e){
    let src = $(this).attr('src');
    $(this).attr('src', src.replace('focus', 'pressed'));
  }).mouseup(function(e){
    let src = $(this).attr('src');
    $(this).attr('src', src.replace('pressed', 'focus'));
  });

  $('#permissions-modal').modal();
  $('#open-perm').on('click', function() {
    $('#permissions-modal').modal('open');
  });
}

inline['menu'] = function() {
  track('menu');
  var deAuth = $('#googleDeAuth'),
      form = $('#show-search-form');

  $(deAuth).on('click', handleSignoutClick);

  $('#settings-btn').on('click', function(){
    $('#settings-modal').modal('open');
  });

  $('#remove-btn').on('click', function(){
    $('#remove-modal').modal('open');
  });

  $('#confirm-remove').on('click', function(){
    removeAll();
    $('#remove-modal').modal('close');
  });

  $('#loading-modal').modal({
    dismissible: false, // Modal can be dismissed by clicking outside of the modal
    opacity: .6, // Opacity of modal background
    inDuration: 300, // Transition in duration
    outDuration: 200, // Transition out duration
    startingTop: '4%', // Starting top style attribute
    endingTop: '20%' // Ending top style attribute
  });

  $('#remove-modal, #settings-modal').modal({
    dismissible: true, // Modal can be dismissed by clicking outside of the modal
    opacity: .5, // Opacity of modal background
    inDuration: 500, // Transition in duration
    outDuration: 400, // Transition out duration
    startingTop: '4%', // Starting top style attribute
    endingTop: '20%' // Ending top style attribute
  });

  $('.tooltipped').tooltip({delay: 50});

  renderContent('user-shows', {shows: window.user.shows}, 'show-area');
}

inline['search-results'] = function() {
  $('.collapsible').collapsible();

  for (let i in window.user.shows) {
    let id = window.user.shows[i].id,
        e = $('.add-show[data-id=' + id + ']');

    toggle($('.add-show').index(e));
  }

  $('.add-show').click(function(e) {
    let id = $(this).attr('data-id');
    console.log(id);
    window.user.shows.push(window.user.current_search[id]);
    e.stopPropagation();
    toggle($('.add-show').index(this));
    drive.save();
  });

  $('.remove-show').click(function(e) {
    let id = $(this).attr('data-id');
    console.log(id);
    removeShow(id);
    e.stopPropagation();
    toggle($('.remove-show').index(this));
  });

  function toggle (i) {
    let h = 'hide',
        add = $('.add-show'),
        rem = $('.remove-show');

    if ($(add[i]).hasClass(h)) {
      $(add[i]).removeClass(h);
      $(rem[i]).addClass(h);
    } else {
      $(rem[i]).removeClass(h);
      $(add[i]).addClass(h);
    }
  }
}

inline['search-form'] = function() {

  $('#show-search-form input').on("keyup", function(e) {
    let key = e.keyCode || e.which;
    let char = String.fromCharCode(key);
    if (/[a-zA-Z0-9-_ ]/.test(char)) {
      $('#show-search-form').submit();
    }

  });

  $('#back-to-shows').on('click', function(e) {
    renderContent('user-shows', {shows: window.user.shows}, 'show-area');
  });
}


inline['user-shows'] = function() {

  $('#update-cal').on('click', function(e) {
    checkCalendar().then(updateCalendar);
  });

  $('#add-shows-button').on('click', function(e) {
    renderContent('search-form', {}, 'show-area');
  });

  $('.remove-show').on('click', function(e) {
    let show = $(this).parents()[2],
        id = $(show).attr('data-id');

    removeShow(id);

    $(show).remove();

    if(!user.shows.length) {
      renderContent('user-shows', {shows: window.user.shows}, 'show-area');
    }

  });
}
