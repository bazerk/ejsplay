var stage = new createjs.Stage(canvas);
var levels = [];
var gridDims = {
  x: 16,
  y: 12
};

var squareDims = {
  w: 46,
  h: 46
};

var CLEAR = 0;
var SOLID = 1;
var WATER = 2;
var EARTH = 3;

var retrievals = {
  left: [-1, 0],
  right: [1, 0],
  above: [0, 1],
  below: [0, -1]
};

function getNeighbour(block, dir) {
  var transpose = retrievals[dir];
  var x = block.blockNo + transpose[0];
  var y = block.level + transpose[1];
  if ((x < 0 || x >= gridDims.x) || (y < 0 || y >= gridDims.y)) return null;
  return levels[y][x];
}

var UNKNOWN = -1;
var UNSEALED = -2;

var fills = [
  'rgba(255,255,255,1)',
  'rgba(0,0,0,1)',
  'rgba(0,0,255,1)',
  'rgba(150,75,0,1)'
];

var squareStroke = 'rgba(0,0,0,1)';
var atEquilibrium = true;

function isSolid(block) {
  return block.state == SOLID || block.state == EARTH;
}

function squareClick(ev) {
  var target = ev.target;
  target.state = (target.state === SOLID) ? CLEAR : SOLID;
  checkBlocks();
}

function drawBlock(block) {
  var fill = fills[block.state];
  block.graphics.clear()
       .setStrokeStyle(2).beginStroke(squareStroke)
       .beginFill(fill).drawRoundRect(0, 0, squareDims.w, squareDims.h, 10).endFill();
}

function isBounded(block) {
  if (!block) return false;
  if (isSolid(block)) return true;
  var left = getNeighbour(block, 'left');
  var bounded = false;
  while (left) {
    if (isSolid(left)) {
      bounded = true;
      break;
    }
    left = getNeighbour(left, 'left');
  }
  if (!bounded) return false;
  var right = getNeighbour(block, 'right');
  while (right) {
    if (isSolid(right)) {
      return true;
    }
    right = getNeighbour(right, 'right');
  }
  return false;
}

function setState(block) {
  var left = getNeighbour(block, 'left');
  if (!left || !isSolid(left)) {
    rightUntilSolid(block, function(nb) {
      nb.state = CLEAR;
      var below = getNeighbour(nb, 'below');
      if (below) setWaterLevel(below, nb.level-1);
    });
    return;
  }
  var isRb = false;
  var isFloored = true;
  rightUntilSolid(block, function(nb) {
    if (isFloored) {
      var below = getNeighbour(nb, 'below');
      if (below && isSolid(below)) isFloored = true;
      else if (below && (below.state === WATER)) isFloored = (below.waterLevel >= nb.level || below.waterLevel == UNKNOWN);
      else isFloored = false;
    }
    var right = getNeighbour(nb, 'right');
    if (right && isSolid(right)) isRb = true;
  });
  var state = (isRb && isFloored) ? WATER : CLEAR;
  rightUntilSolid(block, function(nb) {
    nb.state = state;
    if (nb.state === CLEAR) {
      var below = getNeighbour(nb, 'below');
      if (below) setWaterLevel(below, nb.level-1);
    }
  });
}

function setWaterLevel(block, level) {
  if ((block.state !== WATER) || (block.waterLevel !== UNKNOWN)) return;
  block.waterLevel = level;
  if (block.level > level) block.state = CLEAR;
  setWaterLevel(getNeighbour(block, 'above'), level);
  setWaterLevel(getNeighbour(block, 'below'), level);
  setWaterLevel(getNeighbour(block, 'left'), level);
  setWaterLevel(getNeighbour(block, 'right'), level);
}

function rightUntilSolid(block, cb) {
  var ixBlock = block.blockNo;
  while (ixBlock < gridDims.x) {
    var nb = levels[block.level][ixBlock];
    if (isSolid(nb)) break;
    cb(nb);
    ixBlock++;
  }
}

function forAllBlocks(cb) {
  for (var ixLevel = 0; ixLevel < gridDims.y; ixLevel++) {
    var level = levels[ixLevel];
    for (var ixBlock = 0; ixBlock < gridDims.x; ixBlock++) {
      cb(level[ixBlock]);
    }
  }
}

function checkBlocks() {
  forAllBlocks(function(block) {
    block.waterLevel = UNKNOWN;
    if (!isSolid(block)) block.state = UNKNOWN;
  });
  forAllBlocks(function(block) {
    if (!isSolid(block)) {
      if (block.state === UNKNOWN) setState(block);
    }
  });
  forAllBlocks(function(block) {
    drawBlock(block);
  });
}

for (var y = 0; y < gridDims.y; y++) {
  var level = [];
  var levelNo = gridDims.y - y - 1;
  levels[levelNo] = level;
  for (var x = 0; x < gridDims.x; x++) {
    var square = new createjs.Shape();
    var sx = x*50 + 5;
    var sy = y*50 + 5;
    square.x = sx;
    square.y = sy;
    square.blockNo  = x;
    square.level = levelNo;
    square.waterLevel = UNKNOWN;
    if (levelNo === 0) {
      square.state = EARTH;
    } else {
      square.state = CLEAR;
      square.addEventListener('click', squareClick);
    }
    level.push(square);
    drawBlock(square);
    stage.addChild(square);
  }
}

createjs.Ticker.addEventListener("tick", handleTick);
function handleTick(ev) {
  stage.update();
}
