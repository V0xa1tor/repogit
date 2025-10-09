import Dexie, { type DexieOptions, type Table } from 'dexie';
import type { PageBlock } from './blocks/PageBlock';
import type { EntityTable } from 'dexie';
import type { Setting } from './settings/Setting';
import type { Task } from './Task';

export class Database extends Dexie {

  blocks!: Table<PageBlock, string>;
  settings!: Table<Setting, string>;
  tasks!: Table<Task, number>;

  constructor(name: string, options?: DexieOptions) {
    super(name, options);
    this.version(useAppConfig().version).stores({
      blocks: "id, parentId, type, createdAt, updatedAt",
      settings: "id, group",
      tasks: "++id, title, done"
    });
  }
}