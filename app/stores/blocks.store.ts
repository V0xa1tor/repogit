import { defineStore } from 'pinia';
import { useDatabasesStore } from './databases.store';
import { from, useObservable } from '@vueuse/rxjs';
import DexiePkg from 'dexie';
import type { PageBlock } from '~/models/blocks/PageBlock';
import { v4 as uuidV4 } from "uuid";

const { default: Dexie, liveQuery } = DexiePkg;

export const useBlocksStore = defineStore('blocks', () => {

  const blocks = ref<PageBlock[]>([]);

  // watch(
  //   () => useDatabasesStore().openedDb,
  //   (db) => {
  //     if (!db?.blocks) {
  //       blocks.value = [];
  //       return;
  //     }

  //     const observable = from(liveQuery(() => db.blocks.toArray()));
  //     const reactive = useObservable(observable, { initialValue: [] });

  //     watch(() => reactive.value, (value) => {
  //       blocks.value = value;
  //     }, { immediate: true });
  //   },
  //   { immediate: true }
  // );

  async function addBlock(title: string, text: string) {
    return await useDatabasesStore().openedDb?.blocks?.add({
      id: uuidV4(),
      type: 'page',
      createdAt: new Date(),
      updatedAt: new Date(),
      content: {
        title: title,
        text: text
      }
    });
  }

  async function updateBlock(block: PageBlock) {
    await useDatabasesStore().openedDb?.blocks?.put(block);
  }

  async function deleteBlock(id: string) {
    await useDatabasesStore().openedDb?.blocks?.delete(id);
  }

  return {
    blocks,
    addBlock, updateBlock, deleteBlock
  };

});
