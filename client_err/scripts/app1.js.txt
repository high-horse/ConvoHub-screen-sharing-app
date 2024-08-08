// app.js
const startCaptureButton = document.getElementById("startCapture");
const sharedVideo = document.getElementById("sharedVideo");
const stopCaptureButton = document.getElementById("stopCapture");

let socket;
let mediaStream;
let captureInterval 

async function startCapture() {
  try {
    mediaStream = await navigator.mediaDevices.getDisplayMedia({
      video: { cursor: "always" },
      audio: false,
    });
    sharedVideo.srcObject = mediaStream;
    
    startCaptureButton.disabled = true;
    stopCaptureButton.disabled = false;
    
    captureInterval = setInterval(captureAndSendImage, 1000);
    // TODO : implement the ws connection later
    // startWebSocket(mediaStream);

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
  }
}

function captureAndSendImage() {
  const canvas = document.createElement('canvas');
  canvas.width = sharedVideo.videoWidth
}


function startWebsocketInitial() {
  socket = new WebSocket('ws://localhost:8000/ws')
  socket.onopen = () => console.log("WS connected.")
  socket.onclose = () => console.log("WS closed")
  socket.onerror = (error) => console.error('WebSocket error:', error);
}

function startWebSocket(stream) {
  // TODO: IMPLEMENT SERVER FOR THIS ENDPOINT.
  socket = new WebSocket("ws://localhost:8000/ws");

  socket.onopen = () => {
    console.log("WebSocket connection opened");
    const videoTrack = stream.getVideoTracks()[0];
    const videoSender = new RTCPeerConnection();

    videoSender.addTrack(videoTrack, stream);

    videoSender.onicecandidate = (event) => {
      if (event.candidate) {
        socket.send(JSON.stringify({ candidate: event.candidate }));
      }
    };

    videoSender.createOffer().then((offer) => {
      videoSender.setLocalDescription(offer);
      socket.send(JSON.stringify({ offer }));
    });

    socket.onmessage = async (event) => {
      const data = JSON.parse(event.data);

      if (data.answer) {
        await videoSender.setRemoteDescription(
          new RTCSessionDescription(data.answer),
        );
      }

      if (data.candidate) {
        await videoSender.addIceCandidate(new RTCIceCandidate(data.candidate));
      }
    };
  };

  socket.onclose = () => {
    console.log("WebSocket connection closed");
  };
}

startCaptureButton.addEventListener("click", startCapture);
stopCaptureButton.addEventListener("click", stopCapture);
