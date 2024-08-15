import { ref } from "vue";
import { EventType, Event, PairRequest } from "../types.ts";

export function useWebSocket() {
  const socket = ref<WebSocket | null>(null); // Store socket ref
  const mediaStream = ref<MediaStream | null>(null);  // Store mediashare ref
  const captureInterval = ref<number | null>(null);   // store capture intervel
  const sharedVideo = ref<HTMLVideoElement | null>(null); // store sharedVideo
  const clients = ref<string[]>([]); // To store the list of client IDs
  const myWsId = ref<string | null>(null);  // store my Ws Id
  const peerRequest = ref<PairRequest | null>(null);  
  const myPair = ref<string | null>(null);
  const captureInProgress = ref<boolean>(false);
  const recievedImage = ref<string | null>(null);
  
  const isCapturing = ref<boolean>(false);

  function startWebSocket() {
    if (socket.value) {
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
      console.error("websocket error", error);
    };

    socket.value.onmessage = (event) => {
      const data = event.data;
      // console.log("Recieved Message from WS :", data);

      try {
        const parsedData = JSON.parse(data);
        handleEvent(parsedData as Event);
      } catch (error) {
        console.error("Error parsing message :", error);
      }
    };
  }
  function handleEvent(event: Event) {
    // console.log("handleevent:", event);
    switch (event.type) {
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
      
      case EventType.PEER_PAIRED:
        handlePeerPairedEvent(event)
        break;
        
      case EventType.STREAM_IMAGE_PEER:
        handleStreamImageRecv(event);
        break;
      

      case EventType.PEER_REQUEST_SEND: {
        handlePeerRequestSend(event)
        break;
      }

      case EventType.PEER_REQUEST_RESPONSE: {
        handlePeerRequestRespond(event)
        break;
      }
      
      case EventType.DISCONNECT_PAIR_SHARING:
        handlePeerDisconnected(event);
        break;

      default:
        console.log("Unknown event type:", event.type);
    }
  }

  async function startCapture(videoElement: HTMLVideoElement) {
    try {
      if (!socket.value) {
        console.error("WebSocket not connected.");
        return;
      }
      mediaStream.value = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: "always" },
        audio: false,
      });
      videoElement.srcObject = mediaStream.value;
      sharedVideo.value = videoElement;

      // startWebSocket();
      isCapturing.value = true;
      captureInterval.value = setInterval(captureAndSendImage, 1000); // Capture every second
    } catch (err) {
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
     if (!sharedVideo.value || !isCapturing.value) return;
    // if (!sharedVideo.value) return;

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
              // sendEvent(EventType.IMAGE, base64data as string);
              sendEvent(EventType.STREAM_IMAGE_PEER, base64data as string);
            };
            reader.readAsDataURL(blob);
          }
        },
        "image/jpeg",
        0.7,
      );
    }
  }

  function sendEvent(type: string, payload: string) {
    if (socket.value) {
      const message = JSON.stringify({ type, payload });
      // socket.value.send(`${type}:${payload}`)
      socket.value.send(message);
    }
  }
  
  // Envoked from the view.
  function sendPeerRequest(peerId: string) {
    const payload = {
      peerId: peerId,
      message: "REQUEST",
    };
    if (socket.value) {
      sendEvent(EventType.PEER_REQUEST_SEND, JSON.stringify(payload));
    }
  }
  
  // Envoked from the switch.
  function handlePeerRequestSend(event: Event): void {
    let temp: PairRequest = JSON.parse(event.payload);
    if (temp.message === "REQUEST") {
      peerRequest.value = temp;
    } else {
      console.log("Unrecognized PEER_REQUEST_SEND:", temp.message);
    }
  }
  
  function respondPeerRequest(status: boolean, peerId: string): void {
    const payload = {
      peerId: peerId,
      message: `RESPONSE:${status}`,
    };

    // console.log(payload);
    // to alert the pair request.
    peerRequest.value = null;
    
    if (socket.value) {
      sendEvent(EventType.PEER_REQUEST_RESPONSE, JSON.stringify(payload));
    }
  }
  
  function handlePeerRequestRespond(event: Event) : void {
    let temp: PairRequest = JSON.parse(event.payload);
    if (temp.message.split(":")[0] === "RESPONSE") {
      if (
        temp.message.split(":")[1] == "true"
      ) {
        console.log("Peer accepted the request. ")
      }
    } else {
      console.log("Unrecognized PEER_REQUEST_RESPONSE:", temp.message);
    }
  }
  
  function handlePeerPairedEvent(event: Event) {
    myPair.value = event.payload;
    
    // start sharing screen event.
    if (sharedVideo.value) {
      captureInProgress.value = true;
      startCapture(sharedVideo.value);
    }
  }

  function handleStreamImageRecv(event: Event){
    recievedImage.value = event.payload;
  }
  
  function disconnectPair() {
    if (socket.value) {
      const pair_id = myPair.value
      const payload = {
        myPair : pair_id
      }
       console.log("Seding peer disconnect event:", event); // Debug log
      sendEvent(EventType.DISCONNECT_PAIR_SHARING, JSON.stringify(payload));
    }
  }
  
  function handlePeerDisconnected(event: Event) {
    console.log("Handling peer disconnect event:", event); // Debug log
    
    isCapturing.value = false;
    // Stop screen sharing and clean up media tracks
    if (mediaStream.value) {
      const tracks = mediaStream.value.getTracks();
      tracks.forEach((track) => {
        console.log(`Stopping track: ${track.kind}`); // Debug log
        track.stop();
      });
  
      if (sharedVideo.value) {
        console.log("Clearing video element's srcObject"); // Debug log
        sharedVideo.value.srcObject = null;
      }
    }
  
    // Clear the capture interval
    if (captureInterval.value) {
      console.log("Clearing capture interval"); // Debug log
      clearInterval(captureInterval.value);
      captureInterval.value = null;
    }
  
    // Reset WebSocket-related states
    console.log("Resetting states: myPair, captureInProgress, recievedImage"); // Debug log
    myPair.value = null;
    captureInProgress.value = false;
    recievedImage.value = null; // Clear the last received image
  }

  
  return {
    startWebSocket,
    startCapture,
    stopCapture,
    sharedVideo,
    clients,
    myWsId,
    sendPeerRequest,
    peerRequest,
    respondPeerRequest,
    recievedImage,
    disconnectPair,
    isCapturing,
    captureInProgress
  };
}