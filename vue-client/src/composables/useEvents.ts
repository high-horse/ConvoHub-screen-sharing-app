import { Event, EventType, EventService, PeerManagementService, WebSocketService } from "../types";



export function createEventService(
  peerManagementService: PeerManagementService,
  webSocketService: WebSocketService
): EventService {
 
  function handleUpdateClientEvent(event: Event) {
    peerManagementService.clients.value = event.payload.split(",");
    console.log("Updated client list:", peerManagementService.clients.value);
  }
  
  function handlePingEvent(event: Event) {
    console.log("Recieved PING from server");
    webSocketService.sendEvent(EventType.PONG, "");
  }
  
  function handleNewConnectionEvent(event: Event) {
    peerManagementService.myWsId.value = event.payload;
  }
  
  return{
    handleUpdateClientEvent,
    handlePingEvent,
    handleNewConnectionEvent,
  }
}