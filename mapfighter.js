/*	By Dave Lawrence on 26/8/2010
 *	http://proceduralgraphics.blogspost.com

generate a list of explosions
	-randomly pick one to draw so we have variety but don't have to regen each time (slow)
	-store the explosion ref in each explosion
 
 
 */

var DO_COLLISIONS = true;
var EXPLOSION_SIZE = 200;


var width = 800;
var height = 600;
var PLANE_RADIUS = 50;
var entities = [];
var offset = { x: 0, y: 0 };
var ctx;
var map;
var explosions = [];

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


var player = new Particle(width/2, height/2, '#11FF33');

function setup() {
	setupOverlapping("main-stage");
	setupBackground();
	setupCanvas();
	setupInput();
	setupWorld();
}


function setupBackground() {
	document.getElementById("map_canvas").style.backgroundColor = "#11ee11";
	attachGoogleMapsScript("initialize");
}

function setupCanvas() {
		var canvas = newCanvas(width, height);
		document.getElementById("canvas").appendChild(canvas);
	 	ctx = canvas.getContext("2d");
		var time = 50;
		var intervalId = setInterval(function() { update(time); draw(time); }, time);
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

	player.radius = PLANE_RADIUS;
	player.heading = 0;
	player.reloadTime = 0;
	player.firing = 0;
	player.machineGunreloadTime = 0;
	player.machineGunfiring = true;
	player.image = p38;
	player.draw = drawCenteredImage;
	player.collide = function() { }; // invunerable!
	player.thrust = 10;
	player.age = 0;

	var fireWeapon = function(me, time) {

		// Machine Gun
		me.machineGunreloadTime -= time;
		if (me.machineGunfiring && me.machineGunreloadTime <= 0) {
			var BULLET_RADIUS = 3;
			var bitInFront = getXYFromVector(me.heading, PLANE_RADIUS + BULLET_RADIUS + 1);
			var bitToSide = getXYFromVector(me.heading + Math.PI/2, PLANE_RADIUS * .5);
			
			// shoot
			var weaponSpeed = 2;
			for (var i=0 ; i<2 ; ++i) {
				var p = new Particle(me.x + bitInFront.x, me.y + bitInFront.y, "#ffff00");
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
				entities.push(p);
			}
			me.machineGunreloadTime = 300;
		}
		
		me.reloadTime -= time;
		if (me.firing && me.reloadTime <= 0) {
			var BULLET_RADIUS = 7;
			// shoot
			var weaponSpeed = -.1;
			var p = new Particle(me.x, me.y, "#aaaaaa");
			p.clip = false;
			p.radius = BULLET_RADIUS;
			p.x_v = me.x_v + Math.sin(me.heading) * weaponSpeed;
			p.y_v = me.y_v - Math.cos(me.heading) * weaponSpeed;
			entities.unshift(p); // front of list to get under the player
			me.reloadTime = 500;

			var countdown = function(func, msecs) {
				var timeLeft = msecs;
				return function(me,time) {
					timeLeft -= time;
					if (timeLeft < 0) {
						func(me,time);
					}
				}
			}

			var explode = function(me,time) {
				me.color = "#ffaaaa";
				me.radius = 10;
				me.x_v = 0;
				me.y_v = 0;
				me.image = randomPick(explosions);
				me.draw = drawCenteredImage;
				me.updaters = []; // stop!
				//entities.remove(me);
			}
			
			p.addUpdater(changeRadius(.9));
			p.addUpdater(countdown(explode, 3000));
		}
		
		
	}
	player.addUpdater(fireWeapon);
	player.addUpdater(applyThrust);	
	entities.push(player);

	for (var i=0 ; i<50 ; ++i) {
		var enemy = new Particle(vary(midx, width * 3), vary(midy, height * 3), '#FFFFFF');
		enemy.radius = PLANE_RADIUS;
		enemy.image = zero;
		enemy.draw = drawCenteredImage;
		enemy.x_v = vary(0,1);
		enemy.y_v = vary(0,1);
		enemy.age = 0;
		
		enemy.addUpdater(applyFriction);
		enemy.heading = 0;
		enemy.thrust = 5;
		
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

	for (var i=0 ; i<5 ; ++i) {
		explosions.push(generateExplosion());
	}
	
}

function generateExplosion() {
	var explosion = newCanvas(EXPLOSION_SIZE, EXPLOSION_SIZE);
	explosion_ctx = explosion.getContext("2d");
	var DRAW_GROUND = true;
	if (DRAW_GROUND) {
		
		var groundColor = function() {
			return [181, 109, 16, irand(255)];
		}
		for (var i=0 ; i<3 ; ++i) {
			var ground = newCanvas(EXPLOSION_SIZE, EXPLOSION_SIZE);
			perlin_noise(ground, groundColor);
			circle_alpha(ground);
			var ox = (explosion.width - ground.width)/2;
			var oy = (explosion.height - ground.height)/2;
			explosion_ctx.drawImage(ground, ox, oy, ground.width, ground.width);
		}
	}
	var black = function() {
			return [0,0,0, irand(255)];
	};
	var scortchMark = newCanvas(EXPLOSION_SIZE, EXPLOSION_SIZE);
	perlin_noise(scortchMark, black);
	circle_alpha(scortchMark);
	var ox = (explosion.width - scortchMark.width)/2;
	var oy = (explosion.height - scortchMark.height)/2;
	explosion_ctx.drawImage(scortchMark, ox, oy, scortchMark.width, scortchMark.width);
	return explosion;
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
	
	var pan = getXYFromVector(player.heading, player.thrust);
	// FIXME: Shoudl we do some to-integer stuff here so floats don't happen?
	pan.x = Math.round(pan.x);
	pan.y = Math.round(pan.y);

	offset.x -= pan.x;
	offset.y -= pan.y;
//		console.log('---------------------');
//		console.log('offset = ' + offset.x + ',' + offset.y);
//		console.log('   pan = ' + pan.x + ',' + pan.y);
	if (map) {
		map.panBy(pan.x, pan.y);
	}
	
	var seconds = 1000.0 / time;

	for(var i=0 ; i<entities.length ; ++i) {
		var p = entities[i];
		if (p.active) {
			p.x += p.x_v * seconds;
			p.y += p.y_v * seconds;
		}
	}

	
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

/*
function doExplosion(time) {
	for (var i = 0 ; i<explosions.length ; ++i) {
		ctx.drawImage(explosions[i], width/(explosions.length/i), 0, explosions[i].width, explosions[i].height);
	}
}
*/

function draw(time) {
	ctx.clearRect(0,0,width,height);
	ctx.save();
	drawentities(time, entities);
	ctx.restore();
}

function Particle(x, y, color) {
	this.x = x;
	this.y = y;
	this.x_v = 0;
	this.y_v = 0;
	this.color = color;
	this.radius = 1;
	this.active = true;
	this.clip = true;
	this.updaters = [

	];
	this.addUpdater = function(u) {
		this.updaters.push(u);
	};
	this.update = function(time) {
		for (var i=0 ; i<this.updaters.length ; ++i) {
			this.updaters[i](this,time);
		}
	}
	this.collide = function(otherP) {
		this.active = false;
	}
	this.draw = function(ctx, time) {
		ctx.fillStyle = this.color;
		ctx.beginPath();
		ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, true);
		ctx.fill();
	}
}


function drawentities(time, entities) {
		ctx.save();
		ctx.translate(offset.x, offset.y);
		for(var i=0 ; i<entities.length ; ++i) {
			var p = entities[i];
			if (p.active) {
				entities[i].draw(ctx, time);
			}
		}
		ctx.restore();
}





function initialize() {
	var myLatlng = new google.maps.LatLng(-34.911555,138.600082);
	var myOptions = {
		zoom: 16,
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

function attachGoogleMapsScript(callback) {
	var script = document.createElement("script");
	script.type = "text/javascript";
	script.src = "http://maps.google.com/maps/api/js?sensor=false&callback=" + callback;
	document.body.appendChild(script);
}
