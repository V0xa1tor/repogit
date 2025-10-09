<script setup lang="ts">

onMounted(async () => {
});

</script>

<template>
  <div class="p-3 vstack justify-content-center align-items-center">

    <img
      class="w-50 h-50 user-select-none"
      style="opacity: 0.1;"
      draggable="false"
      src="/bloctopus.svg"
      alt="Blocks"
    >

  </div>
</template>

<style scoped>
i, i::before {
  display: block;
}

.sortable-ghost {
  background-color: var(--bs-tertiary-bg);
}

.sortable-drag {
  opacity: 0 !important;
}

#home-blocks:not(:has(.sortable-ghost)) > div:hover {
  background-color: var(--bs-tertiary-bg);
}

#home-blocks:has(.sortable-ghost), #home-blocks:has(.sortable-ghost) * {
  cursor: grabbing;
}
</style>