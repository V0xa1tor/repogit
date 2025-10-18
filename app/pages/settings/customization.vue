<script setup lang="ts">
import { bsVariables } from '~/assets/bs-colors';

onMounted(() => {
  Object.entries(bsVariables).forEach(([key, defaultValue]) => {
    bsVariables[key as keyof typeof bsVariables] = ref(getCSSVariable(key));
    watch(bsVariables[key as keyof typeof bsVariables], (value) => {
      setCSSVariable(key, value);
    });
  });
});

function getCSSVariable(variable: string) {
  return getComputedStyle(document.querySelector("[data-bs-theme=dark]")!).getPropertyValue(variable);
}

function setCSSVariable(variable: string, value: string) {
  document.documentElement.style.setProperty(variable, value);
}
</script>

<template>
  <div class="container vstack py-3 gap-3">

  <h1 class="mb-3">Customize</h1>

  <ul class="list-group mb-3">
    <li class="list-group-item" v-for="(_, key) in bsVariables" :key="key">
      <span>{{ key }}: </span>
      <input v-model="bsVariables[key].value" type="color" class="form-control form-control-color d-inline">
    </li>
  </ul>
  
  </div>
</template>
