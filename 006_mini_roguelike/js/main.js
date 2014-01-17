(function(global) {

  var stage = new createjs.Stage(canvas);
  var map = new global.Map();
  var mapDef = {
    tilesets: global.TileSets,
    player: {
      tileset: 'creatureTileData',
      frames: {
        standing: 'black_mage'
      },
      startX: 8,
      startY: 8
    },
    world: {
      width: 16,
      height: 16,
      tiles: []
    }
  };

  // Generate some world tiles
  for (var row = 0; row < mapDef.world.width; row++) {
    for (var col = 0; col < mapDef.world.width; col++) {
      var addBrick = Math.random() > 0.9;
      var brick = (addBrick || !row || !col || (row === (mapDef.world.width-1)) || (col === (mapDef.world.height-1)));
      mapDef.world.tiles.push({
        tileset: 'worldTileData',
        frame: brick ? 'grey_wall_1' : 'grey_floor_1',
        properties: {solid: brick}
      });
    }
  }

  map.initialise(stage, mapDef);
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
})(this);
