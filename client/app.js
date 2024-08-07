// app.js
const startCaptureButton = document.getElementById('startCapture');
const sharedVideo = document.getElementById('sharedVideo');

let socket;
let mediaStream;

async function startCapture() {
    try {
        mediaStream = await navigator.mediaDevices.getDisplayMedia({
            video: { cursor: "always" },
            audio: false
        });
        sharedVideo.srcObject = mediaStream;
        startWebSocket(mediaStream);
    } catch (err) {
        console.error("Error: " + err);
    }
}

function startWebSocket(stream) {
    socket = new WebSocket('ws://localhost:3000/ws');

    socket.onopen = () => {
        console.log('WebSocket connection opened');
        const videoTrack = stream.getVideoTracks()[0];
        const videoSender = new RTCPeerConnection();

        videoSender.addTrack(videoTrack, stream);

        videoSender.onicecandidate = event => {
            if (event.candidate) {
                socket.send(JSON.stringify({ candidate: event.candidate }));
            }
        };

        videoSender.createOffer().then(offer => {
            videoSender.setLocalDescription(offer);
            socket.send(JSON.stringify({ offer }));
        });

        socket.onmessage = async event => {
            const data = JSON.parse(event.data);

            if (data.answer) {
                await videoSender.setRemoteDescription(new RTCSessionDescription(data.answer));
            }

            if (data.candidate) {
                await videoSender.addIceCandidate(new RTCIceCandidate(data.candidate));
            }
        };
    };

    socket.onclose = () => {
        console.log('WebSocket connection closed');
    };
}

startCaptureButton.addEventListener('click', startCapture);
