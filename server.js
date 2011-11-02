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
var map = {}; //mapping for game and controllers

io.sockets.on('connection', function (socket) {
	
	socket.emit('connected');
	
	socket.on('new game', function(stamp) {
		socket.set('stamp', stamp, function(){
			games[stamp] = socket.id;
			console.log('new game connection: '+stamp);
		});
		socket.set('type', 'game');
	});
	
	socket.on('new controller', function(stamp){
		socket.set('type', 'controller');
		var id = games[stamp];
		if (id) {
			console.log('new controller connection: '+stamp);
			socket.emit('connected to game');
			socket.set('type', 'controller')
			map[socket.id] = id;
			io.sockets.socket(id).emit('controller connected');
		} else {
			socket.emit('no game');
		}
	});
	
	socket.on('update', function(data) {
		var id = map[socket.id];
		io.sockets.socket(id).emit('update', data);
	});
	
	socket.on('disconnect', function(){
		socket.get('type', function (err, type){
			if (type == 'game') {
				socket.get('stamp', function(err, stamp){
					games[stamp] = null;
					console.log('game connection '+socket.id+' closed.');
				});
			} else if (type == 'controller') {
				map[socket.id] = null;
				console.log('controller connection '+socket.id+' closed.')
			}
		});
	});
});