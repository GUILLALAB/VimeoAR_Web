"use strict"
window.onload = function(){

  var numImages,
    galleryRadius,
    starCloud,
    origin,
    imagesLoaded = true,
    mouseDown = false,
    images = [],
    keyDown = [],
    starPaths=[],
    loadingBar = document.getElementById('loadingBar'),
    speedCoeff = document.getElementById('speedCoeff').value || 0.5,
    yaxis = new THREE.Vector3(0,1,0),
    loader =  new THREE.TextureLoader().setCrossOrigin('anonymous'),
    scene = new THREE.Scene().add( new THREE.AmbientLight(0xffffff) ),
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 10000 ),
    renderer = new THREE.WebGLRenderer();

  loadImages();
  function loadImages(){
    if(!imagesLoaded) return(false);

    //Unload
    images.forEach(function(image){ scene.remove(image); });
    images = [];
    imagesLoaded = false;
    loadingBar.style.width = 0 + '%';
    document.body.classList.remove('imagesLoaded');

    var arrLiteral = [
      "https://live.staticflickr.com/65535/49665275726_1c30ecbfa7_b.jpg",
     "https://live.staticflickr.com/4532/38192669192_c34a2736de_b.jpg",
      "https://live.staticflickr.com/65535/49662749712_973f24e77a_b.jpg",
      "https://live.staticflickr.com/4811/45990144472_390638b8f9_b.jpg",
      "https://live.staticflickr.com/1870/30809868338_91e5c2ef02_b.jpg",
      "https://live.staticflickr.com/4470/38194638566_5ce6bc0e9c_b.jpg",
      "https://live.staticflickr.com/4135/34900727553_fb4f523294_b.jpg",
      "https://live.staticflickr.com/1472/24151374099_d8fdcbc68c_b.jpg",
      "https://live.staticflickr.com/4572/37641706604_dd62e87104_b.jpg",
      "https://live.staticflickr.com/5587/14878002560_f9e0d079ab_b.jpg",
      "https://live.staticflickr.com/2900/14310248658_8c87d807c4_b.jpg",
    "https://live.staticflickr.com/2818/13757207994_bca81d83a2_b.jpg"]; // array literal

    //Preload
    numImages = 1 * ( document.getElementById('numImages').value || 12 );
    numImages=arrLiteral.length;
    galleryRadius = 1024 * numImages / Math.PI / 1.8;
    var galleryPhi = 2 * Math.PI / numImages;
    if( camera.position.length() > galleryRadius ){ camera.position.set(0,0,0); }

    //Load
    for(var i=0; i < arrLiteral.length; i++){ loadImage(i); }
    
    function loadImage(ind){
      loader.load(
        arrLiteral[i],
        function ( texture ) {
          var image = new THREE.Mesh(
            new THREE.PlaneGeometry(1020, 512), 
            new THREE.MeshBasicMaterial({ map: texture })
          );
          image.minFilter = THREE.LinearFilter;
          image.overdraw = true;
          image.rotation.y = - ind * galleryPhi;
          image.position.set( galleryRadius * Math.sin( ind * galleryPhi ), 0, - galleryRadius * Math.cos( ind * galleryPhi ) );
          images.push(image);
          loadingBar.style.width = Math.round( 100 * images.length / numImages ) + '%';
        },
        function ( xhr ) {
          console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
        },
        function ( xhr ) {
          console.log( 'An error happened' );
          loadImage(ind);
        }
      );
    }
    return true;
  }

  loadStars();
  function loadStars(){
    var starSpace = new THREE.Geometry();
    const planeGeometry = new THREE.PlaneBufferGeometry(10000, 10000, 8, 8);
    const planeMaterial = new THREE.MeshPhongMaterial({ color: 0xcccccc });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotateX(-Math.PI / 2);
    plane.position.y = -1000;
    plane.receiveShadow = true;
    plane.isDraggable = false;
    scene.add(plane);

    for(var i=0; i<1000; i++){
      starSpace.vertices.push( new THREE.Vector3( 0.5 - Math.random(), 0.5 - Math.random(), 0.5 - Math.random() ).normalize().multiplyScalar(4000 + (2000 * Math.random())));
      starSpace.colors.push(new THREE.Color(0xFFFFFF));
      starPaths.push( { 'axis': new THREE.Vector3(0.5 - Math.random(), 0.5 - Math.random(), 0.5 - Math.random() ), 'speed' : 0.0015 * Math.random() } );
    }
    starCloud = new THREE.Points(
      starSpace,
      new THREE.PointsMaterial({ size: 12,vertexColors: THREE.VertexColors})
    );
    scene.add(starCloud);
  }
  function moveStars(){
    starCloud.geometry.vertices.forEach(function(vertex,i){
      vertex.applyAxisAngle( starPaths[i]['axis'], starPaths[i]['speed'] );
    });
  }

  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
  render();
  function render() {

    if( ! imagesLoaded && images.length === numImages){
      images.forEach(function(image){ scene.add(image); });
      imagesLoaded = true;
      document.body.classList.add('imagesLoaded');      
    }

    keyNav();

    moveStars();
    starCloud.geometry.verticesNeedUpdate = true;
    
    renderer.render(scene, camera);
    requestAnimationFrame( render );
  }

  // Nav
  document.addEventListener(
    'keydown',
    function(e){ 
      keyDown[e.key]=true;
      if( e.key === '-' ) camera.rotation.y += Math.PI;
    },
    false
  );
  document.addEventListener(
    'keyup',
    function(e){ keyDown[e.key]=false; },
    false
  );
  function keyNav(){
    var newPos = new THREE.Vector3(0,0,0);
    if( keyDown['ArrowLeft'] || keyDown['ArrowRight'] || keyDown['ArrowUp'] || keyDown['ArrowDown'] ){
      document.body.classList.add('keyDown');
      if( keyDown['ArrowUp'] || keyDown['ArrowDown'] ){
        newPos.add( camera.getWorldDirection().multiplyScalar( keyDown['ArrowUp'] ? 1 : -1 ) );
      }
      if( keyDown['ArrowLeft'] || keyDown['ArrowRight']){
        if( keyDown['Shift'] ){
          newPos.add( camera.getWorldDirection().applyAxisAngle( yaxis, (keyDown['ArrowLeft'] ? 1 : -1) * Math.PI / 2));
        } else {
          camera.rotation.y += (keyDown['ArrowLeft'] ? 1 : -1) * speedCoeff * Math.PI / 60;
        }
      }
      newPos
        .normalize()
        .multiplyScalar( speedCoeff * 7 * numImages )
        .add( camera.position );
      if( newPos.length() < 0.95 * galleryRadius ){
        camera.position.set( newPos.x, 0, newPos.z );
      }
    }
    else{
      document.body.classList.remove('keyDown')
    }
  } 
  document.addEventListener(
    'mousedown', 
    function(e){
      if(!mouseDown){
        mouseDown = e;
        origin = { 'angle' : camera.rotation.y, 'position' : camera.position };
        document.body.classList.add('mouseDown');
      }
    },
    false
  );
  document.addEventListener(
    'mouseup',
    function(e){ 
      mouseDown = false;
      document.body.classList.remove('mouseDown');
    },
    false
  );
  document.addEventListener(
    'mousemove',
    function(e){
      var newPos;
      if(mouseDown){
        newPos = camera.getWorldDirection()
          .multiplyScalar( e.clientY - mouseDown.clientY );
        if(keyDown['Shift']){
          newPos.add( camera.getWorldDirection()
            .applyAxisAngle( yaxis, - Math.PI / 2)
            .multiplyScalar( e.clientX - mouseDown.clientX ) 
          );
        } else {
          camera.rotation.y = origin['angle'] + ( 1.5 * speedCoeff * Math.PI * ( e.clientX - mouseDown.clientX ) / window.innerWidth );
        }
        newPos
          .multiplyScalar( speedCoeff * galleryRadius / window.innerWidth / 10 ) 
          .add( origin['position'] );    
        if( newPos.length() < 0.95 * galleryRadius ){
          camera.position.set( newPos.x, 0, newPos.z);
        }
      }
    },
    false
  );

  //UI
  document.getElementById('close').addEventListener(
    'click',
    function(){ this.parentNode.style.display = 'none'; },
    false
  );
  document.getElementById('minMax').addEventListener(
    'click',
    function(){
      this.parentNode.classList.toggle('hidden');
      this.blur();
    },
    false
  );
  document.getElementById('speedCoeff').addEventListener(
    'change',
    function(){ 
      speedCoeff = this.value;
      document.getElementById('speedCoeffLabel').innerHTML = 'Speed: ' + Math.round( this.value * 100 ) + '%';
      this.blur();
    },
    false
  );  
  document.getElementById('numImages').addEventListener(
    'change',
    function(){
      if( loadImages() ){
        document.getElementById('numImagesLabel').innerHTML = 'Images: ' + this.value;
      }
      else{ this.value = numImages; }
      this.blur();
    },
    false
  );  
  document.getElementById('loadImages').addEventListener(
    'click',
    function(){
      loadImages();
      this.blur();
    },
    false
  );

  window.addEventListener(
    'resize',
    function () {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize( window.innerWidth, window.innerHeight );
    }, 
    false
  );
};