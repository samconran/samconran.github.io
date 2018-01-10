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
    //
    isMobile: !(matchMedia('(min-width: 768px)').matches),
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

  //Save function. Stringifys cart and playlist data from user object and stores in localStorage
  black_peaks.user.save = function() {
    var data = {
      cart: black_peaks.user.cart,
      playlist: black_peaks.user.playlist
    }
    localStorage.setItem('black-peaks_user-data', JSON.stringify(data));
  }

  //Load function. Parses cart and playlist data from localStorage, puts into user object
  black_peaks.user.load = function() {
    var data = JSON.parse(localStorage.getItem('black-peaks_user-data'));
    if (!data)
      return false;
    black_peaks.debug(data);
    black_peaks.user.cart = data.cart;
    //If user has a custom playlist, load that
    if (data.playlist.length > 0)
      black_peaks.user.playlist = data.playlist.slice();
  }

  //Load data ASAP
  black_peaks.user.load();

  //Add to cart function to add items to user object's cart
  black_peaks.user.addCart = function(p) {
    var cart = black_peaks.user.cart,
        db = black_peaks.data.merch[p];

    //If the item is already there, increase the quantity. Otherwise, add it
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
    //Display toast message and save the cart to local storage
    black_peaks.toast('Added to cart!');
    black_peaks.user.save();
    black_peaks.debug('saved!');
  }

  //Function to clear the user's cart. Sets the cart to a blank array, displays toast, and saves
  black_peaks.user.clearCart = function() {
    black_peaks.user.cart = {};
    black_peaks.user.save();
    black_peaks.debug(cart);
    black_peaks.toast('Cart Cleared!');
  }

  //RenderPage function for adding/removing classes (CSS looks for these for visibiity) and firing setup functions
  black_peaks.renderPage = function() {

    //If a product page is being rendered, but no info has loaded in, point to the merch page
    if(location.hash == "#product-page" && !($(location.hash + ' #product-title').text()))
      location.hash = '#merch';

    //If no hash, go to the home page
    var page = location.hash || '#home';

    //Before loading tours or checkout page, set them up
    if(page == '#tours' || page =='#checkout')
      black_peaks.page_setup[page]();

    $('.page.rendered').removeClass('rendered');
    $('.page' + page).addClass('rendered');

    //Setup the home page once it has been rendered
    if (page =='#home')
      black_peaks.page_setup[page]();

    //Show 'music' as selected in the navbar for the song page, and 'merch' for the product and checkout pages
    page = (page === '#song') ? '#music' : page;
    page = (page === '#product-page' || page === '#checkout') ? '#merch' : page;

    $('#navbar li, #mobile-navbar li').removeClass('selected');
    $('#navbar li, #mobile-navbar li').has('a[href="'+page+'"]').addClass('selected');
  }

  //Function for rendering the playlist customiser
  black_peaks.renderPlaylist = function() {
    var in_pl = $('#playlist-modal #in-playlist ul'),
        out_pl = $('#playlist-modal #out-playlist ul'),
        pl = black_peaks.user.playlist,
        songs = player.songs,
        removed = songs.filter(s => pl.indexOf(s) == -1);

    //Clear the modal
    $(in_pl).html('');
    $(out_pl).html('');

    //For each item in the playlist, create a listing with remove/move buttons
    for (var i in pl) {
      var li = createListItem(i, pl);
      var buttons = createButtons('remove', 'up', 'down');
      $(li).append(buttons);
      $(in_pl).append(li);
    }

    //For each song not in the playlist, create an 'out of playlist' listing with add button
    for (var i in removed) {
      var li = createListItem(i, removed);
      var buttons = createButtons('add');
      $(li).append(buttons);
      $(out_pl).append(li);
    }

    //When one of the listing's buttons is cicked...
    $('#playlist-modal #playlist-controls a').on('click', function() {
      var index = parseInt($(this).parent().parent().attr('data-index'));

      //Run the relevant function
      if ($(this).hasClass('remove-song'))
        removeSong();
      if ($(this).hasClass('add-song'))
        addSong();
      if ($(this).hasClass('up-song'))
        moveSong(-1);
      if ($(this).hasClass('down-song'))
        moveSong(1);

      function addSong() {
        track = songs.indexOf(removed[index]);
        pl.splice(0, 0, songs[track]);
      }

      function removeSong() {
        pl.splice(index, 1);
        black_peaks.debug(index + ' removed.');
        black_peaks.debug(player.playlist);
      }

      function moveSong(direction) {
        var place = (index + pl.length + direction) % pl.length;
        pl.splice(place, 0, pl.splice(index, 1)[0]);
      }

      //Re-render the playlist
      black_peaks.renderPlaylist();
    });

    //Function to create a li item using jQuery
    function createListItem(i, arr) {
      var li = $('<li/>', {
        class: 'song',
        'data-index': i
      });
      var p = $('<p/>', {
        text: arr[i]
      });
      $(li).append(p);
      return li;
    }

    //Create a button container with the action buttons
    function createButtons(...actions) {
      var div = $('<div/>', {
        class: 'button-container'
      });

      for (var i in actions) {
        div.append(createButton(actions[i]));
      }

      return div;

      //Create individual button
      function createButton(action) {
        var icon_lookup = {'add' : 'fa fa-plus', 'remove' : 'fa fa-minus', 'up' : 'fa fa-angle-up', 'down' : 'fa fa-angle-down'};
        var icon = icon_lookup[action];
        action += '-song';

        return $('<a/>', {
          class: icon +' '+ action +' clickable',
        });
      }
    }
  }

  //setup bxslider for the home page
  black_peaks.page_setup['#home'] = function () {
    $('.slider').bxSlider({
      auto: true
    });
  }

  //Add functions to black_peaks.page_setup for songs
  black_peaks.page_setup['#song'] = function (i){
    var r = black_peaks.data.songs[i];
    black_peaks.debug('ol list item clicked: ' + i);

    //Set the song information fields to the relevant song
    $('#song #song-title').text(r.name);
    $('#song #song-lyrics').text(r.lyrics);
    $('#song #song-play-btn').attr('data-song', r.name);
    $('#song #song-yt-link').attr('href', r.ytLink);
    $('#song #song-spot-link').attr('href', r.spotLink);

    //Replace '\n' characters with <br> tags
    $('#song #song-lyrics').html($('#song #song-lyrics').text().replace(/\\n/g, '<br/>'));
  }

  //Add functions to black_peaks.page_setup for products
  black_peaks.page_setup['#product-page'] = function (i){

    //If the merch hasn't been loaded yet, load it and then continue rendering.
    if (!black_peaks.data.merch) {
      black_peaks.db.ref('merch').once('value').then(function(r){
        black_peaks.data.merch = r.val();
        renderProduct();
      });
    } else {
      renderProduct();
    }

    //Function to render the product
    function renderProduct() {
      var r = black_peaks.data.merch[i];

      black_peaks.debug('Product ID clicked: ' + i);

      //Fill in the product information with the relevant product
      $('#product-page #product-image').attr('src', 'assets/img/store/' +i+ '.jpg');
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

    //Clear the cart list
    $(ul).html('');

    //For each item in the cart, create a listing in the cart ul
    for (var i in cart) {
      var li = $('<li/>', {
        class: 'cart-product',
        'data-product': i,
        text: cart[i].name + '  (' +cart[i].quantity+ ')'
      });
      total += (cart[i].quantity * cart[i].price); //Count up a total cost
      $(ul).append(li);
    }

    //Set the proce to the total
    $('#checkout #cart-price').text(total);
  }

  //Add functions to black_peaks.page_setup for tours
  black_peaks.page_setup['#tours'] = function (distance){
    var tour_dates = black_peaks.data.tours;

    //If tour dates, continue. If none laoded from database yet, load them and then continue
    if (tour_dates)
      filterTours(tour_dates, distance);
    else
      black_peaks.db.ref('tours').once('value').then(function(r){
        tour_dates = r.val();
        filterTours(tour_dates, distance);
      });

    function filterTours(tour_dates, distance) {
      //If no distance given (or distance is 0), render all tours
      if(!distance){
        renderTours(tour_dates);
        return;
      }
      var filtered_dates = [];
      //Ask for the user's location and store in black_peaks's user data
      navigator.geolocation.getCurrentPosition(function(l){
        black_peaks.user.location = {
          lat: l.coords.latitude,
          lon: l.coords.longitude
        };
        //Filter the tour array, returning only elements within distance range
        filtered_dates = tour_dates.filter(function(d){
          return getDistance(d.location.lat, d.location.lon, black_peaks.user.location.lat, black_peaks.user.location.lon) <= distance;
        });
        renderTours(filtered_dates);
      });
      //Function for working out the distance from lattitudes/longitudes
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

    //Function for rendering tour listings
    function renderTours(r) {
      var page_content = $('#tours .content-container');
      $(page_content).html('');

      //For each tour in the array, create the necessary HTML elements and append to the page
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

      //Function for rendering the information div once a tour has been clicked
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

        //Create the HTML using jQuery
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

        //Insert after the end of the tour date's row. If no full row, just after the tour date.
        var offset = black_peaks.isMobile ? 2 : 4,
            insertionPoint = index + offset - (index % offset) - 1;
        if (!($('.tour-date[data-index='+insertionPoint+']').length))
          insertionPoint = index;
        $(div).insertAfter($('.tour-date[data-index='+insertionPoint+']'));

        $('#tours .buy_ticket').on('click', function(e) {
          black_peaks.user.addCart('ticket');
        });
      }
    }
  }

  //Function to create toast (mini pop-up) with custom message
  black_peaks.toast = function(message) {
    var toast = $('<div/>', {
      class: 'toast',
      text: message
    });
    var settings = {
      height:"toggle",
      opacity:"toggle"
    };
    $(toast).appendTo('body').hide().animate(settings, 500).delay(3000).animate(settings, 500, function(){
      $(this.remove());
    });
  }
})();

