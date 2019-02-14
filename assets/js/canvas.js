---
---

console.log("Loading canvas js!");

var camera, scene, renderer, bgScene, plane, controls;
var cubeCamera, cylinder_mesh, line;
var geometry, material, mesh, clock, time, center, isoParent, worldVector, tracesParent;
var raycaster;
var cameraOffsetY = 0;
var loadedProjects = [];
var objectWrapper, mirrorsWrapper;

var mouse;

var videos = [], videoImages = [], videoImageContexts = [], videoTextures = [];

{% if jekyll.environment == "production" %}
  console.log = function() {}
{% endif %}

init();
animate();

var pos = 0;



function getPlaneGeometry() {
        if(_geo == null) {
            var _geo = new THREE.PlaneGeometry(1000, 1000);
        }

        return _geo;
    };

function randomSpherePoint(x0,y0,z0,radius){
   var u = Math.random();
   var v = Math.random();
   var theta = 2 * Math.PI * u;
   var phi = Math.acos(2 * v - 1);
   var x = x0 + (radius * Math.sin(phi) * Math.cos(theta));
   var y = y0 + (radius * Math.sin(phi) * Math.sin(theta));
   var z = z0 + (radius * Math.cos(phi));
   return [x,y,z];
}




function map_range(value, low1, high1, low2, high2) {
    return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}




function createMesh(texture, project){

  console.log("creating mesh for: " ,project.title);
  console.log("texture:" ,texture);
  // console.log("creating mesh with texture: " ,texture.image.src);

	texture.minFilter = THREE.NearestFilter;
	texture.magFilter = THREE.NearestFilter;


	var mat = new THREE.MeshBasicMaterial({
		map: texture,
		// fog: true,
		side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.95
		// color: 0x000000
	});

	var geo = new THREE.PlaneGeometry(1,1);
	var mesh = new THREE.Mesh(geo, mat);
	// console.log("texture: " ,texture.image.width);
  var proportion = texture.image.width / texture.image.height;
  //check if image width is greater than height
  if (proportion > 1) {
    mesh.scale.x = 200;
    mesh.scale.y = 200 / proportion;
    // mesh.scale.y = 100;
  }

  if (proportion == 1){
    mesh.scale.x = 180;
    mesh.scale.y = 180;
  }

  else {
    mesh.scale.y = 200;
    mesh.scale.x = 200 * proportion;
  }
	// mesh.scale.x = texture.image.width*0.1;
	// mesh.scale.y = texture.image.height*0.1;
	mesh.userData = {
  	url: project.url,
  	title: project.title,
    description: project.content,
    // url: project.content,
    imgURL: texture.image.src,
    year: project.year,
    client: project.organization
  };

  var x = Math.random() * 800 - 400;
  var y = Math.random() * 800 - 400;
  var z = Math.random() * 800 - 400;

  mesh.position.set(x,y,z);
  var meshParent = new THREE.Object3D();
  meshParent.add(mesh);
  meshParent.rotation.x = Math.random() * 20;
  meshParent.rotation.y = Math.random() * 20;
  meshParent.rotation.z = Math.random() * 20;
  objectWrapper.add(meshParent);
  project.mesh = mesh;
  project.parent = meshParent;

  // console.log("mesh: " ,mesh);
  // projects.push(project);
}




