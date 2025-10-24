export const useSettingsStore = defineStore('settings', () => {

  const appConfig = useAppConfig();
  const filesystemStore = useFilesystemStore();

  async function createSettings(path: string) {
    await filesystemStore.filesystem.promises.writeFile(`${path == "/" ? "" : path}/${appConfig.settingsFileName}`, JSON.stringify({}), "utf8");
  }

  return {
    createSettings
  };
});
