export const useActionMenuStore = defineStore('actionMenu', () => {

  const items = ref<(action | divider)[]>([
    { type: "divider" },
    { type: "action", name: "Página inicial", icon: "bi-house", action: { type: "link", to: "/" } },
    { type: "action", name: "Kanban", icon: "bi-kanban", action: { type: "link", to: "/kanban" } },
    { type: "action", name: "Calendário", icon: "bi-calendar-date", action: { type: "link", to: "/calendar" } },
    { type: "divider" },
    { type: "action", name: "Configurações", icon: "bi-gear", action: { type: "link", to: "/settings" } }
  ]);

  return { items };
});
