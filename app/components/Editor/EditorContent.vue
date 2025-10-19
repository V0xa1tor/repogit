<script setup lang="ts">

const editorContent = ref<HTMLTextAreaElement | null>();
const props = defineProps<{file: FSFile}>();
const repositoryStore = useRepositoryStore();
const repoStore = useRepoStore();

function updateContent() {
  repoStore.repo?.pfs.writeFile(props.file.path, editorContent.value?.value!, 'utf8');
}
</script>

<template>
  <textarea ref="editorContent"
    class="form-control shadow-none p-3 pb-5 border-0 rounded-0 flex-grow-1 user-select-none"
    style="resize: none; field-sizing: content; overflow-y: none;"
    @contextmenu="(e) => e.stopPropagation()"
    @input="updateContent"
    :value="file.content"
    placeholder="Escreva algo..."
  ></textarea>
</template>