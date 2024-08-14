// usePeerManagement.ts
import { ref } from "vue";
import { PairRequest, Event, EventType } from '../../types';

export function usePeerManagement() {
  const clients = ref<string[]>([]);
  const myWsId = ref<string | null>(null);
  const peerRequest = ref<PairRequest | null>(null);
  const myPair = ref<string | null>(null);
  
  function handlePeerRequestEvent(event: Event) {
    const temp: PairRequest = JSON.parse(event.payload);
    if (temp.message === "REQUEST") {
      peerRequest.value = temp;
    } else if(temp.message.split(":")[0] === "RESPONSE"){
      let resp = temp.message.split(":")[1];
      if (resp === "true") {
        myPair.value = temp.peerID;
        // start sharing screen and emit the image to the server.
      } else if (resp === "false") {
        // alert request was rejected.
      } else {
        console.log("unexpeccted response :", resp)
      }
    } else {
      console.log("Unrecognized PEER_REQUEST_SEND:", temp.message);
    }
  }
  
  function sendPeerRequest(peerId: string, sendEvent: (type: string, payload: string) => void) {
    // ... (keep the existing implementation, but use the passed sendEvent function)
    const payload = {
        peerId: peerId,
        message: "REQUEST",
    };
    sendEvent(EventType.PEER_REQUEST_SEND, JSON.stringify(payload));
  }
  
  function respondPeerRequest(status: boolean, peerId: string, sendEvent: (type: string, payload: string) => void) {
    // ... (keep the existing implementation, but use the passed sendEvent function)
    const payload = {
      peerId: peerId,
      message: `RESPONSE:${status}`,
    };
    peerRequest.value = null;
    myPair.value = peerId;
    sendEvent(EventType.PEER_REQUEST_RESPONSE, JSON.stringify(payload));
  }
  
  return {
    clients,
    myWsId,
    peerRequest,
    myPair,
    sendPeerRequest,
    respondPeerRequest,
    handlePeerRequestEvent,
  };
}