<template>
    <div class="modal" v-if="pairRequest">
        <div class="modal-content">
            <span
                @click="$emit('connectPeer', false)"
                class="close-btn"
            >
                &times;
            </span>
            <div class="font-bold">
                Connect Request
            </div>
            <div name="body" class="mt-8">
                <p>
                    <ul>{{ pairRequest.peerId }}</ul> wants to connect, do you want to accept the
                    {{ pairRequest.message }}.

                </p>
            </div>
            <div class="alert-dialog-buttons mt-8">
                <button
                    @click="$emit('connectPeer', true)"
                    type="button"
                    class="text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-300 font-medium rounded-full text-sm px-5 py-2.5 text-center me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
                >
                    OK
                </button>
                <button
                    @click="$emit('connectPeer', false)"
                    type="button"
                    class="text-white bg-red-700 hover:bg-red-800 focus:outline-none focus:ring-4 focus:ring-red-300 font-medium rounded-full text-sm px-5 py-2.5 text-center me-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900"
                >
                    Cancel
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">

import PairRequest from "../../../types.ts";

const props = defineProps<{
    pairRequest: PairRequest;
}>();

const emits = defineEmits<{
    (emit: "connectPeer", option: boolean): void;
}>();
</script>

<style scoped>
.modal {
    color: black !important;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.modal-content {
    background: #5072a7;
    padding: 2rem;
    border-radius: 0.5rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    position: relative;
    max-width: 500px;
    width: 100%;
}

.close-btn {
    position: absolute;
    top: 10px;
    right: 10px;
    font-size: 1.5rem;
    cursor: pointer;
}

.form-group {
    margin-bottom: 1rem;
}

label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: bold;
}

input,
textarea,
select {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 0.25rem;
}

textarea {
    resize: vertical;
    min-height: 100px;
}

.submit-btn {
    background-color: #007bff;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

.submit-btn:hover {
    background-color: #0056b3;
}
</style>
