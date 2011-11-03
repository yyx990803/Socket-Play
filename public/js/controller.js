var socket = io.connect();
var orientation = {
	x: 0,
	y: 0,
	z: 0
};

socket.on('new connection', function(){
	askForID();
});

socket.on('game closed', function(){
	$('#status').html('Game Closed.');
	window.removeEventListener('deviceorientation', sendUpdate, false);
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
	window.addEventListener('deviceorientation', sendUpdate, false);
}

function sendUpdate(data){
	orientation.x = data.beta.toFixed(3);
	orientation.y = data.alpha ? data.alpha.toFixed(3) : 0;
	orientation.z = -data.gamma.toFixed(3);
	socket.emit('update', orientation);
}