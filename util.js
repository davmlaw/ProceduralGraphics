/*
 * From http://www.karlbunyan.co.uk/2008/12/repeatable-random-numbers-in-javascript.aspx
 * As despite seeding Math.random(), it doesn't return the same sequence each time!
 */
var Random = 
{
 seed : 12345,
 //Returns a random number between 0 and 1
 next : function(lower,upper)
 {
  var maxi = Math.pow(2,32);
  this.seed = (134775813 * (this.seed + 1))
     % maxi;
  var num = (this.seed) / maxi;
  if(typeof lower!='undefined')
  {
   var range = upper - lower;
   num *= range;
   num += lower;
  }
  return num;
 }
}

function irand(x) {
	return Math.floor( Math.random() * x );
}

function rand(x) {
	return Math.random() * x;
}

// pass in a fraction like .8
function odds(x) {
	return x >= rand(1.0);	
}

function vary(x, variance) {
	return x + variance - 2 * rand(variance);
}

function varyUp(x, variance) {
	return x + rand(variance);
}

function either(a,b) {
	return Math.random() < 0.5? a : b;
}

function randomPick(array) {
	return array[irand(array.length)];
}

/// 

function deepCopy(obj) {
	if (Object.prototype.toString.call(obj) == '[object Array]') {
		var out = [], i = 0, len = obj.length;
		for ( ; i < len ; ++i) {
			out[i] = arguments.callee(obj[i]);
		}
		return out;
	}
	if (typeof obj == 'object') {
		var out = [], i;
		for (i in obj) {
			out[i] = arguments.callee(obj[i]);
		}
		return out;
	}
	return obj;
}


function setObjectFromMap(obj, map) {
	for (i in map) {
		obj[i] = map[i];
	}
}

function distance(x,y,x1,y1) {
    var distX = x1 - x;
	var distY = y1 - y;
	return Math.sqrt(distX * distX + distY * distY);
}