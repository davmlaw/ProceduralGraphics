var width = window.innerWidth;
var height = window.innerHeight;
var ctx;
var background;

function setup() {
	createBackground();

	var canvas = newCanvas(width, height);
	document.getElementById("canvas").appendChild(canvas);
 	ctx = canvas.getContext("2d");

}

function createBackground() {
	background = newCanvas(width, height);
	var bgCtx = new CanvasWrapper(background.getContext("2d"));
	bgCtx.fillStyle = "#FFFFFF";
	bgCtx.fillRect(0,0, width, height);
	//drawMain(bgCtx);
}

