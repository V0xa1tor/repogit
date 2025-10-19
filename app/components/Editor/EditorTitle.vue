<script setup lang="ts">

const editorTitle = ref<HTMLInputElement | null>();
const props = defineProps<{file: FSFile}>();
const repositoryStore = useRepositoryStore();
const repoStore = useRepoStore();

async function renameFile() {

  const path = props.file.path.split('/');
  path.pop();

  const newName = editorTitle.value?.value!;

  if (!newName.trim()) return;

  path.push(newName);
  const newPath = path.join('/');
  
  if (props.file.path === newPath) return;

  try {
    await repoStore.repo?.pfs.rename(props.file.path, newPath);
    window.history.replaceState({}, '', newPath);
    await repositoryStore.loadRepositories();
  } catch(e) {
    alert(`Não foi possível renomear o arquivo "${props.file.path}" para "${newPath}".\nCaractere não permitido.`);
    editorTitle.value!.value = props.file.name;
  }
}
</script>

<template>
  <input ref="editorTitle"
    class="form-control shadow-none p-3 pb-0 border-0 rounded-0 fs-1"
    style="resize: none; field-sizing: content;"
    @focusout="renameFile"
    :value="file.name"
    placeholder="Título..."
  />
</template>