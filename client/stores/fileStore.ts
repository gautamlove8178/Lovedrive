import { create } from "zustand";

export interface DriveFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: Date;
}

interface FileStore {
  files: DriveFile[];

  addFile: (file: DriveFile) => void;

  removeFile: (id: string) => void;

  clearFiles: () => void;
}

export const useFileStore = create<FileStore>((set) => ({
  files: [],

  addFile: (file) =>
    set((state) => ({
      files: [...state.files, file],
    })),

  removeFile: (id) =>
    set((state) => ({
      files: state.files.filter((file) => file.id !== id),
    })),

  clearFiles: () =>
    set({
      files: [],
    }),
}));