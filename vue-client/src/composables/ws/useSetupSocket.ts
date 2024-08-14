// app.ts
import { useWebSocket } from "./useWebSocket";
import { usePeerManagement } from "./usePeerManagement";
import { useEvents } from "./useEvents";
import { useScreenCapture } from "./useScreenCapture";

export function useSetupSocket() {
  const { initializeWebSocket, sendEvent } = useWebSocket();
  const { clients, myWsId, peerRequest, myPair, sendPeerRequest, respondPeerRequest, handlePeerRequestEvent } = usePeerManagement();
  const { handleUpdateClientEvent, handlePingEvent, handleNewConnectionEvent } = useEvents(clients, myWsId, sendEvent);
  const { startCapture, stopCapture, sharedVideo } = useScreenCapture(sendEvent);

  initializeWebSocket({
    UPDATE_CLIENT: handleUpdateClientEvent,
    NEW_CONNECTION: handleNewConnectionEvent,
    PING: handlePingEvent,
    PEER_REQUEST_SEND: handlePeerRequestEvent,
    PEER_REQUEST_RESPONSE: handlePeerRequestEvent,
  });

  // Expose necessary functions and reactive variables to your Vue components
  return {
    clients,
    myWsId,
    peerRequest,
    myPair,
    sendPeerRequest: (peerId: string) => sendPeerRequest(peerId, sendEvent),
    respondPeerRequest: (status: boolean, peerId: string) => respondPeerRequest(status, peerId, sendEvent),
    startCapture,
    stopCapture,
    sharedVideo,
  };
}