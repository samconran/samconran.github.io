$('document').ready(function(){
  window.onhashchange = renderPage;
  renderPage();

  window.debug_mode = (document.cookie.replace(/(?:(?:^|.*;\s*)debug\s*\=\s*([^;]*).*$)|^.*$/, "$1"));


  $('#music #track-listing li').on('click', function(e){
    var index = $(this).index();
    debug('ol list item clicked: ' + index);

    readDB('songs/' + index).then(function(r){

      $('#song #song-title').text(r.name);
      $('#song #song-lyrics').text(r.lyrics);
      $('#song #song-yt-link').attr('href', r.ytLink);

      $('#song #song-lyrics').html($('#song #song-lyrics').text().replace(/\r?\n/g, '<br/>'));

      window.location.hash = '#song';
    });
  });


});


function renderPage() {
  var page = location.hash || '#main';

  $('.page.rendered').removeClass('rendered');
  $('.page' + page).addClass('rendered');

  page = (page === '#song') ? '#music' : page;

  $('#navbar li').removeClass('selected');
  $('#navbar li').has('a[href="'+page+'"]').addClass('selected');
}

function debug (s, m) {
  m = m || 'log';
  if (debug_mode)
    console[m](s);
}
