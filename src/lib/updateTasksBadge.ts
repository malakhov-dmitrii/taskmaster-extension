import { pb } from 'src/lib/db';
import { getOrCreateSession } from 'src/lib/session';
import type { SessionWithUser, Task } from 'src/lib/types';

export const updateTasksBadge = async (url: string) => {
  const storage = await chrome.storage.sync.get();
  const code = storage.code;

  if (url?.includes('web.telegram.org')) {
    if (code) {
      const codeRecord = await pb.collection('verification_codes').getOne(code);
      if (!codeRecord) {
        console.log('No code record found: updateTasksBadge');
        throw new Error('no code: updateTasksBadge');
      }
      const profile = await pb.collection('profiles').getOne(codeRecord.user);

      const chat_id = url.split('#')[1];
      if (chat_id) {
        const session = await getOrCreateSession(chat_id, profile.telegram_id, profile.id, true);
        if (session) {
          const tasks = await pb.collection('tasks').getFullList<Task>({
            filter: `session.id="${session.id}"`,
          });

          chrome.action.setBadgeText({ text: tasks.length.toString() });
        } else {
          chrome.action.setBadgeText({ text: '0' });
        }
      } else {
        chrome.action.setBadgeText({ text: '🤔' });
      }
    }
  }
};
