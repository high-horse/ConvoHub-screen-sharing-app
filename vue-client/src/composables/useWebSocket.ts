import { ref } from "vue";
import { Event, EventType, WebSocketService, PeerManagementService, EventService } from '../types.ts'

export function createWebSocketService(
  peerManagementService: PeerManagementService,
  eventService: EventService
): WebSocketService {
  const socket = ref<WebSocket | null>(null);
  const URL: string = "ws://127.0.0.1:8000/ws";

  
  function startWebSocket() {
    if (socket.value) return;
    
    socket.value = new WebSocket(URL)
    
    socket.value.onopen = () => {
      console.log("Websocket Connected");
      sendEvent(EventType.CLIENT_READY, "WebSocket connection established.")
    }
    
    socket.value.onclose = () => {
      console.log("Websocket Disonnected");
      socket.value = null;
    }
    
    socket.value.onerror = (error) => {
      console.error("WebSocket Error :", error)
    }
    
    socket.value.onmessage = (event) => {
      const data = event.data;
      console.log("Recieved message from WS:", data);
      
      try {
        const parsedData = JSON.parse(data);
        handleEvent(parsedData as Event)
      } catch(error) {
        console.error("Error Parsing Message:", error)
      }
    }
  }
  
  function sendEvent(type: string, payload: string):void {
    if(socket.value) {
      const message = JSON.stringify({ type, payload });
      socket.value.send(message);
    }
  }
  
  function handleEvent(event: Event) {
    console.log("handleevent:", event);
    switch (event.type) {
      case EventType.UPDATE_CLIENT:
        eventService.handleUpdateClientEvent(event);
        break;

      case EventType.NEW_CONNECTION:
        eventService.handleNewConnectionEvent(event);
        break;

      case EventType.PING:
        eventService.handlePingEvent(event);
        break;

      case EventType.PEER_REQUEST_SEND:  
      case EventType.PEER_REQUEST_RESPONSE: 
        peerManagementService.handlePeerRequestEvent(event);
        break;
      
      default:
        console.log("Unknown event type:", event.type);
    }
  }
    return {
      startWebSocket,
      sendEvent,
    };
}