<script setup lang="ts">
import { ref } from 'vue'
import ForminputField from '../components/common/ForminputField.vue'

import { InputFieldProps, LabelProps } from '../types'

const emailValue = ref('');
const passwordValue = ref('');

const email = {
  label: {
    for: 'email',
    text: 'Your email'
  } as LabelProps,
  input: {
    type: 'email',
    name: 'email',
    id: 'email',
    placeholder: 'name@mail.com',
    required: true,
    modelValue: emailValue,
  } as InputFieldProps
}

const password = {
  label: {
    for: 'password',
    text: 'Password'
  } as LabelProps,
  input: {
    type: 'password',
    name: 'password',
    id: 'password',
    placeholder: '*********',
    required: true,
    modelValue: passwordValue,
  } as InputFieldProps
}

const submitForm = () => {
  console.log('email:', email)
  console.log('email:', emailValue.value);
   console.log('password:', passwordValue.value);
}
</script>

<template>
  <div class="flex flex-col items-center justify-center px-0 py-8 mx-auto md:h-screen lg:py-0">
    <a href="#" class="flex items-center mb-6 text-2xl font-semibold text-gray-900 dark:text-white">
      Customer Care App
    </a>
    <div
      class="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700"
    >
      <div class="p-6 space-y-4 md:space-y-6 sm:p-8">
        <h1
          class="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white"
        >
          Sign in to your account
        </h1>
        <form class="space-y-4 md:space-y-6" action="#">
          <ForminputField v-model="emailValue" v-bind="email" />
          <ForminputField v-model="passwordValue" v-bind="password" />

          <div class="flex items-center justify-between">
            <div class="flex items-start">
              <div class="flex items-center h-5">
                <input
                  id="remember"
                  aria-describedby="remember"
                  type="checkbox"
                  class="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-primary-600 dark:ring-offset-gray-800"
                />
              </div>
              <div class="ml-3 text-sm">
                <label for="remember" class="text-gray-500 dark:text-gray-300">Remember me</label>
              </div>
            </div>
            <a
              href="#"
              class="text-sm font-medium text-primary-600 hover:underline dark:text-primary-500"
              >Forgot password?</a
            >
          </div>
          <button
            type="submit"
            class="w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
            @click.prevent="submitForm"
          >
            Sign in
          </button>
          <p class="text-sm font-light text-gray-500 dark:text-gray-400">
            Don’t have an account yet?
            <a href="#" class="font-medium text-primary-600 hover:underline dark:text-primary-500"
              >Sign up</a
            >
          </p>
        </form>
      </div>
    </div>
  </div>
</template>
