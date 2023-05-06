<script lang="ts">
  import Button from '../ui/Button.svelte';
  import { useQueryClient } from '@sveltestack/svelte-query';
  import { pb } from 'src/lib/db';
  import type { Session } from 'src/lib/types';
  import { storage } from 'src/storage';
  import { createEventDispatcher, onMount } from 'svelte';
  let queryClient = useQueryClient();

  export let session = null as Session | null;
  export let user_id: string;
  $: floatingMode = 'on';
  $: companionId = session?.users?.find((u) => u !== user_id);

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
    disabled={!session}
    on:click={async () => {
      const res = await pb.collection('tasks').create({
        session: session.id,
        title: 'New Task',
        assigned_to: companionId,
      });
      dispatch('newTask', res.id);
    }}>New Task</Button
  >
</div>
