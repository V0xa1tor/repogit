<script setup lang="ts">
import * as bootstrap from "bootstrap";
import Sortable from "sortablejs";
import { useActionMenuStore } from "~/stores/actionMenu";

const actionMenu = useActionMenuStore();
const breakpoint = useBreakpointStore();

function toggleOffcanvas() {
  const offcanvas = document.getElementById("offcanvas")!;
  if (!offcanvas.style.marginLeft || offcanvas.style.marginLeft == "calc(var(--bs-offcanvas-width) * -1)") {
    offcanvas.style.marginLeft = "0px";
  } else {
    offcanvas.style.marginLeft = "calc(var(--bs-offcanvas-width) * -1)";
  }
  // if (breakpoint.isMdUp) {
  // } else {
  //   const bsOffcanvas = bootstrap.Offcanvas.getOrCreateInstance(offcanvas);
  //   if (bsOffcanvas) bsOffcanvas.toggle();
  // }
}

</script>

<template>
  <div id="action-menu"
    class="d-flex flex-md-column justify-content-evenly justify-content-md-start flex-grow-0 p-2 gap-3 overflow-auto bg-body-tertiary"
    :class="{ 'border-end': breakpoint.isMdUp, 'border-top': !breakpoint.isMdUp }"
  >
    <div>
      <button class="btn fs-4 p-1" @click="toggleOffcanvas">
        <i class="bi bi-list"></i>
      </button>
    </div>
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