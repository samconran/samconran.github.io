$('document').ready(function(){
  window.onhashchange = renderPage;
  renderPage();

  window.debug_mode = (document.cookie.replace(/(?:(?:^|.*;\s*)debug\s*\=\s*([^;]*).*$)|^.*$/, "$1"));
});


function renderPage() {
  var page = location.hash || '#main';

  var content = $(page).html() || '';
  $('#content').html(content);

  $('#navbar a').removeClass('selected');
  $('#navbar a[href="'+page+'"]').addClass('selected');
}

function debug (s, m) {
  m = m || 'log';
  if (debug_mode)
    console[m](s);
}
