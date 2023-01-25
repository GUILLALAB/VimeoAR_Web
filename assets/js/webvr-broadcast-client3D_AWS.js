// Agora settings
//import {sayHello} from './server.js';

const agoraAppId = 'e76fbfaa876b4c68a5d92d92aa6ad3b1'; // insert Agora AppID here
var channelName = '';
var streamCount = 0;
var token = "";
var rtmChannel = null;
// video profile settings
var cameraVideoProfile = '720p_6'; // 960 × 720 @ 30fps  & 750kbs

// set log level:
// -- .DEBUG for dev 
// -- .NONE for prod
AgoraRTC.Logger.setLogLevel(AgoraRTC.Logger.DEBUG);
//sayHello('Jack');
var video = document.getElementById("video");
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
// keep track of streams
var localStreams = {
  uid: '',
  camera: {
    camId: '',
    micId: '',
    stream: {}
  },
  screen: {
    id: '',
    stream: {}
  },
  rtmActive: false
};

// keep track of devices
var devices = {
  cameras: [],
  mics: []
}

export var Broadcaster =
{
  id: null,
  channel: null,
  username: null,
  objecturl: null,
  time: null,
  all: null
};

var rtcClient = AgoraRTC.createClient({ mode: 'live', codec: 'vp8' }); // vp8 to work across mobile devices
var rtmClient = AgoraRTM.createInstance(agoraAppId);

var start = document.getElementById('start');
start.addEventListener('click', init);

if (rtmChannel != null) {
  rtmChannel.on('ChannelMessage', ({ text }, senderId) => {
    // text: text of the received channel message; senderId: user ID of the sender.
    console.log('AgoraRTM msg from user ' + senderId + ' recieved: \n' + text);
    // convert from string to JSON
    const msg = JSON.parse(text);
    // Handle RTM msg 
    if (msg.property === 'rotation') {
      rotateModel(senderId, msg.direction, false)
    } else if (msg.property == 'position') {
      moveModel(senderId, msg.direction, false)
    }
  });
}
if (rtmClient != null) {
  rtmClient.on('ConnectionStateChange', (newState, reason) => {
    console.log('on connection state changed to ' + newState + ' reason: ' + reason);
  });
}
if (rtcClient != null) {
  rtcClient.on('stream-published', function (evt) {
    console.log('Publish local stream successfully');
  });

  // connect remote streams
  rtcClient.on('stream-added', (evt) => {
    const stream = evt.stream;
    const streamId = stream.getId();
    console.log('New stream added: ' + streamId);
    console.log('Subscribing to remote stream:' + streamId);
    // Subscribe to the remote stream
    rtcClient.subscribe(stream, (err) => {
      console.log('[ERROR] : subscribe stream failed', err);
    });

    streamCount++; // Increase count of Active Stream Count
    createBroadcaster(streamId); // Load 3D model with video texture
  });

  rtcClient.on('stream-removed', (evt) => {
    const stream = evt.stream;
    stream.stop(); // stop the stream
    stream.close(); // clean up and close the camera stream
    console.log('Remote stream is removed ' + stream.getId());
  });

  rtcClient.on('stream-subscribed', (evt) => {
    const remoteStream = evt.stream;
    const remoteId = remoteStream.getId();
    console.log('Successfully subscribed to remote stream: ' + remoteStream.getId());

    // get the designated video element and connect it to the remoteStream
    var video = document.getElementById('faceVideo-' + remoteId);
    console.log("stream-subscribed " +'faceVideo-' + remoteId);
    connectStreamToVideo(remoteStream, video);
  });

  // remove the remote-container when a user leaves the channel
  rtcClient.on('peer-leave', (evt) => {
    console.log('Remote stream has left the channel: ' + evt.uid);
    evt.stream.stop(); // stop the stream
    const remoteId = evt.stream.getId();
    // Remove the 3D and Video elements that were created
    console.log("stream-leave " +'faceVideo-' + remoteId);
    document.getElementById('faceVideo-' + remoteId).id="video";
  //  document.getElementById(remoteId).remove();
  //  document.getElementById('faceVideo-' + remoteId).remove();
    streamCount--;  // Decrease count of Active Stream Count
  });

  // show mute icon whenever a remote has muted their mic
  rtcClient.on('mute-audio', (evt) => {
    console.log('mute-audio for: ' + evt.uid);
  });

  rtcClient.on('unmute-audio', (evt) => {
    console.log('unmute-audio for: ' + evt.uid);
  });

  // show user icon whenever a remote has disabled their video
  rtcClient.on('mute-video', (evt) => {
    console.log('mute-video for: ' + evt.uid);
  });

  rtcClient.on('unmute-video', (evt) => {
    console.log('unmute-video for: ' + evt.uid);
  });

}
// event listener for receiving a channel message


