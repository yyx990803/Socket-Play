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
	orientation.x = data.beta;
	orientation.y = data.alpha ? data.alpha : 0;
	orientation.z = -data.gamma;
	socket.emit('update', orientation);
}