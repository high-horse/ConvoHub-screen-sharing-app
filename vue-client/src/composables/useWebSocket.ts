import { ref } from "vue";

const EventType = {
  TEXT: 'TEXT',
  IMAGE: 'IMAGE',
}

export function useWebSocket() {
  const socket = ref<WebSocket | null>(null);
  const mediaStream = ref<MediaStream | null>(null);
  const captureInterval = ref<number | null>(null);
  const sharedVideo = ref<HTMLVideoElement | null>(null);
  
  function startWebSocket() {
    if(socket.value) {
      console.log("Websocket already connected.");
      return;
    }
    
    socket.value = new WebSocket("ws://127.0.0.1:8000/ws");
    
    socket.value.onopen = () => {
      console.log("Websocket connected.");
      sendEvent(EventType.TEXT, "Websocket connectio established");
    };
    
    socket.value.onclose = () => {
      console.log("Websocket disconnected");
    };
    
    socket.value.onerror = (error) => {
      console.error("websocket error", error)
    };
    
    socket.value.onmessage = (event) => {
      const data = event.data;
      console.log("Recieved Message from WS :", data);
    }
  }
  
  async function startCapture(videoElement: HTMLVideoElement) {
    try{
      if(!socket.value) {
        console.error("WebSocket not connected.");
        return;
      }
      mediaStream.value = await navigator.mediaDevices.getDisplayMedia({
          video: { cursor: "always" },
          audio: false
      });
      videoElement.srcObject = mediaStream.value;
      sharedVideo.value = videoElement;

      startWebSocket();
      captureInterval.value = setInterval(captureAndSendImage, 1000); // Capture every second
    } catch(err) {
      console.error("Error: " + err);
    }
  }
  
  
  function stopCapture() {
    if (mediaStream.value) {
      const tracks = mediaStream.value.getTracks();
      tracks.forEach((track) => track.stop());
      if (sharedVideo.value) {
          sharedVideo.value.srcObject = null;
      }
      if (captureInterval.value) {
          clearInterval(captureInterval.value);
      }
      if (socket.value) socket.value.close();
    }
  }
  
  function captureAndSendImage() {
    if (!sharedVideo.value) return;

    const canvas = document.createElement("canvas");
    canvas.width = sharedVideo.value.videoWidth;
    canvas.height = sharedVideo.value.videoHeight;
    const context = canvas.getContext("2d");

    if (context) {
        context.drawImage(sharedVideo.value, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(
          (blob) => {
              if (blob) {
                  const reader = new FileReader();
                  reader.onloadend = function () {
                      const base64data = reader.result;
                      sendEvent(EventType.IMAGE, base64data as string);
                  };
                  reader.readAsDataURL(blob);
              }
          },
          "image/jpeg",
          0.7
        );
    }
  }

  
  function sendEvent(type: string, payload: string) {
    if(socket.value) {
      socket.value.send(`${type}:${payload}`)
    }
  }
  
  return {
    startWebSocket,
    startCapture,
    stopCapture,
    sharedVideo,
    EventType
  }
}