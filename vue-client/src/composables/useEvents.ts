import { Event, EventType } from "../types";

import { usePeerManagement } from "./usePeerManagement";
import { useWebSocket } from "./useWebSocket";


export function useEvents() {
  const { clients, myWsId } = usePeerManagement();
  const { sendEvent } = useWebSocket();
  
  function handleUpdateClientEvent(event: Event) {
    clients.value = event.payload.split(",");
    console.log("Updated client list:", clients.value);
  }
  
  function handlePingEvent(event: Event) {
    console.log("Recieved PING from server");
    sendEvent(EventType.PONG, "");
  }
  
  function handleNewConnectionEvent(event: Event) {
     myWsId.value = event.payload;
  }
  
  return{
    handleUpdateClientEvent,
    handlePingEvent,
    handleNewConnectionEvent,
  }
}