/*	By Dave Lawrence on 26/8/2010
	http://proceduralgraphics.blogspost.com

    NOTE: This is a prototype written in a few hours for a game competition due in 4 days

    The code is a mess, but I have decided to make a feature complete prototype ASAP
    and only then allow myself to refactor later.

    TODO:
	-enemy generators that generate as you come in
	-explosions for enemies


	-be able to attach to something that removes when you are outside of boundary.
	-boundary can be absolute or around player
	-called per frame it goes
	-refactor include list into javascript
	
LAUNCHER SCREEN

-"launcher" screen where you select where you have to bomb (ie address entry) or just use geolocation

Store in URL:

function gup( name )
{
  name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
  var regexS = "[\\?&]"+name+"=([^&#]*)";
  var regex = new RegExp( regexS );
  var results = regex.exec( window.location.href );
  if( results == null )
    return "";
  else
    return results[1];
}



	
	-birds
		-make constraint an option for simulation
	-bird launcher
	-clouds fade away
	
    GRAPHICS
	-clouds move
	-bullets look better
	-bombs look better
    -Explosion effects
    -Plane shoot down effects
    -Better buffering of google maps, perhaps have part of the map canvas offscreen?

    GAME
    -know about target being bombed for win conditions
    -1942 and Zone66 (current) type movements, and the switch between them
    -Lives / deaths on collisions etc
    -Store target lat/long etc in URL so that people can send links for games they have created

    WEAPONS
    -Different weapons

    ENEMIES
    -Lots of different enemies
    -Enemies shoot
    -AI
    -Placement / generation (eg appear offscreen, get culled) 
 
 */

var DO_COLLISIONS = true;
var EXPLOSION_SIZE = 200;


var width = 800;
var height = 600;
var PLANE_RADIUS = 50;
var entities = [];
var underlays = [];
var overlays = [];
var offset = { x: 0, y: 0 };
var ctx;
var map;
var explosionFactory;

var p38 = new Image();
p38.src = "p38.png";
p38.width = 2 * PLANE_RADIUS;
p38.height = 2 * PLANE_RADIUS;

var zero = new Image();
zero.src = "zero.png";
zero.width = 2 * PLANE_RADIUS;
zero.height = 2 * PLANE_RADIUS;


var applyFriction = function(me, time) {
	var amt = Math.pow(.5, time/1000);
	me.x_v *= amt;
	me.y_v *= amt;
}

function getXYFromVector(heading, magnitude) {
	return {
		x: Math.sin(heading) * magnitude,
		y: -Math.cos(heading) * magnitude
	};
}

var applyThrust = function(me, time) {
	var amt = me.thrust * time / 1000;
	me.x_v = Math.sin(me.heading) * amt;
	me.y_v = -Math.cos(me.heading) * amt;
}

var countdown = function(func, msecs) {
	var timeLeft = msecs;
	return function(me,time) {
		timeLeft -= time;
		if (timeLeft < 0) {
			func(me,time);
		}
	}
}

var player;

function setup() {
	setupDocument();
	setupWorld();

	var time = 50;
	var intervalId = setInterval(function() { update(time); draw(time); }, time);
}

function setupDocument() {
	setupOverlapping("main-stage");
	setupControls();
	setupBackground();
	setupCanvas();
	setupInput();
}

function setupControls() {
	var goButton = document.getElementById("go-button");
	var address = document.getElementById("address");
	
	var changeMapCenter = function() {
		if (map) {
			var geocoder = new google.maps.Geocoder();
			geocoder.geocode({ address: address.value }, function(results, status) {
				if (results.length >= 1 && results[0].geometry) {
					var latLong = results[0].geometry.location;
					map.setCenter(latLong);
				}
			});
		}
	};
	goButton.onclick = changeMapCenter;
	address.onkeydown = function(event) {
		if (event.keyCode == 13)
			changeMapCenter();
	};
}

function setupBackground() {
	document.getElementById("map_canvas").style.backgroundColor = "#00FF00"; //"#ffffff";
	attachGoogleMapsScript("initialize");
}

