function randomPatternDrawable() {
	var patternDrawableFactories = [
		function() { return new Drawable(); }, // empty
		solidPatternFactory,
		patternWithMaskFactory,
		tunnelFactory,
		spirographFactory,
		otherDesignFactory
	];

	return randomPick(patternDrawableFactories)();
}



function flannie(ctx, op) {
	var oldAlpha = ctx.globalAlpha;
	ctx.beginPath();
	ctx.rect(-.5, -.5, 0.5, 0.5);
	op(ctx);

	ctx.globalAlpha = .5;
	ctx.beginPath();
	ctx.rect(0, -.5, 0.5, 0.5);
	op(ctx);

	ctx.beginPath();
	ctx.rect(-.5, 0, 0.5, 0.5);
	op(ctx);
	
	ctx.globalAlpha = oldAlpha;
}


function getPatternList() {
	var s = getShapeList();
	var details = [];
	for (var i=0 ; i<s.length; ++i) {
		details.push( { ratio: vary(.75, .2), pattern: s[i] } );
	}

	details.push( { ratio: 1, pattern: flannie } );
	return details;
}

function randomPattern() {
	return randomPick(getPatternList());
}

function solidPatternFactory() {
	var details = randomPattern();
	var pattern = new PatternDrawable(randomColor(), randomColor(), details.ratio, function(ctx) { details.pattern(ctx, fill); });
	return pattern;
}

function patternWithMaskFactory() {
	var s = randomShape();
	var details = randomPattern();
	var pattern = new PatternDrawable(randomColor(), randomColor(), details.ratio, function(ctx) { details.pattern(ctx, fill); });
	pattern.scale = vary(.4, .1);
	pattern.clipFunc = function(ctx) {
		s(ctx, clip);
	}
	return pattern;
}

// have to do this to create new variables for JS
function makeShapeFunc(f) {
	return function(ctx) { f(ctx, stroke); }
}

function tunnelFactory() {
	var len = 6 + irand(6);
	var funcs = [];

	var sameShape = odds(.5);
	var f = randomShape();
	for (var i=0 ; i<len ; ++i) {
		if (!sameShape) {
			f = randomShape();
		}
		funcs.push(makeShapeFunc(f));
	}

	var pattern = new Drawable();
	pattern.strokeStyle = randomColor();
	pattern.func = function(ctx) {
		ctx.scale(2, 2);
		ctx.lineWidth = .05;
		tunnel(ctx, .6, funcs);
	}
	return pattern;
}

function spirographFactory() {
	var pattern = new Drawable();
	var num = 1 + irand(3);
	for (var i=0 ; i<num ; ++i) {
		pattern.children.push( getSpirograph() );
	}
	return pattern;
}


// Taken from Mozilla Transformations demo - https://developer.mozilla.org/en/Canvas_tutorial/Transformations
function getSpirograph() {
	var pattern = new Drawable();
	pattern.strokeStyle = randomColor();

	var R = 20*(irand(3)+2)/(irand(3)+1);
	var r = -8*(irand(3)+3)/(irand(3)+1);
	var O = 10;
	pattern.scale = .008; // normally is 100
	pattern.func = function(ctx) {
		var x1 = R-O;
		var y1 = 0;
		var i  = 1;
		ctx.beginPath();
		ctx.moveTo(x1,y1);
		
		do {
			if (i>20000) break;
			var x2 = (R+r)*Math.cos(i*Math.PI/72) - (r+O)*Math.cos(((R+r)/r)*(i*Math.PI/72))
			var y2 = (R+r)*Math.sin(i*Math.PI/72) - (r+O)*Math.sin(((R+r)/r)*(i*Math.PI/72))
			ctx.lineTo(x2,y2);
			x1 = x2;
			y1 = y2;
			i++;
		} while (x2 != R-O && y2 != 0 );
		ctx.stroke();
	}
	return pattern;
}





function otherDesignFactory() {
	var pattern = new Drawable("rainbow");
	pattern.func = randomDesign();
	return pattern;
}

function randomDesign() {
	return randomPick(getDesignList());
}

function getDesignList() {
	return [
		//rainbow,
		flower
	];
}


////////// Designs

// FIXME: We could make this into a proper rainbow by moving inwards on the curving points
function rainbow(ctx) {
	var roygbiv = ["#FF0000", "#FFA500", "#FFFF00", "#008000", "#0000FF", "#4B0082", "#EE82EE"];
	for (var c=0 ; c<roygbiv.length ; ++c) {
		ctx.lineWidth = 0.1;
		ctx.strokeStyle = roygbiv[c];
		ctx.beginPath();
		ctx.bezierCurveTo(-0.6, 0, 0, -0.5, 0.6, 0);
		ctx.stroke();
		ctx.translate(0.0, 0.1);
	}
}


function flower(ctx) {
	var numPetals = 13;
	var centreRadius = .05;
	var rot = Math.PI * 2 / numPetals;
	var petal = { length: .15, width: .12 };

	ctx.lineWidth = 0.005;
	ctx.strokeStyle = "#000000";
	ctx.fillStyle = "#FFFFFF";
	
	for (var p=0 ; p<numPetals ; ++p) {
    ctx.save();
    ctx.rotate( p * rot );
		ctx.translate(centreRadius, 0);
		
		ctx.beginPath();
		ctx.bezierCurveTo(0, 0, petal.length/2, -petal.width/2, petal.length, 0);
		ctx.bezierCurveTo(petal.length, 0, petal.length/2, petal.width/2, 0, 0);
		ctx.fill();
		ctx.stroke();
    ctx.restore();
  }

	ctx.lineWidth = 0.05;
	ctx.fillStyle = "#fffc22";
	var s = centreRadius * 3;
	ctx.scale(s, s);
	circle(ctx, strokeAndFill);
}

