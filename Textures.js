var textures = {};
var texturesToLoad = 5; //Load a lot of textures
var textureIndex = 0;
function onTextureLoaded(texture, name) {
	//You may want to change some min and mag filters of the texture here.
	//You do want to make the texture repeating. Default is clamped at the edges.
	//After changing texture properties, tell it that it needs an update.
	texture.wrapS = THREE.RepeatWrapping;
	texture.wrapT = THREE.RepeatWrapping;
	//texture.wrapT = THREE.MirroredRepeatWrapping;

	//texture.minFilter = THREE.NearestFilter;
	//texture.magFilter = THREE.NearestFilter;
	
	//Push the texture to the array.
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
			