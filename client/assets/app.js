const startWebSocketButton = document.getElementById("startWebSocket");
const startCaptureButton = document.getElementById("startCapture");
const stopCaptureButton = document.getElementById("stopCapture");
const sharedVideo = document.getElementById("sharedVideo");

let socket;
let mediaStream;
let captureInterval;

// Define EventTypes as a plain object
const EventType = {
    TEXT: 'TEXT',
    IMAGE: 'IMAGE'
};

function startWebSocket() {
    if (socket) {
        console.log("WebSocket already connected");
        return;
    }
    socket = new WebSocket("ws://127.0.0.1:8000/ws");

    socket.onopen = () => {
        console.log("WebSocket connected");
        sendEvent("TEXT", "WebSocket connection established");
    };

    socket.onclose = () => console.log("WebSocket disconnected");
    socket.onerror = (error) => console.error("WebSocket error:", error);

    socket.onmessage = (event) => {
        const data = event.data;
        console.log("Received Message from WS:", data);
    };
}

async function startCapture() {
    try {
        if (!socket) {
            console.error("WebSocket not connected.");
            return;
        }

        mediaStream = await navigator.mediaDevices.getDisplayMedia({
            video: { cursor: "always" },
            audio: false
        });
        sharedVideo.srcObject = mediaStream;
        startCaptureButton.disabled = true;
        stopCaptureButton.disabled = false;

        startWebSocket();
        captureInterval = setInterval(captureAndSendImage, 1000); // Capture every second
    } catch (err) {
        console.error("Error: " + err);
    }
}

function stopCapture() {
    if (mediaStream) {
        const tracks = mediaStream.getTracks();
        tracks.forEach((track) => track.stop());
        sharedVideo.srcObject = null;
        startCaptureButton.disabled = false;
        stopCaptureButton.disabled = true;

        if (captureInterval) {
            clearInterval(captureInterval);
        }
        if (socket) socket.close();
    }
}

function captureAndSendImage() {
    const canvas = document.createElement("canvas");
    canvas.width = sharedVideo.videoWidth;
    canvas.height = sharedVideo.videoHeight;
    const context = canvas.getContext("2d");

    if (context) {
        context.drawImage(sharedVideo, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(
            (blob) => {
                const reader = new FileReader();
                reader.onloadend = function () {
                    const base64data = reader.result;
                    sendEvent(EventType.IMAGE, base64data);
                };
                reader.readAsDataURL(blob);
            },
            "image/jpeg",
            0.7
        );
    }
}

function sendEvent(type, payload) {
    if (socket) {
        socket.send(`${type}:${payload}`);
    }
}

startWebSocketButton.addEventListener("click", startWebSocket);
startCaptureButton.addEventListener("click", startCapture);
stopCaptureButton.addEventListener("click", stopCapture);

stopCaptureButton.disabled = true;