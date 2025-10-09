<script setup lang="ts">
import Sortable from "sortablejs";
import { useActionMenuStore } from "~/stores/actionMenu";

const actionMenu = useActionMenuStore();

function toggleOffcanvas() {
  const offcanvas = document.getElementById("offcanvas")!;
  if (offcanvas.style.marginLeft == "0px") {
    offcanvas.style.marginLeft = "calc(var(--bs-offcanvas-width) * -1)";
  } else {
    offcanvas.style.marginLeft = "0px";
  }
}

</script>

<template>
  <div id="action-menu"
    class="d-flex flex-md-column justify-content-evenly justify-content-md-start border-end flex-grow-0 p-2 gap-3 overflow-auto bg-body-tertiary"
  >
    <button class="btn p-1 fs-4" @click="toggleOffcanvas"><i class="bi bi-list"></i></button>
    <div v-for="item in actionMenu.items">
      <button v-if="item.type == 'action'"
        class="btn fs-4 p-1"
        @click="navigateTo(item.action.to)"
      >
        <i :class="`bi ${item.icon}`"></i>
      </button>
      <div v-if="item.type == 'divider'" class="h-100">
        <hr class="my-0 w-100 d-none d-md-block" style="color: var(--bs-border-color); opacity: 1;">
        <div class="vr d-md-none h-100"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
i, i::before {
  display: block;
}

#action-menu {
  z-index: calc(1045 + 1);
}
</style>