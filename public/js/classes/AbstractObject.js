define(function(){
	function AbstractObject(x, y, z, maxVel) {
		this.pos = {
			x: x || 0,
			y: y || 0,
			z: z || 0
		};
		this.vel = {
			x: 0,
			y: 0,
			z: 0
		};
	}
	AbstractObject.prototype.setBounds = function(w, h){
		this.bounds = {};
		this.bounds.top = h/2;
		this.bounds.left = -w/2;
		this.bounds.right = w/2;
		this.bounds.bottom = -h/2;
	};
	AbstractObject.prototype.update = function(){
		this.pos.x += this.vel.x;
		this.pos.y += this.vel.y;
		this.pos.z += this.vel.z;
		if (this.bounds) {
			if (this.pos.y > this.bounds.top) {
				this.pos.y = this.bounds.top;
			}
			if (this.pos.x > this.bounds.right) {
				this.pos.x = this.bounds.right;
			}
			if (this.pos.y < this.bounds.bottom) {
				this.pos.y = this.bounds.bottom;
			}
			if (this.pos.x < this.bounds.left) {
				this.pos.x = this.bounds.left;
			}
		}
	};
	return AbstractObject;
});