import 'virtual:windi.css';
import Options from 'src/components/Options.svelte';
import { storage } from 'src/storage';
import { supabase } from 'src/lib/db';

const target = document.getElementById('app');

async function render() {
  console.log('render');
  const s = await chrome.storage.sync.get();
  let session = s.session;

  if (!session) {
    const newSession = await supabase.from('pa_profiles').insert({}).select().single();
    await storage.set({ session });
    session = newSession.data;
  }

  new Options({ target, props: { session } });
}

document.addEventListener('DOMContentLoaded', render);
