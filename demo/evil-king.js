"use strict"; // good practice - see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode
////////////////////////////////////////////////////////////////////////////////
// Basic robot arm: forearm and upper arm
////////////////////////////////////////////////////////////////////////////////

/*global THREE, Coordinates, $, document, window, dat*/

var camera, scene, renderer;
var cameraControls, effectController;
var clock = new THREE.Clock();
var gridX = true;
var gridY = false;
var gridZ = false;
var axes = true;
var ground = true;

function fillScene() {
	scene = new THREE.Scene();
	// scene.fog = new THREE.Fog( 0x808080, 2000, 4000 );

	// LIGHTS
	var ambientLight = new THREE.AmbientLight( 0x222222 );

	var light = new THREE.DirectionalLight( 0xFFFFFF, 1.0 );
	light.position.set( 200, 400, 500 );
	
	var light2 = new THREE.DirectionalLight( 0xFFFFFF, 1.0 );
	light2.position.set( -500, 250, -200 );

	scene.add(ambientLight);
	scene.add(light);
	scene.add(light2);

	function drawGround(params) {
		params = params || {};
		var size = params.size !== undefined ? params.size:100;
		var color = params.color !== undefined ? params.color:0xFFFFFF;
		var ground = new THREE.Mesh(
			new THREE.PlaneGeometry(size, size),
			// When we use a ground plane we use directional lights, so illuminating
			// just the corners is sufficient.
			// Use MeshPhongMaterial if you want to capture per-pixel lighting:
			// new THREE.MeshPhongMaterial({ color: color, specular: 0x000000,
			new THREE.MeshLambertMaterial({ color: color,
				// polygonOffset moves the plane back from the eye a bit, so that the lines on top of
				// the grid do not have z-fighting with the grid:
				// Factor == 1 moves it back relative to the slope (more on-edge means move back farther)
				// Units == 4 is a fixed amount to move back, and 4 is usually a good value
				polygonOffset: true, polygonOffsetFactor: 1.0, polygonOffsetUnits: 4.0
			}));
		ground.rotation.x = - Math.PI / 2;
		ground.rotation.y = - 30 * Math.PI / 180;
		ground.position.y = 90;
		scene.add(ground);
	}

	if (ground) {
		drawGround({size: 10000, color: 0xCC7C32});
	}
	if (gridX) {
		Coordinates.drawGrid({size:10000,scale:0.01});
	}
	if (gridY) {
		Coordinates.drawGrid({size:10000,scale:0.01, orientation:"y"});
	}
	if (gridZ) {
		Coordinates.drawGrid({size:10000,scale:0.01, orientation:"z"});	
	}
	if (axes) {
		Coordinates.drawAllAxes({axisLength:200,axisRadius:1,axisTess:50});
	}
	
}





function init() {
	var canvasWidth = window.innerWidth;
	var canvasHeight = window.innerHeight;
	var canvasRatio = canvasWidth / canvasHeight;

	// RENDERER
	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.gammaInput = true;
	renderer.gammaOutput = true;
	renderer.setSize(canvasWidth, canvasHeight);
	renderer.setClearColor( new THREE.Color(0xAAAAAA), 1.0 );

	var container = document.getElementById('container');
	container.appendChild( renderer.domElement );

	// CAMERA
	camera = new THREE.PerspectiveCamera( 30, canvasRatio, 1, 10000 );
	camera.position.set( -510, 240, 100 );
	// CONTROLS
	cameraControls = new THREE.OrbitAndPanControls(camera, renderer.domElement);
	cameraControls.target.set(0,100,0);
	
	fillScene();

}

function animate() {
	window.requestAnimationFrame(animate);
	render();
}

function render() {
	var delta = clock.getDelta();
	cameraControls.update(delta);

	if ( effectController.newGridX !== gridX || effectController.newGridY !== gridY || effectController.newGridZ !== gridZ || effectController.newGround !== ground || effectController.newAxes !== axes)
	{
		gridX = effectController.newGridX;
		gridY = effectController.newGridY;
		gridZ = effectController.newGridZ;
		ground = effectController.newGround;
		axes = effectController.newAxes;

		fillScene();
	}
	
	renderer.render(scene, camera);
}



function setupGui() {

	effectController = {

		newGridX: gridX,
		newGridY: gridY,
		newGridZ: gridZ,
		newGround: ground,
		newAxes: axes,
		
		uy: 70.0,
		uz: -15.0,

		fy: 10.0,
		fz: 60.0
	};

	var gui = new dat.GUI();
	var h = gui.addFolder("Grid display");
	h.add( effectController, "newGridX").name("Show XZ grid");
	h.add( effectController, "newGridY" ).name("Show YZ grid");
	h.add( effectController, "newGridZ" ).name("Show XY grid");
	h.add( effectController, "newGround" ).name("Show ground");
	h.add( effectController, "newAxes" ).name("Show axes");
	h = gui.addFolder("Arm angles");
	h.add(effectController, "uy", -180.0, 180.0, 0.025).name("Upper arm y");
	h.add(effectController, "uz", -45.0, 45.0, 0.025).name("Upper arm z");
	h.add(effectController, "fy", -180.0, 180.0, 0.025).name("Forearm y");
	h.add(effectController, "fz", -120.0, 120.0, 0.025).name("Forearm z");
}

function takeScreenshot() {
	effectController.newGround = true;
	effectController.newGridX = false;
	effectController.newGridY = false;
	effectController.newGridZ = false;
	effectController.newAxes = false;
	init();
	render();
	var img1 = renderer.domElement.toDataURL("image/png");
	camera.position.set( 400, 500, -800 );
	render();
	var img2 = renderer.domElement.toDataURL("image/png");
	var imgTarget = window.open('', 'For grading script');
	imgTarget.document.write('<img src="'+img1+'"/><img src="'+img2+'"/>');
}

init();
setupGui();
animate();
$("body").keydown(function(event) {
	if (event.which === 80) {
		takeScreenshot();
	}
});