import type { settings } from "~/types/repo/settings";

export const useSettingsStore = defineStore('settings', () => {

  const appConfig = useAppConfig();
  const filesystemStore = useFilesystemStore();

  const rootSettings: settings = {
    selectedTheme: "device",
    theme: {
      light: {},
      dark: {}
    },
    actions: []
  };

  async function createSettings(path: string, settings: settings) {
    await filesystemStore.filesystem.promises.writeFile(`${path == "/" ? "" : path}/${appConfig.settingsFileName}`, JSON.stringify(settings, null, '\t'), "utf8");
  }

  return {
    createSettings,
    rootSettings
  };
});
