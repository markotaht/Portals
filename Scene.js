//Muutujad, mingit hetk tuleb üle vaadata
var renderer, scene, camera, port1_scene, port2_scene;

var port1, port2, port1_1,port2_1;

var lightPosition;
var light;
var lightTrajectory;

var port1_cam;
var port1_quad;

var port2_cam;
var port2_quad;

var viewerPosition = new THREE.Vector3(0.0, 0.0, 15.0);

var clock = new THREE.Clock();
var keyboard = new THREEx.KeyboardState();		


var wallPos = 20; // seina kaugus 0punktist
var quadSideLength = 15; // portaali quadi küljepikkus

var hangar;

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
		new THREE.Vector3(-5, -7, 5 ),
		new THREE.Vector3(-4, -7, -2 ),
		new THREE.Vector3( 3, -7, -4 ),
		new THREE.Vector3( 8, -7, 6 ),
	]);
	lightTrajectory.closed = true;
	light = new THREE.Vector3();
	
	//Light so that walls with phong material could be seen
	//TODO: combine with our light
	var plight = new THREE.PointLight( 0xffffff, 1, 100 );
	plight.position.set(10, 1, 15);
	scene.add(plight);
	
	//Objektide loomine ja stseenidesse paigutamine
	hangar = addHangar(scene);
	
	port1 = new THREE.WebGLRenderTarget(width, height, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter});
	port2 = new THREE.WebGLRenderTarget(width, height, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter});
	port1_1 = new THREE.WebGLRenderTarget(width, height, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter});
	port2_1 = new THREE.WebGLRenderTarget(width, height, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter});
	
	port1_quad = addQuad(port1.texture, -wallPos+0.001,-5,0.001, Math.PI/2);
	port2_quad = addQuad(port2.texture, wallPos- 0.001, -5,0.001,-Math.PI/2);
	port1_scene.add(port1_quad);
	port2_scene.add(port2_quad);
	
	
	createObjects(scene);
	
	//textures
	var loader = new THREE.TextureLoader();
	loader.setCrossOrigin('Anonymous'); //This is needed because we are fetching files from another "server".
										//Local files do not work unless you have a web server running.
	loader.setPath('http://cglearn.codelight.eu/files/course/7/textures/');

	loader.load('wallTexture.jpg', onTextureLoaded);
	loader.load('ut256.png', onTextureLoaded);
	loader.load('wallTexture2.jpg', onTextureLoaded);
	loader.load('stripeTexture.png', onTextureLoaded);
	loader.load('sasuke256.png', onTextureLoaded);
}


function toRad(degree) {

	return Math.PI * 2 * degree / 360;
}
			
function parseControls(dt) {
	if(keyboard.pressed("left")){
		camera.rotation.y += toRad(60 * dt % 360);
	}
	if(keyboard.pressed("right")){
		camera.rotation.y -= toRad(60 * dt % 360);
	}
	if(keyboard.pressed("w")){ // W edasi
		camera.translateZ(-10 * dt % 360);
	}
	if(keyboard.pressed("s")){ // S tagasi
		camera.translateZ(10 * dt % 360);
	}
	if(keyboard.pressed("a")){ // A liigutab vasakule
		camera.translateX(-10 * dt % 360)
	}
	if(keyboard.pressed("d")){ // D liigutab paremale
		camera.translateX(10 * dt % 360)
	}
	if(keyboard.pressed("q")){ // Q liigutab y +
		if (camera.position.y > -wallPos) {
			camera.position.y -= 10 * dt % 360;
		}
	}
	if(keyboard.pressed("e")){ // E liigutab y -
		if (camera.position.y < wallPos) {
			camera.position.y += 10 * dt % 360;
		}		
	}

}