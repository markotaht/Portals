//Muutujad, mingit hetk tuleb üle vaadata
var renderer, scene, camera, port1_scene, port2_scene;
var raycasterCam = new THREE.Raycaster();
var raycaster = new THREE.Raycaster();
var center = new THREE.Vector2();
var intersects;

var port1, port2, port1_1,port2_1;

var lightPosition;
var light;
var lightTrajectory;
var plight;

var port1_cam;
var port1_quad;

var port2_cam;
var port2_quad;

var PORT_SCALE_MAX = 5.0;
var PORT_SCALE_MIN = 0.5;

var viewerPosition = new THREE.Vector3(0.0, 0.0, 45.0);

var clock = new THREE.Clock();
var keyboard = new THREEx.KeyboardState();		


var wallPos = 50; // seina kaugus 0punktist
var atWall = false;
var quadSideLength = 10; // portaali quadi küljepikkus

var speed = 1;

var hangar;
// raycasteri jaoks
var rays = [
      new THREE.Vector3(0, 0, 1),
      new THREE.Vector3(1, 0, 1),
      new THREE.Vector3(1, 0, 0),
      new THREE.Vector3(1, 0, -1),
      new THREE.Vector3(0, 0, -1),
      new THREE.Vector3(-1, 0, -1),
      new THREE.Vector3(-1, 0, 0),
      new THREE.Vector3(-1, 0, 1)
    ];
var liikumisVektor = new THREE.Vector3();

var portal1, portal2;
var teleportTime = 0;

function onLoad() { 
	var canvasContainer = document.getElementById('myCanvasContainer'); 
	var width  = 800; 
	var height = 500;
	
	renderer = new THREE.WebGLRenderer({stencil: true}); 
	renderer.setSize(width, height);
	canvasContainer.appendChild(renderer.domElement);
	renderer.autoClear = false;
	
	scene = new THREE.Scene();
	port1_scene = new THREE.Scene();
	port2_scene = new THREE.Scene();
	
	camera = new THREE.PerspectiveCamera(80, width / height, 1, 1000);
	camera.position.set(viewerPosition.x, viewerPosition.y, viewerPosition.z);
	camera.up = new THREE.Vector3(0, 0, -1);
	camera.lookAt(new THREE.Vector3(0,0,0));
	
	//Valguse liikumine
	lightTrajectory = new THREE.CatmullRomCurve3([
		new THREE.Vector3(-20, 8, 8 ),
		new THREE.Vector3(-13, 23, -8 ),
		new THREE.Vector3( 12, 20, -20 ),
		new THREE.Vector3( 8, 13, 20 ),
	]);
	lightTrajectory.closed = true;
	light = new THREE.Vector3();
	
	//Light so that walls with phong material could be seen
	//TODO: combine with our light
	plight = new THREE.PointLight( 0xffffff, 1, 1000 );
	plight.position.set(10, 1, 15);
	scene.add(plight);
	
	//Objektide loomine ja stseenidesse paigutamine
	hangar = addHangar(scene);
	
	port1 = new THREE.WebGLRenderTarget(width, height, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter});
	port2 = new THREE.WebGLRenderTarget(width, height, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter});
	port1_1 = new THREE.WebGLRenderTarget(width, height, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter});
	port2_1 = new THREE.WebGLRenderTarget(width, height, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter});
	
	port1_quad = addQuad(port1.texture, -wallPos+0.005,-5,0.005, Math.PI/2);
	port2_quad = addQuad(port2.texture, wallPos- 0.005, -5,0.005,-Math.PI/2);
	port1_quad.name = "portal1";
	port2_quad.name = "portal2";
	port1_scene.add(port1_quad);
	port2_scene.add(port2_quad);
	
	createObjects(scene);
	
	portal1 = new Portal(-wallPos+0.005,-5,0.005, Math.PI/2);
	portal2 = portal1.createBoundPortal( wallPos- 0.005, -5,0.005,-Math.PI/2);
	
	//textures
	var loader = new THREE.TextureLoader();
	loader.setCrossOrigin('Anonymous'); //This is needed because we are fetching files from another "server".
										//Local files do not work unless you have a web server running.
	loader.setPath('http://cglearn.codelight.eu/files/course/7/textures/');

	loader.load('wallTexture.jpg', function(tex){onTextureLoaded(tex,"wall")});
	loader.load('ut256.png', function(tex){onTextureLoaded(tex,"ut")});
	loader.load('wallTexture2.jpg', function(tex){onTextureLoaded(tex,"wall2")});
	loader.load('stripeTexture.png', function(tex){onTextureLoaded(tex,"stripe")});
	loader.load('sasuke256.png', function(tex){onTextureLoaded(tex,"sasuke")});
}


