import { ref } from "vue";
import { EventType, Event } from '../types.ts';

export function useWebSocket() {
  const socket = ref<WebSocket | null>(null);
  const mediaStream = ref<MediaStream | null>(null);
  const captureInterval = ref<number | null>(null);
  const sharedVideo = ref<HTMLVideoElement | null>(null);
  const clients = ref<string[]>([]); // To store the list of client IDs
  const myWsId = ref<string | null>(null);
  
  function startWebSocket() {
    if(socket.value) {
      console.log("Websocket already connected.");
      return;
    }
    
    socket.value = new WebSocket("ws://127.0.0.1:8000/ws");
    
    socket.value.onopen = () => {
      console.log("Websocket connected.");
      // sendEvent(EventType.TEXT, "Websocket connectio established");
       setTimeout(() => {
         sendEvent(EventType.CLIENT_READY, "Websocket connection established");
       }, 1000); 
    };
    
    socket.value.onclose = () => {
      console.log("Websocket disconnected");
      socket.value = null; 
    };
    
    socket.value.onerror = (error) => {
      console.error("websocket error", error)
    };
    
    socket.value.onmessage = (event) => {
      const data = event.data;
      console.log("Recieved Message from WS :", data);
      
      try {
        const parsedData = JSON.parse(data);
        handleEvent(parsedData as Event);
      } catch (error) {
        console.error("Error parsing message :", error)
      }
    };
  }
  function  handleEvent(event: Event) {
    console.log("handleevent:", event)
    switch(event.type) {
      case EventType.UPDATE_CLIENT:
        clients.value = event.payload.split(",");
        console.log("Updated client list:", clients.value);
        break;
        
      case EventType.NEW_CONNECTION:
        myWsId.value = event.payload;
        break;
      
      case EventType.PING:
        console.log("Recieved PING from server");
        sendEvent(EventType.PONG, "");
        break;
        
      default:
        console.log("Unknown event type:", event.type)
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

      // startWebSocket();
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
      const message = JSON.stringify({type, payload})
      // socket.value.send(`${type}:${payload}`)
      socket.value.send(message)
      
    }
  }
  
  function sendPeerRequest(peerId: string) {
    if(socket.value) {
      sendEvent(EventType.PEER_REQUEST_SEND, peerId)
    }
  }
  
  return {
    startWebSocket,
    startCapture,
    stopCapture,
    sharedVideo,
    clients,
    myWsId,
    sendPeerRequest,
  }
}