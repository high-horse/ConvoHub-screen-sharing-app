<template>
  <AlertComponent
    :pairRequest="peerRequest"
    @connectPeer="connectPeerHandler"
  />
  <div>
    <button
      class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mx-3"
      @click="startCaptureHandler"
      :disabled="captureInProgress"
    >
      Start Capture
    </button>
    <button
      class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mx-3"
      @click="stopCaptureHandler"
      :disabled="!captureInProgress"
    >
      Stop Capture
    </button>
    <video ref="videoElement" autoplay></video>
  </div>
  <ClientsList
    :clientsList="clients"
    :myWsID="myWsId"
    :peerRequest="peerRequest"
    @connectPeer="handleConnectPeer"
  />
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useSetupSocket } from "../composables/ws/useSetupSocket";

import ClientsList from "../components/ClientsList.vue";
import AlertComponent from "../components/common/units/AlertComponent.vue";

const {
  clients,
  myWsId,
  peerRequest,
  myPair,
  sendPeerRequest,
  respondPeerRequest,
  startCapture,
  stopCapture,
  sharedVideo
} = useSetupSocket();


const videoElement = ref<HTMLVideoElement | null>(null);
const captureInProgress = ref(false);

function startCaptureHandler() {
    console.log(clients);
    if (videoElement.value) {
        captureInProgress.value = true;
        startCapture(videoElement.value);
    }
}

function stopCaptureHandler() {
    captureInProgress.value = false;
    stopCapture();
}

onMounted(() => {
    if (videoElement.value) {
        sharedVideo.value = videoElement.value;
    }
});

function handleConnectPeer(peerId: string): void {
    console.log("connect to peer: ", peerId);
    sendPeerRequest(peerId);
}

function connectPeerHandler(status: boolean): void {
    const peerId = peerRequest.value.peerId;
    respondPeerRequest(status, peerId);
    peerRequest.value = null;
}
</script>
