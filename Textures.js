var textures = {};
var texturesToLoad = 2;
var textureIndex = 0;
function onTextureLoaded(texture, name) {
	texture.wrapS = THREE.RepeatWrapping;
	texture.wrapT = THREE.RepeatWrapping;

	textures[name] = texture;
	
	if (--texturesToLoad == 0) {
		onAllTexturesLoaded();
	}
}

function onAllTexturesLoaded() {
	hangar.getObjectByName("leftWall").material.map = textures["wall"];
	hangar.getObjectByName("leftWall").material.needsUpdate = true;
	hangar.getObjectByName("rightWall").material.map = textures["wall"];
	hangar.getObjectByName("rightWall").material.needsUpdate = true;
	hangar.getObjectByName("frontWall").material.map = textures["wall"];
	hangar.getObjectByName("frontWall").material.needsUpdate = true;
	hangar.getObjectByName("backWall").material.map = textures["wall"];
	hangar.getObjectByName("backWall").material.needsUpdate = true;
	hangar.getObjectByName("floor").material.map = textures["wall2"];
	hangar.getObjectByName("floor").material.needsUpdate = true;
	draw();
}
			