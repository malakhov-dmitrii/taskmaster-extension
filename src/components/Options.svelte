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

  const pb = new PocketBase('https://pocketbase-malakhov.fly.dev');

  export let profile: Profile;

  $: session = null as Session | null;
  $: chat_id = '';
  $: editTaskId = '';
  $: isChat = false;
  $: tabReady = false;
  $: loadedSession = false;

  const handleGetSession = async (chat_id: string) => {
    const existing = await pb.collection('sessions').getFullList<SessionWithUser>({
      expand: 'users',
      filter: `users.telegram_id="${chat_id}"`,
    });

    console.log('existing session: ', existing);

    if (existing.length > 0) {
      session = existing.find((i) => i.users.includes(profile.id));
      console.log(`picked session: ${session} | ${profile.id} | ${chat_id}`);

      // failed to find session with user
      // delete existing session and create new one
      if (!session) {
        console.log('session not found');
      }
    } else {
      session = await pb.collection('sessions').create({
        users: [profile.id],
      });
      console.log('new session: ', session);
    }
    loadedSession = true;
  };

  onMount(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      tabReady = true;
      const url = tabs[0].url;
      chat_id = url.split('#')[1];
      if (url.includes('web.telegram.org') && !!chat_id) {
        isChat = true;
        if (profile) handleGetSession(chat_id);
      }
    });
  });
</script>

<QueryProvider>
  {#if !profile}
    <div class="container px-4 py-4 text-base">
      <SignIn />
    </div>
  {:else if !isChat}
    <div class="container px-4 py-4 text-base">
      <SelectChatPlaceholder />
    </div>
  {:else}
    <PopupHeader session_id={session?.id} on:newTask={(event) => (editTaskId = event.detail)} />
    <div class="container px-4 py-4 text-base">
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
            <div>
              <p class="text-center font-bold animate-pulse my-8">Loading session...</p>
            </div>
          {/if}
        </div>
      {/if}
    </div>
  {/if}
</QueryProvider>

<style>
  .container {
    min-width: 500px;
    max-width: 500px;
  }
</style>
