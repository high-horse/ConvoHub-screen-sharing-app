import { ref, Ref } from "vue";
import { EventType, ScreenCaptureService, WebSocketService } from "../types";


export function createScreenCaptureService(webSocketService: WebSocketService): ScreenCaptureService {
  const mediaStream = ref<MediaStream | null>(null);
  const captureInterval = ref<number | null>(null);
  const sharedVideo = ref<HTMLVideoElement | null>(null);
  
  
  async function startCapture(videoElement: HTMLVideoElement) {
    try{
      mediaStream.value = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: "always" },
        audio: false,
      });
      videoElement.srcObject = mediaStream.value;
      sharedVideo.value = videoElement;
      
      captureInterval.value = setInterval(captureAndSendImage, 1000); // each second
    } catch(error) {
      console.error("Error: ", error);
    }
  }
  
  function stopCapture() {
    if (mediaStream.value) {
      mediaStream.value.getTracks().forEach((track) => track.stop());
      if (sharedVideo.value) sharedVideo.value.srcObject = null;
      if (captureInterval.value) clearInterval(captureInterval.value);
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

      canvas.toBlob((blob) => {
        if (blob) {
          const reader = new FileReader();
          reader.onloadend = () => {
            webSocketService.sendEvent(EventType.IMAGE, reader.result as string);
          };
          reader.readAsDataURL(blob);
        }
      }, "image/jpeg", 0.7);
    }
  }
  return {
    startCapture,
    stopCapture,
    sharedVideo
  };
}