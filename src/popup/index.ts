import 'virtual:windi.css';
import Options from 'src/components/Options.svelte';
import { storage } from 'src/storage';
import { pb, supabase } from 'src/lib/db';

const target = document.getElementById('app');

async function render() {
  console.log('render');
  const s = await chrome.storage.sync.get();
  let profile = s.profile;

  console.log('profile', profile, s);

  if (!profile) {
    const newProfile = await pb.collection('profiles').create({});
    await storage.set({ profile: newProfile });
    console.log('newprofile', newProfile);

    profile = newProfile;
  }

  new Options({ target, props: { profile } });
}

document.addEventListener('DOMContentLoaded', render);
