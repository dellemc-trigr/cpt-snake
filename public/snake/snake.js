$(document).ready(function() {
  var canvas = $("#snakeCanvas")
  var ctx = canvas[0].getContext("2d")
  var container = $(canvas).parent();
  var cw = 20;
  var d;
  var food;
  var bonusFood;
  var bonusFoodStatus = 0;
  var score;
  var snake_array; //an array of cells to make up the snake
  var game_loop;
  var timeMark = (new Date()).getTime();
  var shouldSetInterval = true;
  var paused = true;

  var directions = ["right", "down", "left", "up"];
  twitter = $("#twitterButton");
  twitter.attr("data-text", "I just #CFpush my first app #pairprogramming with @EMCDojo & #CloudFoundry at #EMCWorld. Click to play #dojosnake.");
  twitter.attr("data-url", "http://dojo-snake.pcf.beta.virtustream.com/");
  twitter.attr("data-related", "EmcDojo");

  var heads;
  var tail;
  var body;
  var background;
  var gameoverBackground;
  var fruit;
  var hamster;
  var explosion;
  var name=" ";
  var speed = 150;
  var fruitPath = "assets/image/apple.png";

  init();

  function init() {
    score = 0;
    $("#action").html("Start!");
    $('#userHandle').val('');
    $('#successMessage').addClass('hidden');
    d = "right"; //default direction
    createSnake();
    getLeaders().done(updateLeaderBoardDisplay);

    redraw();
  }

  function redraw() {
    var container = $(canvas).parent();
    var w = $(container).width();
    var h = $(container).height();
    if(w > 1000) {
      cw = 35
    }
    canvas.attr('width', w); //max width
    canvas.attr('height', h); //max height

    createFood("food", w, h);
    heads = initHeads(-9999, -9999);
    tail = initTail(-9999, -9999);
    body = initBody(-9999, -9999);
    background = initBackgroundImage(0, 0);
    gameoverBackground = initGameOverBackground(-9999, -9999);
    fruit = initFruit(-9999, -9999);
    hamster = initBonusFood(-9999, -9999);
    explosion = initExplosion(-9999, -9999);
    paintBackgroundImage(background, w, h);
    drawGame(container);
  }

  function drawGame(container){
    //Lets move the snake now using a timer which will trigger the paint function
    //every 60ms
    if(shouldSetInterval){
      game_loop = setInterval(function() {
        if(!paused){
          var w = $(container).width();
          var h = $(container).height();
          paint(w, h);
        }
      }, speed);
      shouldSetInterval = false;
    }
    return;
  }

  function createSnake() {
    var length = 5; //Length of the snake
    snake_array = []; //Empty array to start with
    for(var i = length-1; i>=0; i--) {
      //This will create a horizontal snake starting from the top left
      snake_array.push({x: i, y:0});
    }
  }

  //Lets paint the snake now
  function paint(w, h) {
    var nx = snake_array[0].x;
    var ny = snake_array[0].y;
    //These were the position of the head cell.
    //We will increment it to get the new head position
    //Lets add proper direction based movement now
    if(d == "right") nx++;
    else if(d == "left") nx--;
    else if(d == "up") ny--;
    else if(d == "down") ny++;

    //Lets add the game over clauses now
    //This will restart the game if the snake hits the wall
    //Lets add the code for body collision
    //Now if the head of the snake bumps into its body, the game will restart

    if(nx == -1 || nx >= Math.round(w/cw) || ny == -1 || ny >= Math.round(h/cw) || checkCollision(nx, ny, snake_array)) {
      var head = snake_array[0];
      endGame(head.x, head.y, w, h);
      return;
    }

    paintBackgroundImage(background, w, h)

    //Lets write the code to make the snake eat the food
    //The logic is simple
    //If the new head position matches with that of the food,
    //Create a new head instead of moving the tail
    if(nx == food.x && ny == food.y) {
      score += 10;
      createFood("food", w, h);
    } else if (bonusFoodStatus == 1 && nx == bonusFood.x && ny == bonusFood.y) {
      score += 25;
      bonusFoodStatus = 0;
      timeMark = (new Date()).getTime();
    } else {
      snake_array.pop(); //pops out the last cell
    }
    //The snake can now eat the food.
    var head = {x: nx, y: ny};
    snake_array.unshift(head); //puts back the head as the first cell

    paintHead(head.x, head.y);
    for(var i = 1; i < snake_array.length-1; i++) {
      var body = snake_array[i];
      paintBody(body.x, body.y, i-1);
    }
    var tail = snake_array[snake_array.length-1];
    paintTail(tail.x, tail.y);

    //Lets paint the food
    drawBonusFood(w,h);
    paintFood("fruit",food.x, food.y);

    //Lets paint the score
    var score_text = "Score: " + score;
    ctx.font="2vw LVDCGameOver";
    ctx.fillStyle="white";
    ctx.fillText(score_text, 5, h-5);
    return;
  }

  function endGame(nx, ny, w, h) {
    paused = true;

    paintBackgroundImage(gameoverBackground, w, h);
    var head = snake_array[0];
    paintHead(head.x, head.y);
    for(var i = 1; i < snake_array.length-1; i++) {
      var body = snake_array[i];
      paintBody(body.x, body.y, i-1);
    }
    var tail = snake_array[snake_array.length-1];
    paintTail(tail.x, tail.y);

    //Lets paint the score
    var score_text = "Score: " + score;
    ctx.font="2vw LVDCGameOver";
    ctx.fillStyle="white";
    ctx.fillText(score_text, 5, h-5);

    paintExplosion(nx, ny);

    $("#gameBoard").show();
    $("#tweet").show();
    $("#gameOver").show();
    $("#action").show();
    $("#action").html("> Restart");
    $("#leaderBoard").hide();


    var gameOverText = $('#gameOver')[0];
    if(gameOverText) {
      gameOverText.className += gameOverText.className ? ' blink' : 'blink';
    }

    return;
  }

  //Lets create the food now
  function createFood(foodTypeString, w, h) {
    if (foodTypeString == "bonusFood") {
      bonusFood = {
        x: Math.round(Math.random()*(w-cw)/cw),
        y: Math.round(Math.random()*(h-cw)/cw),
      };
    }
    if (foodTypeString == "food") {
      food = {
        x: Math.round(Math.random()*(w-cw)/cw),
        y: Math.round(Math.random()*(h-cw)/cw),
      };
    }
  }

  function drawBonusFood(w,h){
    if(bonusFoodStatus == 1){
      if(((new Date()).getTime() - timeMark)>5000){
        timeMark = (new Date()).getTime();
        bonusFoodStatus = 0;
      }
      else{
        paintFood("hamster", bonusFood.x, bonusFood.y)
      }
    }
    else if(((new Date()).getTime() - timeMark)>7000) {
      createFood("bonusFood", w, h);
      paintFood("hamster", bonusFood.x, bonusFood.y)
      timeMark = (new Date()).getTime();
      bonusFoodStatus = 1;
    }
  }

  function initFruit(x, y){
    return initImage(fruitPath, x, y);
  }

  function initBonusFood(x, y){
    return initImage("assets/image/hamster.png", x, y);
  }

  //Lets first create a generic function to paint cells
  function paintFood(type,x, y) {
    if (type == "fruit"){
      ctx.drawImage(fruit, x*cw, y*cw, cw, cw);
    }
    else {
      ctx.drawImage(hamster, x*cw, y*cw, cw, cw);
    }
  }

  function initImage(url, x, y) {
    var image = new Image();
    image.onload = function() {
      ctx.drawImage(image, x, y)
    }
    image.src = url;
    return image;
  }

  function initHeads(x, y) {
    var heads = new Array();
    for(var i=0; i<4; i++) {
      var postfix = ".png";
      if(cw == 20) {
        postfix = "-small.png";
      }
      url = "assets/image/snake-head-"+directions[i]+postfix;
      heads[i] = initImage(url, x, y);
    }
    return heads;
  }

  function paintHead(x, y){
    var i = 0;
    if (d == "down") {
      i = 1;
    } else if (d == "left") {
      i = 2;
    } else if (d == "up") {
      i = 3;
    }
    ctx.drawImage(heads[i], x*cw, y*cw);
  }

  function initTail(x, y) {
    var src = "assets/image/snake-tail.png";
    if (cw == 20) {
      src = "assets/image/snake-tail-small.png";
    }
    return initImage(src, x, y);
  }

  function getLeaders() {
    return $.ajax({url: "/backend/index.json"});
  }

  function getTwitterHandle() {
    return $('#userHandle').val().replace(/@/g,"");
  }

  function updateLeaderBoardDisplay(leaders) {
    var leaderDisplay="";
    $(leaders).each(function (i, leader) {
      leaderDisplay += "<div>" + (i+1) + ".&nbsp;" +
      "<span class=\"twitter_handle\">" + leader.twitter_handle + "</span>" +
      "&nbsp;&mdash;&nbsp;" +
      "<span class=\"score\">" + leader.score + "</span>" +
      "</div>"
    });
    var leaders = $("#leaders")
    if(leaders.size != 0) {
      leaders.html(leaderDisplay);
    } else {
      var none ="<div class=\"col-xs-6 col-xs-offset-3\">" +
        "&lt;none&gt;" +
      "</div>"
      leaders.html(none);
    }

    $(leaders).show();
  };

  function validateHandle(event) {
    if(getTwitterHandle().length > 0) {
      $('#joinButton').removeClass('disabled');
    } else {
      $('#joinButton').addClass('disabled');
    }
  }

  function postLeader(handle, score, callback) {
    return $.ajax({
      type: 'POST',
      url: '/backend/',
      data: {
        "token": token,
        "leader": { "twitter_handle": handle, "score": score }
      },
      success: callback
    })
  }

  function paintTail(x, y){
    ctx.drawImage(tail, x*cw, y*cw);
  }

  function initBody(x, y) {
    var src = "assets/image/snake-body.png";
    if (cw == 20) {
      src = "assets/image/snake-body-small.png";
    }
    return initImage(src, x, y);
  }

  function paintBody(x, y, i){
    ctx.drawImage(body, x*cw, y*cw);
    ctx.font="20px Tahoma";
    var printedName = name + " ";
    ctx.fillText(printedName[i%(printedName.length)],x*cw+(body.width/2)-4,y*cw+(body.height/2)+4);
  }

  function initExplosion(x, y) {
    var src = "assets/image/explosion.png";
    if (cw == 20) {
      src = "assets/image/explosion-small.png";
    }
    return initImage(src, x, y);
  }

  function paintExplosion(x, y){
    ctx.drawImage(explosion, (x- 1/2)*cw, (y-1/2)*cw, cw*2, cw*2);
  }

  function initBackgroundImage(x, y) {
    return initImage("assets/image/background.jpg", x, y);
  }

  function paintBackgroundImage(background, w, h) {
    var image_width = background.naturalWidth;
    var image_height = background.naturalHeight;

    if (h/w > image_height/image_width) {
      new_width = image_width*h/image_height;
      ctx.drawImage(background, (w-new_width)/2, 0, new_width, h);
    } else {
      new_height = image_height*w/image_width;
      ctx.drawImage(background, 0, (h-new_height)/2, w, new_height);
    }
  }

  function initGameOverBackground(x, y) {
    return initImage("assets/image/gameover.jpg", x, y);
  }

  function checkCollision(x, y, array) {
    //This function will check if the provided x/y coordinates exist
    //in an array of cells or not
    for(var i = 0; i < array.length; i++) {
      if(array[i].x == x && array[i].y == y)
        return true;
    }
    return false;
  }

  //-----------------EVENT REGISTER GO HERE -------------
  $(window).resize(redraw);

  $$('canvas').swipeLeft(function(){ if(d != "right") d = "left"; });
  $$('canvas').swipeDown(function(){ if(d != "up") d = "down"; });
  $$('canvas').swipeRight(function(){ if(d != "left") d = "right"; });
  $$('canvas').swipeUp(function(){ if(d != "down") d = "up"; });
  $$('canvas').bind('touchstart', function(e){ e.preventDefault(); });
  $("#joinButton").click(function () {
    $('#joinButton, #userHandle').addClass('disabled');
    postLeader(getTwitterHandle(), score, function () {
      $('#joinFormGroup').addClass('has-success');
      $('#successMessage').removeClass('hidden');
      $('#userHandle').removeClass('disabled');
    });
  });

  $('#userHandle').keyup(function () {
    $('#successMessage').addClass('hidden');
    validateHandle();
  });

  $("#action").click(function () {
    $("#gameBoard").hide();
    paused = false;
    init();
  });

  //Lets add the keyboard controls now
  $(document).keydown(function(e){
    var key = e.which;
    //We will add another clause to prevent reverse gear
    if(key == "37" && d != "right") d = "left";
    else if(key == "38" && d != "down") d = "up";
    else if(key == "39" && d != "left") d = "right";
    else if(key == "40" && d != "up") d = "down";
    //The snake is now keyboard controllable
  })
})
