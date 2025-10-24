export interface item {
  name: string;
  path: string;
  type: "page" | "database";
  content?: string;
  children?: item[];
}