function setupCanvas() {
		var canvas = newCanvas(width, height);
		document.getElementById("canvas").appendChild(canvas);
	 	ctx = canvas.getContext("2d");
}

function changeRadius(perSecondMultiplier) {
	return function(me, time) {
		me.radius *= Math.pow(perSecondMultiplier, time/1000);
	}
}

function drawCenteredImage() {
			ctx.save();
			ctx.translate(this.x, this.y);
			ctx.rotate(this.heading);
			ctx.drawImage(this.image, -this.image.width/2, -this.image.height/2, this.image.width, this.image.height);
			ctx.restore();
};

function setupWorld() {
	var MAX_WIDTH = 50;
	
	var midx = width/2;
	var midy = height/2;

	explosionFactory = new ExplosionFactory()	

	player = new Entity(width/2, height/2, '#11FF33');
	player.radius = PLANE_RADIUS;
	player.heading = 0;
	player.reloadTime = 0;
	player.firing = 0;
	player.machineGunreloadTime = 0;
	player.machineGunfiring = true;
	player.image = p38;
	player.draw = drawCenteredImage;
	player.collide = function() { }; // invunerable!
	player.thrust = 3000;
	player.age = 0;

	var fireWeapon = function(me, time) {
		// Machine Gun
		me.machineGunreloadTime -= time;
		if (me.machineGunfiring && me.machineGunreloadTime <= 0) {
			var BULLET_RADIUS = 3;
			var bitInFront = getXYFromVector(me.heading, PLANE_RADIUS + BULLET_RADIUS + 1);
			var bitToSide = getXYFromVector(me.heading + Math.PI/2, PLANE_RADIUS * .5);
			
			// shoot
			var weaponSpeed = 300;
			for (var i=0 ; i<2 ; ++i) {
				var p = new Entity(me.x + bitInFront.x, me.y + bitInFront.y, "#ffff00");
				if (i%2) {
					p.x += bitToSide.x;
					p.y += bitToSide.y;
				} else {
					p.x -= bitToSide.x;
					p.y -= bitToSide.y;				
				}
				p.radius = BULLET_RADIUS;
				p.x_v = Math.sin(me.heading) * weaponSpeed;
				p.y_v = -Math.cos(me.heading) * weaponSpeed;

				var remove = function(me,time) {
					me.active = false;
				}
				p.addUpdater(countdown(remove, 2000));
				entities.push(p);
			}
			me.machineGunreloadTime = 300;
		}
		
		me.reloadTime -= time;
		if (me.firing && me.reloadTime <= 0) {
			var BULLET_RADIUS = 7;
			// shoot
			var weaponSpeed = -.1;
			var p = new Entity(me.x, me.y, "#aaaaaa");
			p.clip = false;
			p.radius = BULLET_RADIUS;
			p.x_v = me.x_v + Math.sin(me.heading) * weaponSpeed;
			p.y_v = me.y_v - Math.cos(me.heading) * weaponSpeed;
			entities.unshift(p); // front of list to get under the player
			me.reloadTime = 500;

			var explode = function(me,time) {
				me.color = "#ffaaaa";
				me.radius = 10;
				me.x_v = 0;
				me.y_v = 0;
				me.heading = 0;
				me.image = explosionFactory.randomExplosion();
				me.draw = drawCenteredImage;
				me.updaters = []; // stop doing anything
			}
			
			p.addUpdater(changeRadius(.9));
			p.addUpdater(countdown(explode, 1800));
		}
		
		
	}
	player.addUpdater(fireWeapon);
	player.addUpdater(applyFriction);	
	player.addUpdater(applyThrust);	
	entities.push(player);

	for (var i=0 ; i<50 ; ++i) {
		var enemy = new Entity(vary(midx, width * 3), vary(midy, height * 3), '#FFFFFF');
		enemy.radius = PLANE_RADIUS;
		enemy.image = zero;
		enemy.draw = drawCenteredImage;
		enemy.x_v = 0;
		enemy.y_v = 0;
		enemy.age = 0;
		
		enemy.addUpdater(applyFriction);
		enemy.heading = 0;
		enemy.thrust = 1000;
		
		var flyInCircle = function(me, time) {
			me.heading += .08;
			applyThrust(me,time);
		}

		var flyInStraightLine = function(me,time) {
			applyThrust(me,time);
		}
		
		enemy.age = 0;
		enemy.heading = rand(Math.PI * 2);
		var ageFactor = vary(700,200);
		var flyInSineWave = function(me,time) {
			me.age += time;
			me.heading += Math.sin(me.age/ageFactor) / 10;
			applyThrust(me,time);
		}
		
		var ai = randomPick([flyInCircle, flyInStraightLine, flyInSineWave]);
		enemy.addUpdater(ai);
/*
		var printStuff = function(me, time) {
			console.log('x_v = ' + me.x_v + 'y_v = ' + me.y_v);
		}
		enemy.addUpdater(printStuff);
*/	
		entities.push(enemy);
	}

	/*
	// Create cloud underlay
	var clouds = newCanvas(width, height);
	var whiteClouds = function() {
			return [255, 255, 255, irand(255)];
	};
	var greyClouds = function() {
			return [55, 55, 55, irand(255)];
	};
	perlin_noise(clouds, greyClouds);
	underlays.push(clouds);


	// create boid simulation
	boidSimulation = new BoidSimulation(10, 300);
		*/
	// a way to draw this stuff, then have it be removed?
	
}

