<script setup lang="ts">
import { InputFieldProps, LabelProps } from '../../types';
import InputField from './units/InputField.vue';
import LabelField from './units/LabelField.vue';

interface FormFieldProps {
  label: LabelProps;
  input: InputFieldProps;
  modelValue: string;
};

const props = defineProps<FormFieldProps>();
const emit = defineEmits(['update:modelValue']);
</script>


<template>
    <div>
        <LabelField v-bind="props.label"/>
        <InputField 
            v-bind="props.input" 
            :modelValue="modelValue"
            @update:modelValue="newValue => emit('update:modelValue', newValue)"
        />
    </div>
</template>