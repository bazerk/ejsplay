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

  var diagonals = [
    [1, 1],
    [1, -1],
    [-1, -1],
    [-1, 1]
  ];

  function MapSquare(tiles, brick, row, col) {
    this.brick = brick;
    this.tiles = tiles;
    this.frame = brick ? 'grey_wall_1' : 'grey_floor_1';
    this.row = row;
    this.col = col;
    this.stageX = row*24 + 12;
    this.stageY = col*24 + 12;
  }

  MapSquare.prototype.draw = function(lightIntensity) {
    var tile = new createjs.Sprite(this.tiles, this.frame);
    tile.x = this.stageX;
    tile.y = this.stageY;
    var shadow = new createjs.Shape();
    shadow.graphics
      .beginFill("rgba(0, 0, 0, " + lightIntensity + ')')
      .drawRect(this.stageX-12, this.stageY-12, 24, 24);
    stage.addChild(tile);
    stage.addChild(shadow);
  };

  function Map() {
    this.width = 16;
    this.height = 16;
    this.stage = stage;
    this.rows = [];
    this.light = [];
    this.tiles = new createjs.SpriteSheet(worldTileData);
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
  };

  Map.prototype.setLight = function(row, col, lightIntensity) {
    if (!this.light[row]) this.light[row] = [];
    this.light[row][col] = lightIntensity;
  };

  Map.prototype.draw = function() {
    for (var row = 0; row < this.width; row++) {
      for (var col = 0; col < this.height; col++) {
        var lightRow = this.light[row];
        var light = lightRow ? lightRow[col] : 0;
        this.rows[row][col].draw(light);
      }
    }
  };

  Map.prototype.getSquare = function(x, y) {
    var row = Math.floor(x/24);
    var col = Math.floor(y/24);
    return this.rows[row][col];
  };

  Map.prototype.setFov = function (square) {
    map.light = [];
    map.setLight(square.row, square.col, 0);
    for (var ixDiag = 0; ixDiag < diagonals.length; ixDiag++) {
      var d = diagonals[ixDiag];
      this.castLight(square.row, square.col, 1, 1, 0, 0, d[0], d[1], 0);
      this.castLight(square.row, square.col, 1, 1, 0, d[0], 0, 0, d[1]);
    }
  };

  Map.prototype.castLight = function(startx, starty, row, start, end, xx, xy, yx, yy) {
    if (start < end) {
      return;
    }
    var radius = 100;
    var newStart = 0,
        blocked = false;
    for (var distance = row; distance < radius && !blocked; distance++) {
      var deltaY = -distance;
      for (var deltaX = -distance; deltaX <= 0; deltaX++) {
        var currentX = Math.floor(startx + deltaX * xx + deltaY * xy);
        var currentY = Math.floor(starty + deltaX * yx + deltaY * yy);
        var leftSlope = (deltaX - 0.5) / (deltaY + 0.5);
        var rightSlope = (deltaX + 0.5) / (deltaY - 0.5);

        if (!(currentX >= 0 && currentY >= 0 && currentX < this.width && currentY < this.height) || start < rightSlope) {
          continue;
        } else if (end > leftSlope) {
          break;
        }
        this.setLight(currentX, currentY, 0);

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
  stage.addEventListener('click', moveFovToSquare);

  function moveFovToSquare(ev) {
    var square = map.getSquare(ev.stageX, ev.stageY);
    map.setFov(square);
    map.draw();
  }

  var map = new Map(stage);
  map.initialise();
  map.draw();

  createjs.Ticker.addEventListener("tick", handleTick);
  function handleTick(ev) {
    kd.tick();
    stage.update(ev);
  }
})();