function loadProjects(){
  var numberOfTextures = 0;
  var numberOfLoadedTextures = 0;
  console.log("loop test: " ,{{site.projects | jsonify}});
  var projects = {{site.projects | jsonify}};
  for (var i = 0; i < projects.length; i++) {
    var project = projects[i];
    var re = /(?:\.([^.]+))?$/;

    console.log("Images in project "+project.title+": " ,project.images);
    for (var j = 0; j < project.images.length; j++) {
      console.log("checking image "+j+"/"+project.images.length+":" ,project.images[j]);
      if (project.images[j].landing != true) {
        console.log("Deleted image: " ,project.images[j]);
        delete project.images[j];
      }
      else {
        console.log("Found landing image: " ,project.images[j]);
        numberOfTextures++;
        // loadedProjects.push(project.images[i]);
      }
    }
    console.log("Images after filter: " ,project.images);


    for (var j = 0; j < project.images.length; j++) {

      if (typeof project.images[j] !== 'undefined') {
        var currentImage = project.images[j];

        var ext = re.exec(project.images[j].url)[1];                 // "txt"

        if (ext == ".mp4") {

          var videoelement = document.createElement("video");
          videoelement.setAttribute("id", data[5]);

          var sourceMP4 = document.createElement("source");
          sourceMP4.type = "video/mp4";
          sourceMP4.src = "images/"+data[5]+data[6];
          videoelement.appendChild(sourceMP4);

          $(videoelement).hide();
          $('body').append(videoelement);


          var video = document.getElementById( data[5] );
          video.load();
          video.autoplay = true;
          video.play();
          video.loop = true;
          video.muted = true;
          video.addEventListener( "loadedmetadata", function (e) {
            video.width = this.videoWidth;
            video.height = this.videoHeight;
            console.log("video.width: " ,video.width);
            console.log("video.height: " ,video.height);

            var videoImage = document.createElement( 'canvas' );
            videoImage.width = video.width;
            videoImage.height = video.height;
            videoImageContext = videoImage.getContext( '2d' );
            videoImageContext.fillStyle = '#000000';
            videoImageContext.fillRect( 0, 0, videoImage.width, videoImage.height );

            videoTexture = new THREE.Texture( videoImage );

            createMesh(videoTexture, data, project);

            videoTexture.minFilter = THREE.LinearFilter;
            videoTexture.magFilter = THREE.LinearFilter;

            videos.push(video);
            videoImages.push(videoImage);
            videoTextures.push(videoTexture);
            videoImageContexts.push(videoImageContext);
            console.log("videoTexture: " ,videoTexture);

          }, false );

        }

        else {
          console.log("creating texture for: " ,project.images[j].url);
          var textureLoader = new THREE.TextureLoader();
          var map = textureLoader.load(
            "assets/media/small/"+project.images[j].url,
            function(texture){
              numberOfLoadedTextures++;
              if (numberOfLoadedTextures == numberOfTextures) {
                console.log("done loading images!");
                $(canvas3D).fadeIn(300);
                $('#loading-text').fadeOut(300, function(){
                  $('#landing-text').fadeIn(300);
                });
              }
              createMesh(texture, project);
            }
          );
        }
      }

    }


  }
}

$(document).ready(function(){
	$('.middle').mousedown(function(e){
		console.log("click on middle!");
		e.stopPropagation();
		e.stopImmediatePropagation();
	});

	// $('.project').mousedown(function(e){
	// 	console.log("click on middle!");
	// 	e.stopPropagation();
	// 	e.stopImmediatePropagation();
	// });
});


