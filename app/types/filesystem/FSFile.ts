export interface FSFile {
  name: string;
  path: string;
  type: "file";
  content?: string;
}