import { defineStore } from 'pinia';
import { useDatabasesStore } from './databases.store';
import { from, useObservable } from '@vueuse/rxjs';
import DexiePkg from 'dexie';
import type { PageBlock } from '~/models/blocks/PageBlock';
import { v4 as uuidV4 } from "uuid";
import type { Task } from '~/models/Task';

const { default: Dexie, liveQuery } = DexiePkg;

export const useTasksStore = defineStore('tasks', () => {

  const tasks = ref<Task[]>([]);

  // watch(
  //   () => useDatabasesStore().openedDb,
  //   (db) => {
  //     if (!db?.tasks) {
  //       tasks.value = [];
  //       return;
  //     }

  //     const observable = from(liveQuery(() => db.tasks.toArray()));
  //     const reactive = useObservable(observable, { initialValue: [] });

  //     watch(() => reactive.value, (value) => {
  //       tasks.value = value;
  //     }, { immediate: true });
  //   },
  //   { immediate: true }
  // );

  async function addTask(title: string, done: boolean) {
    return await useDatabasesStore().openedDb?.tasks?.add({
      title: title,
      done: done
    } as Task);
  }

  async function updateTask(id: number, done: boolean) {
    await useDatabasesStore().openedDb?.tasks?.update(id, { done: done });
  }

  async function deleteTask(id: number) {
    await useDatabasesStore().openedDb?.tasks?.delete(id);
  }

  return {
    tasks,
    addTask, updateTask, deleteTask
  };

});
