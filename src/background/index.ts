import { pb, supabase } from 'src/lib/db';
import type { Profile, SessionWithUser, Task } from 'src/lib/types';
import type { StorageSession } from '../storage';

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'createTaskFromText',
    title: 'New task from text',
    contexts: ['selection'],
  });

  chrome.contextMenus.create({
    id: 'createTask',
    title: 'New task',
    contexts: ['all'],
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  const storage = await chrome.storage.sync.get();
  const session = storage.session as StorageSession;
  console.log('session', session);

  if (!session?.chat_id) {
    console.log('no session', session);

    return;
    // alert('Please login via the extension popup to create a new task.');
  }

  if (info.menuItemId === 'createTaskFromText') {
    const res = await supabase
      .from('pa_todos')
      .insert({
        chat_id: session.chat_id,
        user_id: session.id,
        title: `Task from "${tab.title}" page on ${new Date().toLocaleDateString()}`,
        description: info.selectionText,
        url: tab.url,
      })
      .select();

    if (res.data) {
      chrome.windows.create({
        url: chrome.runtime.getURL(`src/popup/popup.html?editTaskId=${res.data[0].id}`),
        type: 'popup',
        width: 450,
        height: 700,
      });
    }
  }
  if (info.menuItemId === 'createTask') {
    const res = await supabase
      .from('pa_todos')
      .insert({
        chat_id: session.chat_id,
        user_id: session.id,
        title: `Task from "${tab.title}" page on ${new Date().toLocaleDateString()}`,
        description: 'Placeholder description',
        url: tab.url,
      })
      .select();

    console.log(res);

    if (res.data)
      chrome.windows.create({
        url: chrome.runtime.getURL(`src/popup/popup.html?editTaskId=${res.data[0].id}`),
        type: 'popup',
        width: 450,
        height: 700,
      });
  }
});

// chrome.tabs.onActivated.addListener(async (activeInfo) => {
//   const storage = await chrome.storage.sync.get();
//   const profile = storage.profile as Profile;
//   chrome.tabs.get(activeInfo.tabId, async (tab) => {
//     if (tab.url.includes('web.telegram.org')) {
//       const chat_id = tab.url.split('#')[1];
//       if (chat_id) {
//         const existing = await pb.collection('sessions').getFullList<SessionWithUser>({
//           expand: 'users',
//           filter: `users.telegram_id="${chat_id}"`,
//         });
//         if (existing.length > 0) {
//           console.log(existing.filter((i) => i.users.includes(profile.id)));

//           const session = existing.find((i) => i.users.includes(profile.id));

//           const tasks = await pb.collection('tasks').getFullList<Task>({
//             filter: `session.id="${session.id}"`,
//           });

//           chrome.action.setBadgeText({
//             text: `${tasks.filter((i) => !i.is_completed).length}`,
//             tabId: activeInfo.tabId,
//           });
//         }
//       }
//     }
//   });
// });
