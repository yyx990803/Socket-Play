var socket = io.connect();

socket.on('new connection', function(){
	askForID();
});

socket.on('game closed', function(){
	$('#status').html('Game Closed.');
});

function askForID() {
	var stamp = prompt("Enter the game id:");
	socket.emit('new controller', stamp, function(success){
		if (success) {
			start();
		} else {
			askForID();
		}
	});
}

function start() {
	$('#status').html('Connected');
	window.addEventListener('deviceorientation', function(data){
		socket.emit('update', {
			x: data.beta,
			y: data.alpha,
			z: -data.gamma
		});
		$('#info').html(data.beta+'<br/>'+data.alpha+'<br/>'+data.gamma);
	}, false);
}