
// create client 
var agoraAppId = null; // insert Agora AppID here
var channelName = null;
var streamCount = null;
var client =null;
var rtmClient = null;



export function initInstance(){
      agoraAppId = 'e76fbfaa876b4c68a5d92d92aa6ad3b1'; // insert Agora AppID here
      streamCount = 0;
      client = AgoraRTC.createClient({ mode: 'live', codec: 'vp8' }); // vp8 to work across mobile devices
      rtmClient = AgoraRTM.createInstance(agoraAppId);
      AgoraRTC.Logger.setLogLevel(AgoraRTC.Logger.DEBUG);

}

export function InitClients() {
  if (client != null) {
    // connect remote streams
    client.on('stream-added', (evt) => {
      const stream = evt.stream;
      const streamId = stream.getId();
      console.log('New stream added: ' + streamId);
      console.log('Subscribing to remote stream:' + streamId);
      // Subscribe to the stream.
      client.subscribe(stream, (err) => {
        console.log('[ERROR] : subscribe stream failed', err);
      });

      streamCount++;
   //   createBroadcaster(streamId);  // create 3d broadcaster
    });
    client.on('stream-removed', (evt) => {
      const stream = evt.stream;
      stream.stop(); // stop the stream
      stream.close(); // clean up and close the camera stream
      console.log('Remote stream is removed ' + stream.getId());
    });

    client.on('stream-subscribed', (evt) => {
      const remoteStream = evt.stream;
      const remoteId = remoteStream.getId();
      console.log('Successfully subscribed to remote stream: ' + remoteStream.getId());

      // get the designated video element and add the stream as its video source
      var video = document.getElementById('video');
      connectStreamToVideo(remoteStream, video);

    });

    // remove the remote-container when a user leaves the channel
    client.on('peer-leave', (evt) => {
      console.log('Remote stream has left the channel: ' + evt.uid);
      evt.stream.stop(); // stop the stream
      const remoteId = evt.stream.getId();
      document.getElementById(remoteId).remove();
      document.getElementById('video');
      streamCount--;
    });

    // show mute icon whenever a remote has muted their mic
    client.on('mute-audio', (evt) => {
      console.log('mute-audio for: ' + evt.uid);
    });

    client.on('unmute-audio', (evt) => {
      console.log('unmute-audio for: ' + evt.uid);
    });

    // show user icon whenever a remote has disabled their video
    client.on('mute-video', (evt) => {
      console.log('mute-video for: ' + evt.uid);
    });

    client.on('unmute-video', (evt) => {
      console.log('unmute-video for: ' + evt.uid);
    });
  }

  if (rtmClient != null) {
    rtmClient.on('ConnectionStateChange', (newState, reason) => {
      console.log('on connection state changed to ' + newState + ' reason: ' + reason);
    });
  }

  // event listener for receiving a channel message


}


export function initAgora(channelName) {

  initInstance();
  
if(client!=null){
  client.init(agoraAppId, () => {
    console.log('AgoraRTC client initialized');
    joinChannel(channelName); // join channel upon successfull init
  }, function (err) {
    console.log('[ERROR] : AgoraRTC client init failed', err);
  });
}
}



 function joinChannel(channelName) {
  //alert(name);
  // set the role
  fetch("https://livear.herokuapp.com/rte/" + channelName + "/audience/uid/0/86400").then(function (response) {
    return response.json();
  }).then(function (data) {
    //  alert(token);

    client.setClientRole('audience', () => {
      console.log('Client role set to audience');
    }, (e) => {
      console.log('setClientRole failed', e);
    });


    client.join(data.rtcToken, channelName, 0, (uid) => {
      console.log('User ' + uid + ' join channel successfully');
    }, function (err) {
      console.log('[ERROR] : join channel failed', err);
    });

  }).catch(function () {
  });

}

export function leaveChannel() {
  if(client!=null){
  client.leave(() => {

    console.log('client leaves channel');
  }, (err) => {
    console.log('client leave failed ', err); //error handling
  });
}
}

// Agora RTM
// setu the RTM clit and channel


 function createBroadcaster(streamId) {
  // create video element
  video = document.createElement('video');
  video.setAttribute('webkit-playsinline', 'webkit-playsinline');
  video.setAttribute('playsinline', 'playsinline');
  video.setAttribute('poster', '/imgs/no-video.jpg');
  texture = new THREE.VideoTexture(video);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.format = THREE.RGBFormat;
  texture.flipY = true;

  var geometry = new THREE.PlaneBufferGeometry(20, 10);

  const vertexShader = document.getElementById("vertexShader").textContent;
  const fragmentShader = document.getElementById("fragmentShader").textContent;

  var material = new THREE.ShaderMaterial({
    transparent: true,
    uniforms: {
      map: { value: texture },
      keyColor: { value: [0.0, 1.0, 0.0] },
      similarity: { value: 0.74 },
      smoothness: { value: 0.0 }
    },
    vertexShader: vertexShader,
    fragmentShader: fragmentShader
  });
  material.color = new THREE.Color();
  material.metalness = 0;
  var mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  //ads


}

 function connectStreamToVideo(agoraStream, video) {
  if(video!=null){
  video.srcObject = agoraStream.stream;// add video stream to video element as source
  video.onloadedmetadata = () => {
    // ready to play video
    video.play();  
  }
}
}






