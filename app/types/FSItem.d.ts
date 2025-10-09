interface FSItem {
  name: string;
  path: string;
  type: 'file' | 'dir';
  children?: FSItem[]; // Apenas para diretórios
  collapsed?: boolean;
}