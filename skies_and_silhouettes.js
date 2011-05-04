/*	By Dave Lawrence on 26/8/2010
 *	http://proceduralgraphics.blogspost.com

		TODO:

		dutch windmill
		factory
		l-system trees

		proper alignment y pos of windmill etc
		proper size etc


 */

var preloads = {
	'Scary Storm':			{	bgcolor: '#0000ff', fgcolor: '#000000', silhouette: 'wind_turbine' },
	'Outback Windmill':	{	bgcolor: '#ff0000', fgcolor: '#fffd3b', silhouette: 'farm_windmill' },
	'Blue Sky Turbine':	{	bgcolor: '#0000ff', fgcolor: '#ffffff', silhouette: 'wind_turbine' },
	'Black & White':		{	bgcolor: '#000000', fgcolor: '#ffffff', silhouette: 'wind_turbine' },
	'Apocalypse':				{	bgcolor: '#000000', fgcolor: '#ff0000', silhouette: 'tree',					static: true }
};

var silhouettes = {
	'farm_windmill':	drawFarmWindmill,
	'wind_turbine':		drawWindTurbine,
	'tree':						drawTree
};

var width = window.innerWidth * .6;
var height = window.innerHeight * .6;
var ctx;
var selectPreload;
var selectSilhouette;
var input = {}; // convenience map that holds inputs
var background;
var intervalId;
var args = {};


function setup() {
		var canvas = newCanvas(width, height);
		document.getElementById("canvas").appendChild(canvas);
	 	ctx = canvas.getContext("2d");

		input = {
			bgcolor:		document.getElementById('bgcolor'),
			fgcolor:		document.getElementById('fgcolor'),
			silhouette:	document.getElementById('silhouette')
		};

		selectPreload = document.getElementById('preloads');
		selectPreload.options.length = 0; // clear out existing items
		for (var key in preloads) {
			selectPreload.options.add(new Option(key, key))
		}
		selectPreload.options[0].selected = true;
		selectPreload.onchange = updateSelect;

		// silhouette
		selectSilhouette = input.silhouette;
		selectSilhouette.options.length = 0; // clear out existing items
		for (var key in silhouettes) {
			selectSilhouette.options.add(new Option(key, key))
		}
		selectSilhouette.options[0].selected = true;
		document.getElementById('update').onclick = update;
		updateSelect();

		// LSystem setup
		var lsys = new LSystem('X', ['X->F-[[X]+X]+F[+FX]-X', 'F->FF']);
		var iterations = 7;
		var turtleInput = lsys.iterate(iterations);
		args.ctx = ctx;
		args.str = turtleInput;
		args.distance = .004;
		args.angle = 0.436;
		args.angleVariance = 0;
		args.iterations = iterations;
}

function updateSelect() {
		var chosenOption = selectPreload.options[selectPreload.selectedIndex];
		var l = preloads[chosenOption.value];

		input.bgcolor.value = l.bgcolor;
		input.fgcolor.value = l.fgcolor;
		input.silhouette.value = l.silhouette;
		update();
}

var angle = 0;

function update() {
	var bgColor = input.bgcolor.value;
	var fgColor = input.fgcolor.value;
	
	background = newCanvas(width, height);
	var bgCtx = background.getContext("2d");
	bgCtx.fillStyle = bgColor;
	bgCtx.fillRect(0,0, width, height);

	var r = HexToR(fgColor);
	var g = HexToG(fgColor);
	var b = HexToB(fgColor);
	var clouds = function() {
			return [r, g, b, irand(200)];
	};
	perlin_noise(background, clouds);
	if (intervalId) {
		clearInterval(intervalId);
	}
	intervalId = setInterval(function() { angle += 0.08; draw(); }, 80);
}


function draw() {
		ctx.drawImage(background, 0, 0);
		ctx.save();
		ctx.beginPath();
		ctx.moveTo(0, height);
		ctx.quadraticCurveTo(width/2, height * .8, width, height);
		ctx.closePath();
		ctx.fill();
		ctx.restore();

		var WINDMILL_SIZE = height * .66;
		var silhouette = silhouettes[ input.silhouette.value ];

		ctx.save();
		ctx.translate(width/2, height - WINDMILL_SIZE * .6);
		ctx.scale(WINDMILL_SIZE, WINDMILL_SIZE);
		silhouette(ctx, stroke, angle);
		ctx.restore();
}


function drawFarmWindmill(ctx, op, bladeAngle) {
	var windmill = new FarmWindmill();
	windmill.draw(ctx, bladeAngle);
}

function drawWindTurbine(ctx, op, bladeAngle) {
	var windmill = new WindTurbine();
	windmill.draw(ctx, bladeAngle);
}

function drawTree(ctx, op, bladeAngle) {
		var handler = getDefaultLSystemHandler();

		ctx.lineWidth = 0.002;
		ctx.translate(0, .5);
		ctx.rotate(Math.PI);
		drawLSystem(args, handler);

		// Hack - tree has no animation...
		if (intervalId) {
			clearInterval(intervalId);
		}
}
