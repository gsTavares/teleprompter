import { openDB, DBSchema, IDBPDatabase } from 'idb';

export type MessageSchema = {
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
  if(db) {
    return await db.add('messages', { title, content });
  }
};

export const updateMessage = async ({ title, content, id }: MessageSchema) => {
  if(db) {
    return await db.put("messages", { title, content, id});
  }
}

export const getMessages = async () => {
  if(db) {
    return await db.getAll('messages');
  }

  return [];
};

export const getMessageById = async (messageId: number) => {
  if(db) {
    return await db.get("messages", messageId);
  }
}

export const deleteMessage = async (id: number) => {
  if(db) {
    return await db.delete('messages', id);
  }
};
