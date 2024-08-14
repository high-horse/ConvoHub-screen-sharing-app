// useWebSocket.ts
import { useEventBus } from "./eventBus";
import { Event, EventType } from '../../types';

export function useWebSocket() {
  const { startWebSocket, sendEvent, onMessage } = useEventBus();
  
  function initializeWebSocket(eventHandlers: Record<string, (event: Event) => void>) {
    startWebSocket(() => {
      sendEvent(EventType.CLIENT_READY, "WebSocket connection established.");
    });

    onMessage((event: Event) => {
      const handler = eventHandlers[event.type];
      if (handler) {
        handler(event);
      } else {
        console.log("Unknown event type:", event.type);
      }
    });
  }

  return {
    initializeWebSocket,
    sendEvent,
  };
}