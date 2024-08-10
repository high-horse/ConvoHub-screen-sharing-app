<script setup lang="ts">
import { defaultInputClass, InputFieldProps } from '../../../types.ts'

const props = defineProps<InputFieldProps>()
const emit = defineEmits(['update:modelValue']);

const updateValue = (event: Event) => {
  const target = event.target as HTMLInputElement;
  emit('update:modelValue', target.value);
};
</script>

<template>
  <input
    :type="props.type"
    :name="props.name"
    :id="props.id"
    :placeholder="props.placeholder"
    @input="updateValue"
    :class="props.class || defaultInputClass"
    :required="props.required"
  />
</template>
