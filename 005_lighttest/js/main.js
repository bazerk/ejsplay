(function() {

  var worldTileData = {
    framerate: 1,
    images: ["/img/oryx/oryx_16bit_fantasy_world_trimmed.png"],
    frames: {width: 24, height: 24, regX: 12, regY: 12},
    animations: {
      grey_wall_1: { frames: [0] },
      grey_wall_cracks_1: { frames: [1] },
      grey_wall_heavy_cracks_1: { frames: [2] },
      grey_floor_1: { frames: [3] },
      grey_floor_2: { frames: [4] },
      grey_floor_cracked_1: { frames: [5] },
      grey_floor_hatched: { frames: [6] },
    }
  };

  var creatureTileData = {
    framerate: 1,
    images: ["/img/oryx/oryx_16bit_fantasy_creatures_trans_trimmed.png"],
    frames: {width: 24, height: 24, regX: 12, regY: 12},
    animations: {
      blue_warrior: { frames: [0, 18] },
      black_mage: { frames: [3, 21] },
    }
  };

  var diagonals = [
    [1, 1],
    [1, -1],
    [-1, -1],
    [-1, 1]
  ];

  function Player(tiles, frame, row, col) {
    this.tiles = tiles;
    this.frame = frame;
    this.row = row;
    this.col = col;
    this.dir = 1;
    this.tile = new createjs.Sprite(this.tiles, this.frame);
    stage.addChild(this.tile);
  }

  Player.prototype.draw = function() {
    this.tile.x = this.row*24 + 12;
    this.tile.y = this.col*24 + 12;
    this.tile.scaleX = this.dir;
  };

  function MapSquare(tiles, brick, row, col) {
    this.brick = brick;
    this.tiles = tiles;
    this.frame = brick ? 'grey_wall_1' : 'grey_floor_1';
    this.row = row;
    this.col = col;
    this.stageX = row*24 + 12;
    this.stageY = col*24 + 12;
    this.tile = new createjs.Sprite(this.tiles, this.frame);
    this.tile.x = this.stageX;
    this.tile.y = this.stageY;
    this.shadow = new createjs.Shape();
    this.shadow.graphics
      .beginFill("rgb(0, 0, 0)")
      .drawRect(this.stageX-12, this.stageY-12, 24, 24);
    stage.addChild(this.tile);
    stage.addChild(this.shadow);
  }

  MapSquare.prototype.draw = function(lightIntensity) {
    this.shadow.alpha = lightIntensity;
  };

  function Map() {
    this.width = 16;
    this.height = 16;
    this.rows = [];
    this.light = [];
    this.tiles = new createjs.SpriteSheet(worldTileData);
    this.creatureTiles = new createjs.SpriteSheet(creatureTileData);
    this.LEFT = 0;
    this.RIGHT = 1;
    this.UP = 2;
    this.DOWN = 3;
  }

  Map.prototype.initialise = function() {
    for (var x=0; x < this.width; x++) {
      this.rows.push([]);
      this.light.push([]);
      for (var y=0; y < this.height; y++) {
        var addBrick = Math.random() > 0.9;
        var brick = (addBrick || !x || !y || (x === (this.width-1)) || (y === (this.height-1)));
        var square = new MapSquare(this.tiles, brick, x, y);
        this.rows[x].push(square);
      }
    }
    this.player = new Player(this.creatureTiles, 'black_mage', 8, 8);
    this.setFov();
  };

  Map.prototype.setLight = function(row, col, lightIntensity) {
    if (!this.light[row]) this.light[row] = [];
    this.light[row][col] = lightIntensity;
  };

  Map.prototype.draw = function() {
    for (var row = 0; row < this.width; row++) {
      for (var col = 0; col < this.height; col++) {
        var lightRow = this.light[row];
        var light = lightRow ? lightRow[col] : 1;
        if (typeof(light) === "undefined") light = 1;
        this.rows[row][col].draw(light);
      }
    }
    this.player.draw();
  };

  Map.prototype.getSquare = function(x, y) {
    var row = Math.floor(x/24);
    var col = Math.floor(y/24);
    return this.rows[row][col];
  };

  Map.prototype.movePlayer = function(dir) {
    var moveX = 0;
    var moveY = 0;
    switch (dir) {
      case this.UP: moveY = -1; break;
      case this.DOWN: moveY = 1; break;
      case this.LEFT:
        moveX = -1;
        this.player.dir = 1;
        break;
      case this.RIGHT:
        moveX = 1;
        this.player.dir = -1;
        break;
    }
    var newRow = this.player.row + moveX;
    if ((newRow >= 0) && (newRow < this.width)) this.player.row = newRow;
    var newCol = this.player.col + moveY;
    if ((newCol >= 0) && (newCol < this.height)) this.player.col = newCol;
    this.setFov();
    this.draw();
  };

  Map.prototype.setFov = function() {
    map.light = [];
    var row = map.player.row;
    var col = map.player.col;
    map.setLight(row, col, 0);
    for (var ixDiag = 0; ixDiag < diagonals.length; ixDiag++) {
      var d = diagonals[ixDiag];
      this.castLight(row, col, 1, 1, 0, 0, d[0], d[1], 0);
      this.castLight(row, col, 1, 1, 0, d[0], 0, 0, d[1]);
    }
  };

  Map.prototype.castLight = function(startx, starty, row, start, end, xx, xy, yx, yy) {
    if (start < end) {
      return;
    }
    var radius = 16;
    var newStart = 0,
        blocked = false;
    for (var distance = row; distance < radius && !blocked; distance++) {
      var deltaY = -distance;
      for (var deltaX = -distance; deltaX <= 0; deltaX++) {
        var currentX = Math.floor(startx + deltaX * xx + deltaY * xy);
        var currentY = Math.floor(starty + deltaX * yx + deltaY * yy);
        var leftSlope = (deltaX - 0.5) / (deltaY + 0.5);
        var rightSlope = (deltaX + 0.5) / (deltaY - 0.5);

        if (!(currentX >= 0 && currentY >= 0 && currentX < this.width && currentY < this.height) || (start < rightSlope)) {
          continue;
        } else if (end > leftSlope) {
          break;
        }

        var sldist = Math.sqrt(deltaX*deltaX + deltaY*deltaY);
        var intensity = (1/(sldist*sldist))*16;
        this.setLight(currentX, currentY, 1-intensity);

        if (blocked) {
          if (this.rows[currentX][currentY].brick) {
            newStart = rightSlope;
            continue;
          } else {
            blocked = false;
            start = newStart;
          }
        } else {
          if (this.rows[currentX][currentY].brick && distance < radius) {
            blocked = true;
            this.castLight(startx, starty, distance + 1, start, leftSlope, xx, xy, yx, yy);
            newStart = rightSlope;
          }
        }
      }
    }
  };

  var stage = new createjs.Stage(canvas);
  var map = new Map();
  map.initialise();
  map.draw();

  kd.UP.press(function () {
    map.movePlayer(map.UP);
  });

  kd.LEFT.press(function () {
    map.movePlayer(map.LEFT);
  });

  kd.RIGHT.press(function () {
    map.movePlayer(map.RIGHT);
  });

  kd.DOWN.press(function () {
    map.movePlayer(map.DOWN);
  });

  createjs.Ticker.addEventListener("tick", handleTick);
  function handleTick(ev) {
    kd.tick();
    stage.update(ev);
  }
})();
