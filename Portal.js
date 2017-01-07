//Teha protaal objektiks. Vajab veel arendust
var Portal = function(x,y,z,rot){
	this.texture1 = null;
	this.texture2 = null;
	this.position = new THREE.Vector3(x,y,z);
	//Vajab veel mõtlemist
	this.rot = rot;
	this.otherPortal = null
	//Luua siia vastav object
	this.quad = addQuad(null, x,y,z, rot);
	//Ilmselt tuleb siia teha portaali stseen. 
	this.scene = new THREE.Scene();
	this.scene.add(this.quad);
}

Portal.prototype.createBoundPortal = function(x,y,z,rot){
	this.otherPortal = new Portal(x,y,z,rot);
	this.otherPortal.otherPortal = this;
	return this.otherPortal;
}

Portal.prototype.newPosition = function(x,y,z,rot){
	this.position = new THREE.Vector3(x,y,z);
	this.rot = rot;
	this.quad.position = this.position;
}

Portal.prototype.teleportCam = function(portal, camera) {
	camera.position.x = portal.position.x;
	camera.position.z = portal.position.z;
	camera.position.y = portal.position.y;
	camera.rotation.y = portal.rotation.y + Math.PI;
	camera.translateZ(1);
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
	
	// http://www.terathon.com/lengyel/Lengyel-Oblique.pdf Siit saada kuidagi oblique frustum culling.
	//Siin kusagil on mingi matemaatika katki.
	var M3 = new THREE.Vector4(
			camera.projectionMatrix.elements[2], 
			camera.projectionMatrix.elements[6],
			camera.projectionMatrix.elements[10],
			camera.projectionMatrix.elements[14]
			);
		
	var M4 = new THREE.Vector4(
			camera.projectionMatrix.elements[3], 
			camera.projectionMatrix.elements[7],
			camera.projectionMatrix.elements[11],
			camera.projectionMatrix.elements[15]
			);
	
	var normal = new THREE.Vector3(0, 0, 1).applyQuaternion(srcquat);
	var clipPlane = new THREE.Vector4(normal.x, normal.y, normal.z, srcpos.length());
	clipPlane.applyMatrix4(new THREE.Matrix4().getInverse(camera.matrixWorldInverse.clone().transpose()));
	if(clipPlane.w > 0){
		return inverse_view_to_source;
	}
	var Q = new THREE.Vector4(Math.sign(clipPlane.x), Math.sign(clipPlane.y), 1, 1)
		.applyMatrix4(new THREE.Matrix4().getInverse(camera.projectionMatrix.clone()));
	var a = 2/ clipPlane.clone().dot(Q);
	
	//See panna projections maatrixi 3 reaks.
	var M3p = clipPlane.clone().multiplyScalar(a).sub(M4);
//	camera.projectionMatrix.elements[2] = M3p.x;
//	camera.projectionMatrix.elements[6] = M3p.y;
//	camera.projectionMatrix.elements[10] = M3p.z;
//	camera.projectionMatrix.elements[14] = M3p.w;
	return inverse_view_to_source;
}

Portal.prototype.drawRecursivePortal = function(camera, gl, level, maxlevel, move=false){
	var portals = [this, this.otherPortal];
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
			this.drawRecursivePortal(camera,gl, level+1,maxlevel,true);
		}
		gl.colorMask(false,false,false,false);
		gl.depthMask(false);
		
		gl.enable(gl.STENCIL_TEST);
		gl.stencilMask(0xFF);
		
		gl.stencilFunc(gl.NOTEQUAL,level+1,0xFF);
		gl.stencilOp(gl.DECR, gl.KEEP, gl.KEEP);
		camera.matrixWorld = original_mat;
		camera.projectionMatrix = original_proj;
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
	
	//Mõelda mida teha portaali stseeniga...
	
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
	
	center.x = (window.innerWidth / (window.innerWidth * 2) ) * 2 - 1;
	center.y = -(window.innerHeight / (window.innerHeight  * 2) ) * 2 + 1;
	raycaster.setFromCamera( center, camera );

	// kasutame raycasterit, et leida objektidega lõikumised
	intersects = raycaster.intersectObjects( scene.children, true);
	intersectsPortals = raycaster.intersectObjects( port1_scene.children, true);
	intersectsPortals.push.apply(intersectsPortals, raycaster.intersectObjects( port2_scene.children, true));
	var portal = null;
	if (intersectsPortals.length >= 1) {
		if (intersectsPortals[0].distance <= 0.7) {
			if (intersectsPortals[0].object.name == "portal1"){
				console.log(intersectsPortals[0].object.name);
				portal = port2_quad;
			}
			if (intersectsPortals[0].object.name == "portal2"){
				console.log(intersectsPortals[0].object.name);
				portal = port1_quad;
			}
			this.teleportCam(portal,camera);
		}
	}
	renderer.render(scene,camera);
}


//Selle võiks peita nt portal objekti sisse. SIis on lihtsalt portal.draw() ja pärast otsa tavaline scene renderdus. Siis jääb kogu protaali loogika
//ilusti portaali objekti sisse
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
	camera.matrixAutoUpdate = false;
	portal1.drawRecursivePortal(camera,renderer.context,0,3);
	camera.matrixAutoUpdate = true;
}

function teleportCam(portal, rotation, position, liikumisvektor) {
	var pos = portal.position;
	camera.position.set(pos.x + position.x, pos.y + position.y, pos.z + position.z);
	camera.rotation.y = portal.rotation.y + Math.PI + rotation;
	liikumisvektor.applyAxisAngle(new THREE.Vector3(0,1,0), camera.rotation.y - Math.PI);
	camera.translateOnAxis(liikumisvektor, 2);
}