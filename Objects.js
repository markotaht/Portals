var lamp;
var lampchain;

function createObjects(scene){
	
	var mainobjects = new THREE.Object3D();
	
	var table = createCube(0xA66622);
	table.position.set(20, -40, -20);
	table.scale.set(14, 20, 14);
	mainobjects.add(table);
	
	var cone = new THREE.Mesh( new THREE.ConeGeometry( 20, 80, 10 ), 
			new THREE.MeshPhongMaterial( {color: 0x88ff00} ) );
	cone.position.set(-35, -40, 35);
	mainobjects.add(cone);
	
	lamp = new THREE.Mesh(new THREE.SphereGeometry(4, 32, 32),
			new THREE.MeshPhongMaterial({ color: 0xffffff, emissive: 0xffffff}));
	lamp.scale.set(0.8, 0.8, 0.8);
	mainobjects.add(lamp);
	
	var geometry = new THREE.Geometry();
	geometry.vertices.push(new THREE.Vector3( 0, 50, 0 ),new THREE.Vector3( 0, 0, 0 ));
	lampchain = new THREE.Line( geometry, new THREE.LineBasicMaterial({color: 0x727272}) );
	mainobjects.add(lampchain); 
	
	scene.add(mainobjects);
	
}

function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function addHangar(scene) {
	var hangar = new THREE.Object3D();
	var halfPi = Math.PI / 2;
	var wallSize = 2*wallPos;
	var beige = 0xf9dd87;
	var light_gray = 0xe2e1de;
	var brown = 0x8b2800;
	
	var leftWall = createWall(beige, wallSize);
	leftWall.name = "leftWall";
	leftWall.position.set(-wallPos, 0, 0);
	leftWall.rotation.set(0, halfPi, 0);
	hangar.add(leftWall);
	
	var rightWall = createWall(beige, wallSize);
	rightWall.name = "rightWall";
	rightWall.position.set(wallPos, 0, 0);
	rightWall.rotation.set(0, -halfPi, 0);
	hangar.add(rightWall);
	
	var backWall = createWall(beige, wallSize);
	backWall.name = "backWall";
	backWall.position.set(0, 0, -wallPos);
	hangar.add(backWall);

	var frontWall = createWall(beige, wallSize);
	frontWall.name = "frontWall";
	frontWall.position.set(0, 0, wallPos);
	frontWall.rotation.set(0, halfPi*2, 0);
	hangar.add(frontWall);
	
	var ceiling = createWall(light_gray, wallSize);
	ceiling.name = "ceiling";
	ceiling.position.set(0, wallPos, 0);
	ceiling.rotation.set(halfPi, 0, 0);
	hangar.add(ceiling);
	
	var floor = createWall(brown, wallSize);
	floor.name = "floor";
	floor.position.set(0, -wallPos, 0);
	floor.rotation.set(-halfPi, 0, 0);
	hangar.add(floor);
	
	scene.add(hangar);
	return hangar;
}


function addQuad(texture, x, y, z, roty) {
	var halfPi = Math.PI / 2;

	var quad = createQuad(texture);
	quad.position.set(x, y, z);
	quad.rotation.set(0, roty, 0);

	return quad;
}

function createQuad(texture) {
	var geometry = new THREE.PlaneGeometry(quadSideLength, quadSideLength, 1);
	var material = new THREE.MeshPhongMaterial({specular: 0x555555, shininess: 30 });
	var wall     = new THREE.Mesh(geometry, material);
	
	return wall;
}

function createWall(colorCode, wallSize) {
	var geometry = new THREE.PlaneGeometry(wallSize, wallSize, 1);
	var color    = new THREE.Color(colorCode);
	var material = new THREE.MeshPhongMaterial({ color: colorCode, specular: 0x555555, shininess: 30 });
	var wall     = new THREE.Mesh(geometry, material);
	wall.name 	 = "wall";
	return wall;
}

function createCube(colorCode) {
	var geometry = new THREE.BoxGeometry(2, 2, 2);
	var color    = new THREE.Color(colorCode);
	var material = new THREE.MeshPhongMaterial({ color: color, specular: 0x555555, shininess: 30 });
	var cube     = new THREE.Mesh(geometry, material);
	
	return cube;
}