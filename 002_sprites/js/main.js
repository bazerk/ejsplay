ninja_data = {
  framerate: 10,
  images: ["/img/ninja_sprites.png"], // thank you http://forums.tigsource.com/index.php?topic=9404.0!
  frames: {width:48, height:48},
  animations: {
    stand: { frames: [0] },
    jump: { frames: [31] },
    run: [20, 25, 'run', 10],
    die: [50, 59, 'stand'],
    disappear: [40, 49],
  }
};

var stage = new createjs.Stage(canvas);

var spriteSheet = new createjs.SpriteSheet(ninja_data);

var currentAnimation = 0;
var ninja = new createjs.Sprite(spriteSheet, 'stand');
ninja.x = 150;
ninja.y = 150;
ninja.regX = 24;
ninja.regY = 24;
ninja.moveX = 0;
stage.addChild(ninja);

ninja.addEventListener('click', function(target) {
  ninja.gotoAndPlay('die');
});

createjs.Ticker.addEventListener("tick", handleTick);
function handleTick(ev) {
  kd.tick();
  ninja.x += ninja.moveX;
  stage.update(ev);
}

kd.LEFT.down(function () {
  if (ninja.moveX == -10) return;
  ninja.moveX = -10;
  ninja.scaleX = -1;
  ninja.gotoAndPlay('run');
});

kd.RIGHT.down(function () {
  if (ninja.moveX == 10) return;
  ninja.moveX = 10;
  ninja.scaleX = 1;
  ninja.gotoAndPlay('run');
});

function stopNinja() {
  ninja.moveX = 0;
  ninja.gotoAndPlay('stand');
}

kd.LEFT.up(stopNinja);
kd.RIGHT.up(stopNinja);
