/*	By Dave Lawrence on 17/6/2010
 *	LSystem 3
 *	http://proceduralgraphics.blogspost.com
 */

var lsysTypes = {
	'Plant with leaves':	{	axiom: 'S--X',		angle: 0.436,				rules: ['L->', 'X->FL-[[X]+X]+FL[+FLX]-X', 'F->FF'],
		funcs: {
			// Setup (from axiom, will just sit as the first letter)
			'S':	function(args) {
							args.ctx.lineWidth = 2;
							args.ctx.strokeStyle = '#644a35';
						},
			// Leaves
			'L':	function(args) {
							args.ctx.fillStyle = '#00ff00';
							args.ctx.beginPath();
							args.ctx.arc(0, 0, 2, 0, 2 * Math.PI, true);
							args.ctx.fill();
						}
		}
	},
	'Plant':							{ axiom: '--X',			angle: 0.436,				rules: ['X->F-[[X]+X]+F[+FX]-X', 'F->FF']},
	'Koch Snowflake':			{ axiom: 'F--F--F', angle: Math.PI / 3, rules: ['F->F+F--F+F']},
	'Serpinski Carpet':		{ axiom: 'F-F-F-F',	angle: Math.PI / 2, rules: ['F->F[F]-F+F[--F]+F-F']},
	'Serpinski Carpet (color)': {
													axiom: 'F-F-F-F',	angle: Math.PI / 2, rules: ['F->F[CF]-F+F[C--F]+F-F'],
		// A 'C' is put inside each push '[' so color is changed according to depth
		funcs: {
			'C':	function(args) {
							var colors = ['#FFFFFF', '#39de60', '#fffc22', '#ff0000', '#0000FF'];
							args.ctx.strokeStyle = colors[ Math.min(colors.length-1, args.depth) ];
						}
		}
	},
	'Serpinski Square':		{ axiom: 'F-F-F-F',	angle: Math.PI / 2, rules: ['F->FF[-F-F-F]F'] },
	'Serpinski Triangle':	{ axiom: 'A',				angle: Math.PI / 3,	rules: ['A->B-A-B', 'B->A+B+A']},
	'Serpinski Gasket':		{ axiom: 'F--F--F',	angle: Math.PI / 3, rules: ['F->F--F--F--GG', 'G->GG'] }
};

// All of the interesting l-sys drawing code is in lsystem.js, the code below is mostly boring HTML stuff

var width = window.innerWidth - 40;
var height = window.innerHeight * .7;
var DEFAULT_ITERATIONS = 4;
var ctx;
var selectLsys;
var input = {}; // convenience map that holds inputs
var zoom = 1;
var zoom_increment = 0.1;

function setup() {
		var canvas = newCanvas(width, height);
		document.getElementById("canvas").appendChild(canvas);
	 	ctx = canvas.getContext("2d");

		input = {
			axiom:			document.getElementById('axiom'),
			rules:			document.getElementById('rules'),
			angle:			document.getElementById('angle'),
			iterations:	document.getElementById('iterations')
		};
		
		selectLsys = document.getElementById('l-sys');
		selectLsys.options.length = 0; // clear out existing items
		for (var key in lsysTypes) {
			selectLsys.options.add(new Option(key, key))
		}
		selectLsys.options[0].selected = true;
		selectLsys.onchange = updateSelect;
		input.iterations.value = DEFAULT_ITERATIONS;
		document.getElementById('zoom_out').onclick = function() { zoom -= zoom_increment; update() };
		document.getElementById('zoom_in').onclick = function() { zoom += zoom_increment; update() };
		document.getElementById('inc').onclick = function() { input.iterations.value++; };
		document.getElementById('dec').onclick = function() { input.iterations.value--; };
		document.getElementById('update').onclick = update;

		updateSelect();
}

function updateSelect() {
		var chosenOption= selectLsys.options[selectLsys.selectedIndex];
		var l = lsysTypes[chosenOption.value];

		input.axiom.value = l.axiom;
		input.rules.value = l.rules.join(',');
		input.angle.value = l.angle;
		update();
}

function update() {
		var l = {};
		l.axiom = input.axiom.value;
		l.rules = input.rules.value.split(',');
		l.angle = input.angle.value;
		// TODO: Make funcs editable
		var chosenOption= selectLsys.options[selectLsys.selectedIndex];
		l.funcs = lsysTypes[chosenOption.value].funcs;

		draw(l);
}				

function draw(l) {
		ctx.save();
		drawBackground();
		ctx.scale(zoom, zoom);
		ctx.translate(width/10, height/10); // hack margin, until I make proper alignment/zooming etc
		ctx.strokeStyle = "#FFFFFF";

		var lsys = new LSystem(l.axiom, l.rules);
		var iterations = input.iterations.value;
		
		var turtleInput = lsys.iterate(iterations);
		var args = {};
		args.ctx = ctx;
		args.str = turtleInput;
		args.distance = 5;
		args.angle = l.angle;
		args.angleVariance = 0.0;
		args.iterations = iterations;

		var handler = getDefaultLSystemHandler();
		// Add extra drawing funcs
		if (l.funcs) {
			for (var f in l.funcs) {
				handler[f] = l.funcs[f];
			}
		}

		drawLSystem(args, handler);
		ctx.restore();
}

function drawBackground() {
	  ctx.fillStyle = "#000000";
	  ctx.fillRect(0,0, width, height);
}