// create RTC client 
function generateUUID_LiveStream() {
  var d = new Date().getTime();
  var uuid = 'Livexxxxxxxx-xxxx-xxxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = (d + Math.random()*16)%16 | 0;
      d = Math.floor(d/16);
     return (c=='x' ? r : (r&0x3|0x8)).toString(16);
  });
  return uuid; };

function init() {
  // setup the RTM client and channel
   rtcClient = AgoraRTC.createClient({ mode: 'live', codec: 'vp8' }); // vp8 to work across mobile devices
   rtmClient = AgoraRTM.createInstance(agoraAppId);  
 // if (document.getElementById("myInput").value.length > 1) {
   // channelName = document.getElementById("myInput").value;
   channelName = generateUUID_LiveStream();
    rtmChannel = rtmClient.createChannel(channelName);

    rtcClient.init(agoraAppId, () => {
      console.log('AgoraRTC client initialized');
      joinChannel(); // join channel upon successfull init
    }, function (err) {
      console.log('[ERROR] : AgoraRTC client init failed', err);
    });
 // } else { alert("Enter a channel name"); }
}




// join a channel
function joinChannel() {
  //alert(name);
  // set the role

  fetch("https://livear.herokuapp.com/rte/" + channelName + "/publisher/uid/" + localStorage.getItem('sub') + "/86400").then(function (response) {
    return response.json();
  }).then(function (data) {
    token = data.rtcToken;
    //  alert(token);

    rtcClient.setClientRole('audience', () => {
      console.log('Client role set to audience');
    }, (e) => {
      console.log('setClientRole failed', e);
    });

    rtcClient.join(token, channelName, localStorage.getItem('sub'), (uid) => {

      console.log('User ' + uid + ' join channel successfully');
      localStreams.uid = uid;
      createBroadcaster(uid);   // Load 3D model with video texture
      createCameraStream(uid);  // Create the camera stream
      joinRTMChannel(uid);      // join the RTM channel
    }, (err) => {
      console.log('[ERROR] : join channel failed', err);
    });

  }).catch(function () {
  });



}

function leaveChannel() {

  rtcClient.leave(() => {
    console.log('client leaves channel');
    localStreams.camera.stream.stop()   // stop the camera stream playback
    localStreams.camera.stream.close(); // clean up and close the camera stream
    rtcClient.unpublish(localStreams.camera.stream); // unpublish the camera stream
    //disable the UI elements
    $('#mic-btn').prop('disabled', true);
    $('#video-btn').prop('disabled', true);
    $('#exit-btn').prop('disabled', true);
    ctx.canvas.hidden = true;
   // UserStopBroadcast(); IMPORTTANT
   var event = new CustomEvent("stopstream", { 
    detail: {
      videoid: Broadcaster.id,
      channel:Broadcaster.channel,
}
  });

  document.dispatchEvent(event);
    //LoadBroadcast();
  }, (err) => {
    console.log('client leave failed ', err); //error handling
  });
}

// video streams for channel
function createCameraStream(uid) {

  const localStream = AgoraRTC.createStream({
    streamID: uid,
    // audio: true,
    audio: true,
    video: true,
    screen: false
  });

  localStream.setVideoProfile(cameraVideoProfile);

  // The user has granted access to the camera and mic.
  localStream.on('accessAllowed', () => {
    if (devices.cameras.length === 0 && devices.mics.length === 0) {
      console.log('[DEBUG] : checking for cameras & mics');
      getCameraDevices();
      getMicDevices();
    }
    console.log('accessAllowed');
  });
  // The user has denied access to the camera and mic.
  localStream.on('accessDenied', () => {
    console.log('accessDenied');
  });

  localStream.init(() => {
    console.log('getUserMedia successfully');
    // Coonect the local stream video to the video texture
    var video = document.getElementById('faceVideo-' + uid);
    connectStreamToVideo(localStream, video);
    enableUiControls(localStream);
    // publish local stream
    rtcClient.publish(localStream, (err) => {
      console.log('[ERROR] : publish local stream error: ' + err);
    });
    // keep track of the camera stream for later
    localStreams.camera.stream = localStream;
  }, (err) => {
    console.log('[ERROR] : getUserMedia failed', err);
  });
}

