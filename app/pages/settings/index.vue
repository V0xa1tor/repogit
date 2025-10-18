<script setup lang="ts">
const pages = [
  { icon: "bi-archive", title: "Repositórios", link: "/settings/repositories" },
  { icon: "bi-pie-chart", title: "Espaço utilizado", link: "/settings/storage" },
  { icon: "bi-palette", title: "Customização", link: "/settings/customization" },
  { icon: "bi-lightning-charge", title: "Menu de ações", link: "/settings/actions" },
  { icon: "bi-info-circle", title: "Sobre", link: "/settings/about" }
];
</script>

<template>
  <div class="container vstack gap-3 py-3">

    <h1 class="mb-3">Configurações</h1>
    
    <div class="list-group">
      <button v-for="page in pages" type="button"
        class="list-group-item list-group-item-action hstack gap-3 justify-content-between"
        @click="navigateTo(page.link)"
      >
        <div class="hstack gap-2">
          <i :class="`bi ${page.icon}`"></i>
          <div>{{ page.title }}</div>
        </div>
        <i class="bi bi-chevron-right"></i>
      </button>
    </div>

  </div>
</template>

<style scoped>
i, i::before {
  display: block;
}
</style>