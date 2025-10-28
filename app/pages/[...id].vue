<script setup lang="ts">
import type { FSDir } from '~/types/filesystem/FSDir';
import type { FSFile } from '~/types/filesystem/FSFile';
import type { FSItem } from '~/types/filesystem/FSItem';

const item = ref<FSItem | null>(null);

const appConfig = useAppConfig();
const filesystemStore = useFilesystemStore();
const path = decodeURIComponent(useRouter().currentRoute.value.path);
// const type = await repoStore.getItemType(path);

// watch(
//   () => filesystemStore.root,
//   async (root) => {
//     if (root) {
//       if (type === 'page') {
//         file.value = await repoStore.getFile(`${path}/${appConfig.pageFileName}`);
//       } else if (type === 'database') {
//         file.value = await repoStore.getFile(`${path}/${appConfig.databaseFileName}`);
//       } else {
//         file.value = null;
//       }
//     } else {
//       file.value = null;
//     }
//   },
//   { immediate: true }
// );

useHead({
  title: () => item.value?.dir.name || 'Sem nome'
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
  item.value = await filesystemStore.getItem(path);
});
</script>

<template>
  <!-- <div class="vstack">
    <template v-if="file">
      <EditorTitle :file="file" />
      <EditorContent :file="file" />
    </template>
    <template v-else>
      <div class="text-center text-muted py-5">Carregando arquivo...</div>
    </template>
  </div> -->
  {{ item }}
</template>