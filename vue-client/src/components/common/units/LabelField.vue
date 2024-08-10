<script setup lang="ts">
import { LabelProps, defaultLabelClass } from '../../../types.ts'

const props = defineProps<LabelProps>()
</script>

<template>
  <Label :for="props.for" :class="props.class || defaultLabelClass">
    {{ props.text }}
  </Label>
</template>
