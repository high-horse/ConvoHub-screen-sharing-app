<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useWebSocket } from "../composables/useWebSocket";

import ClientsList from "../components/ClientsList.vue";
import AlertComponent from "../components/common/units/AlertComponent.vue";
const {
    startWebSocket,
    startCapture,
    stopCapture,
    sharedVideo,
    clients,
    myWsId,
    sendPeerRequest,
    peerRequest,
    respondPeerRequest,
    captureInProgress,
    recievedImage,
    disconnectPair,
    isCapturing,
} = useWebSocket();
const videoElement = ref<HTMLVideoElement | null>(null);

function startCaptureHandler() {
    // console.log(clients);
    if (videoElement.value) {
        captureInProgress.value = true;
        startCapture(videoElement.value);
    }
}

function stopCaptureHandler() {
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

function handleDisconnect() {
    disconnectPair();
    // Ensure local UI is updated
    if (videoElement.value) {
        videoElement.value.srcObject = null;
    }
    // No need to manually set recievedImage to null here, 
    // as it should be handled in the useWebSocket composable
}
</script>

<template>
    <AlertComponent
        :pairRequest="peerRequest"
        @connectPeer="connectPeerHandler"
    />
    <div>
        <button
            class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mx-3"
            @click="startWebSocket"
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

        <div>
            <ClientsList
                :clientsList="clients"
                :myWsID="myWsId"
                :peerRequest="peerRequest"
                @connectPeer="handleConnectPeer"
            />
        </div>

        <div class="video-content-share-div">
            <video ref="videoElement" autoplay></video>
        </div>

        <div class="video-content-recieve-div" v-if="recievedImage">
            <img :src="recievedImage" alt="Received Image" />
            <button
                class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mx-3"
                @click="handleDisconnect"
            >
                Disconnect
            </button>
        </div>
    </div>
</template>

<style scoped>
.video-content-share-div {
    width: 200px;
    height: 100px;
}
.video-content-recieve-div {
    width: 400px;
    height: 200px;
}
</style>
