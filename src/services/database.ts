import { openDB, DBSchema, IDBPDatabase } from 'idb';

type MessageSchema = {
    id?: number,
    title: string,
    content: string
}

interface MyDB extends DBSchema {
  messages: {
    key: number;
    value: MessageSchema;
  };
}

let db: IDBPDatabase<MyDB>;

export const initDB = async () => {
  db = await openDB<MyDB>('my-indexeddb', 1, {
    upgrade(db) {
      db.createObjectStore('messages', {
        keyPath: 'id',
        autoIncrement: true,
      });
    },
  });
};

export const addMessage = async ({ title, content }: Pick<MessageSchema, "title" | "content">) => {
  return await db.add('messages', { title, content });
};

export const getMessages = async () => {
  return await db.getAll('messages');
};

export const deleteMessage = async (id: number) => {
  return await db.delete('messages', id);
};
