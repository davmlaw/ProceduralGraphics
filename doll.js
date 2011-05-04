/**
 * This method returns a Drawable representing the doll
 * children are a body & a face, each with their own child drawables
 */
function dollFactory(context) {
  var dollDimensions = {
  	width: vary(.57, .05),
  	height: vary(1.0, .05),
  	topRadius: vary(.2, .01),
  	bottomHeight: vary(.79, .05),
		bottomWidth: vary(.38, 0.02),
		curve: vary(.26, 0.01)
  };
	dollDimensions.bodyTop = 0.5 - dollDimensions.bottomHeight;
	dollDimensions.headRadius = vary(dollDimensions.height / 5, 0.005);

	var doll = new Drawable();
	doll.children = [getDollBody(dollDimensions), getDollFace(dollDimensions)];

	return doll;

}


function getDollBody(dollDimensions) {
	var dollBody = new Drawable("body");
	dollBody.fillStyle = randomColor();
	dollBody.clipFunc = function(ctx) { drawDollBody(ctx, dollDimensions, clip); };
	dollBody.func = function(ctx) { drawDollBody(ctx, dollDimensions, fill); };

	if (odds(.1)) {
		// Solid no shawl or ellipse pattern patch
		if (odds(.5)) {
			dollBody.children.push(solidPatternFactory());
		}
	} else {
			dollBody.children.push(getBodyPattern());
		
			// Add shawl last, so it covers everything else
			var shawl = new Drawable("shawl");
			shawl.fillStyle = randomColor();
			shawl.y = -rand(.1);
			shawl.func = function(ctx) {
				var tie = function(ctx) {
					ctx.rotate(Math.PI * .25);
					ctx.beginPath();
					ctx.bezierCurveTo(0, 0, .05, .07, 0, .15);
					ctx.bezierCurveTo(0, .15, -.05, .07, 0, 0);
					ctx.fill();
				}
				mirror(ctx, tie);
				ctx.translate(0, -0.5);
				circle(ctx, fill);
			}
			dollBody.children.push(shawl);
	}
	return dollBody;
}


function drawDollBody(ctx, doll, op) {
		ctx.beginPath();
		var halfw = doll.bottomWidth/2;
	  ctx.moveTo(-halfw, .5); // bottom left
		ctx.lineTo(halfw, .5);
		ctx.bezierCurveTo(halfw, .5, halfw + doll.curve, 0, halfw, doll.bodyTop);
		ctx.lineTo(-halfw, doll.bodyTop);
		ctx.bezierCurveTo(-halfw, doll.bodyTop, -halfw - doll.curve, 0, -halfw, .5);
		ctx.arc(0, doll.bodyTop, doll.headRadius, 0, Math.PI*2, true);
		op(ctx);
}


function getBodyPattern() {
	// slight chance of there being no ellipse
	if (odds(.1)) {
		return solidPatternFactory();
	} else if (odds(.1)) {
		return new Drawable(); // empty - so body will be solid color		
	}

	var bodyPattern = new Drawable("body pattern");
	bodyPattern.fillStyle = randomColor();
	bodyPattern.y = .1;
	bodyPattern.scale = .8;
	bodyPattern.clipFunc = function(ctx) {
		ellipse(ctx, clip, -.3, .3, -.4, .4);
	}
	bodyPattern.func = function(ctx) {
		ellipse(ctx, fill, -.3, .3, -.4, .4);
	}

	var pattern = randomPatternDrawable();
	bodyPattern.children.push(pattern);	
	return bodyPattern;
}



