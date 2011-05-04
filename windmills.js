/*	By Dave Lawrence on 26/8/2010
 *	http://proceduralgraphics.blogspost.com
 */

function Windmill() {
	this.angle = 0;
	this.blades = 0;
	this.drawBase;
	this.drawBlade;
	this.draw = function(ctx, bladeAngle) {
			ctx.lineWidth = 0.01;
			ctx.fillStyle = "#000000";

			this.drawBase(ctx);
	
			// Blades
			ctx.save();
			ctx.rotate(bladeAngle);
	
			for (var i=0 ; i<this.blades ; ++i) {
				ctx.save();
				ctx.rotate(i * 2 * Math.PI / this.blades);
				this.drawBlade(ctx, bladeAngle);
				ctx.restore();
			}
		ctx.restore();
	}
}

function FarmWindmill() {
	this.blades = 9;
	this.drawBase = function(ctx) {
			ctx.beginPath();
			ctx.arc(0, 0, .08, 0, Math.PI*2, true);
			ctx.stroke();

			// Legs
			var legSpreadAngle = Math.PI / 7;
			var legAngle1 = Math.PI + legSpreadAngle / 2;
			var legAngle2 = legAngle1 - legSpreadAngle;
			var legLength = .7;
	
			var prevLeft = [0, 0];
			var prevRight = [0, 0];
			var STEPS = 5;
			var stepLength = legLength / STEPS;
	
			for (var i=0 ; i<STEPS ; ++i) {
				var left = throughAngle(i * stepLength, legAngle1);
				var right = throughAngle(i * stepLength, legAngle2);
				line(ctx, prevLeft, left);
				line(ctx, prevRight, right);
				line(ctx, prevLeft, right);
				line(ctx, prevRight, left);
				prevLeft = left;
				prevRight = right;
			}
	};
	this.drawBlade = function(ctx, bladeAngle) {
			var bladeSpreadAngle = (2 * Math.PI / this.blades) * .75;
			var bladeAngle1 = -bladeSpreadAngle / 2;
			var bladeAngle2 = -bladeAngle1;
	
			var bladeStart = 0.02;
			var bladeLength = .2;

			var a = throughAngle(bladeStart, bladeAngle1);
			var b = throughAngle(bladeLength, bladeAngle1);
			var c = throughAngle(bladeLength, bladeAngle2);
			var d = throughAngle(bladeStart, bladeAngle2);

			ctx.beginPath();
			ctx.moveTo(a[0], a[1]);
			ctx.lineTo(b[0], b[1]);			
			ctx.lineTo(c[0], c[1]);			
			ctx.lineTo(d[0], d[1]);			
			ctx.closePath();
			ctx.fill();
	};
}
FarmWindmill.prototype = new Windmill();

function WindTurbine() {
	this.blades = 3;
	this.drawBase = function(ctx) {
			var legSpreadAngle = .1;
			var legAngle1 = Math.PI + legSpreadAngle / 2;
			var legAngle2 = legAngle1 - legSpreadAngle;
			var legLength = .7;
			var legTopWidth = legLength / 25;

			var a = throughAngle(legTopWidth/2, - Math.PI/2);
			var b = throughAngle(legLength, legAngle1);
			var c = throughAngle(legLength, legAngle2);
			var d = throughAngle(legTopWidth/2, Math.PI/2);

			ctx.beginPath();
			ctx.arc(0, 0, legTopWidth * 1.1, 0, Math.PI*2, true);
			ctx.fill();

			ctx.beginPath();
			ctx.moveTo(0, 0);
			ctx.lineTo(a[0], a[1]);
			ctx.lineTo(b[0], b[1]);			
			ctx.lineTo(c[0], c[1]);			
			ctx.lineTo(d[0], d[1]);			
			ctx.closePath();
			ctx.fill();
	};
	this.drawBlade = function(ctx, bladeAngle) {
			var bladeSpreadAngle = (2 * Math.PI / this.blades) * .31;
			var bladeAngle1 = -bladeSpreadAngle / 2;
			var bladeAngle2 = -bladeAngle1;
	
			var bladeStart = 0;
			var bladeLength = .4;
			var bladeBaseWidth = bladeLength / 25;

			var a = [bladeBaseWidth/2, 0];
			var b = [bladeBaseWidth/2, -bladeLength];
			var c = throughAngle(bladeLength * .25, bladeAngle1);
			var d = [-bladeBaseWidth/2, 0];

			ctx.beginPath();
			ctx.moveTo(0, 0);
			ctx.lineTo(a[0], a[1]);
			ctx.lineTo(b[0], b[1]);
			ctx.quadraticCurveTo(0, -bladeLength, c[0], c[1]);
			ctx.lineTo(d[0], d[1]);			
			ctx.closePath();
			ctx.fill();
	};
}
WindTurbine.prototype = new Windmill();


function line(ctx, a, b) {
			ctx.beginPath();
			ctx.moveTo(a[0],a[1]);
			ctx.lineTo(b[0],b[1]);
			ctx.stroke();
}

function throughAngle(length, angle) {
	return [ Math.sin(angle) * length, -Math.cos(angle) * length ];
}