function toRad(degree) {

	return Math.PI * 2 * degree / 360;
}
function checkCameraPosition() {
	if (camera.position.x >= wallPos)
		camera.position.x -= 0.2;
	else if (camera.position.x <= -wallPos)
		camera.position.x += 0.2;
	if (camera.position.z >= wallPos)
		camera.position.z -= 0.2;
	else if (camera.position.z <= -wallPos)
		camera.position.z += 0.2;
}		
function parseControls(dt) {
	if(keyboard.pressed("left")){
		camera.rotation.y += toRad(120 * speed/4 * dt % 360);
	}
	if(keyboard.pressed("right")){
		camera.rotation.y -= toRad(120 * speed/3 * dt % 360);
	}
	if(keyboard.pressed("up")) {
		if(port1_quad.scale.x < PORT_SCALE_MAX) {
			port1_quad.scale.x += 0.1;
			port1_quad.scale.y += 0.1;
			port2_quad.scale.x += 0.1;
			port2_quad.scale.y += 0.1;
		}
	}
	if(keyboard.pressed("down")) {
		if(port1_quad.scale.x > PORT_SCALE_MIN){
			port1_quad.scale.x -= 0.1;
			port1_quad.scale.y -= 0.1;
			port2_quad.scale.x -= 0.1;
			port2_quad.scale.y -= 0.1;
		}
	}
	var oldPos = new THREE.Vector3().copy(camera.position);
	var camPosCheck = camera.position.x < wallPos && camera.position.x > -wallPos && camera.position.z < wallPos && camera.position.z > -wallPos;
	if(keyboard.pressed("w")){ // W edasi
		if(camPosCheck){
			
			camera.translateZ(-10 * speed * dt % 360);
			liikumisVektor.subVectors(camera.position, oldPos).normalize(); 
		}
		checkCameraPosition();			
	}
	if(keyboard.pressed("s")){ // S tagasi
		if(camPosCheck){
			camera.translateZ(10 * speed * dt % 360);
			liikumisVektor.subVectors(camera.position, oldPos).normalize() 
		}
		checkCameraPosition();
	}
	if(keyboard.pressed("a")){ // A liigutab vasakule
		if(camPosCheck){
			camera.translateX(-10 * speed * dt % 360);
			liikumisVektor.subVectors(camera.position, oldPos).normalize() 
		}
		checkCameraPosition();
	}
	if(keyboard.pressed("d")){ // D liigutab paremale
		if(camPosCheck){
			camera.translateX(10 * speed * dt % 360);
			liikumisVektor.subVectors(camera.position, oldPos).normalize() 
		}
		checkCameraPosition();
	}
	if(keyboard.pressed("q")){ // Q liigutab y +
		if (camera.position.y > -wallPos) {
			camera.position.y -= 10 * speed * dt % 360;
			liikumisVektor.set(0,1,0);
		}
	}
	if(keyboard.pressed("e")){ // E liigutab y -
		if (camera.position.y < wallPos) {
			camera.position.y += 10 * speed * dt % 360;
			liikumisVektor.set(0,-1,0);
		}		
	}
	if(keyboard.pressed("shift")) {
		if (speed < 4)
			speed += 0.2;
	}
	if(keyboard.pressed("z")){ // z tekitab P1
		var i = intersects[0];
		port1_quad.position.set(i.point.x, i.point.y, i.point.z);
		port1_quad.translateZ(0.15);
		if (i.object.name.indexOf("Wall") != -1) {
			port1_quad.rotation.set(i.object.rotation.x, i.object.rotation.y, i.object.rotation.z);
		}
		else {			
			var Yaxis = new THREE.Vector3(0,1,0);
			var pos = new THREE.Vector3();
			pos.addVectors(intersects[0].face.normal, intersects[0].point);
			port1_quad.lookAt(pos);
		}
	}
	if(keyboard.pressed("x")){ // x tekitab P2
		var i = intersects[0];
		port2_quad.position.set(i.point.x, i.point.y, i.point.z);
		port2_quad.translateZ(0.15);
		console.log(i.object.name);
		if (i.object.name.indexOf("Wall") != -1) {
			port2_quad.rotation.set(i.object.rotation.x, i.object.rotation.y, i.object.rotation.z);
		}
		else {			
			var Yaxis = new THREE.Vector3(0,1,0);
			var pos = new THREE.Vector3();
			pos.addVectors(intersects[0].face.normal, intersects[0].point);
			port2_quad.lookAt(pos);
		}
	}
}