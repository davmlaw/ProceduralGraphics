function clip(ctx) { ctx.clip(); }
function fill(ctx) { ctx.fill(); }
function stroke(ctx) { ctx.stroke(); }
function strokeAndFill(ctx) { ctx.stroke(); ctx.fill() }

function empty() { }

function mirror(ctx, func) {
		ctx.save();
		func(ctx);
		ctx.restore();
		ctx.save();
	  ctx.transform(-1, 0, 0, 1, 0, 0);
		func(ctx);
		ctx.restore();
}

function tunnel(ctx, scaleRatio, funcs) {
		ctx.save();
		for(var i=0 ; i<funcs.length ; ++i) {
			funcs[i](ctx);
			ctx.scale(scaleRatio,scaleRatio);
		}
		ctx.restore();
}



function Drawable(name) {
	this.name = name || "unnamed drawable";
	this.x = 0;
	this.y = 0;
	this.scale = 1;
	this.children = [];
	this.clipFunc = empty;
	this.func = empty;
	this.drawChildren = function(ctx) {
		for(var i=0 ; i<this.children.length ; ++i) {
			this.children[i].draw(ctx);
		}
	}
	this.draw = function(ctx) {
			//alert('drawn ' + this.name);

			ctx.save();
			ctx.translate(this.x, this.y);
			ctx.scale(this.scale, this.scale);
			this.clipFunc(ctx);
			if (this.fillStyle) {
				ctx.fillStyle = this.fillStyle;
			}
			if (this.strokeStyle) {
				ctx.strokeStyle = this.strokeStyle;
			}
			this.func(ctx);
			this.drawChildren(ctx);
			ctx.restore();
	}
}

// Draws draw() and a mirrored version
function MirroredDrawable() {
	var that = this;	// this is confusing :)
	this.oldDraw = this.draw;
	this.draw = function(ctx) { mirror(ctx, function(ctx) { that.oldDraw(ctx); }) };
}
MirroredDrawable.prototype = new Drawable();


// Reverses all children
function MirroringDrawableContainer() {
	this.func = function(ctx) { ctx.transform(-1, 0, 0, 1, 0, 0); };
}
MirroringDrawableContainer.prototype = new Drawable();


function PatternDrawable(bgFill, fgFill, patternRatio, patternFunc) {
	this.func = function(ctx) {
		// in theory this should only be translate(-.5, -.5) and fillRect(1000, 1000)
		// but it's likely I've stuffed up and drawn outside of unit range, so do twice as much...
		ctx.translate(-1, -1);
		ctx.scale(.001, .001);
		var patternSize = 100;
		var f = function(ctx) {
			ctx.scale(patternSize * patternRatio, patternSize * patternRatio);
			patternFunc(ctx);
		}
		ctx.fillStyle = generatePattern(patternSize, patternSize, bgFill, fgFill, f);
		ctx.fillRect(0,0, 2000, 2000); 
	}
}
PatternDrawable.prototype = new Drawable();

/*

CanvasDrawable(func, rasterWidth, rasterHeight) {
	if (!rasterWidth) rasterWidth = 200;
	if (!rasterHeight) rasterHeight = 200;
	this.raster = shapeToCanvas(rasterWidth, rasterHeight, fgFill, bgFill, func);
	this.
}

*/

// TODO: other ops, begin/end etc? colour callbacks?
function drawModel(model) {
	var opCodes = {
		m: "moveTo",
		q: "quadraticCurveTo",
		t: "translate",
		b: "bezierCurveTo"
	};

	for (var i=0 ; i<model.length ; ++i) {
		var op = model[i];
		var opCode = opCodes[op[0]];
		if (opCode) {
			if (ctx[opCode]) {
				ctx[opCode](op[1], op[2], op[3], op[4], op[5], op[6]);
			}
		}
	}			
}



function shapeToCanvas(width, height, bgFill, fgFill, func) {
		var buffer = newCanvas(width, height)

		var ctx = buffer.getContext("2d");
		ctx.fillStyle = bgFill;
		ctx.fillRect(0,0, width, height);
		// start in centre
		ctx.translate(Math.floor(width/2), Math.floor(width/2));

		ctx.fillStyle = fgFill;
		func(ctx);
		return buffer;
}


function generatePattern(width, height, bgFill, fgFill, func) {
		var buffer = shapeToCanvas(width, height, bgFill, fgFill, func);
		return buffer.getContext("2d").createPattern(buffer, "repeat");
}


function newCanvas(width, height) {
	var canvas;
	try {
		canvas = document.createElement('canvas');
	} catch (e) {

	}
	canvas.width = width;
	canvas.height = height;
	return canvas;
}

/// 

function topOnlyMask(ctx) {
	ctx.beginPath();
	ctx.rect(-1, -1, 2, 1);
	ctx.clip();
}

function setElementSize(el, width, height) {
	el.style.width = width + "px";
	el.style.height = height + "px";
}

function setupOverlapping(id) {
	var e = document.getElementById(id);
	setElementSize(e, width, height);
	var divs = e.getElementsByTagName("div");
	for (var i=0 ; i<divs.length ; ++i) {
		var d = divs[i];
		setElementSize(d, width, height);
		d.style.position = "absolute";
		d.style.top = d.style.left = "0px";
	}
}



function bottomOnlyMask(ctx) {
	ctx.beginPath();
	ctx.rect(-1, 0, 2, 1);
	ctx.clip();
}

function rgb(r,g,b) {
	return 'rgb(' + r + ',' + g + ',' + b + ')';
}

function rgba(r,g,b,a) {
	return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
}


function rand_rgba(r,g,b,a,randFactor) {
	var v = vary(1, rand(randFactor));
	return rgba(Math.floor(v*r), Math.floor(v*g), Math.floor(v*b), a);	
}

function randomColor() {
	return rgb(irand(256), irand(256), irand(256));
}

// Thanks to http://www.javascripter.net/faq/hextorgb.htm
function HexToR(h) {return parseInt((cutHex(h)).substring(0,2),16)}
function HexToG(h) {return parseInt((cutHex(h)).substring(2,4),16)}
function HexToB(h) {return parseInt((cutHex(h)).substring(4,6),16)}
function cutHex(h) {return (h.charAt(0)=="#") ? h.substring(1,7):h}


function circle_alpha(canvas, fadeFactor) {
	var ff = fadeFactor || 1;
	var canvas_ctx = canvas.getContext ("2d");
	var canvas_id = canvas_ctx.getImageData (0, 0, canvas.width, canvas.height);
	var pixels = canvas_id.data;
	var cx = canvas.width/2;
	var cy = canvas.height/2;
	for (var i = 0; i < pixels.length; i += 4) {
		var p = i/4;
		var x = p % canvas.width;
		var y = p / canvas.width;
		var xd = cx-x;
		var yd = cy-y;
		var radius = Math.sqrt(xd*xd + yd*yd);
		radius = vary(radius, radius*.05);
		pixels[i + 3] *= 1- radius/cx;
	}
	canvas_ctx.putImageData (canvas_id, 0, 0);
}

