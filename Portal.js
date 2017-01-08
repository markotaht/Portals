var Portal = function(x,y,z,rot,name){
	this.maxscale = 1.25;
	this.minscale = 0.125;
	this.otherPortal = null
	this.quad = addQuad(null, x,y,z, rot);
	this.quad.name = name; 
	this.scene = new THREE.Scene();
	this.scene.add(this.quad);
}

Portal.prototype.createBoundPortal = function(x,y,z,rot,name){
	this.otherPortal = new Portal(x,y,z,rot,name);
	this.otherPortal.otherPortal = this;
	return this.otherPortal;
}


Portal.prototype.scaleUp = function(){
	if(this.quad.scale.x < this.maxscale) {
		this.quad.scale.x += 0.025;
		this.quad.scale.y += 0.025;
		this.otherPortal.quad.scale.x += 0.025;
		this.otherPortal.quad.scale.y += 0.025;
	}
}

Portal.prototype.scaleDown = function(){
	if(this.quad.scale.x > this.minscale){
		this.quad.scale.x -= 0.025;
		this.quad.scale.y -= 0.025;
		this.otherPortal.quad.scale.x -= 0.025;
		this.otherPortal.quad.scale.y -= 0.025;
	}
}

Portal.prototype.place = function(){
	var i = intersects[0];
	this.quad.position.set(i.point.x, i.point.y, i.point.z);
	this.quad.translateZ(0.25);
	if (i.object.name.indexOf("Wall") != -1) {
		this.quad.rotation.set(i.object.rotation.x, i.object.rotation.y, i.object.rotation.z);
	}
	else {			
		var Yaxis = new THREE.Vector3(0,1,0);
		var pos = new THREE.Vector3();
		pos.addVectors(intersects[0].face.normal, intersects[0].point);
		this.quad.lookAt(pos);
	}
}

Portal.prototype.teleportCam = function(camera, rotation, position, liikumisvektor) {
	var pos = this.quad.position;
	camera.position.set(pos.x + position.x, pos.y + position.y, pos.z + position.z);
	camera.rotation.y = this.quad.rotation.y + Math.PI + rotation;
	liikumisvektor.applyAxisAngle(new THREE.Vector3(0,1,0), camera.rotation.y - Math.PI);
	camera.translateOnAxis(liikumisvektor, 1);
}

Portal.prototype.portal_view = function(camera, move=false){
	this.quad.updateMatrixWorld();
	this.otherPortal.quad.updateMatrixWorld();	
	
	var camerapos = new THREE.Vector3();
	var camerarot = new THREE.Quaternion();
	var camerascale = new THREE.Vector3();
	camera.matrixWorld.decompose(camerapos,camerarot,camerascale);
	
	var srcpos = new THREE.Vector3();
	var srcquat = new THREE.Quaternion();
	var srcscale = new THREE.Vector3();
	this.quad.matrixWorld.decompose(srcpos, srcquat, srcscale);
	
	var destquat = new THREE.Quaternion();
	var destpos = new THREE.Vector3();
	var destscale = new THREE.Vector3();
	this.otherPortal.quad.matrixWorld.decompose(destpos,destquat,destscale);
	
	var diff = camerapos.clone().sub(srcpos);
	
	
	//IF ortation between2 portals is 180 its all ok
	//any other and we need to rotate

	var ydiff = this.quad.rotation.y - this.otherPortal.quad.rotation.y - Math.PI;
	diff.applyAxisAngle(new THREE.Vector3(0,1,0),-ydiff);
	var newcampos;
	if(!move){
		newcampos = diff.add(destpos);
		var yrotvec = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),-ydiff);
		srcquat = srcquat.multiply(destquat.inverse());
		camerarot = camerarot.multiply(yrotvec);
	}else{
		var mdiff = destpos.clone().sub(srcpos);
		newcampos = camerapos.clone().add(mdiff);
	}
	
	var inverse_view_to_source = new THREE.Matrix4();
	inverse_view_to_source.compose(newcampos,camerarot,camerascale);
	
	return inverse_view_to_source;
}

