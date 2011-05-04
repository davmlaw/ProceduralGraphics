function LSystem(axiom, rules) {
	this.axiom = axiom;
	this.ruleMap = [];

	for (var i=0 ; i<rules.length ; ++i) {
		var s = rules[i].split("->");
		this.ruleMap[s[0]] = s[1];
	}
	this.iterate = function(times) {
		if (!times) times = 1;

		var value = axiom;
		for (var i=0 ; i<times ; ++i) {
			var array = stringToArray(value);

			for (var key in this.ruleMap) {
				// note - a regex won't work, as we don't want to alter values changed this turn.
				//value = value.replace( new RegExp(key, "g"), this.ruleMap[key]);
				for (var c=0 ; c<array.length ; ++c) {
					var newValue = this.ruleMap[ array[c] ];
					if (newValue != null) {
						array[c] = newValue;
					}
				}
			}
			value = array.join("");
		}
		return value;
	}
}

function stringToArray(s) {
	var array = [];
	for (var i=0 ; i<s.length ; ++i) {
		array[i] = s.charAt(i);
	}
	return array;
}

function getDefaultLSystemHandler() {
	var goForward = function(args) {
		args.ctx.translate(0, args.distance);
	};

	var drawForward = function(args) {
			args.ctx.beginPath();
			args.ctx.moveTo(0, 0);
			args.ctx.lineTo(0, args.distance);
			args.ctx.stroke();
			goForward(args);
	};
	
	return {
		// Turn right
		'+': function(args) { args.ctx.rotate(vary( args.angle, args.angle * args.angleVariance)); },
		// Turn left
		'-': function(args) { args.ctx.rotate(vary(-args.angle, args.angle * args.angleVariance)); },
		// Push
		'[': function(args) { args.ctx.save(); args.depth++; },
		// Pop
		']': function(args) { args.ctx.restore(); args.depth--; },
		// Draw forward by length computed by recursion depth
		'|': function(args) { args.distance /= Math.pow(2.0, args.depth); drawForward() },
		'F': drawForward,
		'A': drawForward,
		'B': drawForward,
		'G': goForward
	};
}


function drawLSystem(args, handler) {
	if (!handler) {
		handler = getDefaultLSystemHandler();
	}
	args.depth = 0;
	for(var i=0 ; i<args.str.length ; ++i) {
		var c = args.str.charAt(i);
		if (handler[c]) {
			handler[c](args);
		}
	}
}