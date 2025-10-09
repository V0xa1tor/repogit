import { defineStore } from 'pinia';
import { Database } from '~/models/Database';

export const useSettingsStore = defineStore('settings', () => {

  const databases = ref<Database[] | null>(null);
  const openedDb = ref<Database | null>(null);

  async function loadDatabases() {
    const names = await Database.getDatabaseNames();
    databases.value = await Promise.all(
      names.map(async name => {
        return new Database(name, { autoOpen: false });
      })
    );
  }

  async function createDatabase(name: string) {
    const db = new Database(name, { autoOpen: false });
    await db.open();
    db.close();
    await loadDatabases();
  }

  async function deleteDatabase(db: Database) {
    await db.delete();
    await loadDatabases();
  }

  async function exportDatabase(db: Database) {
    await db.open();
    const blob = await db.export({ prettyJson: true, noTransaction: true});
    db.close();
    return blob;
  }

  async function importDatabase(files: FileList | null) {
    if (files !== null) {
      const dexieExportImport = await import("dexie-export-import");
      [...files].forEach(async (file) => {
        const db = await dexieExportImport.importDB(file);
        db.close();
        await loadDatabases();
      });
    }
  }

  return {
    databases, openedDb,
    loadDatabases, createDatabase, deleteDatabase, exportDatabase, importDatabase
  };

});