function init() {

	$( "#canvas3D").click(function(e) {
		// event.stopPropagation();
		//e.preventDefault();
	  	console.log("clicked canvas!");
	  	//return false;
	});


	// $('body').click(function(){
	// 	console.log("clicked body!");
	// });



	scene = new THREE.Scene();
	bgScene = new THREE.Scene();
	canvas2D = document.getElementById('canvas2D');
  console.log("canvas2D:" ,canvas2D);
	renderer2D = new THREE.CanvasRenderer({canvas: canvas2D, antialias: true, clearColor: 0x000000, clearAlpha: 0, alpha: true, autoClear: true});
	//renderer2D.setPixelRatio(window.devicePixelRatio);
	canvas3D = document.getElementById('canvas3D');
	renderer3D = new THREE.WebGLRenderer( { canvas: canvas3D, antialias: true, clearColor: 0xefefef, clearAlpha: 0, alpha: true, preserveDrawingBuffer: false, autoClear: true });
  scene.background = new THREE.Color( 0xeeeeee );
	renderer3D.setPixelRatio(window.devicePixelRatio);
	renderer3D.setSize(window.innerWidth, window.innerHeight);
	//renderer2D.setSize(window.innerWidth, window.innerHeight);
	canvas2D.width = window.innerWidth*window.devicePixelRatio;
	canvas2D.height = window.innerHeight*window.devicePixelRatio;

	// var container = document.getElementById('container');
	// container.appendChild( renderer3D.domElement);

	console.log("renderer3D.domElement: " ,renderer3D.domElement);

	//canvas3d = renderer3D.domElement;

	mouse = new THREE.Vector2();
	raycaster = new THREE.Raycaster();
	worldVector = new THREE.Vector3();

	camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 1, 10000 );
	camera.position.z = 1100;
  camera.layers.set( 1 );
	//camera.position.y = cameraOffsetY;
	//camera.lookAt(0, 0, 0);

	controls = new THREE.TrackballControls(camera, renderer3D.domElement);
	controls.enableDamping = true;
	controls.dampingFactor = 1.0;
	controls.enableZoom = false;
  // scene.fog = new THREE.Fog( 0xefefef, 400, 2000);
	var isoRadius = 140;

	verticies = [];

	center = new THREE.Vector3(0,0,0);


	objectWrapper = new THREE.Object3D();
  mirrorsWrapper = new THREE.Object3D();
	scene.add(objectWrapper);
  scene.add(mirrorsWrapper);

  cubeCamera = new THREE.CubeCamera(1, 10000, 1024);
  mirrorsWrapper.add(cubeCamera);

  for (var i = 0; i < 1; i++) {

    // var cubeCamera = new THREE.CubeCamera(1, 10000, 1024);

    var segments = 200;
    var size = 400;
    var planeGeo = new THREE.PlaneGeometry( size, size, segments, segments);

    var rad = Math.random() * 80 + 20;
    var blobGeo = new THREE.SphereGeometry(1, 200, 200);
    var cylinder_1_geometry = new THREE.CylinderGeometry( 300, 300, 7, 100 );
    var cylinder_1_material = new THREE.MeshBasicMaterial( {
                color: 0xefefef,
                // fog: true,
                envMap: cubeCamera.renderTarget.texture,
                specular: 0xFFFFFF,
                emissive: 0x000000,
                // shininess: 90,
                alpha: true,
                transparent: true,
                // fog: true,
                opacity: 1,
                // overdraw: true,
                // side: THREE.DoubleSide,
                refractionRatio: 0.5,
                reflectivity: 0.9
    });

    cylinder_1_material.flatShading = true;

    // scene.add(cylinder_mesh);

    texLoader = new THREE.TextureLoader();
    // loader = new THREE.JSONLoader();
		// loader.load( "assets/js/LeePerrySmith.json", function ( geometry ) {
    //
		// } );

    // var sphereGeo = new THREE.SphereGeometry( 300, 50, 50 );
    // cylinder_1_material.bumpMap = texLoader.load('assets/media/earth-bump.png');
    cylinder_mesh = new THREE.Mesh(cylinder_1_geometry, cylinder_1_material);
    var s = 300;
    // cylinder_mesh.scale.set( s, s, s );
    cylinder_mesh.layers.set( 1 );

    // createScene( geometry, 100 );

    var mirrorParent = new THREE.Object3D();
    mirrorParent.add(cylinder_mesh);
    mirrorParent.rotation.x = Math.random() * 20;
    mirrorParent.rotation.y = Math.random() * 20;
    mirrorParent.rotation.z = Math.random() * 20;
    mirrorsWrapper.add(mirrorParent);

    // var x = (Math.random() * 1400 - 700);
    // var y = (Math.random() * 1400 - 700);
    // var z = (Math.random() * 1400 - 700);

    // cylinder_mesh.position.set(x,y,z);
    // cubeCamera.position.set(x,y,z);


    // mirrorParent.position.set(x,y,z);

    // mirrorParent.add(cubeCamera);

    // var lineMat = new THREE.LineBasicMaterial({
    // 	color: 0x000000,
    //   linewidth: 5.0
    // });
    // var lineGeo = new THREE.Geometry();
    // lineGeo.vertices.push(
    //   center,
    //   new THREE.Vector3(0,-500,0)
    // );
    // line = new THREE.Line( lineGeo, lineMat );
    // line.layers.set(1);
    // mirrorParent.add( line );



  }

  var ambLight = new THREE.AmbientLight( 0xffffff ); // soft white light
  ambLight.layers.set( 1 );
  // scene.add( ambLight );

  var hemLight = new THREE.HemisphereLight( 0xffffbb, 0xeacbad, 1 );
  hemLight.layers.set( 1 );
  // scene.add( hemLight );

  var light = new THREE.PointLight( 0xffffff, 0.9, 20 );
  light.position.set( 10, 10, 10 );
  light.layers.set( 1 );
  // scene.add( light );

  var light2 = new THREE.PointLight( 0xffffff, 0.9, 20 );
  light2.position.set( -10, -10, 10 );
  light2.layers.set( 1 );
  // scene.add( light2 );

  $(canvas3D).hide();

	loadProjects();



	var PI2 = Math.PI * 2;

	clock = new THREE.Clock();
	time = clock.getElapsedTime();

	var g = getPlaneGeometry();
	// var shaderMat = new THREE.ShaderMaterial({
