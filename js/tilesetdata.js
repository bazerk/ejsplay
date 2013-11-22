(function(global) {

  var worldTileData = {
    id: 1001,
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
    id: 2001,
    framerate: 2,
    images: ["/img/oryx/oryx_16bit_fantasy_creatures_trans_trimmed.png"],
    frames: {width: 24, height: 24, regX: 12, regY: 12},
    animations: {
      blue_warrior: { frames: [0, 18] },
      black_mage: { frames: [3, 21] },
    }
  };

  var ninjaData = {
    id: 10001,
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

  global.TileSets = {
    worldTileData: worldTileData,
    creatureTileData: creatureTileData,
    ninjaData: ninjaData,
  };

}(this));
