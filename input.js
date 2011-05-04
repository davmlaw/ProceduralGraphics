function setupInput() {
	if (!document.addEventListener && document.attachEvent) {
		// IE
		document.attachEvent('onkeydown', handleKeyDown)
		document.attachEvent('onkeypress', handleKeyPress)
		document.attachEvent('onkeyup', handleKeyUp)
	} else {
		window.addEventListener('keydown', handleKeyDown, true)
		window.addEventListener('keypress', handleKeyPress, true)
		window.addEventListener('keyup', handleKeyUp, true)
	}
}

function handleKeyPress(event)
{
	return stopPropagation(event.charCode, event);
}

function handleKeyDown(event)
{
	if (event.keyCode == 32) // space
		key_fire = true;
	else if (event.keyCode == 37) // left
		key_left = true;
	else if (event.keyCode == 39) // right
		key_right = true;

	return stopPropagation(event.keyCode, event);
}

function handleKeyUp(event)
{
	if (event.keyCode == 32) // space
		key_fire = false;
	else if (event.keyCode == 37) // left
		key_left = false;
	else if (event.keyCode == 39) // right
		key_right = false;

	return stopPropagation(event.keyCode, event);
}

function stopPropagation(keyCode, event) {
	if (keyCode == 32 || keyCode == 37 || keyCode == 39) {
		if (event.preventDefault) event.preventDefault();
		if (event.stopPropagation) event.stopPropagation();
		return false;
	}
}
