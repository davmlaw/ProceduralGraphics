var width = window.innerWidth;
var height = window.innerHeight;
var ctx;
var background;
var leaves = [];


function setup() {
	createBackground();

	var canvas = newCanvas(width, height);
	document.getElementById("canvas").appendChild(canvas);
 	ctx = canvas.getContext("2d");

	setInterval(draw, 100);
}

function createBackground() {
	background = newCanvas(width, height);
	var bgCtx = new CanvasWrapper(background.getContext("2d"));
	bgCtx.fillStyle = "#FFFFFF";
	bgCtx.fillRect(0,0, width, height);
	drawMain(bgCtx);
}

function draw() {
		ctx.save();
		ctx.drawImage(background, 0, 0);
		drawLeaves();
		ctx.restore();
}

function drawMain(ctx) {
	  ctx.fillStyle = "#000000";
	  ctx.strokeStyle = "#000000";

		var plant = {
				axiom: 'FX',
				angle: 0.3,
				rules: new Array('X->[-FX][+FX]')
		};

		var lsys = new LSystem(plant.axiom, plant.rules);
		var iterations = 6;
		var turtleInput = lsys.iterate(iterations);
		var args = {};
		args.ctx = ctx;
		args.str = turtleInput;
		args.distance = 100;
		args.angle = plant.angle;
		args.angleVariance = 0.3;
		args.iterations = iterations;
	
		var handler = getDefaultLSystemHandler();

		handler["F"] = function(args) {
			var oldDist = args.distance;
			var x = Math.pow(1.4, args.depth);
			args.ctx.lineWidth = args.iterations / x;
			args.distance /= x;
			args.distance *= vary(1, .3);

			args.ctx.beginPath();
			args.ctx.moveTo(0, 0);
			//args.ctx.lineTo(0, args.distance);
			args.ctx.quadraticCurveTo(vary(0, args.distance/15), args.distance/2, 0, args.distance);
			args.ctx.stroke();

			handler["G"](args); // go forward
			args.distance = oldDist;
		};


		handler["X"] = function(args) {
			var leafColors = ['#ff493d', '#ffa33a', '#ffa33c', '#c02f1a', '#ffe53d'];
			var p = args.ctx.getCoords(0, 0);
			var numLeaves = vary(2,1);
			for (var i=0 ; i<numLeaves ; ++i) {
				var leaf = new Leaf(vary(p.x, 10), vary(p.y, 10), 0, randomPick(leafColors), vary(args.ground, 5));
				leaves.push(leaf);
			}
		}

		for (var i=0 ; i<5 ; ++i) {
			var x = width * vary(.5, .4);
			var y = height * vary(.75, .2);
			args.ground = y;
			ctx.save();
			ctx.translate(x, y);
			ctx.rotate(Math.PI);
			drawLSystem(args, handler);
			ctx.restore();
		}
}

function drawLeaves() {
		for(var i=0 ; i<leaves.length ; ++i) {
			var leaf = leaves[i];
			if (leaf.active) {
				if (leaf.attached) {
					if (odds(.01)) {
						leaf.attached = false;
						leaf.y_v = 1.5;
					}
				} else if (leaf.y < leaf.ground) {
					// wind effect
					leaf.x_v = vary(leaf.x_v, 1);
					leaf.x_v = Math.max(leaf.x_v, -1.5);
					leaf.x_v = Math.min(leaf.x_v, 1.5);
					
					// move
					leaf.x += leaf.x_v;
					leaf.y += leaf.y_v;
				}
				leaves[i].draw(ctx);
			}
		}
}


function Leaf(x, y, angle, color, ground) {
	this.x = x;
	this.y = y;
	this.x_v = 0;
	this.y_v = 0;
	this.angle = angle;
	this.color = color;
	this.ground = ground;
	this.radius = 3.5;
	this.active = true;
	this.attached = true;
	this.draw = function(ctx) {
			ctx.fillStyle = this.color;
			ctx.beginPath();
			ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, true);
			ctx.fill();
	}
}

