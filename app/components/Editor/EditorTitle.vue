<script setup lang="ts">

const editorTitle = ref<HTMLInputElement | null>();
const props = defineProps<{file: FSFile}>();
const repositoryStore = useRepositoryStore();
const repoStore = useRepoStore();
const parentName = ref('');

onMounted(() => {
  const path = props.file.path.split('/');
  path.pop();
  parentName.value = path.pop()!;
});

async function renameFile() {

  const path = props.file.path.split('/');
  path.pop(); // Remove page.md

  const parentPath = path.join("/");

  const newName = editorTitle.value?.value!;

  if (!newName.trim()) return;

  path.pop(); // Remove parentname
  path.push(newName); // Add new parentname
  const newPath = path.join('/');
  
  if (parentPath === newPath) return;

  try {
    await repoStore.repo?.pfs.rename(parentPath, newPath);
    window.history.replaceState({}, '', newPath);
    await repositoryStore.loadRepositories();
  } catch(e) {
    alert(`Não foi possível renomear o arquivo "${parentPath}" para "${newPath}".`);
    console.error(e);
    editorTitle.value!.value = parentName.value;
  }
}
</script>

<template>
  <input ref="editorTitle"
    class="form-control shadow-none p-3 pb-0 border-0 rounded-0 fs-1"
    style="resize: none; field-sizing: content;"
    @focusout="renameFile"
    :value="parentName"
    placeholder="Título..."
  />
</template>