function getDollFace(dollDimensions) {
	var dollFace = new Drawable("face");
	dollFace.y = dollDimensions.bodyTop;
	dollFace.scale = dollDimensions.headRadius * 1.6;
	dollFace.fillStyle = "#FFFFFF";
	dollFace.clipFunc = function(ctx) { circle(ctx, clip); }
	dollFace.func = function(ctx) { circle(ctx, fill); }

	// cheeks
	if (odds(.8)) {
		var cheeks = new MirroredDrawable("cheeks");
		cheeks.x = -.22
		cheeks.y = .2;
		cheeks.scale = vary(.13, .01);
		cheeks.fillStyle = rgba( 212, 83, 101, vary(0.3,0.1) );
		cheeks.func = function(ctx) {
			circle(ctx, fill);
		}
		dollFace.children.push(cheeks);
	}


	var mouthInit = {
		name: "Mouth",
		y: .2,
		scale: 0.2,
		fillStyle: "#FF0000",
		func: randomPick([
			function(ctx) {
					ctx.strokeStyle = "#FF0000";
					ctx.lineWidth = 0.05;
					ctx.beginPath();
					ctx.bezierCurveTo(-.5, 0, 0, .3, 0.5, 0);
					ctx.stroke();
					ctx.scale(.6, .6);
					heart(ctx, fill);
			},
			function(ctx) {
					ctx.strokeStyle = "#000000";
					ctx.lineWidth = 0.05;
					ctx.beginPath();
					ctx.bezierCurveTo(-.5, 0, 0, -.08, .5, 0);
					ctx.stroke();
					ctx.beginPath();
					ctx.bezierCurveTo(-.25, 0.2, 0, .3, .25, 0.2);
					ctx.stroke();
			}
		])
	}


	var mouth = new Drawable("mouth");
	setObjectFromMap(mouth, mouthInit);
	dollFace.children.push(mouth);
	
	var noseInit = {
		name: "Nose",
		y: .1,
		scale: 0.05,
		fillStyle: "#000000",
		func: randomPick([
			function(ctx) {
				ctx.translate(-.7, 0);
				ctx.scale(.5, .5);
				circle(ctx, fill);
			},
			function(ctx) {
				ctx.lineWidth = .2;
				ctx.beginPath();
				ctx.bezierCurveTo(-.5, 0, 0, -1, .5, 0);
				ctx.stroke();
			}
		])
	}
	
	var nose = new MirroredDrawable();
	setObjectFromMap(nose, noseInit);
	dollFace.children.push(nose);

	var eyeColor = randomPick(['#77a1bb', '#72c8ff', '#7dd266', '#563628']);

	var eyesInit = {
		name: "Eyes",
		x: -.2,
		scale: 0.1,
		strokeStyle: "#000000",
		fillStyle: "#000000",
		func: randomPick([
			function(ctx) {
				ctx.beginPath();
				ctx.arc(0, -.05, .4, 0, Math.PI*2, true);
				ctx.fill();
		
				ctx.lineWidth = 0.1;
				ctx.beginPath();
				ctx.arc(0, 0, .5, 0, Math.PI*2, true);
				ctx.stroke();
		
				ctx.beginPath();
				ctx.bezierCurveTo(-1, 0, 0, -1.1, 1, 0);
				ctx.stroke();
		
				// eyelashes
				ctx.lineWidth = 0.07;
				ctx.beginPath();
				ctx.bezierCurveTo(-0.98, 0, -1.4, -.02, -1.8, -.6);
				ctx.stroke();
		
				ctx.beginPath();
				ctx.bezierCurveTo(-0.85, -.18, -1.2, -.3, -1.4, -.68);
				ctx.stroke();
		
				ctx.beginPath();
				ctx.bezierCurveTo(-0.55, -.35, -.9, -.4, -1.05, -.78);
				ctx.stroke();
			},
			/*
			function(ctx) {
				ctx.lineWidth = 0.1;
				ctx.beginPath();
				ctx.arc(0, -.05, .6, 0, Math.PI, true);
				ctx.closePath();
				ctx.stroke();
	
				ctx.beginPath();
				ctx.arc(0, -.05, .4, Math.PI, Math.PI * 2, true);
				ctx.fill();
			},
			function(ctx) {
				ctx.lineWidth = 0.1;
				ctx.beginPath();
				ctx.bezierCurveTo(-.5, 0, 0, -.1, .5, 0);
				ctx.stroke();
	
				ctx.beginPath();
				ctx.arc(0, -.05, .4, Math.PI, Math.PI * 2, true);
				ctx.fill();
			},
			*/
			function(ctx) {
				ctx.lineWidth = 0.1;
				ctx.beginPath();
				ctx.bezierCurveTo(-1, 0, 0, -.8, 1, 0);
				ctx.stroke();
	
				ctx.fillStyle = eyeColor;
				ctx.beginPath();
				ctx.arc(0, 0, .3, 0, Math.PI * 2, true);
				ctx.fill();
	
				ctx.fillStyle = "#000000";
				ctx.beginPath();
				ctx.arc(0, 0, .18, 0, Math.PI * 2, true);
				ctx.fill();
			}
			
		])
	};

	var eyes = new MirroredDrawable();
	setObjectFromMap(eyes, eyesInit);
	dollFace.children.push(eyes);
	
	var hairColor = randomPick(new Array('#000000', '#fffc22', '#ffb722', 'brown'));
	var eyebrowPeak = vary(-.4, .1);
	
	var eyebrows = new MirroredDrawable("eyebrows");
	eyebrows.x = -.2;
	eyebrows.y = -.1;
	eyebrows.scale = .15;
	eyebrows.strokeStyle = hairColor;
	eyebrows.func = function(ctx) {
		ctx.lineWidth = 0.1;
		ctx.beginPath();
		ctx.bezierCurveTo(-0.5, 0, 0, eyebrowPeak , .5, 0);
		ctx.stroke();
	
		// go over it again with a slight black blend to darken
		ctx.strokeStyle = rgba(0, 0, 0, .4);
		ctx.beginPath();
		ctx.bezierCurveTo(-0.5, 0, 0, eyebrowPeak, .5, 0);
		ctx.stroke();
	}
	dollFace.children.push(eyebrows);
	
	for(var i=0 ; i<2; ++i) {
		var hair = new Drawable("hair");
		hair.x = vary(0, .05);
		hair.y = vary(-.5, .05);
		hair.strokeStyle = hairColor;
		hair.fillStyle = hairColor;
		hair.func = function(ctx) {
			ctx.rotate(Math.PI * .25);
			ctx.beginPath();
			ctx.bezierCurveTo(0, -.5, .5, 0, -.3, 1);
			ctx.lineTo(-1, 0); // go back so hair's always filled
			ctx.closePath();
			ctx.fill();
		}
	
		var d = hair;
		if (i) {
			d = new MirroringDrawableContainer();
			d.children = [hair];
		}
		dollFace.children.push(d);
	}

	return dollFace;
}


