<script lang="ts">
  import { useQuery } from '@sveltestack/svelte-query';
  import EditItemView from 'src/components/EditItemView.svelte';
  import PopupHeader from 'src/components/PopupHeader.svelte';
  import QueryProvider from 'src/components/QueryProvider.svelte';
  import SignIn from 'src/components/SignIn.svelte';
  import ViewItemsList from 'src/components/ViewItemsList.svelte';
  import { supabase } from 'src/lib/db';
  import type { StorageSession } from 'src/storage';

  export let session: StorageSession;
  let params = location.search
    .replaceAll('?', '')
    .split('&')
    .map(i => {
      const [key, v] = i.split('=');
      return { [key]: v };
    });

  const editTaskId = params.find(i => i.editTaskId)?.editTaskId;
</script>

<QueryProvider>
  {#if !session.chat_id}
    <div class="container py-4 text-base">
      <SignIn {session} />
    </div>
  {:else}
    <div class="container py-4 text-base">
      <PopupHeader {session} />
      <div class="px-4 mt-2">
        {#if editTaskId}
          <EditItemView id={editTaskId} />
        {:else}
          <ViewItemsList chat_id={session.chat_id} />
        {/if}
      </div>
    </div>
  {/if}
</QueryProvider>

<style>
  .container {
    min-width: 450px;
    max-width: 450px;
  }
</style>
