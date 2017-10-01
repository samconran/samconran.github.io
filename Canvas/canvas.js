var pageLoad = function() {
  var d = $('div');
  for (var i = 0; i < d.length; i++){
    var s = d[i];
    var t = 500 + (1000 * i);
    $(s).delay(t).animate({"opacity": "1"}, 1000);
  };
  $(".button_container").delay(10).queue(function(next){
    $(this).css({"pointer-events":"auto"});
    next();
  });
};

pageLoad();

var pageChange = function (a) {
  $(".button_container").css({"pointer-events": "none"});
  var d = $('div');
  var t;
  for (var i = 0; i < d.length; i++){
    var s = d[i];
    t = (1000 * i);
    $(s).delay(t).animate({"opacity": "0"}, 1000);
  };
  t += 1000;
  setTimeout(function(){
    window.location = 'https://samconran.github.io/'
  }, t);
};

var navBar = function() {
  if ($('.navbar').css('width') == '0px') {
    $('.navbar').animate({width:240}, 500);
    $('.navbar h1').delay(500).animate({opacity:1}, 500);
    $('.navbar p').delay(1000).animate({opacity:1}, 500);
    $('.navbar li').delay(1500).animate({opacity:1}, 500);
  } else if ($('.navbar').css('width') != '0px') {
    $('.navbar li').animate({opacity:0}, 500);
    $('.navbar p').delay(500).animate({opacity:0}, 500);
    $('.navbar h1').delay(1000).animate({opacity:0}, 500);
    $('.navbar').delay(1500).animate({width:0}, 500);
  };
};

var buttons = $('.button');
$.each(buttons , function(){
  $(this).on('click' , function () {
    pageChange((this.innerText.toLowerCase()));
  });
});
