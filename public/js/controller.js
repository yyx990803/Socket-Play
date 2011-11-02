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
		
		var or = {
			x: 0,
			y: 0,
			z: 0
		};
		
		window.addEventListener('deviceorientation', function(data){
			or.x = data.beta;
			or.y = data.alpha;
			or.z = -data.gamma;
			update();
		}, false);
		
		function update() {
			socket.emit('update', {stamp:stamp, orientation:or});
		}
		
	}
});