$('document').ready(function(){
  window.onhashchange = renderPage;
  renderPage();

  window.debug_mode = (document.cookie.replace(/(?:(?:^|.*;\s*)debug\s*\=\s*([^;]*).*$)|^.*$/, "$1"));
});


function renderPage() {
  var page = location.hash || '#main';

  $('.page.rendered').removeClass('rendered');
  $('.page' + page).addClass('rendered');

  $('#navbar li').removeClass('selected');
  $('#navbar li').has('a[href="'+page+'"]').addClass('selected');
}

function debug (s, m) {
  m = m || 'log';
  if (debug_mode)
    console[m](s);
}
