"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("./types");
const startWebSocketButton = document.getElementById("startWebSocket");
const startCaptureButton = document.getElementById("startCapture");
const stopCaptureButton = document.getElementById("stopCapture");
const sharedVideo = document.getElementById("sharedVideo");
let socket = null;
let mediaStream = null;
;
let captureInterval = null;
function startWebSocket() {
    if (socket) {
        console.log("WS already connected");
        return;
    }
    socket = new WebSocket("ws://127.0.0.1:8000/ws");
    socket.onopen = () => {
        console.log("WebSocket connected");
        sendEvent(types_1.EventType.TEXT, "WebSocket connection established");
    };
    socket.onclose = () => console.log("WebSocket disconnected");
    socket.onerror = (error) => console.error("WebSocket error:", error);
    socket.onmessage = (event) => {
        const data = event.data;
        console.log("Recieved Message from WS:", data);
    };
}
function startCapture() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!socket) {
                console.error("WS not connected.");
                return;
            }
            mediaStream = yield navigator.mediaDevices.getDisplayMedia({
                video: { cursor: "always" },
                audio: false,
            });
            sharedVideo.srcObject = mediaStream;
            startCaptureButton.disabled = true;
            stopCaptureButton.disabled = false;
            startWebSocket();
            captureInterval = setInterval(captureAndSendImage, 1000); // Capture every second
        }
        catch (err) {
            console.error("Error: " + err);
        }
    });
}
function stopCapture() {
    if (mediaStream) {
        let tracks = mediaStream.getTracks();
        tracks.forEach((track) => track.stop());
        sharedVideo.srcObject = null;
        startCaptureButton.disabled = false;
        stopCaptureButton.disabled = true;
        if (captureInterval) {
            clearInterval(captureInterval);
        }
        if (socket)
            socket.close();
    }
}
function captureAndSendImage() {
    const canvas = document.createElement("canvas");
    canvas.width = sharedVideo === null || sharedVideo === void 0 ? void 0 : sharedVideo.videoWidth;
    canvas.height = sharedVideo === null || sharedVideo === void 0 ? void 0 : sharedVideo.videoHeight;
    canvas
        .getContext("2d")
        .drawImage(sharedVideo, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
        const reader = new FileReader();
        reader.onloadend = function () {
            const base64data = reader.result;
            sendEvent(types_1.EventType.IMAGE, base64data);
        };
        reader.readAsDataURL(blob);
    }, "image/jpeg", 0.7);
}
function sendEvent(type, payload) {
    if (socket) {
        const event = { type, payload };
        socket.send(`${event.type}:${event.payload}`);
    }
}
startCaptureButton.addEventListener("click", startCapture);
stopCaptureButton.addEventListener("click", stopCapture);
stopCaptureButton.disabled = true;
