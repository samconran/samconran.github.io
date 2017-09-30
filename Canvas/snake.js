w=10;
var snake, d, food, score;
init();

function Snake(){

  paint();
  function paint() {
    var nx = snake[0].x;
		var ny = snake[0].y;

    if(d == "right") nx++;
		else if(d == "left") nx--;
		else if(d == "up") ny--;
		else if(d == "down") ny++;

    if(nx == -1 || nx == xx/w || ny == -1 || ny == yy/w || Collision(nx, ny, snake)){
      init();
			return;
		}

    if(nx == food.x && ny == food.y){
			var tail = {x: nx, y: ny};
			createFood();
      score++;
		}else {
			var tail = snake.pop();
			tail.x = nx; tail.y = ny;
		}
		snake.unshift(tail);

    for(var i = 0; i < snake.length; i++){
      var c = snake[i];
      paintCell(c.x, c.y, '#00e8ff');
    };

    paintCell(food.x, food.y, '#c1c1c1');

    ctx.font="15px Arial";
		ctx.fillText(("Score: " + score), 30, yy-10);
  }
}

function paintCell(x, y, c) {
  ctx.fillStyle = c;
  ctx.fillRect(x*w, y*w, w, w);
  ctx.strokeStyle = "#2c2c2c";
  ctx.strokeRect(x*w, y*w, w, w);
}

function Collision(x, y, a){
  for(var i = 0; i < a.length; i++){
    if(a[i].x == x && a[i].y == y)
     return true;
  }
  return false;
}

$(document).keydown(function(e){
  var key = e.which;
  if(key == "37" && d!="right") d = "left";
  else if(key == "38" && d!="down") d="up";
  else if(key == "39" && d!="left") d="right";
  else if(key == "40" && d!="up") d="down";
})

function init(){
  snake = [];
  d = 'right';
  score = 0;
  createSnake();
  createFood();
}

function createSnake() {
  for (var i = 5; i>-1; i--){
    snake.push({
      x : i,
      y : 0
    });
  };
};
function createFood(){
  food = {
    x: Math.round(Math.random()*(xx-w)/w),
    y: Math.round(Math.random()*(yy-w)/w)
  };
}
