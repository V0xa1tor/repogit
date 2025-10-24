import type { action } from "../action";

export interface settings {
  selectedTheme: "light" | "dark" | "device";
  theme: {
    light: {}, // Bootstrap variables --bs-
    dark: {}
  };
  actions: (action | "divider")[];
}