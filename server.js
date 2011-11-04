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

//Socket Server Logic
var match = {}; //temp holder for establishing connections between games and controllers
var activeGame = 0;

io.sockets.on('connection', function (socket) {
	
	socket.emit('new connection');
	
	/* 
	 * New game connection
	 */
	socket.on('new game', function(returnID) {
		
		console.log('new game connection on: '+ socket.id);
		var stamp = getNewStamp();
		returnID(stamp);
		match[stamp] = socket.id;
		activeGame ++;
		socket.set('type', 'game');
		socket.set('stamp', stamp);
		
	});
	
	/* 
	 * New controller connection
	 */
	socket.on('new controller', function(stamp, returnConnection){
		
		console.log('new controller connection on: '+ socket.id);
		var gameid = match[stamp];
		if (gameid) {
			
			socket.set('game', gameid);
			socket.set('type', 'controller');
			
			var game = io.sockets.socket(gameid);
			game.set('controller', socket.id);
			game.emit('controller connected');
			
			console.log('Paired up: game ' + gameid + ' / controller ' + socket.id);
			
			returnConnection(true);
		} else {
			returnConnection(false);
		}
		
	});
	
	/* 
	 * Receiving controller updates
	 */
	socket.on('update', function(data) {
		socket.get('game', function(err, gid){
			if (!err) {
				io.sockets.socket(gid).emit('update', data);
			}
		});
	});
	
	/* 
	 * Receiving game state changes
	 */
	socket.on('pause', function(){
		socket.get('type', function(err, type){
			if (type == 'game') {
				socket.get('controller', function(err, cid){
					if (cid) {
						io.sockets.socket(cid).emit('game paused');
					}
				});
			} else {
				socket.get('game', function(err, gid){
					if (gid) {
						io.sockets.socket(gid).emit('controller paused');
					}
				});
			}
		});
	});
	
	socket.on('resume', function(){
		socket.get('type', function(err, type){
			if (type == 'game') {
				socket.get('controller', function(err, cid){
					if (cid) {
						io.sockets.socket(cid).emit('game resumed');
					}
				});
			} else {
				socket.get('game', function(err, gid){
					if (gid) {
						io.sockets.socket(gid).emit('controller resumed');
					}
				});
			}
		});
	});
	
	/* 
	 * Disconnects
	 */
	socket.on('disconnect', function(){
		socket.get('type', function (err, type){
			if (type == 'game') {
				socket.get('stamp', function(err, stamp){
					if (stamp) {
						match[stamp] = null;
						activeGame --;
						if (activeGame == 0) match = {};
					}
				});
				socket.get('controller', function(err, cid){
					if (cid) {
						io.sockets.socket(cid).emit('game closed');
					}
				});
				console.log('game connection '+socket.id+' closed.');
			} else if (type == 'controller') {
				socket.get('game', function(err, gid){
					if (gid) {
						io.sockets.socket(gid).emit('controller closed');
					}
				});
				console.log('controller connection '+socket.id+' closed.')
			}
		});
	});
});

function getNewStamp() {
	var s = new Date().getTime();
	return s%100000000;
}