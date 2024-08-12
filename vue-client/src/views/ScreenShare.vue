<template>
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

        <video ref="videoElement" autoplay></video>
    </div>

    <ClientsList :clientsList="clients" :myWsID="myWsId" />
    <div>

    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useWebSocket } from "../composables/useWebSocket";

import ClientsList from "../components/ClientsList.vue";

const {
    startWebSocket,
    startCapture,
    stopCapture,
    sharedVideo,
    clients,
    myWsId,
    EventType,
} = useWebSocket();
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
</script>
