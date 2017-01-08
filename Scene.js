//Muutujad, mingit hetk tuleb üle vaadata
var renderer, scene, camera;
var raycasterCam = new THREE.Raycaster();
var raycaster = new THREE.Raycaster();
var center = new THREE.Vector2();
var intersects;


var lightPosition;
var light;
var lightTrajectory;
var plight;

var viewerPosition = new THREE.Vector3(0.0, 0.0, 45.0);

var clock = new THREE.Clock();
var keyboard = new THREEx.KeyboardState();		


var wallPos = 50; // seina kaugus 0punktist
var atWall = false;
var quadSideLength = 40; // portaali quadi küljepikkus

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
	
	plight = new THREE.PointLight( 0xffffff, 1, 1000 );
	plight.position.set(10, 1, 15);
	scene.add(plight);
	
	//Objektide loomine ja stseenidesse paigutamine
	hangar = addHangar(scene);
	
	createObjects(scene);
	
	portal1 = new Portal(-wallPos+0.02,-5,0.02, Math.PI/2, "portal1");
	portal2 = portal1.createBoundPortal( wallPos- 0.02, -5,0.02,-Math.PI/2, "portal2");
	
	//textures
	var loader = new THREE.TextureLoader();
	loader.setCrossOrigin('Anonymous'); //This is needed because we are fetching files from another "server".
										//Local files do not work unless you have a web server running.
	loader.setPath('http://cglearn.codelight.eu/files/course/7/textures/');

	loader.load('wallTexture.jpg', function(tex){onTextureLoaded(tex,"wall")});
	loader.load('wallTexture2.jpg', function(tex){onTextureLoaded(tex,"wall2")});
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
		portal1.scaleUp();
	}
	if(keyboard.pressed("down")) {
		portal1.scaleDown();
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
		portal1.place();
	}
	if(keyboard.pressed("x")){ // x tekitab P2
		portal2.place();
	}
}