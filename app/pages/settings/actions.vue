<script setup lang="ts">
import { useActionMenuStore } from '~/stores/actionMenu';

const actionMenu = useActionMenuStore();

import Sortable from "sortablejs";
onMounted(() => {
  const sortable = Sortable.create(document.getElementById("action-menu-settings")!, {
    animation: 150,
    handle: ".move-handler"
  });
});

</script>

<template>
  <div class="container vstack gap-3 py-3">

    <h1 class="mb-3">Configurações</h1>

    <ol id="action-menu-settings" class="list-group">
      <li v-for="item in actionMenu.items" class="p-2 d-flex justify-content-between" :class="{ 'list-group-item': item.type != 'divider' }">
        <div v-if="item.type == 'action'" class="w-100 d-flex justify-content-between align-items-center">
          <div class="d-flex align-items-center">
            <button class="btn btn-outline-secondary p-2 me-2"><i :class="`bi ${item.icon}`"></i></button>
            <div contenteditable>{{ item.name }}</div>
          </div>
          <button class="btn btn-outline-warning p-1 px-2 d-flex align-items-center" style="border: 1px dashed"><i class="bi bi-lightning-charge me-1"></i><span>Ação</span></button>
        </div>
        <div v-if="item.type == 'divider'" class="w-100">
          <hr>
        </div>
        <button class="btn border-0 move-handler p-2 ms-2">
          <i class="bi bi-arrows-move"></i>
        </button>
      </li>
    </ol>

  </div>
</template>

<style scoped>
i, i::before {
  display: block;
}

.sortable-ghost {
  opacity: 0;
}

.move-handler:hover {
  cursor: move;
}
</style>