//On document.ready...
$('document').ready(function(){
  //Set the render page function to fire on every hashchange event
  window.onhashchange = black_peaks.renderPage;
  black_peaks.renderPage(); //Initial render page call

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

  //When the playlist button is clicked, show it and scroll to it. If on mobile, close the player modal.
  $('#player #playlist').on('click', function(){
    black_peaks.renderPlaylist();
    if (black_peaks.isMobile)
      $(this).parent().parent().parent().toggle();
    $('#playlist-modal').toggle();
    window.scrollTo(0,0);
  });

  //On clicking the save playlist button, save it and show the toast.
  $('#playlist-modal #save-playlist-button').on('click', function(){
    player.update();
    black_peaks.toast('Playlist saved!');
  });

  //When a play button is clicked, play the song
  $('#song #song-play-btn').on('click', function() {
    var song = $('#song #song-play-btn').attr('data-song');
    player.setSong(song);
    player.play();
  });

  //When a song is clicked, setup the song page to show its details, and then load it
  $('#music #track-listing .clickable').on('click', function(e){
    var index = $(this).parent().index();
    black_peaks.page_setup['#song'](index);
    window.location.hash = '#song';
  });

  //When a distance filter is clicked, re-setup the page, filtering by the distance
  $('#tours #tours-menu .button').on('click', function(){
    var distance = $(this).attr('data-distance');
    black_peaks.page_setup['#tours'](distance);
  });

  //Setup add to cart and view buttons on the merch page
  $('#merch .purchase-buttons .button').on('click', function(e){
    var product = $(this).parent().parent().attr('id').substring(8);
    if ($(this).hasClass('view-product')) {
      black_peaks.page_setup['#product-page'](product);
      window.location.hash = '#product-page';
    } else {
      black_peaks.user.addCart(product);
    }
  });

  //When a merch item is clicked, setup the product page and load it
  $('#merch .product-thumbnail').on('click', function(e){
    var product = $(this).parent().attr('id').substring(8);
    black_peaks.page_setup['#product-page'](product);
    window.location.hash = '#product-page';
  });

  //Set up adding to cart event on the button click
  $('#product-page #product-add-cart').on('click', function(e) {
    var product = $(this).attr('data-id');
    black_peaks.user.addCart(product);
  });

  //Clear the cart and re-render the page on 'clear cart' click
  $('#checkout #clear-cart').on('click', function() {
    black_peaks.user.clearCart();
    black_peaks.renderPage();
  });
});
