import { EventType, Event } from "./types"; 

const startWebSocketButton = document.getElementById("startWebSocket");
const startCaptureButton = document.getElementById("startCapture");
const stopCaptureButton = document.getElementById("stopCapture");
const sharedVideo = document.getElementById("sharedVideo");

let socket: WebSocket | null = null;
let mediaStream : MediaStream | null = null;;
let captureInterval : number | null = null;

function startWebSocket() {
  if(socket) {
    console.log("WS already connected");
    return;
  }
  socket = new WebSocket("ws://127.0.0.1:8000/ws");
  socket.onopen = () => {
    console.log("WebSocket connected");
    sendEvent(EventType.TEXT, "WebSocket connection established");
  };
  socket.onclose = () => console.log("WebSocket disconnected");
  socket.onerror = (error) => console.error("WebSocket error:", error);
  
  socket.onmessage = (event) => {
    const data = event.data;
    console.log("Recieved Message from WS:", data);
  }
}

async function startCapture() {
  try {
    if(!socket) {
      console.error("WS not connected.")
      return;
    }
    
    mediaStream = await navigator.mediaDevices.getDisplayMedia({
      video: { cursor: "always" },
      audio: false,
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
    let tracks = mediaStream.getTracks();
    tracks.forEach((track) => track.stop());
    sharedVideo.srcObject = null;
    startCaptureButton.disabled = false;
    stopCaptureButton.disabled = true;
    
    if(captureInterval){
      clearInterval(captureInterval);
    }
    if (socket) socket.close();
  }
}

function captureAndSendImage() {
  const canvas = document.createElement("canvas");
  canvas.width = sharedVideo?.videoWidth;
  canvas.height = sharedVideo?.videoHeight;
  canvas
    .getContext("2d")
    .drawImage(sharedVideo, 0, 0, canvas.width, canvas.height);

  canvas.toBlob(
    (blob) => {
      const reader = new FileReader();
      reader.onloadend = function () {
        const base64data = reader.result as string;
        sendEvent(EventType.IMAGE, base64data);
      };
      reader.readAsDataURL(blob);
    },
    "image/jpeg",
    0.7,
  );
}

function sendEvent(type: EventType, payload: string) {
  if(socket) {
    const event: Event = { type, payload };
    socket.send(`${event.type}:${event.payload}`);
  }
}


startCaptureButton.addEventListener("click", startCapture);
stopCaptureButton.addEventListener("click", stopCapture);

stopCaptureButton.disabled = true;
