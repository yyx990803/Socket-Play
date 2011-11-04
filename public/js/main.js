require(
    [
        "utils/stats",
		"utils/anim",
		"libs/three",
		"classes/Player"
    ],
    function(useStats, useAnimation, THREE, Player) {
	
		//useStats();
		useAnimation();
		
		var updateCount = 0,
			DEBUG = false;
		if (DEBUG) {
			checkUpdateRate();
			$('#updates').html('<span id="ups"></span> Updates/Sec');
			function checkUpdateRate() {
				$('#ups').text(updateCount);
				updateCount = 0;
				setTimeout(checkUpdateRate, 1000);
			}
		}
		
		var ori = {
			x: 0,
			y: 0,
			z: 0
		};
	    var RATIO = 360/Math.PI;
		var socket,
			connected = false,
			paused = false;
		var camera, scene, renderer;
		var player, Ship;
		var Particles = [];

		init3D();
		initGameLogic();
		animate();
		initSocket();
		handleEvents();

		function init3D() {

			container = document.getElementById('content');

			camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 10000 );
			camera.position.z = 1000;

			scene = new THREE.Scene();
			scene.fog = new THREE.FogExp2( 0x000000, 0.001 );			
			addShip();
			addParticles();

			renderer = new THREE.WebGLRenderer({ clearAlpha: 1 });
			renderer.setSize( window.innerWidth, window.innerHeight );
			renderer.sortObjects = false;

			container.appendChild( renderer.domElement );

		}
		
		function initGameLogic() {
			player = new Player();
			player.setBounds(window.innerWidth*1.4, window.innerHeight*1.4);
		}
		
		function animate() {
			requestAnimationFrame( animate );
			render();
		}
		
		function initSocket() {
			
		    socket = io.connect();
			
		    socket.on('new connection', function() {
		    	socket.emit('new game', function(id){
					$('#gameid').html(id);
				});
		    });
		
			socket.on('controller connected', function(){
				$('#status').html('Controller Connected').css('color','#3f3');
				connected = true;
				var p = $('#how-popup');
				if (paused && p.data('open')=='true') {
					p.fadeOut(function(){
						p.data('open','false');
						paused = false;
					});
				}
			});
			
			socket.on('controller closed', function(){
				$('#status').html('Controller Disconnected').css('color','#f33');
				connected = false;
			});
			
		    socket.on('update', function(data){
				if (DEBUG) updateCount++;
				update(data.x, data.y, data.z);
		    });
		
		};
		
		function update(x,y,z) {
			
			x -= 15; //adjustment for holding habit
			
			ori.x = x / RATIO;
			ori.z = z / RATIO;
			player.vel.x = -z * .5;
			player.vel.y = x * .5;
		}
		
		function render() {
			
			if (connected && !paused) {
				
				player.update();
			
				Ship.rotation.x += (ori.x - Ship.rotation.x) * .05;
				Ship.rotation.z += (ori.z*0.8 - Ship.rotation.z) * .05;
				Ship.rotation.y = Ship.rotation.z * .8;
			
				Ship.position.x += (player.pos.x - Ship.position.x) * .05;
				Ship.position.y += (player.pos.y - Ship.position.y) * .05;
				
			}
			
			for (var i=0; i<3; i++) {
				var p = Particles[i];
				p.position.z += 8;
				if (p.position.z > 2000) p.position.z = -1000;
			}
		
			renderer.render( scene, camera );
		}
		
		function addShip() {
			var size = 60,
				geometry = new THREE.CubeGeometry( 30, 30, 30 );
				material = new THREE.MeshNormalMaterial();
			Ship = new THREE.Object3D();
			for ( var i = 0; i < 3; i ++ ) {
				var mesh = new THREE.Mesh( geometry, material );
				switch(i) {
					case 0:
						mesh.position.z = -size;
						break;
					case 1:
						mesh.position.x = -size*Math.sin(Math.PI/3);
						mesh.position.z = size*Math.cos(Math.PI/3);
						break;
					case 2:
						mesh.position.x = size*Math.sin(Math.PI/3);
						mesh.position.z = size*Math.cos(Math.PI/3);
						break;
					default:
						break;
				}
				mesh.matrixAutoUpdate = false;
				mesh.updateMatrix();
				Ship.add( mesh );
				scene.add( Ship );
			}
		}
		
		function addParticles() {
			
			var material = new THREE.ParticleBasicMaterial({size: 5});
			
			for (var j=0; j < 3; j++) {
				var geometry = new THREE.Geometry();
				for ( var i = 0; i < 500; i++ ) {
					var vector = new THREE.Vector3( Math.random() * 3000 - 1500, Math.random() * 3000 - 1500, Math.random() * -1000 );
					geometry.vertices.push( new THREE.Vertex( vector ) );
				}
				var p = new THREE.ParticleSystem( geometry, material );
				p.position.z = -j*1000+1000;
				Particles.push(p);
				scene.add(p);
			}

		}
		
		function handleEvents() {
			$('#about').click(function(){
				if ($('#about-popup').data('open')!='true') {
					paused = true;
					socket.emit('pause');
					$('.popup:visible').data('open','false').fadeOut();
					$('#about-popup').data('open','true').fadeIn();
				}
			});
			$('#how').click(function(){
				if ($('#how-popup').data('open')!='true') {
					paused = true;
					socket.emit('pause');
					$('.popup:visible').data('open','false').fadeOut();
					$('#how-popup').data('open','true').fadeIn();
				}
			}).trigger('click');
			$('.resume').click(function(){
				var p = $(this.parentNode);
				if (!p.is('.popup')) p = $(this.parentNode.parentNode);
				p.fadeOut(function(){
					p.data('open','false');
					paused = false;
					socket.emit('resume');
				});
			});
		}

    }
);