//              uniforms: {
//                  time: {type: 'f', value: time},
//                  res: {type: 'v2', value: new THREE.Vector2(window.innerWidth, window.innerHeight)}
//              },
//              vertexShader: document.getElementById('baseVs').text,
//              fragmentShader: document.getElementById('noiseFs').text,
//              depthWrite: false,
//              depthTest: false
//          });
        //plane = new THREE.Mesh(g, shaderMat);
        //bgScene.add(plane);
        //plane.position.z = 0;
        //console.log("res" ,plane.material.uniforms.res.value);



  window.addEventListener( 'resize', onWindowResize, false );
  document.addEventListener('mousedown', onDocumentMouseDown, false);
  document.addEventListener( 'mousemove', onMouseMove, false );

}


function onDocumentMouseDown(event) {
	// console.log("click!: " ,mouse);
  // //event.preventDefault();
  // raycaster.setFromCamera( mouse, camera );
  // var intersects = raycaster.intersectObjects( scene.children, true );
  // // console.log("intersects: " ,intersects);
  // if (intersects.length > 0) {
  // 	$('.middle').html('<div class="project"><div class="title">'+intersects[0].object.userData.title+'</div></div>');
  //
  //
	// 	if (intersects[0].object.userData.description){
	// 		$('.project').append('<div class="description">'+intersects[0].object.userData.description+'</div>');
	// 	}
  //
	// 	if (intersects[0].object.userData.URL){
	// 		$('.project').append('<div class="url"><a class="arrow" target="_blank" href="'+intersects[0].object.userData.URL+'">&rarr;</a></div>');
	// 	}
  //
	// 	// intersects[0].object.matrixAutoUpdate = false;
  // 	// console.log(intersects[0].object.userData);
  // 	// if (intersects[0].object.userData.URL){
  //  //    	window.open(intersects[0].object.userData.URL, '_blank');
  //  //    }
  // }
  //
  // else {
  // 	$('.middle').html('<div><span>Computational & Interactive<br>Designer / Artist from Sweden<br>Researcher at Fabrica</span></div>');
  // 	$('.middle').html('<div class="description"><span class="info">Computational & Interactive<br>Designer / Artist from Sweden<br>Researcher at <a href="http://www.fabrica.it/">Fabrica</a>, Italy</span></div>');
  //
  // }
  // return;
}

function onMouseMove( event ) {

	// calculate mouse position in normalized device coordinates
	// (-1 to +1) for both components
	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

}

// var arrow;
// var line2;
// var cubeCameraVector = new THREE.Vector3();
// var lineMat = new THREE.LineBasicMaterial({
// 	color: 0xff0000,
//   linewidth: 5.0
// });
// var lineGeo = new THREE.Geometry();
// lineGeo.vertices.push(
//   center,
//   new THREE.Vector3(0,500,0)
// );
// line2 = new THREE.Line( lineGeo, lineMat );
// line2.layers.set(1);
// scene.add( line2 );
// console.log("line.geometry: " ,line.geometry);
// var endPoint;

