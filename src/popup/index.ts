import 'virtual:windi.css';
import Options from 'src/components/Options.svelte';
import { storage } from 'src/storage';
import { pb } from 'src/lib/db';
import type { Profile } from 'src/lib/types';

const target = document.getElementById('app');

// chrome.storage.sync.clear();

async function render() {
  console.log('render');

  const s = await chrome.storage.sync.get();
  let profile = null;

  if (!s.code) {
    const newCode = await pb.collection('verification_codes').create({});
    await chrome.storage.sync.set({ code: newCode.id });
  } else {
    const code = await pb
      .collection('verification_codes')
      .getOne(s.code)
      .catch(() => {
        console.log('error');
        chrome.storage.sync.clear();
        window.location.reload();
        return null;
      });

    console.log({ user: code.user });
    if (code.user) profile = await pb.collection('profiles').getOne(code.user);
  }

  console.log({ profile });

  // profile = await pb
  //   .collection('profiles')
  //   .getOne<Profile>(profile.id)
  //   .catch(async () => {
  //     console.log('error');
  //     await chrome.storage.sync.clear();
  //     window.location.reload();
  //     return null;
  //   });

  new Options({ target, props: { profile } });
}

document.addEventListener('DOMContentLoaded', render);