function createBroadcaster(streamId) {
  // create video element

  
  video = document.getElementById("video");
  video.id = 'faceVideo-' + streamId;
  console.log("createBroadcaster " +'faceVideo-' + streamId);

  video.setAttribute('webkit-playsinline', 'webkit-playsinline');
  video.setAttribute('playsinline', 'playsinline');
  video.setAttribute('poster', '/imgs/no-video.jpg');
  // add video object to the DOM
  const offset = streamCount;
  const position = offset * 3 + ' -1.8 0';
}
function update() {
  var width = (window.innerWidth > 0) ? window.innerWidth : screen.width;
  var height = (window.innerHeight > 0) ? window.innerHeight : screen.height;

  //ctx.drawImage(video, 0, 0, width, height);
  requestAnimationFrame(update);
}

function connectStreamToVideo(agoraStream, video) {
  video.srcObject = agoraStream.stream;// add video stream to video element as source
  //canvas = document.getElementById("canvas");
 // ctx = canvas.getContext("2d");
 // ctx.canvas.width = window.innerWidth;
 // ctx.canvas.height = window.innerHeight;
 // ctx.canvas.hidden = false;
  //UserStartBroadcast(channelName, video.id);

  Broadcaster.id=video.id;
  Broadcaster.channel=channelName;

  var event = new CustomEvent("stream", { 
    detail: {
      videoid: video.id,
      channel:channelName

}
  });
  document.dispatchEvent(event);

}
  


function changeStreamSource(deviceIndex, deviceType) {
  console.log('Switching stream sources for: ' + deviceType);
  var deviceId;

  if (deviceType === 'video') {
    deviceId = devices.cameras[deviceIndex].deviceId
  } else if (deviceType === 'audio') {
    deviceId = devices.mics[deviceIndex].deviceId;
  }

  localStreams.camera.stream.switchDevice(deviceType, deviceId, () => {
    console.log('successfully switched to new device with id: ' + JSON.stringify(deviceId));
    // set the active device ids
    if (deviceType === 'audio') {
      localStreams.camera.micId = deviceId;
    } else if (deviceType === 'video') {
      localStreams.camera.camId = deviceId;
    } else {
      console.log('unable to determine deviceType: ' + deviceType);
    }
  }, () => {
    console.log('failed to switch to new device with id: ' + JSON.stringify(deviceId));
  });
}

function joinRTMChannel(uid) {
  console.log('uid:')
  console.log(uid)
  rtmClient.login({ token: null, uid: String(uid) }).then(() => {
    console.log('AgoraRTM client login success');
    // join a channel and send a message
    rtmChannel.join().then(() => {
      // join-channel success
      localStreams.rtmActive = true
      console.log('RTM Channel join success');
      addCameraListener();
    }).catch(error => {
      // join-channel failure
      console.log('failed to join channel for error: ' + error);
    });
  }).catch(err => {
    console.log('AgoraRTM client login failure', err);
  });
}

function sendChannelMessage(action, direction) {
  if (localStreams.rtmActive) {
    // use a JSON object to send our instructions in a structured way
    const jsonMsg = {
      action: action,
      direction: direction
    };
    // build the Agora RTM Message
    const msg = {
      description: undefined,
      messageType: 'TEXT',
      rawMessage: undefined,
      text: JSON.stringify(jsonMsg)
    };

    rtmChannel.sendMessage(msg).then(() => {
      // channel message-send success
      console.log('sent msg success');
    }).catch(error => {
      // channel message-send failure
      console.log('sent msg failure');
    });
  }
}

// helper methods
function getCameraDevices() {
  console.log('Checking for Camera Devices.....')
  rtcClient.getCameras((cameras) => {
    devices.cameras = cameras; // store cameras array
    cameras.forEach((camera, i) => {
      const name = camera.label.split('(')[0];
      const optionId = 'camera_' + i;
      const deviceId = camera.deviceId;
      if (i === 0 && localStreams.camera.camId === '') {

        localStreams.camera.camId = deviceId;
      }
      $('#camera-list').append('<a class=\'dropdown-item\' id= ' + optionId + '>' + name + '</a>');
    });
    $('#camera-list a').click((event) => {
      const index = event.target.id.split('_')[1];
      changeStreamSource(index, 'video');
    });
  });
}