function castRay() {
  mirrorsWrapper.updateMatrixWorld(true);
  line.updateMatrixWorld(true);
  cubeCameraVector = cylinder_mesh.getWorldDirection( cubeCameraVector );
  // var axis = new THREE.Vector3().copy(cylinder_mesh.getWorldDirection());
  // var angle = THREE.Math.degToRad(180);
  // cubeCameraVector.applyAxisAngle( axis, angle );
  // console.log("cubeCameraVector: " ,cubeCameraVector);

  // console.log("raycaster: " ,intersects);
  endPoint = line.geometry.vertices[1].clone();
  endPoint.applyMatrix4( line.matrixWorld );
  var directionVector = endPoint.clone().sub(center).normalize();
  // var v = new THREE.Vector3().copy(center);
	// v.add(directionVector.clone().multiplyScalar(500));
  raycaster.set(center, directionVector);
  var intersects = raycaster.intersectObjects(scene.children, true);
  // endPoint.multiplyScalar(500);
  // console.log("endPoint:" ,endPoint);

  if (typeof line2 !== 'undefined'){
    line2.geometry.vertices[0].copy(center);
    line2.geometry.vertices[1].copy(endPoint);
    line2.geometry.verticesNeedUpdate = true;
  }



  // scene.remove ( arrow );
  // arrow = new THREE.ArrowHelper( cubeCamera.getWorldDirection(), cubeCamera.getWorldPosition(), 100, Math.random() * 0xffffff );
  // arrow.layers.set(1);
  // scene.add( arrow );

  if (intersects.length > 2) {
    // console.log("intersects: " ,intersects);
    console.log("intersect 2" ,intersects[1].object.userData.imgURL);
    // $('#landing-title').text(intersects[0])
    // mesh.userData
  }
}


function toScreenXY(position, camera, canvas) {
  var pos = position.clone();
  var projScreenMat = new THREE.Matrix4();
  projScreenMat.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
 // projScreenMat.multiplyVector3( pos );
	pos.applyProjection(projScreenMat);
  return { x: (( pos.x + 1 ) * canvas.width / 2  + canvas.offsetLeft),
      y: (( - pos.y + 1) * canvas.height / 2 + canvas.offsetTop) };
}


function checkRotation(){

    var x = camera.position.x,
        y = camera.position.y,
        z = camera.position.z;

    // if (keyboard.pressed("left")){
    //     camera.position.x = x * Math.cos(rotSpeed) + z * Math.sin(rotSpeed);
    //     camera.position.z = z * Math.cos(rotSpeed) - x * Math.sin(rotSpeed);
    // } else if (keyboard.pressed("right")){
        camera.position.y = y * Math.cos(rotSpeed) - x * Math.sin(rotSpeed);
        camera.position.x = x * Math.cos(rotSpeed) + y * Math.sin(rotSpeed);
    //}

    //camera.lookAt(scene.position);
    //camera.lookAt(0, 50, 50);
    //camera.lookAt(scene.position.x, scene.position.y, scene.position.z);

}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}


function animateTraces(object, size){

	var tracePoint = object.clone();
	console.log("tracePoint: " ,object.children[0].material);
	tracePoint.children[0].geometry = object.children[0].geometry.clone();
	tracePoint.children[0].material = object.children[0].material.clone();
	tracePoint.position.setFromMatrixPosition(object.matrixWorld);
	tracePoint.children[0].material.opacity *= 0.05;
	//tracePoint.children[0].scale.set(0.5, 0.5, 0.5);
	tracePoint.children[0].material.color = new THREE.Color( 0xffffff );
	tracesParent.add(tracePoint);


	// var o = object.children[0].material.opacity;
	// var map = parameters[0][1];
	// var tracePoint = new THREE.Sprite( new THREE.SpriteMaterial( { map: map, fog: false, opacity: 0.5, transparent: true} ) );
	// //var size = object.
	// tracePoint.scale.set(size, size, 1);
	// //var p = new THREE.Vector3();
	// var p = object.position.clone();
	// tracePoint.position.set(p.x, p.y, p.z);
	// tracesParent.add(tracePoint);

	var newSize = {x: 0.4, y: 0.4, z: 0.4};
	var tweenSize = new TWEEN.Tween( tracePoint.scale ).to(newSize, 6000);
	var tweenOpacity = new TWEEN.Tween( tracePoint.material ).to( { opacity: 0 }, 6000 );
	tweenOpacity.onComplete(function(){
		//console.log("tween complete: " ,tracePoint.children[0].material.opacity);
		tracesParent.remove(tracePoint);
	});
	tweenSize.start();
	tweenOpacity.start();
}

