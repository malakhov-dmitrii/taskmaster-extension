<script lang="ts">
  import Button from '../../ui/Button.svelte';
  import { useQueryClient } from '@sveltestack/svelte-query';
  import { pb } from 'src/lib/db';
  import type { Session } from 'src/lib/types';
  import { storage } from 'src/storage';
  import { createEventDispatcher, onMount } from 'svelte';
  import { Edit, Menu } from 'lucide-svelte';
  import HeaderMenu from 'src/components/header/HeaderMenu.svelte';

  let queryClient = useQueryClient();

  export let session = null as Session | null;
  export let user_id: string;
  $: companionId = session?.users?.find((u) => u !== user_id);

  const dispatch = createEventDispatcher();
</script>

<div class="px-4 border-b border-slate-300 py-4 flex items-center justify-between">
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
    }}
  >
    <Edit class="w-4 h-4 mr-2" />
    New Task</Button
  >

  <HeaderMenu />

  <!-- <div class="flex space-x-2">
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
  </div> -->
</div>
