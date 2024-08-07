const startCaptureButton = document.getElementById("startCapture");
const stopCaptureButton = document.getElementById("stopCapture");
const sharedVideo = document.getElementById("sharedVideo");

let socket;
let mediaStream;
let captureInterval;

function startWebSocket() {
  socket = new WebSocket("ws://localhost:8000/ws");
  socket.onopen = () => console.log("WebSocket connected");
  socket.onclose = () => console.log("WebSocket disconnected");
  socket.onerror = (error) => console.error("WebSocket error:", error);
}

async function startCapture() {
  try {
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
    clearInterval(captureInterval);
    if (socket) socket.close();
  }
}

function captureAndSendImage() {
  const canvas = document.createElement("canvas");
  canvas.width = sharedVideo.videoWidth;
  canvas.height = sharedVideo.videoHeight;
  canvas
    .getContext("2d")
    .drawImage(sharedVideo, 0, 0, canvas.width, canvas.height);

  canvas.toBlob(
    (blob) => {
      const reader = new FileReader();
      reader.onloadend = function () {
        const base64data = reader.result;
        socket.send(base64data);
      };
      reader.readAsDataURL(blob);
    },
    "image/jpeg",
    0.7,
  );
}

startCaptureButton.addEventListener("click", startCapture);
stopCaptureButton.addEventListener("click", stopCapture);

stopCaptureButton.disabled = true;
