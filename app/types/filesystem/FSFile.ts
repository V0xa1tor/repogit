export interface FSFile {
  type: "file";
  name: string;
  path: string;
  content?: string;
}