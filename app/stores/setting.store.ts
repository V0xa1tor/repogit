export const useSettingStore = defineStore('setting', () => {

  const appConfig = useAppConfig();
  const repoStore = useRepoStore();

  async function createSettings(path: string) {
    await repoStore.repo?.pfs.writeFile(`${path}/${appConfig.settingsFileName}`, JSON.stringify({}), "utf8");
  }

  return {
    createSettings
  };
});
