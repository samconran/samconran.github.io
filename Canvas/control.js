//Initial Canvas setup
var canvas = document.getElementById('canvas');
canvas.width = canvas.scrollWidth;
canvas.height = canvas.scrollHeight;
canvas.style.backgroundColor = '#1c1c1c';
var ctx = canvas.getContext('2d');
//set some constants
var pi = Math.PI;
var tau = pi * 2;
var xx = canvas.width;
var yy = canvas.height;

setTimeout(Canvas, 1000);

function Canvas() {
  var Project = Clock;

  function changeProject(a) {
    Project = window[a];
  }

  var li = $('li');
  $.each(li , function(){
    $(this).on('click' , function () {
      changeProject((this.textContent));
    });
  });

  var Draw = function() {
    ctx.clearRect(0,0,xx,yy);
    Project();
  }

  setInterval(Draw, 100);

}
