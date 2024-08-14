// useEvents.ts

import { Ref } from "vue";
import { Event } from "../../types";

export function useEvents(clients: Ref<string[]>, myWsId: Ref<string | null>, sendEvent: (type: string, payload: string) => void) {
  function handleUpdateClientEvent(event: Event) {
    clients.value = event.payload.split(",");
    console.log("Updated client list:", clients.value);
  }
  
  function handlePingEvent(event: Event) {
    console.log("Received PING from server");
    sendEvent("PONG", "");
  }
  
  function handleNewConnectionEvent(event: Event) {
    myWsId.value = event.payload;
  }
  
  return {
    handleUpdateClientEvent,
    handlePingEvent,
    handleNewConnectionEvent,
  };
}