var key_fire = false;
var key_left = false;
var key_right = false;

function update(time) {
	if (key_left) {
		player.heading -= .1;
	} else if (key_right) {
		player.heading += .1;
	}
	player.firing = key_fire;

	var seconds = time / 1000.0;
	var pan = { x: player.x_v * seconds, y: player.y_v * seconds };
	//var pan = getXYFromVector(player.heading, player.thrust);
	
	// FIXME: Shoudl we do some to-integer stuff here so floats don't happen?
//	pan.x = Math.round(pan.x);
//	pan.y = Math.round(pan.y);

	offset.x -= pan.x;
	offset.y -= pan.y;
//		console.log('---------------------');
//		console.log('offset = ' + offset.x + ',' + offset.y);
//		console.log('   pan = ' + pan.x + ',' + pan.y);
	if (map) {
		map.panBy(pan.x, pan.y);
	}
	
	var seconds = time / 1000.0;
//	console.log('seconds = ' + seconds);
	
	for(var i=0 ; i<entities.length ; ++i) {
		var p = entities[i];
		if (p.active) {
			p.x += p.x_v * seconds;
			p.y += p.y_v * seconds;
		} else {
			entities.splice(i,1);
		}
	}

	// Update these things
	//boidSimulation.update();
	
	//console.log('entities = ' + entities.length);
	
	for(var i=0 ; i<entities.length ; ++i) {
		var p = entities[i];
		if (p.active) {
			p.update(time);
			if (DO_COLLISIONS && p.clip) {
				for(var j=i+1; j<entities.length ; ++j) {
					var otherP = entities[j];
					if (otherP.active && otherP.clip) {
						if (distance(p.x,p.y,otherP.x,otherP.y) <= p.radius + otherP.radius) {
							p.collide(otherP);
							otherP.collide(p);
						}
					}
				}
			}
		}
	}
}

function draw(time) {
	ctx.clearRect(0,0,width,height);
	ctx.save();
	drawImages(underlays);
	drawentities(time, entities);
	drawImages(overlays);
	ctx.restore();
}

function initialize() {
	var myLatlng = new google.maps.LatLng(-34.911555,138.600082);
	var myOptions = {
		zoom: 17,
		center: myLatlng,
		mapTypeId: google.maps.MapTypeId.SATELLITE,
		mapTypeControl: false,
		panControl: false,
		rotateControl: false,
		scaleControl: false,
		streetViewControl: false,
		zoomControl: false
	}
	map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
}

function attachScript(scriptName) {
	var script = document.createElement("script");
	script.type = "text/javascript";
	script.src = scriptName;
	document.body.appendChild(script);
}


function attachGoogleMapsScript(callback) {
	attachScript("http://maps.google.com/maps/api/js?sensor=false&callback=" + callback);
}