function getMicDevices() {
  console.log('Checking for Mic Devices.....')
  rtcClient.getRecordingDevices((mics) => {
    devices.mics = mics; // store mics array
    mics.forEach((mic, i) => {
      let name = mic.label.split('(')[0];
      const optionId = 'mic_' + i;
      const deviceId = mic.deviceId;
      if (i === 0 && localStreams.camera.micId === '') {
        localStreams.camera.micId = deviceId;
      }
      if (name.split('Default - ')[1] != undefined) {
        name = '[Default Device]' // rename the default mic - only appears on Chrome & Opera
      }
      $('#mic-list').append('<a class=\'dropdown-item\' id= ' + optionId + '>' + name + '</a>');
    });
    $('#mic-list a').click((event) => {
      const index = event.target.id.split('_')[1];
      changeStreamSource(index, 'audio');
    });
  });
}




function rotateModel(uid, direction, send) {
  if (send) {
    sendChannelMessage('rotation', direction)
  }
  var model = document.getElementById(uid)
  if (direction === 'counter-clockwise') {
    model.object3D.rotation.y += 0.1;
  } else if (direction === 'clockwise') {
    model.object3D.rotation.y -= 0.1;
  }
}

function moveModel(uid, direction, send) {
  if (send) {
    sendChannelMessage('position', direction)
  }
  var model = document.getElementById(uid)
  switch (direction) {
    case 'forward':
      model.object3D.position.z += 0.1
      break;
    case 'backward':
      model.object3D.position.z -= 0.1
      break;
    case 'left':
      model.object3D.position.x -= 0.1
      break;
    case 'right':
      model.object3D.position.x += 0.1
      break;
    default:
      console.log('Unable to determin direction: ' + direction);
  }
}

// UI
function toggleBtn(btn) {
  btn.toggleClass('btn-dark').toggleClass('btn-danger');
}

function toggleScreenShareBtn() {
  $('#screen-share-btn').toggleClass('btn-danger');
  $('#screen-share-icon').toggleClass('fas').toggleClass('fab').toggleClass('fa-slideshare').toggleClass('fa-times-circle');
}

function toggleVisibility(elementID, visible) {
  if (visible) {
    $(elementID).attr('style', 'display:block');
  } else {
    $(elementID).attr('style', 'display:none');
  }
}

function toggleMic() {
  toggleBtn($('#mic-btn')); // toggle button colors
  toggleBtn($('#mic-dropdown'));
  $('#mic-icon').toggleClass('fa-microphone').toggleClass('fa-microphone-slash'); // toggle the mic icon
  if ($('#mic-icon').hasClass('fa-microphone')) {
    localStreams.camera.stream.unmuteAudio(); // enable the local mic
  } else {
    localStreams.camera.stream.muteAudio(); // mute the local mic
  }
}

function toggleVideo() {
  toggleBtn($('#video-btn')); // toggle button colors
  toggleBtn($('#cam-dropdown'));
  if ($('#video-icon').hasClass('fa-video')) {
    localStreams.camera.stream.muteVideo(); // enable the local video
    console.log('muteVideo');
  } else {
    localStreams.camera.stream.unmuteVideo(); // disable the local video
    console.log('unMuteVideo');
  }
  $('#video-icon').toggleClass('fa-video').toggleClass('fa-video-slash'); // toggle the video icon
}



function enableUiControls() {

  $('#mic-btn').prop('disabled', false);
  $('#video-btn').prop('disabled', false);
  $('#exit-btn').prop('disabled', false);

  $('#mic-btn').click(() => {
    toggleMic();
  });

  $('#video-btn').click(() => {
    toggleVideo();
  });

  $('#exit-btn').click(() => {
    console.log('so sad to see you leave the channel');
    leaveChannel();
  });

  // keyboard listeners 
  $(document).keypress((e) => {
    switch (e.key) {
      case 'm':
        console.log('squick toggle the mic');
        toggleMic();
        break;
      case 'v':
        console.log('quick toggle the video');
        toggleVideo();
        break;
      case 'q':
        console.log('so sad to see you quit the channel');
        leaveChannel();
        break;
      case 'r':
        rotateModel(localStreams.uid, 'counter-clockwise', true)
        break;
      case 'e':
        rotateModel(localStreams.uid, 'clockwise', true)
        break;
      case 'd':
        // move the model forward
        moveModel(localStreams.uid, 'forward', true)
        break;
      case 'x':
        // move the model backward
        moveModel(localStreams.uid, 'backward', true)
        break;
      case 'z':
        // move the model left
        moveModel(localStreams.uid, 'left', true)
        break;
      case 'c':
        // move the model right
        moveModel(localStreams.uid, 'right', true)
        break;
      default:  // do nothing
    }
  });
}

