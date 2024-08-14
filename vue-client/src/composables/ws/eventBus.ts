// eventBus.ts
import { ref } from "vue";
import { Event, EventType } from '../../types';

const socket = ref<WebSocket | null>(null);
const URL: string = "ws://127.0.0.1:8000/ws";

export function useEventBus() {
  function startWebSocket(onOpenCallback: () => void) {
    if (socket.value) return;
    
    socket.value = new WebSocket(URL);
    
    socket.value.onopen = () => {
      console.log("Websocket Connected");
      onOpenCallback();
    };
    
    socket.value.onclose = () => {
      console.log("Websocket Disconnected");
      socket.value = null;
    };
    
    socket.value.onerror = (error) => {
      console.error("WebSocket Error:", error);
    };
  }

  function sendEvent(type: string, payload: string): void {
    if (socket.value) {
      const message = JSON.stringify({ type, payload });
      socket.value.send(message);
    }
  }

  function onMessage(callback: (event: Event) => void) {
    if (socket.value) {
      socket.value.onmessage = (event) => {
        const data = event.data;
        console.log("Received message from WS:", data);
        
        try {
          const parsedData = JSON.parse(data);
          callback(parsedData as Event);
        } catch(error) {
          console.error("Error Parsing Message:", error);
        }
      };
    }
  }

  return {
    startWebSocket,
    sendEvent,
    onMessage,
  };
}