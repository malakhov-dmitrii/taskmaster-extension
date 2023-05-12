import { pb } from 'src/lib/db';
import { updateTasksBadge } from '../lib/updateTasksBadge';
import type { Profile, Task } from 'src/lib/types';

chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
  updateTasksBadge(tabs[0]?.url);
});

chrome.history.onVisited.addListener(async (result) => {
  await updateTasksBadge(result?.url);
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  await updateTasksBadge(tab?.url);
});

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, async (tab) => {
    updateTasksBadge(tab?.url);
  });
});

chrome.runtime.onInstalled.addListener(function (object) {
  if (object.reason === chrome.runtime.OnInstalledReason.INSTALL) {
    chrome.tabs.create({ url: 'https://pa-task-tracker.super.site/' });
  }
});

chrome.runtime.setUninstallURL('https://pa-task-tracker.super.site/were-sorry');

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message === 'badgeIncrement') {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      updateTasksBadge(tabs[0]?.url);
    });
  }
});

console.log('background script loaded');
const listenForUpdates = async () => {
  const storage = await chrome.storage.sync.get();
  const code = storage.code;
  const codeRecord = await pb.collection('verification_codes').getOne(code);
  if (!codeRecord) {
    console.log('No code record found: updateTasksBadge');
    throw new Error('no code: updateTasksBadge');
  }
  const profile = await pb.collection('profiles').getOne(codeRecord.user);
  let sessions = await pb.collection('sessions').getFullList({ filter: `users.id?="${profile.id}"` });

  await pb.collection('sessions').subscribe('*', async (update) => {
    if (update.action === 'create' && update.record.users.find((u) => u.id === profile.id)) {
      sessions.push(update.record);
    }
  });

  await pb.collection('tasks').subscribe('*', async (update) => {
    const session = sessions.find((s) => s.id === update.record.session);
    if (session) {
      const task = await pb
        .collection('tasks')
        .getOne<Task & { expand: { assigned_to: Profile } }>(update.record.id, { expand: 'assigned_to' });
      chrome.notifications?.create(update.record.id, {
        message:
          `${update.record.description}
---
Status: ${update.record.is_completed ? 'done' : 'pending'}
Assigned to: ${task.expand.assigned_to?.username ?? 'n/a'}
${task.date ? `Due: ${new Date(task.date).toLocaleDateString()}` : 'No due date'}
` ?? 'message',
        title: `Task ${update.action}d`,
        type: 'basic',
        iconUrl: chrome.runtime.getURL('src/assets/icons/get_started32.png'),
      });
    }

    // console.log('tasks', tasks);
  });
};
listenForUpdates();
