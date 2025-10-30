<script setup lang="ts">
import type { FSItem } from './types/filesystem/FSItem';


const loading = ref(true);
const viewport = useViewportStore();
const appConfig = useAppConfig();
const repositoryStore = useRepositoryStore();
const propertiesStore = usePropertiesStore();
const settingsStore = useSettingsStore();
const router = useRouter();

const path = ref(decodeURIComponent(router.currentRoute.value.path));

onMounted(async () => {
  const firstTime = !(await indexedDBExists(appConfig.fsName));
  const filesystemStore = useFilesystemStore();

  viewport.updateWindowSize();
  window.addEventListener('resize', viewport.updateWindowSize);

  window.addEventListener('resize', setAppHeight);
  window.addEventListener('orientationchange', setAppHeight);
  setAppHeight();

  // FS population
  if (firstTime) {
    await propertiesStore.createProperties("/", propertiesStore.rootProperties);
    await settingsStore.createSettings("/", settingsStore.rootSettings);
    await repositoryStore.createDocs();
  }

  filesystemStore.repositories = await filesystemStore.listRepos();

  watch(() => router.currentRoute.value.path, async (newPath) => {
    path.value = decodeURIComponent(newPath);

    let match = false;
    function check(item: FSItem) {
      if (item.isRepo) {
        if (path.value.startsWith(item.path)) {
          filesystemStore.basePath = item.path;
          filesystemStore.relativePath = path.value.replace(item.path, '');
          match = true;
        }
      } else {
        for (const child of item.children!) {
          if (child.type == "item") check(child);
        }
      }
    }
    for(const repo of filesystemStore.repositories!) check(repo);
    if (!match) {
      filesystemStore.basePath = "";
      filesystemStore.relativePath = path.value;
    } 
    // console.log(`filesystemStore.basePath: ${filesystemStore.basePath}; filesystemStore.relativePath: ${filesystemStore.relativePath};`);
    
    let item = await filesystemStore.getItem(filesystemStore.basePath! == "" ? "/" : filesystemStore.basePath!);

    // if (!item?.isRepo) {
    //   item = await filesystemStore.getItem("/");
    //   item!.children = await filesystemStore.list("/", true);
    //   filesystemStore.root = item;
    //   return;
    // }

    item!.children = await filesystemStore.list(filesystemStore.basePath! == "" ? "/" : filesystemStore.basePath!, true);
    filesystemStore.root = item;
  }, { immediate: true });

  // const root = await filesystemStore.getItem("/");
  // root!.children = await filesystemStore.list("/", true);
  // filesystemStore.root = root;

  await sleep(200);
  loading.value = false;
});

function setAppHeight() {
  const height = window.innerHeight;
  document.documentElement.style.setProperty('--app-height', `${height}px`);
}

async function indexedDBExists(name: string): Promise<boolean> {
  if (!('databases' in indexedDB)) {
    console.warn('indexedDB.databases() não é suportado neste navegador');
    return false;
  }

  const databases = await indexedDB.databases();
  return databases.some(db => db.name === name);
}

</script>

<template>

  <NuxtPwaManifest />

  <div v-if="loading"
    class="position-fixed bg-body w-100 h-100 d-flex justify-content-center align-items-center"
    style="z-index: 9999;"
  >
    <Loading />
  </div>

  <div class="d-flex flex-column-reverse flex-md-row h-100 overflow-auto">
    <ActionMenu /> <!-- Side / Bottom -->
    <!-- <div class="vr" style="color: var(--bs-border-color); opacity: 1;"></div> -->
    <div class="hstack w-100 h-100 overflow-auto">
      <SidePanel />
      <div class="vstack" style="width: 1%;">
        <!-- <TopBar2 /> -->
        <TopBar />
        <NuxtPage class="overflow-auto" />
      </div>
    </div>
  </div>
  
</template>

<style>
html, body, #__nuxt {
  width: 100dvw;
  height: var(--app-height);
}
</style>