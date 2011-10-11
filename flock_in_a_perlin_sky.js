/*	By Dave Lawrence on 19/6/2010
 *	Boids
 *	http://proceduralgraphics.blogspost.com
 */

var width = window.innerWidth;
var height = window.innerHeight;
var ctx;
var background;
var boidSimulation = new BoidSimulation(20, 300);

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

		setInterval(function() { boidSimulation.update(); draw(); }, 50);
}

function draw() {
		ctx.save();
		ctx.drawImage(background, 0, 0);
		ctx.fillStyle = "#000000";
		
		var boids = boidSimulation.boids;
		for(var i = 0; i < boids.length ; i++) {
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

		var bird = [
			[0, -.375],
			[.02, -0.3425, .015, -.31],
			[.06, -.28, .05, -.2],
			[.2,  -.35, .5,  .25],
			[.2, -.15, .05, -.075],
			[.045, .1, .045, .1],
			[.06, .2, .14, .375],
			[0.02, .2, 0, .125]
		];

		var drawBirdSide = function() {
			ctx.moveTo(bird[0][0], bird[0][1]); // 1st is starting pos
			for (var i=1 ; i<bird.length ; ++i) {
				var curve = bird[i];
				ctx.quadraticCurveTo(curve[0], curve[1], curve[2], curve[3]);
			}
		}

		ctx.beginPath();
		drawBirdSide();
		ctx.transform(-1, 0, 0, 1, 0, 0); // mirror
		drawBirdSide();
		op(ctx);
}
