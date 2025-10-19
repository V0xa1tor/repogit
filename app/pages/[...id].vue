<script setup lang="ts">
const path = decodeURIComponent(useRouter().currentRoute.value.path);
const repositoryStore = useRepositoryStore();
const repoStore = useRepoStore();
const file = ref<FSFile | null>(null);

watch(
  () => repoStore.repo,
  async (repo) => {
    if (repo) {
      file.value = await repoStore.getFile(path);
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