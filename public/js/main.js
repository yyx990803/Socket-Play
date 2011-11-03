require(
    [
        "utils/stats",
		"utils/anim",
		"libs/three",
		"libs/tween"
    ],
    function(setupStats, setupAnimation, THREE, TWEEN) {
	
		setupStats();
		setupAnimation();
		
		var WIDTH = 400,
			HEIGHT = 300,
			VIEW_ANGLE = 45,
			ASPECT = WIDTH / HEIGHT,
			NEAR = 0.1,
			FAR = 10000,
			RATIO = 180/Math.PI;
			
		var	container = document.getElementById('content'),
			renderer = new THREE.WebGLRenderer(),
			camera = new THREE.Camera(VIEW_ANGLE,ASPECT,NEAR,FAR),
			scene = new THREE.Scene();
			
		camera.position.z = 300;
		renderer.setSize(WIDTH, HEIGHT);
		container.appendChild(renderer.domElement);
		
		var material = new THREE.MeshLambertMaterial({color:0xCC0000});
		var cube = new THREE.Mesh(new THREE.Cube(100, 100 ,100), material);
		var pointLight = new THREE.PointLight( 0xFFFFFF );
		pointLight.position.x = 10;
		pointLight.position.y = 50;
		pointLight.position.z = 130;
		
		scene.addChild(cube);
		scene.addLight(pointLight);
		
		(function animate() {
			TWEEN.update();
			renderer.render(scene, camera);
			requestAnimationFrame(animate);
		}) ();
		
		window.onload = function() {
			
		    var socket = io.connect();
			
		    socket.on('new connection', function() {
		    	socket.emit('new game', function(id){
					$('#gameid').html(id);
				});
		    });
		
			socket.on('controller connected', function(){
				$('#status').html('Controller Connected');
			});
			
			socket.on('controller closed', function(){
				$('#status').html('Controller Disconnected');
			});
			
		    socket.on('update', function(data){
				count++;
				update(data.x, data.y, data.z);
		    });
		};
		
		var count = 0;
		var i = document.getElementById('ups');
		watch();
		function watch() {
			i.innerHTML = count;
			count = 0;
			setTimeout(watch, 1000);
		}
		
		function update(x,y,z) {
			y = 0;
			new TWEEN.Tween( cube.rotation ).to({
				x : x / RATIO,
				y : y / RATIO,
				z : z / RATIO
			}, 200).start();	
		}

    }
);