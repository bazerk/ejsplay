var b2Vec2 = Box2D.Common.Math.b2Vec2;
var b2BodyDef = Box2D.Dynamics.b2BodyDef;
var b2Body = Box2D.Dynamics.b2Body;
var b2FixtureDef = Box2D.Dynamics.b2FixtureDef;
var b2Fixture = Box2D.Dynamics.b2Fixture;
var b2World = Box2D.Dynamics.b2World;
var b2DebugDraw = Box2D.Dynamics.b2DebugDraw;

var worldScale = 30;

var gravity = new b2Vec2(0, 10);
var world = new b2World(gravity, true);

var canvasPosition = getElementPosition(document.getElementById("canvas"));


var WALL_WIDTH = 30;
var STAGE_WIDTH = 800;
var STAGE_HEIGHT = 600;

createBox(STAGE_WIDTH, WALL_WIDTH, STAGE_WIDTH/2, STAGE_HEIGHT-WALL_WIDTH/2, b2Body.b2_staticBody);
createBox(STAGE_WIDTH, WALL_WIDTH, STAGE_WIDTH/2 , WALL_WIDTH/2, b2Body.b2_staticBody);
createBox(WALL_WIDTH, STAGE_HEIGHT, WALL_WIDTH/2, STAGE_HEIGHT/2, b2Body.b2_staticBody);
createBox(WALL_WIDTH, STAGE_HEIGHT, STAGE_WIDTH-WALL_WIDTH/2, STAGE_HEIGHT/2, b2Body.b2_staticBody);
var player = createPlayer(50, STAGE_HEIGHT/2, STAGE_WIDTH/2);


document.addEventListener("mousedown",function(e){
  createBox(Math.random() * 40 + 40,
                         Math.random() * 40 + 40,
                         e.clientX - canvasPosition.x,
                         e.clientY - canvasPosition.y,
                         b2Body.b2_dynamicBody);
});


function createPlayer(radius, pX, pY) {
  var bodyDef = new b2BodyDef();
  bodyDef.type = b2Body.b2_dynamicBody;
  bodyDef.position.Set(pX/worldScale, pY/worldScale);

  var fixtureDef = new b2FixtureDef();
  fixtureDef.density = 1.0;
  fixtureDef.friction = 0.5;
  fixtureDef.restitution = 0.5;
  fixtureDef.shape = new Box2D.Collision.Shapes.b2CircleShape();
  fixtureDef.shape.Set(0, 0);
  fixtureDef.shape.SetRadius(radius/worldScale);
  
  var body = world.CreateBody(bodyDef);
  body.CreateFixture(fixtureDef);

  return body;
}


function createBox(width, height, pX, pY, type) {
  var bodyDef = new b2BodyDef();
  bodyDef.type = type;
  bodyDef.position.Set(pX/worldScale, pY/worldScale);
  
  var fixtureDef = new b2FixtureDef();
  fixtureDef.density = 1.0;
  fixtureDef.friction = 0.5;
  fixtureDef.restitution = 0.5;
  fixtureDef.shape = new Box2D.Collision.Shapes.b2PolygonShape();

  fixtureDef.shape.SetAsBox(width/2/worldScale,
                            height/2/worldScale);
  
  var body = world.CreateBody(bodyDef);
  body.CreateFixture(fixtureDef);

  return body;
}

function debugDraw() {
  var draw = new b2DebugDraw();
  draw.SetSprite(document.getElementById("canvas").getContext("2d"));
  draw.SetDrawScale(30.0);
  draw.SetFillAlpha(0.5);
  draw.SetLineThickness(1.0);
  draw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
  world.SetDebugDraw(draw);
}

function getElementPosition(element) {
  var elem=element, tagname="", x=0, y=0;
  while((typeof(elem) == "object") && (typeof(elem.tagName) != "undefined")) {
    y += elem.offsetTop;
    x += elem.offsetLeft;
    tagname = elem.tagName.toUpperCase();
    if(tagname == "BODY"){
      elem=0;
    }
    if(typeof(elem) == "object"){
      if(typeof(elem.offsetParent) == "object"){
        elem = elem.offsetParent;
      }
    }
  }
  return {x: x, y: y};
}

function update() {
  world.Step(1/60, 10, 10);
  world.DrawDebugData();
  world.ClearForces();
  kd.tick();
}

kd.UP.down(function () {
  var force = new b2Vec2(0, -300);
  player.ApplyForce(force, player.GetPosition());
});

kd.LEFT.down(function () {
  var force = new b2Vec2(-300, 0);
  player.ApplyForce(force, player.GetPosition());
});

kd.RIGHT.down(function () {
  var force = new b2Vec2(300, 0);
  player.ApplyForce(force, player.GetPosition());
});

kd.DOWN.down(function () {
  var force = new b2Vec2(0, 300);
  player.ApplyForce(force, player.GetPosition());
});


debugDraw();
window.setInterval(update, 1000/60);
