//Initialisation, wrapped in an IIFE to avoid polluting global namespace
(function(){

  //Initialise the firebase database
  firebase.initializeApp({
    apiKey: 'AIzaSyB7yp9ArORQ7yfStGAAm0eU5xYjxlWET6w',
    authDomain: 'black-peaks.firebaseapp.com',
    databaseURL: 'https://black-peaks.firebaseio.com',
    projectId: 'black-peaks',
    storageBucket: 'black-peaks.appspot.com',
    messagingSenderId: '476376172614'
  });

  //An object to act as a namespace containing the site's objects and main functions—this is to avoid polluting the global namespace
  window.black_peaks = {
    //local copy of database, to be loaded in
    data : {},
    //An object containing setup functions for pages (to be added in later)
    page_setup: {},
    //A user object containing user information (cart object and playlist array)
    user: {
      cart: {},
      playlist: []
    },
    //A reference to the firebase databse
    db: firebase.database(),
    //A variable set to true if there is a 'debug' cookie with a value of 'true'
    debug_mode: (document.cookie.replace(/(?:(?:^|.*;\s*)debug\s*\=\s*([^;]*).*$)|^.*$/, "$1")),
    //A function to output to the console if the above is true
    debug : function (s, m) {
      m = m || 'log';
      if (black_peaks.debug_mode)
        console[m](s);
    }
  };

  //Read data from the database, store in black_peaks.data
  black_peaks.db.ref().once('value').then(function(r){
    black_peaks.data = r.val();
  });

  //Ask for the user's location and store in black_peaks's user data
  navigator.geolocation.getCurrentPosition(function(l){
    black_peaks.user.location = {
      lat: l.coords.latitude,
      lon: l.coords.longitude
    };
  });


  black_peaks.user.save = function() {
    var data = {
      cart: black_peaks.user.cart,
      playlist: black_peaks.user.playlist
    }
    localStorage.setItem('black-peaks_user-data', JSON.stringify(data));
  }

  black_peaks.user.load = function() {
    var data = JSON.parse(localStorage.getItem('black-peaks_user-data'));
    if (!data)
      return false;
    black_peaks.debug(data);
    black_peaks.user.cart = data.cart;
    black_peaks.user.playlist = data.playlist;
  }
  black_peaks.user.load();

  black_peaks.user.addCart = function(p) {
    var cart = black_peaks.user.cart,
        db = black_peaks.data.merch[p];
    if (cart[p]) {
      cart[p].quantity++;
    } else {
      cart[p] = {
        name: db.name,
        price: db.price,
        quantity: 1
      }
    }
    black_peaks.debug(cart);
    black_peaks.user.save();
    black_peaks.debug('saved!');
  }

  //RenderPage function for adding/removing classes (CSS looks for these for visibiity) and firing setup functions
  black_peaks.renderPage = function() {

    if (location.pathname.indexOf('/shop/') > -1)
      return;

    var page = location.hash || '#home';

    if(page == '#tours' || page =='#checkout')
      black_peaks.page_setup[page]();

    $('.page.rendered').removeClass('rendered');
    $('.page' + page).addClass('rendered');

    page = (page === '#song') ? '#music' : page;
    page = (page === '#product-page' || page === '#checkout') ? '#merch' : page;

    $('#navbar li, #mobile-navbar li').removeClass('selected');
    $('#navbar li, #mobile-navbar li').has('a[href="'+page+'"]').addClass('selected');
  }


  //Add functions to black_peaks.page_setup for songs
  black_peaks.page_setup['#song'] = function (i){
    var r = black_peaks.data.songs[i];
    black_peaks.debug('ol list item clicked: ' + i);

    $('#song #song-title').text(r.name);
    $('#song #song-lyrics').text(r.lyrics);
    $('#song #song-yt-link').attr('href', r.ytLink);
    $('#song #song-spot-link').attr('href', r.spotLink);

    $('#song #song-lyrics').html($('#song #song-lyrics').text().replace(/\\n/g, '<br/>'));
  }

  //Add functions to black_peaks.page_setup for products
  black_peaks.page_setup['#product-page'] = function (i){

    if (!black_peaks.data.merch) {
      black_peaks.db.ref('merch').once('value').then(function(r){
        black_peaks.data.merch = r.val();
        renderProduct();
      });
    } else {
      renderProduct();
    }

    function renderProduct() {
      var r = black_peaks.data.merch[i];

      black_peaks.debug('Product ID clicked: ' + i);

      $('#product-page #product-image').attr('src', 'assets/img/store/' +i+ '.jpg.');
      $('#product-page #product-title').text(r.name);
      $('#product-page #product-price').text(r.price);
      $('#product-page #product-add-cart').attr('data-id', i);
      $('#product-page #product-description').text(r.description);
    }
  }

  black_peaks.page_setup['#checkout'] = function() {
    var ul = $('#checkout #cart-info ul'),
        cart = black_peaks.user.cart,
        total = 0;

    $(ul).html('');

    for (var i in cart) {
      var li = $('<li/>', {
        class: 'cart-product',
        'data-product': i,
        text: cart[i].name + '  (' +cart[i].quantity+ ')'
      });
      total += (cart[i].quantity * cart[i].price);
      $(ul).append(li);
    }
    $('#checkout #cart-price').text(total);
  }

  //Add functions to black_peaks.page_setup for tours
  black_peaks.page_setup['#tours'] = function (){
    var r = black_peaks.data.tours;

    if (r)
      renderTours(r);
    else
      black_peaks.db.ref('tours').once('value').then(function(r){
        renderTours(r.val());
      });

    function renderTours(r) {
      var page_content = $('#tours .content-container');
      $(page_content).html('');

      for (var i in r) {

        var gig = r[i],
            location = gig.location;

        var div = $('<div/>', {
          class: 'tour-date clickable',
          'data-index': i,
          click: renderInfo
        }),

        h1_day = $('<h1/>', {
          class: 'tour-date-day',
          text: moment(gig.date).format('ddd')
        }),

        h1_date = $('<h1/>', {
          class: 'tour-date-date',
          text: moment(gig.date).format('MMM DD')
        }),

        p = $('<p/>', {
          class: 'tour-date-city',
          text:location.city
        });

        $(div).append(h1_day).append(h1_date).append(p);

        $(page_content).append(div);

      }

      function renderInfo(e) {

        var clicked = e.currentTarget,
            render = !($(clicked).hasClass('selected'));

        $('.tour-date-info').remove();
        $('.tour-date.selected').removeClass('selected');

        if(!render)
          return;

        var index = $(e.currentTarget).data().index,
            gig = black_peaks.data.tours[index],
            location = gig.location,
            dt = gig.date;
        black_peaks.debug('Tour clicked (index): ' + index);
        $(clicked).addClass('selected');

        var div = $('<div/>', {
          class: 'tour-date-info'
        }),

        h1_location = $('<h1/>', {
          class: 'tour-date-location',
          text: 'Location:  ' + location.name + ' (' +location.postcode+ ')'
        }),

        h1_time = $('<h1/>', {
          class: 'tour-date-time',
          text: 'Time:  ' + moment(dt).format('HH:mm')
        }),

        div_buttons = $('<div/>', {
          class: 'button-container'
        }),

        button_view_location = $('<a/>', {
          class: 'button',
          text: 'View location',
          href: location.link,
          target: '_blank'
        }),

        button_buy_tickets = $('<a/>', {
          class: 'button buy_ticket',
          text: 'Buy tickets',
          target: '_blank'
        });

        $(div_buttons).append(button_view_location).append(button_buy_tickets);
        $(div).append(h1_location).append(h1_time).append(div_buttons);

        var offset = (matchMedia('(min-width: 768px)').matches) ? 4 : 2,
            insertionPoint = index + offset - (index % offset) - 1;
        $(div).insertAfter($('.tour-date[data-index='+insertionPoint+']'));

        $('#tours .buy_ticket').on('click', function(e) {
          black_peaks.user.addCart('ticket');
        });
      }

      function getDistance(lat1,lon1,lat2,lon2) {
        var R = 6371; // Radius of the earth in km
        var dLat = deg2rad(lat2-lat1);  // deg2rad below
        var dLon = deg2rad(lon2-lon1);
        var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon/2) * Math.sin(dLon/2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        var d = R * c; // Distance in km
        return d;

        function deg2rad(deg) {
          return deg * (Math.PI/180)
        }
      }
    }
  }

})();











