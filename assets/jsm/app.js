import * as THREE from './three.module.js';
import { RGBELoader } from './RGBELoader.js';
import { LoadingBar } from './LoadingBar.js';

class App{
    constructor(){
        const container = document.createElement( 'div' );
        document.body.appendChild( container );
        
        this.loadingBar = new LoadingBar();
        this.material=null;

        this.mesh=null;
        this.texture=null;
        this.start=0;
        this.videolink=null;
        this.data=null;

        this.loadingBar.visible = false;
       this.video = document.getElementById( 'video' );
       this.hls = new Hls();
      console.log("test");

   //     this.assetsPath = '../../assets/ar-shop/';
        
        this.camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.01, 20 );
        this.camera.position.set( 0, 1.6, 0 );
        
        this.scene = new THREE.Scene();

        const ambient = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
        ambient.position.set( 0.5, 1, 0.25 );
        this.scene.add(ambient);
            
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true } );
        this.renderer.setPixelRatio( window.devicePixelRatio );
        this.renderer.setSize( window.innerWidth, window.innerHeight );
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        container.appendChild( this.renderer.domElement );
       // this.setEnvironment();
        
        this.reticle = new THREE.Mesh(
            new THREE.RingBufferGeometry( 0.15, 0.2, 32 ).rotateX( - Math.PI / 2 ),
            new THREE.MeshBasicMaterial()
        );
        
        this.btnvideos = document.getElementById('btnvideos');
        this.btnvideos.style.display="none";

        this.movie = document.getElementById('movielist');
        this.movie.style.display="none";
        this.reticle.matrixAutoUpdate = false;
        this.reticle.visible = false;
        this.scene.add( this.reticle );
        
        this.setupXR();
        const self = this;

        window.addEventListener('resize', this.resize.bind(this) );
    }
   
    test(test){
      console.log("test");}
    
     setVideo(){

       self.source = document.getElementById('source');
       this.texture = new THREE.VideoTexture(this.video);
       this.texture.minFilter = THREE.LinearFilter;
       this.texture.magFilter = THREE.LinearFilter;
       this.texture.format = THREE.RGBFormat;
        
        self.geometry = new THREE.PlaneBufferGeometry( 2, 1);
    
       self.vertexShader = document.getElementById("vertexShader").textContent;
        self.fragmentShader = document.getElementById("fragmentShader").textContent;
    
          // Cia o material usando a urlVideoTexture
    
          this.material = new THREE.ShaderMaterial({
            transparent: true,
            uniforms: {
              map: { value: this.texture },
              keyColor: { value: [0.0, 1.0, 0.0] },
              similarity: { value: 0.74 },
              smoothness: { value: 0.0 }
            },
            vertexShader: self.vertexShader,
            fragmentShader: self.fragmentShader
          });
    
        //  self.material = new THREE.MeshBasicMaterial( {color: 0x000000} );

        this.mesh = new THREE.Mesh( self.geometry, this.material);
        this.scene.add(this.mesh);
        this.mesh.visible=true;
        
   }
    
      PlayVideo(url){
        this.data=url.split('~');

        this.updateName = async () => {
          const documentClient = new AWS.DynamoDB.DocumentClient();
        
          const newName =  (+this.data[2]) + (+1);

          const params = {
            TableName: 'VideoAWS',
            Key: {
              guid: this.data[1],
            },
            UpdateExpression: 'set title = :r',
            ExpressionAttributeValues: {
              ':r': newName,
            },
          };
        
          await documentClient.update(params).promise();
        }

        this.updateName();

        const self = this;
        self.hls = new Hls();
        if (Hls.isSupported()) {
          self.hls.loadSource(this.data[0]);
          self.hls.attachMedia(self.video);
          self.hls.on(Hls.Events.MANIFEST_PARSED, function () {
            self.video.play();
            
            console.log("HLS");
          });
        } else {
          // HLS isnt supported in iOS, so we do it natively
          var file = this.data[0];
          self.video.src = file;
          console.log("MP4");
          self.video.addEventListener("loadedmetadata", function () {
            self.video.play();
          });
        }
     
         // HLS isnt supported in iOS, so we do it natively
      
       
      
           
         }


         

         checkXR(){
            this.renderer.xr.enabled = true;
        
            if ( 'xr' in navigator ) {
    
                navigator.xr.isSessionSupported( 'immersive-ar' ).then( ( supported ) => {
    
                    if (supported){
                        const collection = document.getElementsByClassName("ar-button");
            
    
                     //   const collection   = document.getElementById("home_product").querySelector('li[id='+btn+']').querySelector("#"+btn+"").getElementsByClassName("ar-button");
                        [...collection].forEach( el => {
                            el.style.display = 'block';
                        });
                    }
                } );
                
            } 
         }
    setupXR(){
        this.checkXR();
    
        const self = this;

        this.hitTestSourceRequested = false;
        this.hitTestSource = null;
        
        function onSelect() {
          //  if (self.chair===undefined) return;
            
            if (self.reticle!=null){
               // self.chair.position.setFromMatrixPosition( self.reticle.matrix );

                if(self.mesh!=null){

                    if(self.start==0){
                self.mesh.position.setFromMatrixPosition( self.reticle.matrix );
                self.PlayVideo(self.videolink);
                self.mesh.scale.set( 5,5,5 );
                self.start=1;
                self.mesh.visible=true;
            }else{              
                  self.mesh.position.setFromMatrixPosition( self.reticle.matrix );
                  self.mesh.scale.set( 5,5,5 );
                  self.video.play();
                  self.mesh.visible=true;

                    }
                }
              //  self.chair.visible = true;
            }
        }

        this.controller = this.renderer.xr.getController( 0 );
        this.controller.addEventListener( 'select', onSelect );
        
        this.scene.add( this.controller );
    }
    
    resize(){
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize( window.innerWidth, window.innerHeight ); 
    }
    
    setEnvironment(){
        const loader = new RGBELoader().setDataType( THREE.UnsignedByteType );
        const pmremGenerator = new THREE.PMREMGenerator( this.renderer );
        pmremGenerator.compileEquirectangularShader();
        
        const self = this;
        
        loader.load( '../../assets/hdr/venice_sunset_1k.hdr', ( texture ) => {
          const envMap = pmremGenerator.fromEquirectangular( texture ).texture;
          pmremGenerator.dispose();

          self.scene.environment = envMap;

        }, undefined, (err)=>{
            console.error( 'An error occurred setting the environment');
        } );
    }
    
    showRowVideos(){
     if(this.movie.style.display=="none"){
      this.movie.style.display="block";
      this.reticle.visible=true;

     }else{
      this.movie.style.display="none";
      this.reticle.visible=false;
     }
    }

   
    showChair(url){

      

        this.initAR();

        const collection = document.getElementsByClassName("row");
        [...collection].forEach( el => {
          el.style.display = 'none';
        });

        const collections = document.getElementsByClassName("footer-basic");
        [...collections].forEach( el => {
          el.style.display = 'none';
        });
        this.movie.style.display="block";
        this.btnvideos.style.display="block";

       this.video = document.getElementById( 'video' );
       this.data=url;
        this.videolink=url;
        document.getElementById("uploadtop").style.display = "block";

       /* this.updateName = async () => {
          const documentClient = new AWS.DynamoDB.DocumentClient();
        
          const newName =  (+this.hls[2]) + (+1);

          const params = {
            TableName: 'VideoAWS',
            Key: {
              guid: this.hls[1],
            },
            UpdateExpression: 'set title = :r',
            ExpressionAttributeValues: {
              ':r': newName,
            },
          };
        
          await documentClient.update(params).promise();
        }

        this.updateName();*/
      //  this.test = document.querySelector('[data-id]');
      //  const loader = new GLTFLoader( ).setPath(this.assetsPath);
        const self = this;
       
        this.loadingBar.visible = true;
        this.loadingBar.visible = false;

        // Load a glTF rsource
       /* loader.load(
            `chair${id}.glb`,

            function ( gltf ) {

                self.scene.add( gltf.scene );
                self.chair = gltf.scene;
        
                self.chair.visible = false; 
                
                self.loadingBar.visible = false;
                self.renderer.setAnimationLoop( self.render.bind(self) );
            },
            function ( xhr ) {

                self.loadingBar.progress = (xhr.loaded / xhr.total);
                
            },
            function ( error ) {

                console.log( 'An error happened' );

            }
        );*/
        if(this.mesh==null){
        self.setVideo();
        }
        self.renderer.setAnimationLoop( self.render.bind(self) );

    }           
    
    initAR(){
        let currentSession = null;
        const self = this;
        
        const sessionInit = { requiredFeatures: ['hit-test'], optionalFeatures: [ 'dom-overlay', 'dom-overlay-for-handheld-ar' ], domOverlay: { root: document.body } };

        
        function onSessionStarted( session ) {

            session.addEventListener( 'end', onSessionEnded );

            self.renderer.xr.setReferenceSpaceType( 'local' );
            self.renderer.xr.setSession( session );
       
            currentSession = session;
            
        }

        function onSessionEnded( ) {

            currentSession.removeEventListener( 'end', onSessionEnded );
            const collection = document.getElementsByClassName("row");
            [...collection].forEach( el => {
              el.style.display = 'block';
            });

            const collections = document.getElementsByClassName("footer-basic");
            [...collections].forEach( el => {
              el.style.display = 'block';
            });
            self.movie.style.display="none";
            document.getElementById("uploadtop").style.display = "none";

            
            if (self.mesh !== null){
             //   self.scene.remove( self.chair );
             self.video.pause();              
             self.mesh.visible=false;
             self.start=0;
             //   self.chair = null;
            }
            currentSession = null;

            self.renderer.setAnimationLoop( null );

        }

        if ( currentSession === null ) {

            navigator.xr.requestSession( 'immersive-ar', sessionInit ).then( onSessionStarted );

        } else {

            currentSession.end();

        }
    }
    
    requestHitTestSource(){
        const self = this;
        
        const session = this.renderer.xr.getSession();

        session.requestReferenceSpace( 'viewer' ).then( function ( referenceSpace ) {
            
            session.requestHitTestSource( { space: referenceSpace } ).then( function ( source ) {

                self.hitTestSource = source;

            } );

        } );

        session.addEventListener( 'end', function () {

            self.hitTestSourceRequested = false;
            self.hitTestSource = null;
            self.referenceSpace = null;

        } );

        this.hitTestSourceRequested = true;

    }
    
    getHitTestResults( frame ){
        const hitTestResults = frame.getHitTestResults( this.hitTestSource );

        if ( hitTestResults.length ) {
            
            const referenceSpace = this.renderer.xr.getReferenceSpace();
            const hit = hitTestResults[ 0 ];
            const pose = hit.getPose( referenceSpace );

            this.reticle.visible = true;
            this.reticle.matrix.fromArray( pose.transform.matrix );

        } else {

            this.reticle.visible = false;

        }

    }
    
    render( timestamp, frame ) {

        if ( frame ) {
            if ( this.hitTestSourceRequested === false ) this.requestHitTestSource( )

            if ( this.hitTestSource ) this.getHitTestResults( frame );
        }


        if(this.mesh!=null){
            this.mesh.lookAt(this.camera.position);
  
          }
  

  
          if(this.video!=null)
          {
            if ( this.video.readyState === this.video.HAVE_ENOUGH_DATA ) 
            {
              if ( this.texture ) 
              this.texture.needsUpdate = true;
            }
          }

        this.renderer.render( this.scene, this.camera );

    }
}

export { App };