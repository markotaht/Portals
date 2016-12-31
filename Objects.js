function createObjects(scene){
	var randomObjects = new THREE.Object3D();
	
	var cube = createCube(0x3DE5CF); //new THREE.Mesh(new THREE.BoxGeometry(4, 4, 4), createShaderMaterial(new THREE.Color(0x3DE5CF)));
	cube.position.set(1, 3, 5);
	cube.scale.set(2, 2, 2);
	randomObjects.add(cube);
	
	var sphere = new THREE.Mesh(new THREE.SphereGeometry(4, 32, 32), new THREE.MeshPhongMaterial({ color: 0xE55B3D, specular: 0x555555, shininess: 30 }));
	sphere.position.set(-4, -2, 0);
	randomObjects.add(sphere);

	var sphere2 = new THREE.Mesh(new THREE.SphereGeometry(4, 32, 32), new THREE.MeshPhongMaterial({ color: 0x63ef40, specular: 0x555555, shininess: 30 }));
	sphere2.position.set(2, -15, 1);
	randomObjects.add(sphere2);

	randomObjects.position.set(0, 0, 0);
	scene.add(randomObjects)
}

function addHangar(scene) {
	var hangar = new THREE.Object3D();
	var halfPi = Math.PI / 2;
	//var wallPos = 20;
	var wallSize = 2*wallPos;
	
	var leftWall = createWall(0x47d147, wallSize);
	leftWall.position.set(-wallPos, 0, 0);
	leftWall.rotation.set(0, halfPi, 0);
	hangar.add(leftWall);
	
	var rightWall = createWall(0xff00ff, wallSize);
	rightWall.position.set(wallPos, 0, 0);
	rightWall.rotation.set(0, -halfPi, 0);
	hangar.add(rightWall);
	
	var backWall = createWall(0x1436e1, wallSize);
	backWall.position.set(0, 0, -wallPos);
	hangar.add(backWall);
	
	var ceiling = createWall(0x00ffff, wallSize);
	ceiling.position.set(0, wallPos, 0);
	ceiling.rotation.set(halfPi, 0, 0);
	hangar.add(ceiling);
	
	var floor = createWall(0xffff00, wallSize);
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
	var material = new THREE.MeshPhongMaterial({ map:texture, specular: 0x555555, shininess: 30 });
	var wall     = new THREE.Mesh(geometry, material);
	
	return wall;
}

function createWall(colorCode, wallSize) {
	var geometry = new THREE.PlaneGeometry(wallSize, wallSize, 1);
	var color    = new THREE.Color(colorCode);
	//Replaced our custom material with phong
	//TODO: replace for other things too, make our light work with it
	var material = new THREE.MeshPhongMaterial({ color: colorCode, specular: 0x555555, shininess: 30 });
	var wall     = new THREE.Mesh(geometry, material);
	
	return wall;
}

function createCube(colorCode) {
	var geometry = new THREE.BoxGeometry(2, 2, 2);
	var color    = new THREE.Color(colorCode);
	var material = new THREE.MeshPhongMaterial({ color: color, specular: 0x555555, shininess: 30 });
	var cube     = new THREE.Mesh(geometry, material);
	
	return cube;
}