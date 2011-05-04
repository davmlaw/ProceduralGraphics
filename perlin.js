// Based on code by iron_wallaby posted at http://www.ozoneasylum.com/30982
function perlin_noise (canvas, colorFunc) {
  var canvas_ctx = canvas.getContext ("2d");
  var saved_alpha = canvas_ctx.globalAlpha;
  var offscreen = newCanvas(canvas.width, canvas.height);
  var offscreen_ctx = offscreen.getContext ("2d");
  var offscreen_id = offscreen_ctx.getImageData (0, 0,
                                                 offscreen.width,
                                                 offscreen.height);
  var offscreen_pixels = offscreen_id.data;
  for (var i = 0; i < offscreen_pixels.length; i += 4) {
		var rgba = colorFunc();
    offscreen_pixels[i    ] = rgba[0];
    offscreen_pixels[i + 1] = rgba[1];
    offscreen_pixels[i + 2] = rgba[2];
    offscreen_pixels[i + 3] = rgba[3];
  }

  offscreen_ctx.putImageData (offscreen_id, 0, 0);

  /* Scale random iterations onto the canvas to generate Perlin noise. */
  for (var size = 4; size <= offscreen.width; size *= 2) {
    var x = irand(offscreen.width - size);

		var verticalSize = Math.min(size,offscreen.height);
    var y = irand(offscreen.height - verticalSize);

    canvas_ctx.globalAlpha = 4.0 / size;
    canvas_ctx.drawImage (offscreen, x, y, size, verticalSize,
                                     0, 0, canvas.width, canvas.height);
  }
  canvas_ctx.globalAlpha = saved_alpha;
}

function generate_explosion(canvas, colorFunc) {
  var canvas_ctx = canvas.getContext ("2d");
  var saved_alpha = canvas_ctx.globalAlpha;
  var offscreen = newCanvas(canvas.width, canvas.height);
  var offscreen_ctx = offscreen.getContext ("2d");
  var offscreen_id = offscreen_ctx.getImageData (0, 0,
                                                 offscreen.width,
                                                 offscreen.height);
  var offscreen_pixels = offscreen_id.data;
  for (var i = 0; i < offscreen_pixels.length; i += 4) {
	var rgba = colorFunc();
    offscreen_pixels[i    ] = rgba[0];
    offscreen_pixels[i + 1] = rgba[1];
    offscreen_pixels[i + 2] = rgba[2];
    offscreen_pixels[i + 3] = rgba[3];
  }

  offscreen_ctx.putImageData (offscreen_id, 0, 0);

	var num = 5;
	var size = 8;
	var radius = Math.min(canvas.width, canvas.height)/2 - size;
	console.log('radius = ' + radius);

	for (var i=0 ; i<num ; ++i) {
		var dist = rand(radius) - rand(radius); // 2 to get Gaussian dist around centre
		var dir = rand(Math.PI * 2);
		var x = canvas.width/2 + Math.sin(dir) * dist;
		var y = canvas.height/2 - Math.cos(dir) * dist;
		if (x < 0 || y < 0) {
			console.log('too low: ' + x + ',' + y);
		} else if (x > canvas.width - size || y > canvas.height - size) {
			console.log('too high!: ' + x + ',' + y);		
		}
		
//		canvas_ctx.globalAlpha = 4.0 / radius;
//		var verticalSize = Math.min(size,offscreen.height);
		canvas_ctx.drawImage (offscreen, x, y, size, size,
								0, 0, canvas.width, canvas.height);
	}
	canvas_ctx.globalAlpha = saved_alpha;
}
