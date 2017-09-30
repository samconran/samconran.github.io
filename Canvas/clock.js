var Clock = function() {

  setup(); //Draw the static circles
  Time(); //Draw the moving parts

  //Both are defined as follows:

  function setup() {
    ctx.fillStyle = '#00e8ff';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.arc(xx/2, yy/2, 150, 0, tau);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(xx/2, yy/2, 200, 0, tau);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(xx/2, yy/2, 240, 0, tau);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(xx/2, yy/2, 280, 0, tau);
    ctx.stroke();
  };

  function Time() {

    var d = new Date();
    var h = d.getHours();
    var m = d.getMinutes();
    var s = d.getSeconds();

    h = (h.toString()[1]) ? h : '0' + h;
    m = (m.toString()[1]) ? m : '0' + m;
    s = (s.toString()[1]) ? s : '0' + s;

    var time = h + ':' + m + ':' + s;

    var aH = (tau * (h / 12)) - (tau/4);
    var aM = (tau * (m / 60)) - (tau/4);
    var aS = (tau * (s / 60)) - (tau/4);

    DrawHand(aH, 200, 4);
    DrawHand(aM, 240, 2);
    DrawHand(aS, 280, 1);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = "50px Arial";
    ctx.fillStyle = '#1c1c1c';
    ctx.fillText(time,xx/2,yy/2);

    function DrawHand(a, r, l) {
      ctx.lineWidth = l;
      ctx.beginPath();
      ctx.moveTo(xx/2,yy/2);
      ctx.lineTo((xx/2 + Math.cos(a) * r), yy/2 + Math.sin(a) * r);
      ctx.strokeStyle = '#00e8ff';
      ctx.stroke();
    };
  };

};
