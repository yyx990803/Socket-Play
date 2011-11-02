var socket = io.connect();

socket.on('connected', function(){
	
	init();
	var stamp;
	
	socket.on('no game', function(){
		init();
	});
	
	socket.on('connected to game', function(){
		$('#status').html('Connected');
		startUpdates();
	});
	
	function init() {
		stamp = prompt("Enter the game id:");
		socket.emit('new controller', stamp);
	}
	
	function startUpdates() {
		
		var orientation = {
			x: 0,
			y: 0,
			z: 0
		};
		
		window.addEventListener('deviceorientation', function(data){
			orientation.x = data.beta.toFixed(3);
			orientation.y = data.alpha.toFixed(3);
			orientation.z = -data.gamma.toFixed(3);
			socket.emit('controller update', {
				stamp: stamp,
				orientation: orientation
			});
		}, false);
		
		//pulse();
		
		function pulse() {
			socket.emit('controller update', {
				stamp: stamp,
				data: {
					orientation: orientation
				}
			});
			setTimeout(pulse, 10);
		}
		
	}
});