Portal.prototype.drawRecursivePortal = function(camera, gl, level, maxlevel, move=false){
	var portals;
	if(camera.position.distanceTo(this.quad.position) > camera.position.distanceTo(this.otherPortal.quad.position)){
		portals = [this, this.otherPortal];
	}else{
		portals = [this.otherPortal, this];
	}
	var original_mat = camera.matrixWorld.clone();
	var original_proj = camera.projectionMatrix.clone();
	for(var i in portals){
		var portal = portals[i];
		gl.colorMask(false,false,false,false);
		gl.depthMask(false);
		
		gl.disable(gl.DEPTH_TEST);
		gl.enable(gl.STENCIL_TEST);
		
		gl.stencilFunc(gl.NOTEQUAL,level,0xFF);
		
		gl.stencilOp(gl.INCR,gl.KEEP,gl.KEEP);
		gl.stencilMask(0xFF);
		
		renderer.render(portal.scene,camera);
		camera.matrixWorld = portal.portal_view(camera,move);
		if(level == maxlevel){
			gl.colorMask(true, true, true, true);
			gl.depthMask(true);
			
			renderer.clear(false,true,false);
			gl.enable(gl.DEPTH_TEST);
			gl.enable(gl.STENCIL_TEST);
			
			gl.stencilMask(0x00);
			
			gl.stencilFunc(gl.EQUAL,level+1,0xFF);
			renderer.render(scene,camera);
		}else{
			this.drawRecursivePortal(camera,gl, level+1,maxlevel,false);
		}
		gl.colorMask(false,false,false,false);
		gl.depthMask(false);
		
		gl.enable(gl.STENCIL_TEST);
		gl.stencilMask(0xFF);
		
		gl.stencilFunc(gl.NOTEQUAL,level+1,0xFF);
		gl.stencilOp(gl.DECR, gl.KEEP, gl.KEEP);
		camera.matrixWorld = original_mat.clone();
		camera.projectionMatrix = original_proj.clone();
		renderer.render(portal.scene,camera);		
	}
	
	gl.disable(gl.STENCIL_TEST);
	gl.stencilMask(0x00);
	
	gl.colorMask(false,false,false,false);
	
	gl.enable(gl.DEPTH_TEST);
	gl.depthMask(true);
	
	gl.depthFunc(gl.ALWAYS);
	
	renderer.clear(false,true,false);
			
	for(var i in portals){
		renderer.render(portals[i].scene,camera);
	}
	
	gl.depthFunc(gl.LESS);
	
	gl.enable(gl.STENCIL_TEST);
	gl.stencilMask(0x00);
	
	gl.stencilFunc(gl.LEQUAL,level,0xff);
	
	gl.colorMask(true,true,true,true);
	gl.depthMask(true);
	
	gl.enable(gl.DEPTH_TEST);
	renderer.render(scene,camera);
}

//Render logic for portals. Needs to be called only on 1 portal. draw call on one will also render its partner.
Portal.prototype.draw = function(camera){
	camera.updateMatrixWorld();
	original_mat = camera.matrixWorld.clone();
	var original_proj = camera.projectionMatrix.clone();
	
	var gl = renderer.context;
	
	//Puhastame kõik buffrid ära
	renderer.autoClear = false;
	renderer.clear(true,true,true);
	
	//Valmistame stencli
	gl.stencilOp(gl.KEEP,gl.KEEP,gl.REPLACE);
	gl.stencilMask(0xff);
	
	gl.colorMask(false,false,false,false);
	gl.depthMask(false);
	
	gl.enable(gl.STENCIL_TEST);
	gl.enable(gl.DEPTH_TEST);
	
	//Portaal 1 stenclisse
	gl.stencilFunc(gl.ALWAYS,1,0xff);
	renderer.render(this.scene,camera);
	
	//Portaal 2 stenclisse
	gl.stencilFunc(gl.ALWAYS,2,0xff);
	renderer.render(this.otherPortal.scene,camera);
	
	renderer.clear(false,true,false);
	
	gl.colorMask(true,true,true,true);
	gl.depthMask(true);
	camera.matrixAutoUpdate = false;
	
	//Joonistame esimese protaali vaate
	gl.stencilFunc(gl.EQUAL,1,0xff);
	
	gl.stencilOp(gl.KEEP,gl.KEEP,gl.KEEP);
	camera.matrixWorld = this.portal_view(camera);
	renderer.render(scene,camera);

	//Joonistame teise portaali vaate
	gl.stencilFunc(gl.EQUAL,2,0xff);
	
	gl.stencilOp(gl.KEEP,gl.KEEP,gl.KEEP);
	camera.matrixWorld = original_mat.clone();
	camera.projectionMatrix = original_proj.clone();
	camera.matrixWorld = this.otherPortal.portal_view(camera);
	renderer.render(scene,camera);
	
	//Aitab stenclist
	gl.disable(gl.STENCIL_TEST);
	renderer.clear(false,false,true);
	
	//Paneme kaamera tagai algesse kohta
	camera.matrixWorld = original_mat.clone();
	camera.projectionMatrix = original_proj.clone();
	camera.matrixAutoUpdate = true;
	
	//Tühjendame sügavuspuhvri
	renderer.clear(false,true,false);
	
	
	//Joonistame mõlemad portaalid sügavus buffrisse
	// Et neid üle ei kirjutataks
	gl.colorMask(false,false,false,false);
	gl.depthMask(true);
	renderer.render(this.scene,camera);
	renderer.render(this.otherPortal.scene,camera);
	gl.enable(gl.DEPTH_TEST);
	
	//Joonistame lõpliku stseeni
	gl.colorMask(true,true,true,true);
	
	renderer.render(scene,camera);
}

