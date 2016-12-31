var textures = [];
var texturesToLoad = 5; //Load a lot of textures
var textureIndex = 0;
function onTextureLoaded(texture) {
	//You may want to change some min and mag filters of the texture here.
	//You do want to make the texture repeating. Default is clamped at the edges.
	//After changing texture properties, tell it that it needs an update.
	texture.wrapS = THREE.RepeatWrapping;
	texture.wrapT = THREE.RepeatWrapping;
	//texture.wrapT = THREE.MirroredRepeatWrapping;

	//texture.minFilter = THREE.NearestFilter;
	//texture.magFilter = THREE.NearestFilter;
	
	//Push the texture to the array.
	textures.push(texture);
	
	if (--texturesToLoad == 0) {
		onAllTexturesLoaded();
	}
}

function onAllTexturesLoaded() {
	for (var i = 0; i < 5; i++){
		hangar.children[i].material.map = textures[i];
		hangar.children[i].material.needsUpdate = true;
	}
	draw();
}
			