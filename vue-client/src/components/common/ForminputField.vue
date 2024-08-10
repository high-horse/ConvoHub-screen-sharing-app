<script setup lang="ts">
import { InputFieldProps, LabelProps } from '../../types';
import InputField from './InputField.vue';
import LabelField from './LabelField.vue';

interface FormFieldProps {
  label: LabelProps;
  input: InputFieldProps;
};

const props = defineProps<FormFieldProps>()
</script>


<template>
    <div>
        <LabelField v-bind="props.label"/>
        <InputField v-bind="props.input" />
    </div>
</template>