function animate() {


	//console.log("test");
	pos+=.1;
	var time = Date.now() * 0.0009;

	requestAnimationFrame( animate );
	// camera.lookAt(new THREE.Vector3(0,cameraOffsetY,0));
	// camera.position.x = Math.cos(pos * Math.PI / 180) * 1100;
	// camera.position.z = Math.sin(pos * Math.PI / 180) * 1100;


	objectWrapper.rotation.y += 0.003;

  mirrorsWrapper.rotation.y += 0.002;
  mirrorsWrapper.rotation.x += 0.0009;



  // k = 1;
  // // k = (mouse.x + 1) * 2;
  // for (var i = 0; i < cylinder_mesh.geometry.vertices.length; i++) {
  //     var p = cylinder_mesh.geometry.vertices[i];
  //     p.normalize().multiplyScalar(1 + 0.3 * noise.perlin3(p.x * k + time, p.y * k, p.z * k));
  // }


  // var peak = 170;
  // var smoothing = 140;
  // // smoothing = noise.perlin2(time/2600, time/2800) * 100 + 50;
  // var vertices = cylinder_mesh.geometry.vertices;
  //  for (var i = 0; i < vertices.length; i++) {
  //     vertices[i].z = peak * noise.perlin2(
  //       vertices[i].x/smoothing + (time/2300),
  //       vertices[i].y/smoothing + (time / 2700)
  //     );
  // }


  // cylinder_mesh.geometry.computeVertexNormals();
  // cylinder_mesh.geometry.verticesNeedUpdate = true; //must be set or vertices will not update

	for (var i = 0; i < objectWrapper.children.length; i++) {
		var thisObject = objectWrapper.children[i].children[0];
		thisObject.rotation.y += 0.005;
		thisObject.rotation.x += 0.002;
	}


	for (var i = 0; i < videos.length; i++) {
		var video = videos[i];
		var videoTexture = videoTextures[i];
		var videoImageContext = videoImageContexts[i];
		if ( video.readyState === video.HAVE_ENOUGH_DATA )
		{
			videoImageContext.drawImage( video, 0, 0, video.width, video.height );
			if ( videoTexture )
				videoTexture.needsUpdate = true;
		}

	}

  // for (var i = 0; i < mirrorsWrapper.children.length; i++) {
	// 	var thisObject = mirrorsWrapper.children[i];
	// 	thisObject.rotation.y += 0.009;
	// 	thisObject.rotation.x += 0.004;
  //   // thisObject.children[1].updateCubeMap(renderer3D, scene);
	// }

  // castRay();

	//camera.lookAt( scene.position );
	//TWEEN.update();
	controls.update();
  cubeCamera.updateCubeMap(renderer3D, scene);
	renderer3D.autoClear = true;
        // renderer3D.clear();
	//renderer3D.render( bgScene, camera );
	renderer3D.render( scene, camera );

}


function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer3D.setSize( window.innerWidth, window.innerHeight );
	//renderer2D.setSize( window.innerWidth, window.innerHeight );
	canvas2D.width = window.innerWidth*window.devicePixelRatio;
	canvas2D.height = window.innerHeight*window.devicePixelRatio;
	var displayWidth  = canvas2D.clientWidth;
		var displayHeight = canvas2D.clientHeight;
		console.log("window width: " ,window.innerWidth);
		console.log("window height: " ,window.innerHeight);
		console.log("canvas2d width: " ,displayWidth);
		console.log("canvas2d height: " ,displayHeight);

}
