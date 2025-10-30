<script setup lang="ts">
import type { FSDir } from '~/types/filesystem/FSDir';
import type { FSFile } from '~/types/filesystem/FSFile';
import type { FSItem } from '~/types/filesystem/FSItem';

const item = ref<FSItem | null>(null);

const appConfig = useAppConfig();
const filesystemStore = useFilesystemStore();
const path = ref(decodeURIComponent(useRouter().currentRoute.value.path));
const last = computed(() => path.value.split("/").pop());
// const type = await repoStore.getItemType(path);

watch(() => filesystemStore.relativePath, async () => {
  item.value = await filesystemStore.getItem(filesystemStore.basePath! + filesystemStore.relativePath!);
  console.log(item.value);
}, { immediate: true });

useHead({
  title: () => item.value?.name || 'Sem nome'
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

const pages = [
  { icon: "bi-pie-chart", title: "Espaço utilizado", link: "/settings/storage" },
  { icon: "bi-palette", title: "Customização", link: "/settings/customization" },
  { icon: "bi-lightning-charge", title: "Menu de ações", link: "/settings/actions" }
];
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
  <!-- {{ item }} -->
  <!-- <pre>{{ filesystemStore.repositories }}</pre> -->
  <div v-if="last == appConfig.settingsFileName">
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
  </div>
</template>