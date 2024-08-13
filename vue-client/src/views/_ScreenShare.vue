<template>
    <AlertComponent
        :pairRequest="peerRequest"
        @connectPeer="connectPeerHandler"
    />
    <div>
        <button
            class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mx-3"
            @click="webSocketService.startWebSocket"
        >
            Start WebSocket
        </button>

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
        :clientsList="peerManagementService.clients"
        :myWsID="peerManagementService.myWsId"
        :peerRequest="peerManagementService.peerRequest"
        @connectPeer="handleConnectPeer"
    />
    <div></div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useServices } from "../composables/useServices";

import ClientsList from "../components/ClientsList.vue";
import AlertComponent from "../components/common/units/AlertComponent.vue";

const {
  webSocketService,
  peerManagementService,
  screenCaptureService,
} = useServices();


const videoElement = ref<HTMLVideoElement | null>(null);
const captureInProgress = ref(false);

function startCaptureHandler() {
    console.log(peerManagementService.clients);
    if (videoElement.value) {
        captureInProgress.value = true;
        screenCaptureService.startCapture(videoElement.value);
    }
}

function stopCaptureHandler() {
    captureInProgress.value = false;
    screenCaptureService.stopCapture();
}

onMounted(() => {
    if (videoElement.value) {
        screenCaptureService.sharedVideo.value = videoElement.value;
    }
});

function handleConnectPeer(peerId: string): void {
    console.log("connect to peer: ", peerId);
    peerManagementService.sendPeerRequest(peerId);
}

function connectPeerHandler(status: boolean): void {
    const peerId = peerManagementService.peerRequest.value.peerId;
    peerManagementService.respondPeerRequest(status, peerId);
    peerManagementService.peerRequest.value = null;
}
</script>
