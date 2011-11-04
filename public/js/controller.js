var socket = io.connect(),
	connected = false,
	paused = false;

socket.on('new connection', function(){
	askForID();
});

socket.on('game closed', function(){
	$('#status').html('Game Closed.');
	connected = false;
});

socket.on('game paused', function(){
	paused = true;
});

socket.on('game resumed', function(){
	paused = false;
});

function askForID() {
	var stamp = prompt("Enter the game id:");
	if (stamp != '' && stamp != null) {
		socket.emit('new controller', stamp, function(success){
			if (success) {
				start();
			} else {
				askForID();
			}
		});
	}
}

function start() {
	connected = true;
	$('#status').html('Connected');
	window.addEventListener('deviceorientation', function(data){
		if (connected && !paused) {
			socket.emit('update', {
				//x and z axis are swapped here becaues the device is held in landscape orientation
				x: -data.gamma.toFixed(3),
				//y: data.alpha,
				z: -data.beta.toFixed(3)
			});
			//$('#info').html(data.beta+'<br/>'+data.alpha+'<br/>'+data.gamma);
		}
	}, false);
}