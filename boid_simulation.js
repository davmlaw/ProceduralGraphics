function BoidSimulation(numBoids, initialRuns) {
	this.boids = [];
	this.maxVelocity = 6;
	for(var i = 0; i < numBoids; i++) {
		this.boids.push(new Boid(rand(width), rand(height), 5, this.maxVelocity));
	}
	this.update = function() {
		for(var i = 0; i < this.boids.length; i++) {
			this.boids[i].moveWith(this.boids, 300);
			this.boids[i].moveCloser(this.boids, 300);					
			this.boids[i].moveAway(this.boids, 15);	
		}
		
		for(var i = 0; i < this.boids.length; i++) {
			this.boids[i].move();
			this.boids[i].constrain(width, height);
		}
	};
	if (initialRuns) {
		for(var i = 0; i < initialRuns; i++) {
			this.update();
		}
	}
}