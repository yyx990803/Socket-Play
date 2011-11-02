require(
    [
        "utils/stats",
		"utils/anim",
		"libs/three",
		"libs/tween",
		"libs/jquery"
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
			var stamp = new Date().getTime();
			stamp %= 100000000;
		    socket.on('connected', function() {
				var i = document.getElementById('gameid');
				i.innerHTML = stamp;
		    	socket.emit('new game', stamp);
		    });
			socket.on('controller connected', function(){
				$('#status').html('Controller Connected');
			});
		    socket.on('update', function(data){
				update(data.x, data.y, data.z);
		    });
		};
		
		function update(x,y,z) {
			y = 0;
			new TWEEN.Tween( cube.rotation ).to({
				x : x / RATIO,
				y : y / RATIO,
				z : z / RATIO
			}, 200).start();	
		}
		
		/*
		document.addEventListener( 'mousedown', onDocumentMouseDown, false );
		function onDocumentMouseDown(e) {
			e.preventDefault();
			
			new TWEEN.Tween( cube.position ).to({
				x: Math.random() * 200 - 100,
				y: Math.random() * 200 - 100,
				z: Math.random() * 200 - 100 }, 2000 )
			.easing(TWEEN.Easing.Elastic.EaseOut).start();
			
			new TWEEN.Tween( cube.rotation ).to( {
				x: ( Math.random() * 360 ) * Math.PI / 180,
				y: ( Math.random() * 360 ) * Math.PI / 180,
				z: ( Math.random() * 360 ) * Math.PI / 180 }, 2000 )
			.easing(TWEEN.Easing.Elastic.EaseOut).start();
		}
		*/
    }
);