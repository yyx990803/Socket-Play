var express = require('express'),
	controllers = require('./controllers'),
	io = require('socket.io');

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.compiler({ src: __dirname + '/public', enable: ['less'] }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Routes

app.get('/', controllers.index);
app.get('/c', controllers.controller);

io = io.listen(app);
app.listen(8888);

var games = {}; //holder for game connections
var controllers = {}; //holder for controller connections

io.sockets.on('connection', function (socket) {
	
	socket.emit('connected');
	
	socket.on('new game', function(stamp) {
		socket.set('stamp', stamp, function(){
			games['n'+stamp] = true;
			socket.join(stamp);
			console.log('new game connection: '+stamp);
		});
		socket.set('type', 'game');
	});
	
	socket.on('new controller', function(stamp){
		socket.set('type', 'controller');
		if (games['n'+stamp] == true) {
			socket.set('stamp', stamp, function(){
				controllers['n'+stamp] = true;
				console.log('new controller connection: '+stamp);
				socket.emit('connected to game');
				socket.broadcast.to(stamp).emit('controller connected');
			});
		} else {
			socket.emit('no game');
		}
	});
	
	socket.on('controller update', function(data) {
		socket.broadcast.to(data.stamp).emit('controller update', data.orientation);
	});
	
	socket.on('disconnect', function(){
		socket.get('stamp', function(err, stamp){
			socket.get('type', function (err, type){
				if (type == 'game') {
					games['n'+stamp] = null;
					console.log('game connection '+stamp+' closed.');
				} else if (type == 'controller') {
					if (controllers['n'+stamp] == true) {
						controllers['n'+stamp] = null;
						console.log('controller connection '+stamp+' closed.');
					}
				}
			});
		});
	});
});