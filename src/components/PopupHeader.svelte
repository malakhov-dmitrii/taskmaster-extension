<script lang="ts">
  import { useQuery, useQueryClient } from '@sveltestack/svelte-query';
  import { supabase } from 'src/lib/db';
  import type { StorageSession } from 'src/storage';

  export let session: StorageSession;
  let chatQuery = useQuery('chat', () => {
    if (!session.chat_id) return Promise.resolve(null);
    return Promise.resolve(supabase.from('pa_chats').select().eq('id', session.chat_id).single());
  });

  let queryClient = useQueryClient();
</script>

<div class="px-4 border-b border-gray-400 pb-4 flex items-center justify-between">
  {#if !$chatQuery.isLoading}
    <div class="flex items-center space-x-2">
      <p>
        Chat join code: <strong class="tracking-widest font-mono">{$chatQuery.data?.data.join_code}</strong>
      </p>
      <button
        class="text-xs border border-gray-300 px-2 shadow font-medium rounded py-1"
        on:click={() => {
          navigator.clipboard.writeText($chatQuery.data?.data.join_code);
        }}>Copy</button
      >
    </div>
  {:else}
    <div class="bg-gray-300 rounded shadow animate-pulse h-4 w-1/2" />
  {/if}

  <!-- <button
    class="border border-gray-300 rounded px-2 text-xs shadow font-medium py-1"
    on:click={() => {
      chrome.storage.sync.clear();
      window.location.reload();
    }}>Sign out</button
  > -->
  <button
    class="border border-gray-300 rounded px-2 text-xs shadow font-medium py-1"
    on:click={() => {
      queryClient.invalidateQueries('todos');
      queryClient.refetchQueries('todos');
    }}>Refresh</button
  >
</div>
