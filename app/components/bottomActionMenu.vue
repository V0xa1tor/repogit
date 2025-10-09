<script setup lang="ts">
import Sortable from "sortablejs";
import { useActionMenuStore } from "~/stores/actionMenu";

const actionMenu = useActionMenuStore();

</script>

<template>
  <div class="overflow-auto bg-body-tertiary">
    <div
      class="hstack flex-grow-0 p-2 gap-3 mx-auto"
      style="width: fit-content;"
    >
      <div v-for="item in actionMenu.items">
        <button v-if="item.type == 'action'"
          class="btn fs-4 p-1"
          @click="navigateTo(item.action.to)"
        >
          <i :class="`bi ${item.icon}`"></i>
        </button>
        <div v-if="item.type == 'divider'" class="vr mx-2 d-block" style="color: var(--bs-border-color); opacity: 1;"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
i, i::before {
  display: block;
}
</style>