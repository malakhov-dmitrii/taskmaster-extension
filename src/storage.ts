import type { Profile, Session } from 'src/lib/types';

type IStorage = {
  count?: number;
  session?: Session;
  profile?: Profile;
  code?: string;
};

export interface StorageSession {
  id: number;
  chat_id: number | null;
  role: 'assistant' | 'client';
  username: string | null;
}

const defaultStorage: IStorage = {
  count: 0,
};

export const storage = {
  get: (): Promise<IStorage> => chrome.storage.sync.get(defaultStorage) as Promise<IStorage>,
  set: (value: IStorage): Promise<void> => chrome.storage.sync.set(value),
};
