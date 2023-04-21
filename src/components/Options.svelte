<script lang="ts">
  import type { Profile, Session, SessionWithUser } from 'src/lib/types';
  import { useQuery } from '@sveltestack/svelte-query';
  import EditItemView from 'src/components/EditItemView.svelte';
  import PopupHeader from 'src/components/PopupHeader.svelte';
  import QueryProvider from 'src/components/QueryProvider.svelte';
  import SelectChatPlaceholder from 'src/components/SelectChatPlaceholder.svelte';
  import SignIn from 'src/components/SignIn.svelte';
  import ViewItemsList from 'src/components/ViewItemsList.svelte';
  import { onMount } from 'svelte';

  import PocketBase from 'pocketbase';
  import EmptyList from 'src/components/EmptyList.svelte';

  export const pb = new PocketBase('https://pocketbase-malakhov.fly.dev');

  export let profile: Profile;
  let session: Session | null = null;
  let chat_id: string | null = null;
  let editTaskId = '';

  $: isChat = false;
  $: loadedTab = false;
  $: loadedSession = false;

  const handleGetSession = async (chat_id: string) => {
    const existing = await pb.collection('sessions').getFullList<SessionWithUser>({
      expand: 'users',
      filter: `users.telegram_id="${chat_id}"`,
    });
    if (existing.length > 0) {
      session = existing.find((i) => i.users.includes(profile.id));
    } else {
      session = await pb.collection('sessions').create({
        users: [profile.id],
      });
    }
    loadedSession = true;
  };

  onMount(() => {
    // if (!profile) return;
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      loadedTab = true;
      const url = tabs[0].url;
      chat_id = url.split('#')[1];
      if (url.includes('web.telegram.org') && !!chat_id) {
        isChat = true;
        if (profile) handleGetSession(chat_id);
      }
    });
  });
</script>

{#if (loadedTab && loadedSession) || (loadedTab && !isChat)}
  {#if !profile}
    <div class="container px-4 py-4 text-base">
      <SignIn />
    </div>
  {:else if !isChat && !editTaskId}
    <div class="container px-4 py-4 text-base">
      <SelectChatPlaceholder />
    </div>
  {:else}
    <QueryProvider>
      <div class="container py-4 text-base">
        <PopupHeader session_id={session?.id} on:newTask={(event) => (editTaskId = event.detail)} />
        {#if editTaskId}
          <div class="px-4 mt-2">
            <EditItemView id={editTaskId} on:close={() => (editTaskId = '')} />
          </div>
        {:else}
          <div class="px-4 mt-2">
            {#if session?.id}
              <ViewItemsList
                on:edit={(e) => (editTaskId = e.detail.id)}
                session_id={session?.id}
                profile_id={profile?.id}
              />
            {:else}
              <EmptyList />
              Code: 1
            {/if}
          </div>
        {/if}
      </div>
    </QueryProvider>
  {/if}
{:else}
  <div class="w-full h-64 container p-4">
    <div class="bg-slate-100 animate-pulse" />
  </div>
{/if}

<style>
  .container {
    min-width: 500px;
    max-width: 500px;
  }
</style>
