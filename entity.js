function Entity(x, y, color) {
	this.x = x;
	this.y = y;
	this.x_v = 0;
	this.y_v = 0;
	this.color = color;
	this.radius = 1;
	this.active = true;
	this.clip = true;
	this.updaters = [

	];
	this.addUpdater = function(u) {
		this.updaters.push(u);
	};
	this.update = function(time) {
		for (var i=0 ; i<this.updaters.length ; ++i) {
			this.updaters[i](this,time);
		}
	}
	this.collide = function(otherP) {
		this.active = false;
	}
	this.draw = function(ctx, time) {
		ctx.fillStyle = this.color;
		ctx.beginPath();
		ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, true);
		ctx.fill();
	}
}


function drawentities(time, entities) {
		ctx.save();
		ctx.translate(offset.x, offset.y);
		for(var i=0 ; i<entities.length ; ++i) {
			var p = entities[i];
			if (p.active) {
				entities[i].draw(ctx, time);
			}
		}
		ctx.restore();
}