$('document').ready(function(){
  window.onhashchange = black_peaks.renderPage;
  black_peaks.renderPage();

  //General function for opening the mobile-nav or mobile-player screens
  $('#navbar .mobile a').on('click', function(){
    var target = ($(this).parent().attr('id') == 'mob-nav') ? '#mobile-navbar' : '#player';
     $(target).toggle();
  });

  //When one of the mobile modal's close buttons is clicked, close the modal
  $('.modal .modal-header a').on('click', function(){
    $(this).parent().parent().toggle();
  });

  $('#mobile-navbar ul a').on('click', function() {
    $('#mobile-navbar').toggle();
  });


  $('#music #track-listing .clickable').on('click', function(e){
    var index = $(this).parent().index();
    black_peaks.page_setup['#song'](index);
    window.location.hash = '#song';
  });

  $('#merch .purchase-buttons .button').on('click', function(e){
    var product = $(this).parent().parent().attr('id').substring(8);
    if ($(this).hasClass('view-product')) {
      black_peaks.page_setup['#product-page'](product);
      window.location.hash = '#product-page';
    } else {
      black_peaks.user.addCart(product);
    }
  });

  $('#merch .product-thumbnail').on('click', function(e){
    var product = $(this).parent().attr('id').substring(8);
    black_peaks.page_setup['#product-page'](product);
    window.location.hash = '#product-page';
  });

  $('#product-page #product-add-cart').on('click', function(e) {
    var product = $(this).attr('data-id');
    black_peaks.user.addCart(product);
  });
});
