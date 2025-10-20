interface FSItem {
  name: string;
  path: string;
  type?: 'page' | 'database';
  children?: FSItem[]; // Apenas para diretórios
  collapsed?: boolean;
}