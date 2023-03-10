import { supabase } from 'src/lib/db';
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
    return;
    // alert('Please login via the extension popup to create a new task.');
  }

  // get tab DOM
  const tabDOM = await new Promise(resolve => {
    chrome.scripting
      .executeScript({
        target: { tabId: tab.id, allFrames: true },
        func: () => {
          const innerText = document.documentElement.innerText;
          return innerText;
        },
      })
      .then(injectionResults => injectionResults.flat())
      .then(r =>
        fetch('https://name-recognition-production.up.railway.app/api/names', {
          method: 'POST',
          body: JSON.stringify({ text: r[0].result }),
        })
      )
      .then(r => r.json());
  });

  console.log('tabDOM', tabDOM);

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
