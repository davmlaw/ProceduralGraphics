function circle(ctx, op) {
		ctx.beginPath();
		ctx.arc(0, 0, .5, 0, Math.PI*2, true);
		op(ctx);
}

function ellipse(ctx, op, x1, x2, y1, y2) {
	var KAPPA = 4 * ((Math.sqrt(2) -1) / 3);

	var rx = (x2-x1)/2;
	var ry = (y2-y1)/2;
	
	var cx = x1+rx;
	var cy = y1+ry;
	
	ctx.beginPath();
	ctx.moveTo(cx, cy - ry);
	ctx.bezierCurveTo(cx + (KAPPA * rx), cy - ry,  cx + rx, cy - (KAPPA * ry), cx + rx, cy);
	ctx.bezierCurveTo(cx + rx, cy + (KAPPA * ry), cx + (KAPPA * rx), cy + ry, cx, cy + ry);
	ctx.bezierCurveTo(cx - (KAPPA * rx), cy + ry, cx - rx, cy + (KAPPA * ry), cx - rx, cy);
	ctx.bezierCurveTo(cx - rx, cy - (KAPPA * ry), cx - (KAPPA * rx), cy - ry, cx, cy - ry);
	op(ctx);
}

// This is from the mozilla canvas demo, but hacked up
function heart(ctx, op) {
	ctx.beginPath();
	ctx.translate(-0.68, -0.5); // move back to around origin
	ctx.moveTo(.68,.363);
	ctx.bezierCurveTo(.68,.336,.636,.227,.454,.227);
	ctx.bezierCurveTo(.181,.227,.181,.568,.181,.568);
	ctx.bezierCurveTo(.181,.727,.363,.927,.68,1.09);
	ctx.bezierCurveTo(1,.927,1.18,.727,1.18,.568);
	ctx.bezierCurveTo(1.18,.568,1.18,.227,.909,.227);
	ctx.bezierCurveTo(.772,.227,.68,.336,.68,.363);
	op(ctx);
	ctx.translate(0.68, 0.5); // move back to around origin
	
}

function star(ctx, op) {
	var radius = 0.5;
	//var possibleStarSides = new Array(5); // could use others (7, 11 look good), but meh 
	var sides = 5; //possibleStarSides[ Math.floor(Math.random() * possibleStarSides.length) ];

  ctx.beginPath()
  ctx.moveTo(0, -radius);
  for (i=0;i<2*sides-1;i++){
    ctx.rotate(Math.PI/sides);
    if(i%2 == 0) {
      ctx.lineTo(0, -radius * 0.4);
    } else {
      ctx.lineTo(0, -radius);
    }
  }
  ctx.closePath();
  op(ctx);
  
  // Get back to original rotation
  ctx.rotate(Math.PI/sides);
}

function tiltedShape(ctx, func, op) {
	var rot = Math.PI / 4;
	ctx.rotate(rot);
	func(ctx, op);
	ctx.rotate(-rot); // put it back for children...
}

function cross(ctx, op) {
	var hw = .1; // half cross width
	var len = .3;
	ctx.beginPath();
	ctx.moveTo(-hw, -hw);
  for (i=0;i<4;i++) {
		ctx.lineTo(-hw, -len);
		ctx.lineTo(hw, -len);
		ctx.lineTo(hw, -hw);
    ctx.rotate(Math.PI/2); // 1/4 rotation
	}
	op(ctx);
}


function getShapeList() {
	return [
		star,
		circle,
		heart,
		cross,
		function(ctx, op) { tiltedShape(ctx, cross, op); }
	];
}


function randomShape() {
	return randomPick(getShapeList());
}