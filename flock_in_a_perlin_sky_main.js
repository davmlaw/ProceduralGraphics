/*	By Dave Lawrence on 19/6/2010
 *	Boids
 *	http://proceduralgraphics.blogspost.com
 */

var width = window.innerWidth;
var height = window.innerHeight;
var ctx;
var background;

var boids = [];
var maxVelocity = 6;
var numBoids = 20;


function setup() {
		var canvas = newCanvas(width, height);
		document.getElementById("canvas").appendChild(canvas);
	 	ctx = canvas.getContext("2d");

		background = newCanvas(width, height);
		var bgCtx = background.getContext("2d");
		bgCtx.fillStyle = "#0000FF";
		bgCtx.fillRect(0,0, width, height);

		var whiteClouds = function() {
				return [255, 255, 255, irand(255)];
		};
		perlin_noise(background, whiteClouds);

		for(var i = 0; i < numBoids; i++) {
			boids.push(new Boid(rand(width), rand(height), 5));
		}

		setInterval(function() { update(); draw(); }, 100);
}

function update() {
		for(var i = 0; i < numBoids; i++) {
			boids[i].moveWith(boids, 300);
			boids[i].moveCloser(boids, 300);					
			boids[i].moveAway(boids, 15);	
		}
		
		for(var i = 0; i < numBoids; i++) {
			boids[i].move();
		}
}


function draw() {
		ctx.save();
		ctx.drawImage(background, 0, 0);

		ctx.fillStyle = "#000000";
		for(var i = 0; i < numBoids; i++) {
			ctx.save();
			ctx.translate(boids[i].x, boids[i].y);
			ctx.rotate(Math.PI/2 + boids[i].getHeading());
			ctx.scale(60, 60);
			drawBird(ctx, fill);
			ctx.restore();
		}

		ctx.restore();
}

function drawBird(ctx, op) {
		ctx.lineWidth = 0.005;
		ctx.lineWidth = 0.005;

		var bird = [
			["m", 0, -.375],
			["q", .02, -0.3425, .015, -.31],
			["q", .06, -.28, .05, -.2],
			["q", .2,  -.35, .5,  .25],
			["q", .2, -.15, .05, -.075],
			["q", .045, .1, .045, .1],
			["q", .06, .2, .14, .375],
			["q", 0.02, .2, 0, .125]
		];

		ctx.beginPath();
		drawModel(bird);
		ctx.transform(-1, 0, 0, 1, 0, 0); // mirror
		drawModel(bird);
		op(ctx);
}
