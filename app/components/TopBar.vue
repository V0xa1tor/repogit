<script setup lang="ts">

declare global {
  interface Window {
    tuiEditor: any;
  }
}

const breadcrumbItems = computed(() => {
  const breadcrumb: breadcrumbItem[] = [];
  const fullPath = decodeURIComponent(useRouter().currentRoute.value.fullPath);

  if (fullPath != '/') {
    const splitedPath = fullPath.slice(1).split('/');
    breadcrumb.push({
      name: 'Home',
      path: '/'
    });
    for (let i = 0; i < splitedPath.length; i++) {
      const block = useBlocksStore().blocks.find(block => block.id == splitedPath[i]);

      breadcrumb.push({
        name: block ? block.content.title : splitedPath[i]!,
        path: i == splitedPath.length -1 ? '' : '/' + splitedPath.slice(0, i + 1).join('/')
      });
    }
    return breadcrumb;
  }
});

function toggleView() {
  const currentTab = window.tuiEditor.getCurrentPreviewTab();
  const nextTab = currentTab === 'write' ? 'preview' : 'write';
  window.tuiEditor.changePreviewTab(nextTab);
}

</script>

<template>
  <nav class="hstack flex-nowrap bg-body-tertiary align-items-stretch border-bottom" id="top-bar">
    <div class="p-2 text-nowrap">
      <button class="btn p-1 fs-4" @click="$router.back()"><i class="bi bi-arrow-left"></i></button>
      <button class="btn p-1 fs-4" @click="$router.forward()"><i class="bi bi-arrow-right"></i></button>
    </div>
    <div class="flex-grow-1 hstack overflow-auto">
      <ol class="breadcrumb flex-nowrap m-auto">
        <li v-for="item in breadcrumbItems" class="breadcrumb-item text-nowrap">
          <NuxtLink class="text-decoration-none" :class="{ 'text-body': !item.path && item.name, 'text-secondary': !item.name }" :to="item.path">{{ item.name || 'Sem título' }}</NuxtLink>
        </li>
      </ol>
    </div>
    <div class="p-2 hstack align-items-center">
      <button @click="toggleView" class="btn p-1 fs-4"><i class="bi bi-three-dots-vertical"></i></button>
    </div>
  </nav>
</template>

<style scoped>
i, i::before {
  display: block;
}
#top-bar {
  z-index: calc(1045 + 1);
}

.breadcrumb-item::before {
  float: none;
}
</style>