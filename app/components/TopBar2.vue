<script setup lang="ts">
import { window } from 'rxjs';
import Sortable from 'sortablejs';

const blocks = ref(["Teste 1", "Teste 2", "Teste 3", "Teste 4", "Teste 5", "Teste 6"]);

onMounted(() => {
  const sortable = Sortable.create(document.getElementById("tabs")!, {
    direction: "horizontal",
    animation: 150,
    delay: 450,
    easing: "ease-out",
    delayOnTouchOnly: true,
    forceFallback: true
  });
});

</script>

<template>
  <nav class="hstack flex-nowrap align-items-stretch bg-body-tertiary overflow-x-auto overflow-y-hidden border-bottom p-2 pb-0" style="min-height: fit-content;">
    <ul id="tabs" class="nav nav-tabs text-nowrap flex-nowrap border-bottom-0 w-100" style="margin-bottom: -1px;">
      <li v-for="text in blocks" class="nav-item">
        <button type="button" class="nav-link text-body" :class="{ 'active': text == 'Teste 1' }">{{ text }}</button>
      </li>
    </ul>
  </nav>
</template>

<style scoped>
i, i::before {
  display: block;
}

.sortable-drag {
  opacity: 0 !important;
}
</style>