import 'virtual:windi.css';
import Options from 'src/components/Options.svelte';
import { storage } from 'src/storage';
import { pb } from 'src/lib/db';
import type { Profile } from 'src/lib/types';

const target = document.getElementById('app');

async function render() {
  let profile = null;
  const s = await chrome.storage.sync.get();

  console.log('Open popup', s);

  if (!s.code) {
    /**
     * Create code, user will be assigned later
     */
    const newCode = await pb.collection('verification_codes').create({});
    await chrome.storage.sync.set({ code: newCode.id });
  } else {
    const code = await pb.collection('verification_codes').getOne(s.code);

    console.log('code: ', code);

    if (!code) {
      console.log('no code: popup -> index.ts ');
      throw new Error('no code: popup -> index.ts');
    }

    console.log('code user: ', code?.user);
    if (code.user) profile = await pb.collection('profiles').getOne(code.user);
  }

  target.innerHTML = '';
  new Options({ target, props: { profile } });
}

document.addEventListener('DOMContentLoaded', render);
document.addEventListener('focus', render);

chrome.history.onVisited.addListener(async (result) => {
  render();
});
