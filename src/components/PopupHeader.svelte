<script lang="ts">
  import Button from '../ui/Button.svelte';
  import { useQueryClient } from '@sveltestack/svelte-query';
  import { pb } from 'src/lib/db';
  import { storage } from 'src/storage';
  import { createEventDispatcher, onMount } from 'svelte';
  let queryClient = useQueryClient();

  export let session_id: string;
  $: floatingMode = 'on';

  onMount(async () => {
    const store = await chrome.storage.sync.get('floatingMode');
    floatingMode = store.floatingMode;
  });

  const dispatch = createEventDispatcher();
</script>

<div class="px-4 border-b border-slate-300 py-4 flex items-center justify-between">
  <div class="flex space-x-2">
    <Button
      variant="subtle"
      size="sm"
      on:click={() => {
        window.location.reload();
      }}>Refresh</Button
    >
    <Button
      variant="ghost"
      size="sm"
      on:click={() => {
        console.log('sign out');

        chrome.storage.sync.clear();
        window.location.reload();
      }}>Sign Out</Button
    >
    <Button
      variant="outline"
      size="sm"
      on:click={() => {
        const v = floatingMode === 'on' ? 'off' : 'on';
        chrome.storage.sync.set({ floatingMode: v });
        floatingMode = v;
      }}
    >
      {#if floatingMode === 'on'}
        ✅
      {:else}
        ❌
      {/if}
      Floating button</Button
    >
  </div>

  <Button
    size="sm"
    disabled={!session_id}
    on:click={async () => {
      const res = await pb.collection('tasks').create({
        session: session_id,
        title: 'New Task',
      });
      dispatch('newTask', res.id);
    }}>New Task</Button
  >
</div>
