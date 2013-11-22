(function(global) {

  var diagonals = [
    [1, 1],
    [1, -1],
    [-1, -1],
    [-1, 1]
  ];

  function Player(tiles, frames, row, col) {
    this.tiles = tiles;
    this.frames = frames;
    this.row = row;
    this.col = col;
    this.dir = 1;
    this.tile = new createjs.Sprite(this.tiles, this.frames.standing);
    stage.addChild(this.tile);
  }

  Player.prototype.draw = function() {
    this.tile.x = this.row*24 + 12;
    this.tile.y = this.col*24 + 12;
    this.tile.scaleX = this.dir;
  };

  function MapSquare(tile, properties, row, col) {
    this.solid = properties.solid;
    this.row = row;
    this.col = col;
    this.stageX = row*24 + 12;
    this.stageY = col*24 + 12;
    this.tile = tile;
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
    this.rows = [];
    this.light = [];
    this.LEFT = 0;
    this.RIGHT = 1;
    this.UP = 2;
    this.DOWN = 3;
  }

  Map.prototype.initialise = function(tilesets, mapDef) {
    this.tilesets = tilesets;
    this.width = mapDef.width;
    this.height = mapDef.height;

    for (var x=0; x < this.width; x++) {
      this.rows.push([]);
      this.light.push([]);
      for (var y=0; y < this.height; y++) {
        var square = new MapSquare(this.tiles, solid, x, y);
        this.rows[x].push(square);
      }
    }

    this.player = new Player(this.tilesets[mapDef.player.tileset],mapDef.player.frames, mapDef.startX, mapDef.startY);
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
          if (this.rows[currentX][currentY].solid) {
            newStart = rightSlope;
            continue;
          } else {
            blocked = false;
            start = newStart;
          }
        } else {
          if (this.rows[currentX][currentY].solid && distance < radius) {
            blocked = true;
            this.castLight(startx, starty, distance + 1, start, leftSlope, xx, xy, yx, yy);
            newStart = rightSlope;
          }
        }
      }
    }
  };

})(this);
