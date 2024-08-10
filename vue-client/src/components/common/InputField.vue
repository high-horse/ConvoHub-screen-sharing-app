<script setup lang="ts">
import { defaultInputClass, InputFieldProps } from '../../types.ts'

const props = defineProps<InputFieldProps>()
</script>

<template>
  <input
    :type="props.type"
    :name="props.name"
    :id="props.id"
    :placeholder="props.placeholder"
    :class="props.class || defaultInputClass"
    :required="props.required"
  />
</template>
