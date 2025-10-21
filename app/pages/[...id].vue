<script setup lang="ts">
const path = decodeURIComponent(useRouter().currentRoute.value.path);
const appConfig = useAppConfig();
const repoStore = useRepoStore();
const file = ref<FSFile | null>(null);
const type = await repoStore.getItemType(path);

watch(
  () => repoStore.repo,
  async (repo) => {
    if (repo) {
      if (type === 'page') {
        file.value = await repoStore.getFile(`${path}/${appConfig.pageFileName}`);
      } else if (type === 'database') {
        file.value = await repoStore.getFile(`${path}/${appConfig.databaseFileName}`);
      } else {
        file.value = null;
      }
    } else {
      file.value = null;
    }
  },
  { immediate: true }
);

useHead({
  title: () => file.value?.name || 'Sem título'
});

// watch(block, async (newBlock) => {
//   if (newBlock !== undefined) await blocksStore.updateBlock(toRaw(newBlock));
// }, { deep: true });

onMounted(async () => {
  // const pageTitle = document.getElementById("page-title") as HTMLInputElement;
  // const pageText = document.getElementById("page-text") as HTMLInputElement;
  // pageTitle!.value = block.value?.content.title ?? '';
  // pageText!.value = block.value?.content.text ?? '';
  // pageText.focus();
  // file.value = await repositoryStore.getFile(path) ?? null;
  
});
</script>

<template>
  <div class="vstack">
    <template v-if="file">
      <EditorTitle :file="file" />
      <EditorContent :file="file" />
    </template>
    <template v-else>
      <div class="text-center text-muted py-5">Carregando arquivo...</div>
    </template>
  </div>
</template>