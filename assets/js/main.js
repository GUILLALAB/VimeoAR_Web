const videoElement = document.querySelector('video#gum_video');
const transparentCanvas = document.querySelector('canvas#transparent_canvas');
const deviceSelect = document.querySelector('select#devices');
const callBtnTransparent = document.querySelector('button#call_transparent');
const videoEnabled = document.querySelector('input#show_video');
const transparencyEnabled = document.querySelector('input#show_transparency');

let height, width;



// canvas green screen controls
const gFloorRange = 105;
const rbCeilingRange = 80;
const FRAME_RATE = 25;
let videoWidth = 320;
let videoHeight = 240;

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











function transparent(results, ctx) {
    ctx.clearRect(0, 0, width, height);

    // Draw the mask
    ctx.drawImage(results.segmentationMask, 0, 0, width, height);

    // Add the original video back in only overwriting the masked pixels
    ctx.globalCompositeOperation = 'source-in';
    ctx.drawImage(results.image, 0, 0, width, height);
}



function greenScreen(results, ctx) {
    ctx.clearRect(0, 0, width, height);

    // Draw the mask
    ctx.drawImage(results.segmentationMask, 0, 0, width, height);

    // Fill green on everything but the mask
    ctx.globalCompositeOperation = 'source-out';
    ctx.fillStyle = '#00FF00';
    ctx.fillRect(0, 0, width, height);

    // Add the original video back in (in image) , but only overwrite missing pixels.
    ctx.globalCompositeOperation =  'destination-atop';
    ctx.drawImage(results.image, 0, 0, width, height);
}

const selfieSegmentation = new SelfieSegmentation({locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`;
    }});
selfieSegmentation.setOptions({
    modelSelection: 1,
});





 async function segment(videoElement, transparentCanvas, greenCanvas){

    width = videoElement.width;
    height = videoElement.height;

    transparentCanvas.height = height;
    transparentCanvas.width = width;
    const transparentCtx = transparentCanvas.getContext('2d');

    greenCanvas.height = height;
    greenCanvas.width = width;
    const greenCtx = greenCanvas.getContext('2d');

    selfieSegmentation.onResults(results=>{
        transparent(results, transparentCtx);
        greenScreen(results, greenCtx);
    });
    await selfieSegmentation.send({image: videoElement});
}


function addAlpha(imageData, gFloor=105, rbCeiling=80) {
    const {data} = imageData;

    for (let r = 0, g = 1, b = 2, a = 3; a < data.length; r += 4, g += 4, b += 4, a += 4) {
        if (data[r] <= rbCeiling && data[b] <= rbCeiling && data[g] >= gFloor)
            data[a] = 0;
    }
    return imageData
}

// ToDo: make this a class
 function addTransparency(source, outputCanvas, gFloorElem, rbCeilingElem) {
    const outputCtx = outputCanvas.getContext('2d');

    outputCanvas.height = source.height;
    outputCanvas.width = source.width;

    const getImageData = () => {
        const width = source.width;
        const height = source.height;

        outputCtx.drawImage(source, 0, 0, width, height);
        const imageData = outputCtx.getImageData(0, 0, width, height);
        const transparentImageData = addAlpha(imageData, gFloorElem.value, rbCeilingElem.value);
        outputCtx.putImageData(transparentImageData, 0, 0);

        requestAnimationFrame(getImageData);
    };

    getImageData();
}


start().catch(err => console.error(err));
