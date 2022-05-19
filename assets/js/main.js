import {segment} from "./modul/segment.mjs";
import {addTransparency} from "./modul/transparency.mjs";



const videoElement = document.querySelector('video#gum_video');
const transparentCanvas = document.querySelector('canvas#transparent_canvas');

const deviceSelect = document.querySelector('select#devices');

const callBtnTransparent = document.querySelector('button#call_transparent');
const callBtnGreen = document.querySelector('button#call_green');
const callBtnTransparentCanvas = document.querySelector('button#call_transparent_green');
const callBtnTransparentWebgl = document.querySelector('button#call_transparent_webgl');

const videoEnabled = document.querySelector('input#show_video');
const transparencyEnabled = document.querySelector('input#show_transparency');



const qvgaBtn = document.querySelector('button#qvga');
const vgaBtn = document.querySelector('button#vga');
const hdBtn = document.querySelector('button#hd');

// canvas green screen controls
const gFloorRange = document.querySelector('input#g_floor');
const rbCeilingRange = document.querySelector('input#rb_ceiling');

// webGL controls
const keyColor = document.getElementById("keyColor");
const similarityRange = document.getElementById("similarity");
const smoothnessRange = document.getElementById("smoothness");
const spillRange = document.getElementById("spill");


const FRAME_RATE = 25;

let videoWidth = 640;
let videoHeight = 480;



// Safari & Firefox don't support OffscreenCanvas
const offscreenCanvas = typeof OffscreenCanvas === 'undefined' ? document.createElement("canvas") :
    new OffscreenCanvas(1, 1);
let segmentedCanvas;


async function getVideo() {
    console.log(`Getting ${videoWidth}x${videoHeight} video`);

    document.querySelectorAll('video').forEach(element => {
        element.height = videoHeight;
        element.width = videoWidth;
    });

    let videoSource = videoDevices[deviceSelect.selectedIndex || 0]?.deviceId;

    let stream = await navigator.mediaDevices.getUserMedia(
        {
            video:
                {
                    height: {exact: videoHeight}, width: {exact: videoWidth}, frameRate: FRAME_RATE,
                    deviceId: videoSource ? {exact: videoSource} : undefined
                }
        });
    videoElement.srcObject = stream;
    videoElement.play();
    console.log(`Capture camera with device ${stream.getTracks()[0].label}`);
}

async function start() {
    // create a stream and send it to replace when its starts playing
    videoElement.onplaying = async () => {

        // use the offscreen canvas when the visible one is hidden for improved performance
        segmentedCanvas =  offscreenCanvas;
        segmentedCanvas.height = videoElement.height;
        segmentedCanvas.width = videoElement.width;

        let lastTime = new Date();

        async function getFrames() {
            const now = videoElement.currentTime;
            if (now > lastTime){
                const fps = (1/(now-lastTime)).toFixed();
                await segment(videoElement, transparentCanvas, segmentedCanvas);
            }
            lastTime = now;
            requestAnimationFrame(getFrames)
        }

        await getFrames();

        addTransparency(segmentedCanvas, transparentGreenCanvas, gFloorRange, rbCeilingRange);

    };

    // Note: list of devices may change after first camera permission approval
    await getDevices();
    await getVideo();

    callBtnTransparent.onclick = () => sendVideo(transparentGreenCanvas.captureStream(FRAME_RATE));

}

let videoDevices = [];

async function getDevices() {
    let devices = await navigator.mediaDevices.enumerateDevices();
    videoDevices = devices.filter(device => device.kind === 'videoinput');
    console.log("video devices:", videoDevices);
    videoDevices.forEach(device => {
        const option = document.createElement('option');
        option.text = device.label;
        deviceSelect.appendChild(option);
    });
}

deviceSelect.onchange = getVideo;

qvgaBtn.onclick = async () => {
    videoWidth = 320;
    videoHeight = 240;
    await getVideo();
};

vgaBtn.onclick = async () => {
    videoWidth = 640;
    videoHeight = 480;
    await getVideo();
};

hdBtn.onclick = async () => {
    videoWidth = 1280;
    videoHeight = 720;
    await getVideo();
};


videoEnabled.onclick = async () => {
    console.log("Changing video display state");
    videoElement.parentElement.hidden = !videoElement.parentElement.hidden;
    await videoElement.play();
};

transparencyEnabled.onclick = async () => {
    console.log("Changing transparency display state");
    transparentCanvas.parentElement.hidden = !transparentCanvas.parentElement.hidden;
    await videoElement.play();
};





start().catch(err => console.error(err));
