<template>
<h1>clients template</h1>
    <div>
        <ul>
            <li v-for="client in clientsList" :key="client">
                <button 
                    v-if="client != myWsID"  
                    @click="$emit('connectPeer', client)"
                    class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                   {{ client }}
                </button>
            </li>
        </ul>
    </div>
    <div>
    MY WSID <br />
    {{myWsID}}
    </div>
    <div>
    MY peerRequest <br />
    {{peerRequest}}
    </div>
    
</template>

<script setup lang="ts">

const props = defineProps<{
  clientsList : string[],
  myWsID : string,
  peerRequest : PairRequest,
}>()

const emit = defineEmits<{
  (emit: 'connectPeer', peerId:string ):void
}>()

</script>

<style>
li {
    margin:10px;
}
</style>
