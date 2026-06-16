export interface Tab {
  id: string;
  title: string;

  content: string;

  pinned: boolean;

  dirty: boolean;

  filePath?: string;
}