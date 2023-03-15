<script lang="ts">
  import { anonKey, supabaseUrl } from 'src/lib/config';
  // import { createClient } from '@supabase/supabase-js';
  // import { supabase } from 'src/lib/db';
  import { storage, type StorageSession } from 'src/storage';
  import { onMount } from 'svelte';

  let open = false;
  $: selection = null as Selection | null;
  $: selectionText = '';
  $: selectionNodeRect = selection?.focusNode?.parentElement?.getBoundingClientRect();

  $: loading = false;

  $: {
    if (selection && selection.toString().length > 0) {
      open = true;
      selectionText = selection.toString();
    } else {
      setTimeout(() => {
        open = false;
      }, 100);
    }
  }

  async function createTask(text: string, url: string) {
    loading = true;
    const storage = await chrome.storage.sync.get();
    const session = storage.session as StorageSession;

    const urlSiteName = url.split('/')[2];
    const tab = (await chrome.tabs?.query({ active: true, currentWindow: true })?.[0]) ?? urlSiteName;

    // chat_id: session.chat_id,
    // user_id: session.id,
    // title: `Task from "${tab.title}" page on ${new Date().toLocaleDateString()}`,
    // description: info.selectionText,
    // url: tab.url,

    if (!session) {
      alert('Please login to create a task');
      return;
    }

    const res = await fetch(`${supabaseUrl}/rest/v1/pa_todos`, {
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: session.chat_id,
        user_id: session.id,
        title: `Task from "${tab.title ?? urlSiteName}" page on ${new Date().toLocaleDateString()}`,
        description: text,
        url: tab?.url ?? url,
      }),
      method: 'POST',
    }).then(res => res.json());

    if (res.data) {
      chrome.windows.create({
        url: chrome.runtime.getURL(`src/popup/popup.html?editTaskId=${res.data[0].id}`),
        type: 'popup',
        width: 450,
        height: 700,
      });
    }

    loading = false;
  }

  onMount(() => {
    console.log('mounted');

    document.addEventListener('selectionchange', () => {
      selection = document.getSelection();
    });

    document.addEventListener('scroll', () => {
      selection = null;
    });
  });
</script>

{#if open}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <div
    class="create-task-btn"
    on:click={() => {
      if (loading) return;
      createTask(selectionText, window.location.href);
    }}
  >
    {#if loading}
      Loading...
    {:else}
      Create task from selection
    {/if}
  </div>
{/if}
