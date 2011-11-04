define(
	[
		"classes/AbstractObject"
	],
	function(AbstractObject){
		function Player() {
			
		}
		Player.prototype = new AbstractObject();
		return Player;
	}
);