function draw() {
	requestAnimationFrame(draw);

	var dt = clock.getDelta();
	if (speed > 1)
		speed -= 0.1;
	parseControls(dt);
	
	var time = clock.getElapsedTime();
	var m = time*0.3;
	lightPosition = lightTrajectory.getPoint(m - parseInt(m));
	scene.children[0].position.set(lightPosition.x, lightPosition.y, lightPosition.z);
	lamp.position.set(lightPosition.x, lightPosition.y, lightPosition.z);
	lampchain.geometry.vertices[1] = new THREE.Vector3(lightPosition.x, lightPosition.y, lightPosition.z);
	lampchain.geometry.verticesNeedUpdate = true;
	
	if (camera.position.x > wallPos-0.5) {
		camera.position.x -= 0.25;
	}
	else if (camera.position.x < -wallPos+0.5) {
		camera.position.x += 0.25;
	}
	// labane kontroll, mis ei lase kaameral hangaarist välja minna
	if (camera.position.z > wallPos) {
		camera.position.z -= 0.25;
	}
	else if (camera.position.z < -wallPos) {
		camera.position.z += 0.25;
	}	
	
	renderer.autoClear = false;
	renderer.clear(true,true,true);
	camera.updateMatrixWorld();
//	camera.updateProjectionMatrix ();
	camera.matrixAutoUpdate = false;
	portal1.drawRecursivePortal(camera,renderer.context,0,3);
	camera.matrixAutoUpdate = true;
	
	center.x = (window.innerWidth / (window.innerWidth * 2) ) * 2 - 1;
	center.y = -(window.innerHeight / (window.innerHeight  * 2) ) * 2 + 1;

	// kasutame raycasterit, et leida objektidega lõikumised
	raycasterCam.setFromCamera( center, camera );
	intersects = raycasterCam.intersectObjects(scene.children, true);
	var intersectsObjects;
	var collisions;
	var portal;
	var rotationDiff;
	var position;
	for (var i = 0; i < rays.length; i++) {
		// anname raycasterile kiire suuna
		raycaster.set(camera.position, rays[i]);
		intersectsPortals = raycaster.intersectObjects(portal1.scene.children, true);
		intersectsPortals.push.apply(intersectsPortals, raycaster.intersectObjects(portal2.scene.children, true));
		if (intersectsPortals.length > 0 && intersectsPortals[0].distance <= 0.7) {
			if (intersectsPortals[0].object.name == "portal1"){
				portal = portal2;
				rotationDiff = camera.rotation.y - portal1.quad.rotation.y;
				position = new THREE.Vector3().copy(camera.position).sub(portal1.quad.position);
			}
			if (intersectsPortals[0].object.name == "portal2"){
				portal = portal1;
				rotationDiff = camera.rotation.y - portal2.quad.rotation.y;
				position = new THREE.Vector3().copy(camera.position).sub(portal2.quad.position);
			}
			if(time - teleportTime > 0.5){
				camera.translateOnAxis(liikumisVektor, 1);
				teleportTime = time;
				portal.teleportCam(camera, rotationDiff, position, liikumisVektor);     
			} 
		}
	}
}
